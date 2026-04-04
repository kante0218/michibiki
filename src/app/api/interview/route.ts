import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { generateTestFromBank, hasQuestionBank } from "@/lib/questionBank";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({ maxRequests: 20, windowMs: 60_000 });

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

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
        // Exponential backoff: 2s, 4s, 8s
        const delay = Math.pow(2, attempt + 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

// Generate questions based on job category and optional test results
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "anonymous";
  const { success } = limiter(ip);
  if (!success) {
    return NextResponse.json(
      { error: "リクエストが多すぎます。しばらくしてからもう一度お試しください。" },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { action, category, jobTitle, jobDescription, testResults, question, answer, conversationHistory } = body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "AI API key not configured" }, { status: 500 });
    }

    if (action === "generate_test") {
      // Try question bank first (randomized from large pool to prevent cheating)
      if (hasQuestionBank(category)) {
        const bankQuestions = generateTestFromBank(category);
        if (bankQuestions && bankQuestions.length === 10) {
          const questions = bankQuestions.map((q, i) => ({
            id: i + 1,
            type: q.type,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            hint: q.hint,
            difficulty: q.difficulty,
            timeLimit: q.timeLimit,
            points: q.points,
          }));
          return NextResponse.json({ questions });
        }
      }

      // Fallback: AI generation for categories without question bank
      const message = await callWithRetry(() => anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 6000,
        messages: [
          {
            role: "user",
            content: `あなたは日本の採用プラットフォーム「みちびき」のAI面接官です。
高専生・大学院生の専門知識を評価する面接テストを合計10問生成してください。
候補者は学生です。実務経験ではなく、学業・研究・学術的な知識と応用力を評価してください。

【構成】
- 前半5問: multiple_choice（4択問題）
- 後半5問: short_answer または case_study（記述問題）

カテゴリ: ${category}
求人タイトル: ${jobTitle || "一般"}
求人内容: ${jobDescription || "なし"}

【重要なルール】
1. 問題の順序をランダム化しないでください（選択→記述の順番を守る）
2. 選択問題の正解の位置は均等に分散させてください（全てAやBにしない）
3. 記述問題は学術的な知識の応用や研究シナリオに基づいてください
4. 同じ知識を問う問題を重複させないでください
5. 難易度は段階的に上げてください（各セクション内でeasy→hard）
6. 学生の学習到達度とポテンシャルを測る問題にしてください

各問題は以下のJSON形式で出力してください:
{
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "question": "問題文",
      "options": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
      "correctAnswer": "正解の選択肢テキスト",
      "hint": "ヒント",
      "difficulty": "easy" | "medium" | "hard",
      "timeLimit": 60,
      "points": 10
    },
    {
      "id": 6,
      "type": "short_answer" | "case_study",
      "question": "具体的なシナリオ付きの記述問題文",
      "hint": "ヒント",
      "difficulty": "easy" | "medium" | "hard",
      "timeLimit": 180,
      "points": 10
    }
  ]
}

JSONのみを出力してください。`,
          },
        ],
      }));

      const content = message.content[0];
      if (content.type === "text") {
        try {
          const jsonMatch = content.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return NextResponse.json(parsed);
          }
        } catch {
          return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
        }
      }
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    if (action === "evaluate_test") {
      // Evaluate test answers
      const message = await callWithRetry(() => anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: `以下のテスト結果を評価してください。

テスト結果:
${JSON.stringify(testResults, null, 2)}

以下のJSON形式で評価を返してください:
{
  "totalScore": 合計点,
  "maxScore": 満点,
  "percentage": パーセンテージ,
  "evaluation": "総合評価コメント",
  "strengths": ["強み1", "強み2"],
  "weaknesses": ["改善点1", "改善点2"],
  "questionFeedback": [
    {
      "questionId": 1,
      "correct": true/false,
      "feedback": "フィードバックコメント"
    }
  ]
}

JSONのみを出力してください。`,
          },
        ],
      }));

      const content = message.content[0];
      if (content.type === "text") {
        try {
          const jsonMatch = content.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return NextResponse.json(parsed);
          }
        } catch {
          return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
        }
      }
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    if (action === "interview_question") {
      // Generate next interview question based on conversation history and test results
      const systemPrompt = `あなたは日本の採用プラットフォーム「みちびき」のAI面接官です。
高専生・大学院生を対象に、学生の専門知識とポテンシャルを評価する面接を行ってください。
候補者は学生です。社会人経験ではなく、研究経験・学術プロジェクト・技術的基礎力・成長ポテンシャルに注目してください。
日本語で自然に会話してください。敬語を使用し、学生に対して励ましつつも丁寧に深掘りしてください。

面接のルール:
1. 候補者のテスト結果（選択5問+記述5問）を必ず参考にしてください
2. テストで間違えた問題や記述の弱い部分を重点的に深掘りしてください
3. 記述回答の内容をもとに「なぜそう考えたのか」「他のアプローチは？」などフォローアップしてください
4. 研究経験、卒業研究、学術プロジェクトについて積極的に質問してください
5. 技術的基礎力だけでなく、学ぶ姿勢やチームでの協働経験についても聞いてください
6. 質問は簡潔にしてください。前置きは1文程度、質問は1つだけにしてください
7. 必ず1つの明確な質問で終わってください
8. 長い文章は避け、合計3文以内にしてください
9. 音声で読み上げられることを意識し、自然な話し言葉を使ってください
10. テストの記述回答をそのまま繰り返さず、さらに発展的な質問をしてください

カテゴリ: ${category}
求人: ${jobTitle || "一般"}
${testResults ? `テスト結果（選択5問+記述5問の回答と評価）: ${JSON.stringify(testResults)}` : ""}`;

      const messages: Anthropic.MessageParam[] = conversationHistory || [];

      if (question && answer) {
        // Add the latest Q&A to history
        messages.push({ role: "assistant", content: question });
        messages.push({ role: "user", content: answer });
      }

      if (messages.length === 0) {
        messages.push({
          role: "user",
          content: "面接を始めてください。まず自己紹介をお願いします。",
        });
      }

      const message = await callWithRetry(() => anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system: systemPrompt,
        messages,
      }));

      const content = message.content[0];
      if (content.type === "text") {
        return NextResponse.json({
          question: content.text,
          conversationHistory: messages,
        });
      }
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    if (action === "evaluate_interview") {
      // Final evaluation of the entire interview
      const message = await callWithRetry(() => anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: `以下の面接の会話履歴を総合的に評価してください。
候補者は高専生または大学院生です。社会人経験がないことを前提に、学生としてのポテンシャルと専門性を重視して評価してください。

カテゴリ: ${category}
会話履歴:
${JSON.stringify(conversationHistory, null, 2)}

${testResults ? `テスト結果: ${JSON.stringify(testResults)}` : ""}

以下の5つの評価軸で採点してください:
- 専門知識: 学術的な専門知識の深さと正確さ
- 研究力: 研究経験、実験設計、問題発見能力
- 論理的思考力: 論理的な説明力、仮説構築力
- コミュニケーション力: 説明の明瞭さ、質疑応答の対応力
- ポテンシャル: 成長可能性、学習意欲、好奇心

以下のJSON形式で評価を返してください:
{
  "overallScore": 0-100の総合スコア,
  "technicalScore": 0-100の専門知識スコア,
  "researchScore": 0-100の研究力スコア,
  "communicationScore": 0-100のコミュニケーション力スコア,
  "problemSolvingScore": 0-100の論理的思考力スコア,
  "potentialScore": 0-100のポテンシャルスコア,
  "summary": "総合評価の要約（3-4文）",
  "strengths": ["強み1", "強み2", "強み3"],
  "improvements": ["改善点1", "改善点2"],
  "recommendation": "採用推奨度（強く推奨/推奨/条件付き推奨/非推奨）",
  "detailedFeedback": "詳細なフィードバック（5-6文）"
}

JSONのみを出力してください。`,
          },
        ],
      }));

      const content = message.content[0];
      if (content.type === "text") {
        try {
          const jsonMatch = content.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return NextResponse.json(parsed);
          }
        } catch {
          return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
        }
      }
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const statusCode = (typeof error === "object" && error !== null && "status" in error) ? (error as { status: number }).status : 500;
    console.error("Interview API error:", statusCode, errMsg);
    return NextResponse.json({ error: errMsg || "Internal server error" }, { status: statusCode === 529 ? 529 : 500 });
  }
}
