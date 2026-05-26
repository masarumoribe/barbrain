import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

# ── Ingredients ──────────────────────────────────────────────
ingredients = [
    {"name": "Gin",               "category": "spirit",  "unit": "ml"},
    {"name": "Vodka",             "category": "spirit",  "unit": "ml"},
    {"name": "White Rum",         "category": "spirit",  "unit": "ml"},
    {"name": "Tequila Blanco",    "category": "spirit",  "unit": "ml"},
    {"name": "Mezcal",            "category": "spirit",  "unit": "ml"},
    {"name": "Bourbon",           "category": "spirit",  "unit": "ml"},
    {"name": "Sweet Vermouth",    "category": "liqueur", "unit": "ml"},
    {"name": "Dry Vermouth",      "category": "liqueur", "unit": "ml"},
    {"name": "Cointreau",         "category": "liqueur", "unit": "ml"},
    {"name": "Campari",           "category": "liqueur", "unit": "ml"},
    {"name": "Simple Syrup",      "category": "syrup",   "unit": "ml"},
    {"name": "Lime Juice",        "category": "juice",   "unit": "ml"},
    {"name": "Lemon Juice",       "category": "juice",   "unit": "ml"},
    {"name": "Angostura Bitters", "category": "bitter",  "unit": "dash"},
    {"name": "Egg White",         "category": "other",   "unit": "piece"},
]

# ── Cocktails ─────────────────────────────────────────────────
cocktails = [
    {
        "name": "Negroni",
        "description": "A perfectly balanced bitter Italian classic",
        "instructions": "Stir all ingredients with ice. Strain into rocks glass over a large ice cube.",
        "glass_type": "rocks",
        "garnish": "Orange peel",
        "category": "classic",
    },
    {
        "name": "Margarita",
        "description": "The world's most popular cocktail",
        "instructions": "Shake all ingredients with ice. Strain into salt-rimmed glass.",
        "glass_type": "coupe",
        "garnish": "Lime wheel",
        "category": "classic",
    },
    {
        "name": "Whiskey Sour",
        "description": "Tart, frothy, and timeless",
        "instructions": "Dry shake first, then shake with ice. Double strain into coupe.",
        "glass_type": "coupe",
        "garnish": "Lemon wheel and cherry",
        "category": "sour",
    },
    {
        "name": "Daiquiri",
        "description": "Simple, elegant, and often misunderstood",
        "instructions": "Shake all ingredients hard with ice. Double strain into chilled coupe.",
        "glass_type": "coupe",
        "garnish": "None",
        "category": "classic",
    },
    {
        "name": "Old Fashioned",
        "description": "The original cocktail",
        "instructions": "Stir ingredients with ice until well chilled. Strain over large ice cube.",
        "glass_type": "rocks",
        "garnish": "Orange peel",
        "category": "classic",
    },
]

# ── Cocktail ingredients ──────────────────────────────────────
cocktail_ingredients = [
    ("Negroni",       "Gin",               30,  "ml",    False),
    ("Negroni",       "Sweet Vermouth",    30,  "ml",    False),
    ("Negroni",       "Campari",           30,  "ml",    False),

    ("Margarita",     "Tequila Blanco",    50,  "ml",    False),
    ("Margarita",     "Cointreau",         20,  "ml",    False),
    ("Margarita",     "Lime Juice",        20,  "ml",    False),

    ("Whiskey Sour",  "Bourbon",           50,  "ml",    False),
    ("Whiskey Sour",  "Lemon Juice",       25,  "ml",    False),
    ("Whiskey Sour",  "Simple Syrup",      15,  "ml",    False),
    ("Whiskey Sour",  "Egg White",          1,  "piece", False),

    ("Daiquiri",      "White Rum",         50,  "ml",    False),
    ("Daiquiri",      "Lime Juice",        25,  "ml",    False),
    ("Daiquiri",      "Simple Syrup",      15,  "ml",    False),

    ("Old Fashioned", "Bourbon",           60,  "ml",    False),
    ("Old Fashioned", "Simple Syrup",      10,  "ml",    False),
    ("Old Fashioned", "Angostura Bitters",  2,  "dash",  False),
]


def seed():
    print("Seeding ingredients...")
    ing_res = supabase.table("ingredients").insert(ingredients).execute()
    ing_map = {row["name"]: row["id"] for row in ing_res.data}
    print(f"  ✓ {len(ing_map)} ingredients inserted")

    print("Seeding cocktails...")
    cock_res = supabase.table("cocktails").insert(cocktails).execute()
    cock_map = {row["name"]: row["id"] for row in cock_res.data}
    print(f"  ✓ {len(cock_map)} cocktails inserted")

    print("Seeding cocktail ingredients...")
    ci_rows = [
        {
            "cocktail_id":   cock_map[c],
            "ingredient_id": ing_map[i],
            "amount":        amount,
            "unit":          unit,
            "is_optional":   optional,
        }
        for c, i, amount, unit, optional in cocktail_ingredients
    ]
    supabase.table("cocktail_ingredients").insert(ci_rows).execute()
    print(f"  ✓ {len(ci_rows)} cocktail ingredients inserted")

    print("\n✅ Seed complete.")


if __name__ == "__main__":
    seed()