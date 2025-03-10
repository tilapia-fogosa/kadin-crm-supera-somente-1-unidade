
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

console.log("Normalize Lead Source Function initialized")

interface LeadPayload {
  name: string
  phone_number: string
  email?: string
  lead_source?: string
  observations?: string
  meta_id?: string
  original_ad?: string
  original_adset?: string
  age_range?: string
}

const leadSourceMapping: Record<string, string> = {
  'fb': 'facebook',
  'ig': 'instagram',
  'website': 'website',
  'whatsapp': 'whatsapp',
  'webhook': 'webhook',
  'indicacao': 'indicacao',
  'outros': 'outros'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Recebendo nova requisição POST')
    const payload = await req.json()
    console.log('Payload recebido:', payload)

    // Validar campos obrigatórios
    if (!payload.name) {
      console.error('Campo obrigatório ausente: name')
      return new Response(
        JSON.stringify({ 
          error: 'Campo obrigatório ausente: name',
          received_payload: payload 
        }),
        { 
          status: 400,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    if (!payload.phone_number) {
      console.error('Campo obrigatório ausente: phone_number')
      return new Response(
        JSON.stringify({ 
          error: 'Campo obrigatório ausente: phone_number',
          received_payload: payload 
        }),
        { 
          status: 400,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    // Log dos campos recebidos
    console.log('Campos recebidos:')
    console.log('name:', payload.name)
    console.log('phone_number:', payload.phone_number)
    console.log('email:', payload.email)
    console.log('lead_source:', payload.lead_source)
    console.log('observations:', payload.observations)
    console.log('meta_id:', payload.meta_id)
    console.log('original_ad:', payload.original_ad)
    console.log('original_adset:', payload.original_adset)
    console.log('age_range:', payload.age_range)

    // Normalizar o lead source
    let normalizedSource = 'outros'
    if (payload.lead_source) {
      const sourceLower = payload.lead_source.toLowerCase().trim()
      normalizedSource = leadSourceMapping[sourceLower] || 'outros'
      console.log('Lead source normalizado:', normalizedSource)
    }

    // Criar o objeto de lead com todos os campos
    const lead = {
      name: payload.name,
      phone_number: payload.phone_number,
      email: payload.email,
      lead_source: normalizedSource,
      observations: payload.observations,
      meta_id: payload.meta_id,
      original_ad: payload.original_ad,
      original_adset: payload.original_adset,
      age_range: payload.age_range
    }

    console.log('Tentando inserir lead na tabela:', lead)

    // Criar cliente usando o service_role key para garantir inserção
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(lead)
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Erro ao inserir lead:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao inserir lead no banco de dados',
          details: error,
          attempted_payload: lead 
        }),
        { 
          status: 500,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    console.log('Lead inserido com sucesso!')
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Lead registrado com sucesso',
        normalized_source: normalizedSource 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Erro ao processar requisição:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao processar requisição',
        details: error.message,
        stack: error.stack
      }), 
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
