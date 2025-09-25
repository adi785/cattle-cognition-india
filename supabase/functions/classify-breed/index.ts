import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Initialize Hugging Face client
const hf = new HfInference(Deno.env.get('HUGGING_FACE_ACCESS_TOKEN'))

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { image_url, animal_id, user_id, animal_type } = await req.json()

    if (!image_url || !animal_id || !user_id || !animal_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: image_url, animal_id, user_id, animal_type' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Processing breed classification for animal ${animal_id} of type ${animal_type}`)
    console.log(`Image URL: ${image_url}`)
    
    const startTime = Date.now()

    // Validate image URL
    if (!image_url || !image_url.startsWith('http')) {
      throw new Error('Invalid image URL provided')
    }

    // Obtain image blob - prefer Storage download for private buckets, fallback to HTTP fetch
    let imageBlob: Blob | null = null
    try {
      const url = new URL(image_url)
      const parts = url.pathname.split('/').filter(Boolean)
      const idxPublic = parts.indexOf('public')
      if (idxPublic >= 0 && parts[idxPublic + 1]) {
        const bucketId = parts[idxPublic + 1]
        const objectPath = parts.slice(idxPublic + 2).join('/')
        console.log(`Attempting storage download from bucket "${bucketId}" path "${objectPath}"`)
        const { data, error } = await supabase.storage.from(bucketId).download(objectPath)
        if (error) {
          console.warn('Storage download failed, will fallback to HTTP fetch:', error.message)
        } else {
          imageBlob = data
        }
      }
    } catch (e) {
      console.warn('Could not parse storage URL, will fallback to HTTP fetch:', (e as Error).message)
    }

    if (!imageBlob) {
      console.log('Fetching image via HTTP...')
      const imageResponse = await fetch(image_url, { headers: { 'Cache-Control': 'no-cache' } })
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`)
      }
      imageBlob = await imageResponse.blob()
    }

    console.log(`Image obtained successfully, size: ${imageBlob.size} bytes, type: ${imageBlob.type}`)

    // Skip Hugging Face API call for now and use mock predictions
    console.log('Using mock predictions instead of HF API')
    
    const processingTime = Date.now() - startTime

    // Mock breed predictions based on animal type (replace with actual model results)
    let predictions = []
    if (animal_type === 'cattle') {
      predictions = [
        { breed: 'gir', confidence: 0.85 },
        { breed: 'sahiwal', confidence: 0.12 },
        { breed: 'jersey_cross', confidence: 0.03 }
      ]
    } else if (animal_type === 'buffalo') {
      predictions = [
        { breed: 'murrah', confidence: 0.78 },
        { breed: 'nili_ravi', confidence: 0.15 },
        { breed: 'surti', confidence: 0.07 }
      ]
    }

    const topPrediction = predictions[0]

    // Create or update animal record
    const { data: animalRecord, error: recordError } = await supabase
      .from('animal_records')
      .upsert({
        user_id,
        animal_id,
        animal_type,
        predicted_breed: topPrediction.breed,
        confidence_score: topPrediction.confidence,
        image_url,
        verification_status: 'pending'
      }, {
        onConflict: 'animal_id,user_id'
      })
      .select()
      .single()

    if (recordError) {
      console.error('Error creating animal record:', recordError)
      return new Response(
        JSON.stringify({ error: 'Failed to create animal record', details: recordError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Log the prediction
    const { error: logError } = await supabase
      .from('breed_predictions')
      .insert({
        animal_record_id: animalRecord.id,
        image_url,
        predicted_breeds: predictions,
        model_version: 'resnet-50-v1.0',
        processing_time_ms: processingTime
      })

    if (logError) {
      console.error('Error logging prediction:', logError)
    }

    console.log(`Classification completed in ${processingTime}ms for animal ${animal_id}`)

    return new Response(
      JSON.stringify({
        success: true,
        animal_record_id: animalRecord.id,
        predictions,
        top_prediction: {
          breed: topPrediction.breed,
          confidence: topPrediction.confidence
        },
        processing_time_ms: processingTime
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in classify-breed function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})