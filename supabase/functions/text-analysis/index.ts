import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { text, userId } = await req.json();

    if (!text || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({
          analysis: "AI analysis is currently unavailable. Here are some general wellness tips:\n\n• Stay hydrated by drinking plenty of water\n• Get adequate rest (7-9 hours of sleep)\n• Eat a balanced diet rich in iron, calcium, and vitamins\n• Practice stress-reduction techniques like meditation or yoga\n• Light exercise like walking can help with cramps\n• Use a heating pad for comfort\n• Track your symptoms to identify patterns\n\nIf symptoms are severe or concerning, please consult a healthcare provider."
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful menstrual health wellness advisor. Provide NON-MEDICAL wellness advice only. Include suggestions about nutrition, hydration, rest, exercise, and self-care. Always remind users to consult healthcare providers for medical concerns. Keep responses friendly, supportive, and informative. Do not diagnose or prescribe."
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI API request failed");
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && supabaseServiceKey) {
      await fetch(`${supabaseUrl}/rest/v1/text_analyses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "apikey": supabaseServiceKey,
        },
        body: JSON.stringify({
          user_id: userId,
          input_text: text,
          ai_response: analysis,
        }),
      });
    }

    return new Response(
      JSON.stringify({ analysis }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to analyze text",
        analysis: "Here are some general wellness tips:\n\n• Stay hydrated by drinking plenty of water\n• Get adequate rest (7-9 hours of sleep)\n• Eat a balanced diet rich in iron, calcium, and vitamins\n• Practice stress-reduction techniques\n• Light exercise can help with symptoms\n• Use heat therapy for cramps\n\nConsult a healthcare provider for medical advice."
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
