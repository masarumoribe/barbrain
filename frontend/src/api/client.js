import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
})

export const getStats = () => api.get('/stats')
export const getCocktails = () => api.get('/cocktails')
export const getCocktail = (id) => api.get(`/cocktails/${id}`)
export const createCocktail = (data) => api.post('/cocktails', data)
export const updateCocktail = (id, data) => api.put(`/cocktails/${id}`, data)
export const getIngredients = () => api.get('/ingredients')
export const getInventory = () => api.get('/inventory')
export const upsertInventory = (ingredientId, quantity, lowThreshold) =>
  api.post(`/inventory/${ingredientId}?quantity=${quantity}&low_threshold=${lowThreshold}`)
export const createIngredient = (name, category, unit) =>
  api.post('/ingredients', { name, category, unit })
export const matchCocktails = () => api.get('/cocktails/match/inventory')
export const getKnowledge = () => api.get('/knowledge')
export const createKnowledge = (data) => api.post('/knowledge', data)
export const updateKnowledge = (id, data) => api.put(`/knowledge/${id}`, data)
export const deleteKnowledge = (id) => api.delete(`/knowledge/${id}`)
export const askAssistant = (message) => api.post('/ai/suggest', { message })