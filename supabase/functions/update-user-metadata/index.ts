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

    if (!body.user_id) {
      throw new Error("user_id is required");
    }

    if (!body.metadata) {
      throw new Error("metadata is required");
    }

    // Mettre à jour les métadonnées de l'utilisateur
    const { data: userData, error: userError } = await supabase.auth.admin.updateUserById(
      body.user_id,
      { user_metadata: body.metadata }
    );

    if (userError) {
      console.error('Error updating user metadata:', userError);
      throw userError;
    }

    // Si update_profile est true, mettre à jour aussi la table profiles
    if (body.update_profile) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update(body.metadata)
        .eq('id', body.user_id)
        .select()
        .single();

      if (profileError) {
        console.error('Error updating profile:', profileError);
        throw profileError;
      }

      // Récupérer les données utilisateur mises à jour
      const { data: updatedUser, error: getUserError } = await supabase.auth.admin.getUserById(body.user_id);

      if (getUserError) {
        console.error('Error getting updated user:', getUserError);
        throw getUserError;
      }

      return new Response(
        JSON.stringify({
          message: "User metadata and profile updated successfully",
          data: {
            user: updatedUser,
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
    }

    return new Response(
      JSON.stringify({
        message: "User metadata updated successfully",
        data: userData
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
    console.error('Error in update-user-metadata:', error);
    return new Response(
      JSON.stringify({
        error: error.message || "Une erreur est survenue lors de la mise à jour des métadonnées"
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
