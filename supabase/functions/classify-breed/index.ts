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

    // Call Roboflow API for breed classification
    console.log('Calling Roboflow API for breed classification')
    
    let predictions = [{ breed: 'unknown', confidence: 0 }]
    let topPrediction = { breed: 'unknown', confidence: 0 }
    
    try {
      // Convert blob to base64 for Roboflow API
      const arrayBuffer = await imageBlob.arrayBuffer()
      const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
      const dataUrl = `data:${imageBlob.type};base64,${base64String}`
      
      const roboflowResponse = await fetch('https://serverless.roboflow.com/innovyom-1s6fe/detect-and-classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer Y0UeO8RHs1Vp63Y6O3m3`
        },
        body: JSON.stringify({
          image: dataUrl,
          use_cache: true
        })
      })

      if (!roboflowResponse.ok) {
        throw new Error(`Roboflow API error: ${roboflowResponse.status} ${roboflowResponse.statusText}`)
      }

      const roboflowResult = await roboflowResponse.json()
      console.log('Roboflow API response:', roboflowResult)
      
      // Extract predictions from Roboflow response
      if (roboflowResult.predictions && roboflowResult.predictions.length > 0) {
        // Sort predictions by confidence
        const sortedPredictions = roboflowResult.predictions.sort((a: any, b: any) => b.confidence - a.confidence)
        
        predictions = sortedPredictions.slice(0, 3).map((pred: any) => ({
          breed: pred.class || pred.predicted_class || 'unknown',
          confidence: parseFloat((pred.confidence || 0).toFixed(2))
        }))
        
        topPrediction = predictions[0] || { breed: 'unknown', confidence: 0 }
      } else {
        // Fallback if no predictions
        console.warn('No predictions returned from Roboflow API')
        predictions = [{ breed: 'unknown', confidence: 0 }]
        topPrediction = predictions[0]
      }

    } catch (roboflowError) {
      console.error('Roboflow API error:', roboflowError)
      // Keep default fallback values
    }
    
    const processingTime = Date.now() - startTime

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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})