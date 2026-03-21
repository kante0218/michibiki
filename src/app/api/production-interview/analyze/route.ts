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

      // Use Claude to perform comprehensive analysis
      const message = await callWithRetry(() =>
        anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 3000,
          messages: [
            {
              role: "user",
              content: `あなたは日本の採用プラットフォーム「みちびき」の面接評価AIです。
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

${correctRate !== null ? `## 選択問題正答率: ${correctRate}%` : ""}

以下のJSON形式で詳細な評価を返してください:
{
  "technicalScore": 0-100の技術スコア,
  "communicationScore": 0-100のコミュニケーションスコア,
  "problemSolvingScore": 0-100の問題解決スコア,
  "appearanceScore": 0-100の面接態度・印象スコア,
  "correctRate": ${correctRate !== null ? correctRate : "null"},
  "overallMatchingScore": 0-100の求人要件との適合度,
  "aiAnalysis": "詳細なAI分析テキスト（日本語で5-8文程度。候補者の総合的な印象、技術力の評価、コミュニケーション力、求人への適合度を含めてください）",
  "strengths": ["強み1", "強み2", "強み3"],
  "weaknesses": ["改善点1", "改善点2"],
  "recommendation": "採用推奨に関するコメント（日本語で2-3文。強く推奨/推奨/条件付き推奨/非推奨のいずれかを明記してください）"
}

JSONのみを出力してください。`,
            },
          ],
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
      const { data: result, error: insertError } = await supabase
        .from("interview_results")
        .upsert(
          {
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
          },
          { onConflict: "production_interview_id" }
        )
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
