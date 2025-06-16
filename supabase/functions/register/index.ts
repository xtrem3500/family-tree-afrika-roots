import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Début de la fonction register')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Configuration manquante: SUPABASE_URL ou SUPABASE_ANON_KEY')
    }

    console.log('URL Supabase:', supabaseUrl)

    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey
    )

    const body = await req.json()
    console.log('Données reçues:', JSON.stringify(body, null, 2))

    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      photo_url,
      country,
      title,
      birth_place,
      birth_date,
      is_patriarch
    } = body

    // Vérifier les champs obligatoires
    if (!email || !password || !first_name || !last_name) {
      throw new Error('Email, mot de passe, prénom et nom sont obligatoires')
    }

    // Préparer les métadonnées utilisateur
    const user_metadata = {
      first_name,
      last_name,
      phone: phone || null,
      photo_url: photo_url || null,
      country: country || null,
      title: title || null,
      birth_place: birth_place || null,
      birth_date: birth_date && birth_date !== '' ? birth_date : null,
      is_patriarch: is_patriarch || false,
      role: is_patriarch ? 'patriarch' : 'member'
    }

    console.log('Métadonnées utilisateur:', JSON.stringify(user_metadata, null, 2))

    // Créer l'utilisateur avec les métadonnées
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: user_metadata,
        emailRedirectTo: `${supabaseUrl}/auth/callback`
      }
    })

    if (authError) {
      console.error('Erreur auth détaillée:', JSON.stringify(authError, null, 2))
      throw new Error(`Erreur lors de la création de l'utilisateur: ${authError.message}`)
    }

    console.log('Utilisateur créé avec succès:', JSON.stringify(authData, null, 2))

    return new Response(
      JSON.stringify({
        message: 'User registered successfully',
        user: {
          id: authData.user?.id,
          email,
          ...user_metadata
        }
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        status: 200
      }
    )
  } catch (error) {
    console.error('Erreur dans register:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.toString()
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        status: 400
      }
    )
  }
})
