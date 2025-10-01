import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sales, inventory, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'sales_prediction':
        systemPrompt = `Tu es un expert en analyse de données de vente pour bars et restaurants. 
        Analyse les données et fournis des prédictions précises pour les 7 prochains jours.
        Réponds en JSON avec: { predictions: [{ date: string, expectedRevenue: number, confidence: number }], insights: string[] }`;
        userPrompt = `Données de ventes des 30 derniers jours : ${JSON.stringify(sales)}. Prédis les ventes des 7 prochains jours.`;
        break;

      case 'inventory_suggestions':
        systemPrompt = `Tu es un expert en gestion d'inventaire pour bars et restaurants.
        Analyse l'inventaire et les ventes pour suggérer des commandes optimales.
        Réponds en JSON avec: { suggestions: [{ item: string, suggestedOrder: number, reason: string }], savings: string }`;
        userPrompt = `Inventaire actuel: ${JSON.stringify(inventory)}. Ventes récentes: ${JSON.stringify(sales)}. Quelles commandes recommandes-tu ?`;
        break;

      case 'anomaly_detection':
        systemPrompt = `Tu es un expert en détection d'anomalies pour bars et restaurants.
        Détecte les anomalies dans les données (vols potentiels, casse inhabituelle, erreurs).
        Réponds en JSON avec: { anomalies: [{ type: string, item: string, severity: 'low'|'medium'|'high', description: string }], summary: string }`;
        userPrompt = `Inventaire: ${JSON.stringify(inventory)}. Ventes: ${JSON.stringify(sales)}. Détecte les anomalies.`;
        break;

      default:
        throw new Error('Type de prédiction invalide');
    }

    console.log('Calling Lovable AI with type:', type);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI Response:', aiResponse);

    return new Response(aiResponse, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-predictions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
