import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

const CACHE_KEY = 'gala_flowers_cache'
const CACHE_TTL = 5 * 60 * 1000 // 5 daqiqa

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { ts, data, catalogData } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return null
    return { data, catalogData }
  } catch {
    return null
  }
}

function saveCache(data, catalogData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data, catalogData }))
  } catch {}
}

export function useSupabaseData() {
  const cached = loadCache()

  const [data, setData]             = useState(cached?.data       || { hero: {}, collections: [], steps: [] })
  const [catalogData, setCatalogData] = useState(cached?.catalogData || { categories: [], products: [] })
  // Cache bo'lsa — darhol loading=false, foydalanuvchi hech narsa ko'rmaydi
  const [loading, setLoading]       = useState(!cached)

  useEffect(() => {
    async function fetchAll() {
      try {
        const [hero, collections, steps, categories, products] = await Promise.all([
          supabase.from('hero').select('*').limit(1).single(),
          supabase.from('collections').select('*'),
          supabase.from('steps').select('*').order('id'),
          supabase.from('categories').select('*'),
          supabase.from('products').select('*'),
        ])

        const newData = {
          hero: hero.data || {},
          collections: collections.data || [],
          steps: steps.data || [],
        }
        const newCatalog = {
          categories: categories.data || [],
          products: products.data || [],
        }

        setData(newData)
        setCatalogData(newCatalog)
        saveCache(newData, newCatalog)
      } catch (err) {
        console.error('Supabase fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  return { data, catalogData, loading }
}