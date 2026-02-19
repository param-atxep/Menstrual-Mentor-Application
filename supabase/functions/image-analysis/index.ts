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
    const { image, userId } = await req.json();

    if (!image || !userId) {
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

    const base64Data = image.split(",")[1];
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    let redIntensity = 0;
    let pixelCount = 0;

    for (let i = 0; i < Math.min(imageBuffer.length, 30000); i += 4) {
      const r = imageBuffer[i];
      redIntensity += r || 0;
      pixelCount++;
    }

    const avgRedIntensity = pixelCount > 0 ? redIntensity / pixelCount : 0;

    let riskLevel = "Low";
    let analysis = "Normal appearance detected. Continue regular monitoring of your health.";

    if (avgRedIntensity < 100) {
      riskLevel = "Moderate";
      analysis = "Possible anemia indicators detected. Consider increasing iron-rich foods in your diet (leafy greens, lean meat, legumes). Stay hydrated and get adequate rest. If symptoms like fatigue persist, consult a healthcare provider.";
    } else if (avgRedIntensity < 50) {
      riskLevel = "High";
      analysis = "Significant concerns detected in the analysis. This may indicate severe anemia or other health issues. Please consult with a healthcare provider as soon as possible for proper medical evaluation and treatment.";
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && supabaseServiceKey) {
      await fetch(`${supabaseUrl}/rest/v1/image_analyses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "apikey": supabaseServiceKey,
        },
        body: JSON.stringify({
          user_id: userId,
          image_url: "data:image/base64",
          red_intensity: avgRedIntensity,
          risk_level: riskLevel,
          analysis_result: analysis,
        }),
      });
    }

    return new Response(
      JSON.stringify({
        riskLevel,
        redIntensity: avgRedIntensity,
        analysis,
      }),
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
      JSON.stringify({ error: "Failed to analyze image" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
