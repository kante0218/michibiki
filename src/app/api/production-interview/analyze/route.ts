import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Retry wrapper for Anthropic API calls (handles 529 overloaded errors)
async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      const isOverloaded =
        (error instanceof Error && error.message?.includes("Overloaded")) ||
        (error instanceof Error && error.message?.includes("529")) ||
        (typeof error === "object" && error !== null && "status" in error && (error as { status: number }).status === 529);

      if (isOverloaded && attempt < maxRetries) {
        const delay = Math.pow(2, attempt + 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "AI API key not configured" }, { status: 500 });
    }

    const supabase = getSupabaseAdmin();

    // -------------------------------------------------------
    // Action: analyze
    // -------------------------------------------------------
    if (action === "analyze") {
      const { productionInterviewId } = body;

      if (!productionInterviewId) {
        return NextResponse.json({ error: "productionInterviewId is required" }, { status: 400 });
      }

      // Fetch interview data with related job posting
      const { data: interview, error: interviewError } = await supabase
        .from("production_interviews")
        .select("*, job_postings(*)")
        .eq("id", productionInterviewId)
        .single();

      if (interviewError || !interview) {
        console.error("Interview fetch error:", interviewError?.message);
        return NextResponse.json(
          { error: "Interview not found" },
          { status: 404 }
        );
      }

      const questions = interview.questions || [];
      const answers = interview.answers || [];
      const conversationLog = interview.conversation_log || [];
      const jobPosting = interview.job_postings;

      // Calculate correct rate for multiple choice questions
      let correctCount = 0;
      let totalGradable = 0;
      if (Array.isArray(questions) && Array.isArray(answers)) {
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i] as { type?: string; correctAnswer?: string };
          const a = answers[i] as { answer?: string } | undefined;
          if (q.type === "multiple_choice" && q.correctAnswer && a) {
            totalGradable++;
            if (a.answer === q.correctAnswer) {
              correctCount++;
            }
          }
        }
      }
      const correctRate = totalGradable > 0 ? Math.round((correctCount / totalGradable) * 100) : null;

      // Detect expert interview
      const interviewCategory = (interview as Record<string, unknown>).category as string || "";
      const isExpert = interviewCategory.includes("expert") || (body.expert === true);

      // Build analysis prompt (extended for expert with CoT evaluation)
      const basePrompt = `あなたは日本の採用プラットフォーム「みちびき」の面接評価AIです。
以下の面接データを総合的に分析し、評価してください。

## 求人情報
タイトル: ${jobPosting?.title || "不明"}
説明: ${jobPosting?.description || "なし"}
要件: ${jobPosting?.requirements || "なし"}

## 面接問題と回答
${JSON.stringify(questions, null, 2)}

## 候補者の回答
${JSON.stringify(answers, null, 2)}

## 面接会話ログ
${JSON.stringify(conversationLog, null, 2)}

${correctRate !== null ? `## 選択問題正答率: ${correctRate}%` : ""}`;

      const standardOutput = `{
  "technicalScore": 0-100の技術スコア,
  "communicationScore": 0-100のコミュニケーションスコア,
  "problemSolvingScore": 0-100の問題解決スコア,
  "appearanceScore": 0-100の面接態度・印象スコア,
  "correctRate": ${correctRate !== null ? correctRate : "null"},
  "overallMatchingScore": 0-100の求人要件との適合度,
  "aiAnalysis": "詳細なAI分析テキスト（日本語で5-8文程度）",
  "strengths": ["強み1", "強み2", "強み3"],
  "weaknesses": ["改善点1", "改善点2"],
  "recommendation": "採用推奨コメント（強く推奨/推奨/条件付き推奨/非推奨を明記）"`;

      const expertExtension = isExpert ? `,
  "expertAnalysis": {
    "domainExpertiseScore": 0-100のドメイン専門性スコア,
    "thinkingDepth": "surface" | "moderate" | "deep" から1つ選択,
    "chainOfThought": [
      {"step": 1, "description": "候補者の思考ステップ1の説明", "quality": "good" | "adequate" | "weak"},
      {"step": 2, "description": "候補者の思考ステップ2の説明", "quality": "good" | "adequate" | "weak"}
    ],
    "uniqueInsights": ["候補者が示したユニークな洞察1", "洞察2"],
    "readinessLevel": "intermediate_expert" | "advanced_expert" | "thought_leader" から1つ選択,
    "cotSummary": "候補者の思考プロセス全体の評価（日本語3-5文。問題理解→アプローチ選定→代替案検討→リスク評価のプロセスを評価）"
  }` : "";

      const expertInstructions = isExpert ? `

## エキスパート面接 追加評価指示
この面接はエキスパート（専門家）向けの面接です。通常の評価に加え、以下を重点的に評価してください：
1. **思考プロセスの可視化**: 候補者が「なぜその判断に至ったか」を論理的に説明できているか
2. **代替案の検討**: 複数のアプローチを比較検討し、トレードオフを理解しているか
3. **リスク認識**: 潜在的なリスクや限界を適切に認識しているか
4. **独自の洞察**: 他にないユニークな視点や深い専門知識を示しているか
5. **思考の深さ**: 表面的な回答か、深い分析に基づく回答か` : "";

      const analysisPrompt = `${basePrompt}${expertInstructions}

以下のJSON形式で詳細な評価を返してください:
${standardOutput}${expertExtension}
}

JSONのみを出力してください。`;

      // Use Claude to perform comprehensive analysis
      const message = await callWithRetry(() =>
        anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: isExpert ? 4000 : 3000,
          messages: [{ role: "user", content: analysisPrompt }],
        })
      );

      const content = message.content[0];
      if (content.type !== "text") {
        return NextResponse.json({ error: "No response from AI" }, { status: 500 });
      }

      let analysisResult;
      try {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
        }
        analysisResult = JSON.parse(jsonMatch[0]);
      } catch {
        return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
      }

      // Save results to interview_results table
      const upsertData: Record<string, unknown> = {
        production_interview_id: productionInterviewId,
        technical_score: analysisResult.technicalScore,
        communication_score: analysisResult.communicationScore,
        problem_solving_score: analysisResult.problemSolvingScore,
        appearance_score: analysisResult.appearanceScore,
        correct_rate: analysisResult.correctRate,
        overall_matching_score: analysisResult.overallMatchingScore,
        ai_analysis: analysisResult.aiAnalysis,
        strengths: analysisResult.strengths,
        weaknesses: analysisResult.weaknesses,
        recommendation: analysisResult.recommendation,
        analyzed_at: new Date().toISOString(),
      };

      // Include expert CoT analysis if available
      if (isExpert && analysisResult.expertAnalysis) {
        upsertData.expert_analysis = analysisResult.expertAnalysis;
      }

      const { data: result, error: insertError } = await supabase
        .from("interview_results")
        .upsert(upsertData, { onConflict: "production_interview_id" })
        .select()
        .single();

      if (insertError) {
        console.error("Failed to save interview results:", insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      // Create a notification for the company user
      if (jobPosting?.company_id) {
        const candidateName = interview.candidate_name || "候補者";
        await supabase.from("notifications").insert({
          user_id: jobPosting.company_id,
          type: "interview_analyzed",
          title: "面接分析完了",
          message: `${candidateName}さんの面接分析が完了しました。総合適合度: ${analysisResult.overallMatchingScore}%`,
          data: {
            production_interview_id: productionInterviewId,
            overall_matching_score: analysisResult.overallMatchingScore,
          },
          read: false,
        });
      }

      return NextResponse.json({
        result,
        analysis: analysisResult,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const statusCode =
      typeof error === "object" && error !== null && "status" in error
        ? (error as { status: number }).status
        : 500;
    console.error("Production Interview Analyze API error:", statusCode, errMsg);
    return NextResponse.json(
      { error: errMsg || "Internal server error" },
      { status: statusCode === 529 ? 529 : 500 }
    );
  }
}
