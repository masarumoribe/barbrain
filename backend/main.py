import os
import anthropic
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from supabase import create_client
from pydantic import BaseModel

load_dotenv()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

app = FastAPI()

PUBLIC_PATHS = {"/", "/openapi.json", "/docs", "/docs/oauth2-redirect", "/redoc"}

# ── CORS ──────────────────────────────────────────────────────
# This allows your React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:5174",
        "https://barbrain-production.up.railway.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def verify_supabase_token(token: str):
    try:
        user_response = supabase.auth.get_user(token)
        return user_response.user
    except Exception:
        return None


@app.middleware("http")
async def require_auth(request: Request, call_next):
    if request.method == "OPTIONS" or request.url.path in PUBLIC_PATHS:
        return await call_next(request)

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return JSONResponse(
            status_code=401,
            content={"detail": "Missing bearer token"},
        )

    token = auth_header.split(" ", 1)[1].strip()
    user = verify_supabase_token(token)
    if not user:
        return JSONResponse(
            status_code=401,
            content={"detail": "Invalid or expired token"},
        )

    request.state.user = user
    return await call_next(request)

# ── Pydantic models ──────────────────────────────────────────
class IngredientCreate(BaseModel):
    name: str
    category: str
    unit: str

class CocktailIngredientInput(BaseModel):
    ingredient_id: str
    amount: float
    unit: str
    is_optional: bool = False

class CocktailCreate(BaseModel):
    name: str
    description: str
    instructions: str
    glass_type: str
    garnish: str
    category: str
    ingredients: list[CocktailIngredientInput]

class CocktailUpdate(BaseModel):
    name: str
    description: str
    instructions: str
    glass_type: str
    garnish: str
    category: str
    ingredients: list[CocktailIngredientInput]

class AssistantMessage(BaseModel):
    message: str

class KnowledgeEntry(BaseModel):
    title: str
    category: str
    content: str

# ── Health check ──────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "BarBrain API is running"}


@app.get("/auth/me")
def get_current_user(request: Request):
    return {
        "id": request.state.user.id,
        "email": request.state.user.email,
    }

# ── Home ──────────────────────────────────────────────────────
@app.get("/stats")
def get_stats():
    cocktails = supabase.table("cocktails").select("id", count="exact").execute()
    ingredients = supabase.table("ingredients").select("id", count="exact").execute()
    knowledge = supabase.table("knowledge_base").select("id", count="exact").execute()
    
    # Low stock items
    low_stock = (
        supabase.table("inventory")
        .select("quantity_on_hand, low_threshold, ingredients(name)")
        .execute()
    )
    
    low = [
        {
            "name": row["ingredients"]["name"],
            "quantity": row["quantity_on_hand"],
            "threshold": row["low_threshold"],
        }
        for row in low_stock.data
        if row["quantity_on_hand"] is not None
        and row["quantity_on_hand"] <= row["low_threshold"]
        and row["quantity_on_hand"] > 0
    ]

    out = [
        {
            "name": row["ingredients"]["name"],
        }
        for row in low_stock.data
        if row["quantity_on_hand"] is not None
        and row["quantity_on_hand"] == 0
    ]

    return {
        "total_cocktails": cocktails.count,
        "total_ingredients": ingredients.count,
        "total_knowledge": knowledge.count,
        "low_stock": low,
        "out_of_stock": out,
    }

# ── Cocktails ─────────────────────────────────────────────────
@app.get("/cocktails")
def get_cocktails():
    res = (
        supabase.table("cocktails")
        .select("*, cocktail_ingredients(amount, unit, is_optional, ingredients(id, name, category))")
        .execute()
    )
    return res.data

@app.get("/cocktails/{cocktail_id}")
def get_cocktail(cocktail_id: str):
    res = (
        supabase.table("cocktails")
        .select("*, cocktail_ingredients(*, ingredients(*))")
        .eq("id", cocktail_id)
        .single()
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Cocktail not found")
    return res.data

@app.post("/cocktails")
def create_cocktail(cocktail: CocktailCreate):
    # Check if cocktail already exists
    existing = (
        supabase.table("cocktails")
        .select("id")
        .eq("name", cocktail.name)
        .execute()
    )
    if existing.data:
        raise HTTPException(status_code=400, detail="Cocktail already exists")

    # Insert cocktail
    res = (
        supabase.table("cocktails")
        .insert({
            "name": cocktail.name,
            "description": cocktail.description,
            "instructions": cocktail.instructions,
            "glass_type": cocktail.glass_type,
            "garnish": cocktail.garnish,
            "category": cocktail.category,
        })
        .execute()
    )
    cocktail_id = res.data[0]["id"]

    # Insert cocktail ingredients
    ci_rows = [
        {
            "cocktail_id": cocktail_id,
            "ingredient_id": ing.ingredient_id,
            "amount": ing.amount,
            "unit": ing.unit,
            "is_optional": ing.is_optional,
        }
        for ing in cocktail.ingredients
    ]
    if ci_rows:
        supabase.table("cocktail_ingredients").insert(ci_rows).execute()

    # Return full cocktail with ingredients
    full = (
        supabase.table("cocktails")
        .select("*, cocktail_ingredients(amount, unit, is_optional, ingredients(id, name, category))")
        .eq("id", cocktail_id)
        .single()
        .execute()
    )
    return full.data

@app.put("/cocktails/{cocktail_id}")
def update_cocktail(cocktail_id: str, cocktail: CocktailUpdate):
    # Update cocktail details
    supabase.table("cocktails").update({
        "name": cocktail.name,
        "description": cocktail.description,
        "instructions": cocktail.instructions,
        "glass_type": cocktail.glass_type,
        "garnish": cocktail.garnish,
        "category": cocktail.category,
    }).eq("id", cocktail_id).execute()

    # Delete existing ingredients and re-insert
    supabase.table("cocktail_ingredients").delete().eq("cocktail_id", cocktail_id).execute()

    if cocktail.ingredients:
        ci_rows = [
            {
                "cocktail_id": cocktail_id,
                "ingredient_id": ing.ingredient_id,
                "amount": ing.amount,
                "unit": ing.unit,
                "is_optional": ing.is_optional,
            }
            for ing in cocktail.ingredients
        ]
        supabase.table("cocktail_ingredients").insert(ci_rows).execute()

    # Return updated cocktail
    full = (
        supabase.table("cocktails")
        .select("*, cocktail_ingredients(amount, unit, is_optional, ingredients(id, name, category))")
        .eq("id", cocktail_id)
        .single()
        .execute()
    )
    return full.data

# ── Ingredients ───────────────────────────────────────────────
@app.get("/ingredients")
def get_ingredients():
    res = supabase.table("ingredients").select("*").execute()
    return res.data

# ── Inventory ─────────────────────────────────────────────────
@app.get("/inventory")
def get_inventory():
    res = (
        supabase.table("inventory")
        .select("*, ingredients(*)")
        .execute()
    )
    return res.data

@app.post("/inventory/{ingredient_id}")
def upsert_inventory(ingredient_id: str, quantity: float, low_threshold: float = 50):
    res = (
        supabase.table("inventory")
        .upsert(
            {
                "ingredient_id": ingredient_id,
                "quantity_on_hand": quantity,
                "low_threshold": low_threshold,
            },
            on_conflict="ingredient_id"
        )
        .execute()
    )
    return res.data

@app.post("/ingredients")
def create_ingredient(ingredient: IngredientCreate):
    # Check if ingredient already exists
    existing = (
        supabase.table("ingredients")
        .select("id")
        .eq("name", ingredient.name)
        .execute()
    )
    if existing.data:
        raise HTTPException(status_code=400, detail="Ingredient already exists")
    
    res = (
        supabase.table("ingredients")
        .insert({
            "name": ingredient.name,
            "category": ingredient.category,
            "unit": ingredient.unit,
        })
        .execute()
    )
    return res.data[0]

# ── Assistant ─────────────────────────────────────────────────
@app.get("/knowledge")
def get_knowledge():
    res = (
        supabase.table("knowledge_base")
        .select("*")
        .order("category")
        .execute()
    )
    return res.data

@app.post("/knowledge")
def create_knowledge(entry: KnowledgeEntry):
    res = (
        supabase.table("knowledge_base")
        .insert({
            "title": entry.title,
            "category": entry.category,
            "content": entry.content,
        })
        .execute()
    )
    return res.data[0]

@app.put("/knowledge/{entry_id}")
def update_knowledge(entry_id: str, entry: KnowledgeEntry):
    res = (
        supabase.table("knowledge_base")
        .update({
            "title": entry.title,
            "category": entry.category,
            "content": entry.content,
            "updated_at": "now()",
        })
        .eq("id", entry_id)
        .execute()
    )
    return res.data[0]

@app.delete("/knowledge/{entry_id}")
def delete_knowledge(entry_id: str):
    supabase.table("knowledge_base").delete().eq("id", entry_id).execute()
    return {"deleted": entry_id}

@app.post("/ai/suggest")
def ai_suggest(body: AssistantMessage):
    # Fetch knowledge base
    knowledge = (
        supabase.table("knowledge_base")
        .select("title, category, content")
        .execute()
    )

    # Build readable knowledge base
    knowledge_text = "\n\n".join(
        f"[{entry['category'].upper()}] {entry['title']}:\n{entry['content']}"
        for entry in knowledge.data
    )

    # Fetch inventory
    # Fetch inventory
    inv = (
        supabase.table("inventory")
        .select("quantity_on_hand, ingredients(name)")
        .execute()
    )
    in_stock = [
        f"{row['ingredients']['name']} ({row['quantity_on_hand']}ml)"
        for row in inv.data
        if row['quantity_on_hand'] and row['quantity_on_hand'] > 0
    ]

    # Fetch cocktails database
    cocktails = (
        supabase.table("cocktails")
        .select("name, category, description, instructions, garnish, glass_type, cocktail_ingredients(amount, unit, is_optional, ingredients(name))")
        .execute()
    )

    # Build readable cocktail list
    cocktail_text = []
    for c in cocktails.data:
        ings = "\n".join(
            f"  - {ci['amount']}{ci['unit']} {ci['ingredients']['name']}"
            + (" (optional)" if ci['is_optional'] else "")
            for ci in c['cocktail_ingredients']
        )
        cocktail_text.append(
            f"{c['name']} ({c['category']}):\n"
            f"  Description: {c['description']}\n"
            f"  Glass: {c['glass_type']} | Garnish: {c['garnish']}\n"
            f"  Ingredients:\n{ings}\n"
            f"  Instructions: {c['instructions']}"
        )

    system_prompt = f"""You are the bar assistant for this establishment. You help staff with any question about the bar — recipes, procedures, VIP preferences, ordering, and general bartending knowledge.

PRIORITY: Always answer from the bar's knowledge base first. Only use general bartending knowledge if the answer is not covered in the knowledge base.

BAR KNOWLEDGE BASE:
{knowledge_text if knowledge_text else "No knowledge base entries yet."}

COCKTAIL DATABASE:
{chr(10).join(cocktail_text) if cocktail_text else "No cocktails in database yet."}

CURRENT INVENTORY:
{chr(10).join(in_stock) if in_stock else "No inventory data available."}

Guidelines:
- Answer clearly and concisely — staff may be asking during a busy service
- For recipes, always give exact amounts and steps
- For procedures, give numbered steps
- For VIP profiles, be specific about preferences
- If something is not in the knowledge base, say so clearly and offer general guidance
- Never make up bar-specific information that isn't in the knowledge base"""

    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1024,
        system=system_prompt,
        messages=[{"role": "user", "content": body.message}]
    )

    return {"response": response.content[0].text}