import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export function useSupabaseData() {
  const [data, setData] = useState({ hero: {}, collections: [], steps: [] })
  const [catalogData, setCatalogData] = useState({ categories: [], products: [] })
  const [loading, setLoading] = useState(true)

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

        setData({
          hero: hero.data || {},
          collections: collections.data || [],
          steps: steps.data || [],
        })

        setCatalogData({
          categories: categories.data || [],
          products: products.data || [],
        })
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