import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { HfInference } from "@huggingface/inference";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get Google ID token from session (stored by NextAuth)
    const googleToken = (session as any).idToken;
    if (!googleToken) {
      return NextResponse.json(
        { success: false, error: "Google ID token not found in session" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const image = formData.get("image") as File;
    const lifestyleData = JSON.parse(formData.get("lifestyleData") as string);

    if (!image) {
      return NextResponse.json(
        { success: false, error: "No image provided" },
        { status: 400 }
      );
    }

    // Call your FastAPI skin analysis endpoint
    const analysisFormData = new FormData();
    analysisFormData.append("file", image);

    const skinAnalysisResponse = await fetch(
      `${process.env.SKIN_ANALYSIS_API_URL}/analyze/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${googleToken}`,
        },
        body: analysisFormData,
      }
    );

    if (!skinAnalysisResponse.ok) {
      throw new Error("Skin analysis failed");
    }

    const skinAnalysisData = await skinAnalysisResponse.json();

    // Convert image to base64 for returning to frontend
    const imageBuffer = await image.arrayBuffer();
    const imageBase64 = `data:${image.type};base64,${Buffer.from(imageBuffer).toString('base64')}`;

    // Get yesterday's data for comparison
    const yesterdayResponse = await fetch(
      `${process.env.SKIN_ANALYSIS_API_URL}/yesterday/`,
      {
        headers: {
          Authorization: `Bearer ${googleToken}`,
        },
      }
    );

    let yesterdayData = null;
    if (yesterdayResponse.ok) {
      yesterdayData = await yesterdayResponse.json();
    }

    // Prepare dermatologist prompt with your specified format
    const prompt = buildDermatologistPrompt(
      yesterdayData,
      skinAnalysisData,
      lifestyleData
    );

    // Call Hugging Face API
    const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
    
    const hfResponse = await hf.chatCompletion({
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const aiAnalysis = hfResponse.choices[0]?.message?.content || "";

    return NextResponse.json({
      success: true,
      analysis: {
        image: imageBase64,
        skinData: skinAnalysisData,
        yesterdayData,
        aiAnalysis,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to analyze skin",
      },
      { status: 500 }
    );
  }
}

function buildDermatologistPrompt(
  yesterdayData: any,
  todayData: any,
  lifestyleData: any
): string {
  let prompt = "You are a friendly dermatologist who gives warm, caring, and easy-to-understand advice about skincare.\n\n";

  // Yesterday's data
  if (yesterdayData && yesterdayData.file) {
    prompt += "YESTERDAY'S DATA\n";
    prompt += `File: ${yesterdayData.file}\n\n`;

    if (yesterdayData.top_brightest_regions?.length > 0) {
      const regions = yesterdayData.top_brightest_regions
        .map((r: any) => `${r.region}=${r.brightness.toFixed(1)}`)
        .join(", ");
      prompt += `Top Brightest Regions: ${regions}\n\n`;
    }

    if (yesterdayData.acne) {
      const acne = yesterdayData.acne;
      prompt += `Acne: class=${acne.class}`;
      if (acne.redness !== undefined) {
        prompt += `, redness=${acne.redness.toFixed(1)}, coverage=${acne.coverage.toFixed(1)}%`;
      }
      prompt += "\n\n";
    }

    if (yesterdayData.blackspot) {
      const bs = yesterdayData.blackspot;
      prompt += `Blackspot: class=${bs.class}`;
      if (bs.darkness_level !== undefined) {
        prompt += `, darkness=${bs.darkness_level.toFixed(1)}, coverage=${(bs.coverage_ratio * 100).toFixed(1)}%`;
      }
      prompt += "\n\n";
    }
  }

  // Today's data
  prompt += "TODAY'S DATA\n";
  prompt += `File: ${todayData.file}\n\n`;

  if (todayData.top_brightest_regions?.length > 0) {
    const regions = todayData.top_brightest_regions
      .map((r: any) => `${r.region}=${r.brightness.toFixed(1)}`)
      .join(", ");
    prompt += `Top Brightest Regions: ${regions}\n\n`;
  }

  if (todayData.acne) {
    const acne = todayData.acne;
    prompt += `Acne: class=${acne.class}`;
    if (acne.redness !== undefined) {
      prompt += `, redness=${acne.redness.toFixed(1)}, coverage=${acne.coverage.toFixed(1)}%`;
    }
    prompt += "\n\n";
  }

  if (todayData.blackspot) {
    const bs = todayData.blackspot;
    prompt += `Blackspot: class=${bs.class}`;
    if (bs.darkness_level !== undefined) {
      prompt += `, darkness=${bs.darkness_level.toFixed(1)}, coverage=${(bs.coverage_ratio * 100).toFixed(1)}%`;
    }
    prompt += "\n\n";
  }

  // Lifestyle data
  prompt += "LIFESTYLE\n";
  if (lifestyleData.sleepTime && lifestyleData.wakeTime) {
    const sleepHours = calculateSleepHours(
      lifestyleData.sleepTime,
      lifestyleData.wakeTime
    );
    prompt += `Sleep: slept at ${lifestyleData.sleepTime}, woke at ${lifestyleData.wakeTime} (≈ ${sleepHours} hours)\n\n`;
  }
  if (lifestyleData.stressLevel) {
    const stressMap: any = {
      1: "low",
      2: "low-medium",
      3: "medium",
      4: "medium-high",
      5: "high",
    };
    prompt += `Stress level: ${stressMap[lifestyleData.stressLevel] || "medium"}\n\n`;
  }
  if (lifestyleData.exerciseMinutes) {
    prompt += `Exercise: ${lifestyleData.exerciseMinutes} minutes\n\n`;
  }

  // Weather data if available
  if (lifestyleData.weather) {
    prompt += "WEATHER\n";
    if (lifestyleData.weather.temperature !== undefined) {
      prompt += `Temperature: ${lifestyleData.weather.temperature} °C\n`;
    }
    if (lifestyleData.weather.humidity !== undefined) {
      prompt += `Humidity: ${lifestyleData.weather.humidity}%\n`;
    }
    if (lifestyleData.weather.uvIndex !== undefined) {
      prompt += `UV index: ${lifestyleData.weather.uvIndex}\n`;
    }
    prompt += "\n";
  }

  // Task instructions
  prompt += `YOUR TASK
Compare today's skin condition with yesterday's (acne redness/coverage, blackspot darkness/coverage).

State clearly if the skin is improving, stable, or worsening. Use exactly one of these words for each area (Acne, Dark spots) and for Overall: improving / stable / worsening. Do not include numeric deltas in the wording. If yesterday's data are missing, say "insufficient to compare" and base advice on TODAY only.

Use a warm, encouraging tone.

If improved: congratulate and suggest maintaining the routine.
If worsened: reassure, reduce worry, and recommend a gentler routine.

Consider sleep and stress level:
- If sleep < 7 hours or irregular: explain briefly how sleep affects inflammation/oil control and suggest small fixes (consistent bedtime, gentler/non-stripping cleanser, basic moisturizer).
- If stress = medium/high: acknowledge it compassionately; note how stress can increase oil/redness/breakouts; recommend simple calming habits (breathing, short walk, wind-down routine) and a skin routine that avoids over-exfoliation.

Provide general routine advice for today:
- Use weather (heat/humidity/UV) and exercise (sweat) to tailor cleansing, hydration, and sunscreen reminders.
- Keep advice practical and easy to follow.

Recommend skincare ingredients only (no product names/brands):
- Choose 3–6 ingredients tied to the findings (e.g., acne/redness/oil → Salicylic Acid, Niacinamide, Azelaic Acid, Zinc PCA, Panthenol; dark spots → Vitamin C, Arbutin, Kojic Acid, Tranexamic Acid, plus Sunscreen filters).
- For each recommended ingredient, include: name | purpose | typical strength | frequency | best pairs | avoid with | layer as (Toner/Serum/Moisturizer).

Ingredient combinations (be specific):
- Compatible (same routine OK): Niacinamide 4–5% with BHA 0.5–2% / Azelaic 10% / Tranexamic 2–5% / Arbutin 2–7% / Vitamin C (L-AA 8–15% or derivatives) / Zinc PCA / Panthenol / Ceramides. Vitamin C AM + Niacinamide AM/PM is OK. Azelaic 10% + Tranexamic/Arbutin OK.
- Caution (separate by time or alternate nights): AHA/BHA ↔ Retinoid (retinol/retinal); Benzoyl Peroxide 2.5–5% ↔ Retinoid; strong Vitamin C (≥15% L-AA) with strong acids in the same routine.
- Avoid layering (same routine) for most users: multiple strong exfoliants together (AHA + BHA stacks); high-dose Kojic with strong AHA in one go. Always include a short reason to reduce irritation risk.

Layering map (pick what fits TODAY’s findings) — Toner → Serum → Moisturizer:
- Toner (daily hydrating): Glycerin, Hyaluronic Acid, Panthenol, Beta-glucan, Centella, Green tea.
- Toner (acid, 1–3×/week if tolerated): AHA 5–10% (glycolic/lactic) for dullness; BHA 0.5–2% for oil/clogs. Skip if skin is irritated/sensitive today.
- Serum (choose 1–2): 
  • Acne/oil: Niacinamide 4–5%, BHA 0.5–2%, Zinc PCA, Azelaic 10%. 
  • Dark spots: Vitamin C (L-AA 8–15% AM or derivatives), Tranexamic 2–5%, Arbutin 2–7%, Azelaic 10%.
  • Redness/barrier: Panthenol, Centella, Peptides.
- Moisturizer: 
  • Oily/combination → light gel-cream (Niacinamide 3–4%, Ceramides, Squalane). 
  • Dry/sensitive → richer cream (Ceramides + Cholesterol + Fatty acids, Panthenol).
- Order rule: thin → thick; antioxidants/brighteners → retinoid (PM) → moisturizer → sunscreen (AM last).

Safety notes:
- Avoid stacking strong actives the same night (AHA/BHA + retinoid; benzoyl peroxide + strong retinoid). Patch test; pause actives if irritation persists; sunscreen SPF ≥30 daily with reapply guidance.

Writing style:
Clear, empathetic, 2–3 short paragraphs plus concise bullets in the second section. Gentle, supportive, like a personal consultation. Avoid overly technical language; keep it simple and comforting.

EXPECTED OUTPUT
Return the answer in English with two sections:
1) Today's Assessment  — say status for Acne, Dark spots, and Overall using only improving/stable/worsening (no percentages); 3–5 sentences max, warm and clear.
2) Advice & Recommended Ingredients — include AM routine, PM routine, Layering map (Toner/Serum/Moisturizer), Ingredient combinations (Compatible/Caution/Avoid), 3–6 Recommended ingredients with strength/frequency/pairings/avoid-with, plus 1–2 safety notes tailored to sleep/stress/weather/exercise.`;

  return prompt;
}

function calculateSleepHours(sleepTime: string, wakeTime: string): number {
  const [sleepHour, sleepMin] = sleepTime.split(":").map(Number);
  const [wakeHour, wakeMin] = wakeTime.split(":").map(Number);

  let sleepMinutes = sleepHour * 60 + sleepMin;
  let wakeMinutes = wakeHour * 60 + wakeMin;

  if (wakeMinutes < sleepMinutes) {
    wakeMinutes += 24 * 60;
  }

  const totalMinutes = wakeMinutes - sleepMinutes;
  return Math.round((totalMinutes / 60) * 10) / 10;
}