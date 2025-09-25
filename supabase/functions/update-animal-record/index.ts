import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const { 
      record_id, 
      manual_breed, 
      final_breed, 
      verification_status,
      notes,
      location_data,
      owner_details 
    } = await req.json()

    if (!record_id) {
      return new Response(
        JSON.stringify({ error: 'record_id is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    
    if (manual_breed) updateData.manual_breed = manual_breed.toLowerCase().replace(/\s+/g, '_')
    if (final_breed) updateData.final_breed = final_breed.toLowerCase().replace(/\s+/g, '_')
    if (verification_status) updateData.verification_status = verification_status
    if (notes !== undefined) updateData.notes = notes
    if (location_data) updateData.location_data = location_data
    if (owner_details) updateData.owner_details = owner_details

    // If verification status is being set, record who verified it
    if (verification_status && ['verified', 'rejected'].includes(verification_status)) {
      updateData.verified_by = user.id
    }

    const { data: updatedRecord, error } = await supabase
      .from('animal_records')
      .update(updateData)
      .eq('id', record_id)
      .eq('user_id', user.id) // Ensure user can only update their own records
      .select()
      .single()

    if (error) {
      console.error('Error updating animal record:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to update animal record', details: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    if (!updatedRecord) {
      return new Response(
        JSON.stringify({ error: 'Record not found or access denied' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    console.log(`Animal record ${record_id} updated by user ${user.id}`)

    return new Response(
      JSON.stringify({
        success: true,
        record: updatedRecord
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in update-animal-record function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})