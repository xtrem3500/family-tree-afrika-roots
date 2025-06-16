import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "http://localhost:8080",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };

  // Gérer les requêtes prévol OPTIONS
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const body = await request.json();
    console.log('Received request body:', body);

    if (!body.email || !body.password) {
      throw new Error("email and password are required");
    }

    // Créer l'utilisateur dans auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        first_name: body.first_name,
        last_name: body.last_name,
        phone: body.phone,
        photo_url: body.photo_url,
        is_patriarch: body.is_patriarch || false,
        role: body.is_patriarch ? 'patriarch' : 'member',
        title: body.title,
        birth_place: body.birth_place,
        birth_date: body.birth_date
      }
    });

    if (authError) {
      console.error('Error creating user:', authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error("No user data returned");
    }

    // Attendre que le trigger ait fini (1-2s)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mettre à jour le profil avec les informations supplémentaires
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({
        photo_url: body.photo_url,
        country: body.country,
        title: body.title,
        birth_place: body.birth_place,
        birth_date: body.birth_date,
        updated_at: new Date().toISOString()
      })
      .eq('id', authData.user.id)
      .select()
      .single();

    if (profileError) {
      console.error('Error updating profile:', profileError);
      throw profileError;
    }

    return new Response(
      JSON.stringify({
        message: "User registered successfully",
        data: {
          user: authData.user,
          profile: profileData
        }
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in register-user:', error);
    return new Response(
      JSON.stringify({
        error: error.message || "Une erreur est survenue lors de l'inscription"
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});
