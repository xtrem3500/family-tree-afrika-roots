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

    // Supprimer les données dans l'ordre pour respecter les contraintes de clés étrangères
    const { error: relationshipsError } = await supabase
      .from('relationships')
      .delete()
      .neq('id', 0); // Supprime toutes les relations

    if (relationshipsError) throw relationshipsError;

    const { error: joinRequestsError } = await supabase
      .from('join_requests')
      .delete()
      .neq('id', 0); // Supprime toutes les demandes d'adhésion

    if (joinRequestsError) throw joinRequestsError;

    const { error: familyMembersError } = await supabase
      .from('family_members')
      .delete()
      .neq('id', 0); // Supprime tous les membres

    if (familyMembersError) throw familyMembersError;

    const { error: familyTreesError } = await supabase
      .from('family_trees')
      .delete()
      .neq('id', 0); // Supprime tous les arbres

    if (familyTreesError) throw familyTreesError;

    const { error: profilesError } = await supabase
      .from('profiles')
      .delete()
      .neq('id', 0); // Supprime tous les profils

    if (profilesError) throw profilesError;

    return new Response(
      JSON.stringify({ message: "Toutes les données ont été supprimées avec succès." }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
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
