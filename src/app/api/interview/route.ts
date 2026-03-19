import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

// Generate questions based on job category and optional test results
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, category, jobTitle, jobDescription, testResults, question, answer, conversationHistory } = body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "AI API key not configured" }, { status: 500 });
    }

    if (action === "generate_test") {
      // Generate field-specific online test questions
      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: `あなたは日本の採用プラットフォーム「みちびき」のAI面接官です。
以下の求人に対する技術テスト問題を5問生成してください。

カテゴリ: ${category}
求人タイトル: ${jobTitle || "一般"}
求人内容: ${jobDescription || "なし"}

各問題は以下のJSON形式で出力してください:
{
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice" | "coding" | "short_answer" | "case_study",
      "question": "問題文",
      "options": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"] (multiple_choiceの場合のみ),
      "correctAnswer": "正解" (multiple_choiceの場合のみ),
      "hint": "ヒント",
      "difficulty": "easy" | "medium" | "hard",
      "timeLimit": 秒数,
      "points": 配点
    }
  ]
}

難易度は段階的に上げてください。最初は基本、最後は応用問題。
JSONのみを出力してください。`,
          },
        ],
      });

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
      const message = await anthropic.messages.create({
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
      });

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
プロフェッショナルかつ温かみのある面接を行ってください。
日本語で自然に会話してください。敬語を使用してください。

面接のルール:
1. 候補者のテスト結果を参考に、深掘り質問をしてください
2. 技術的な質問だけでなく、人間性やチームワークについても聞いてください
3. 回答に基づいて適切なフォローアップ質問をしてください
4. 1回の発言は2-3文程度に抑えてください
5. 必ず1つの質問で終わってください

カテゴリ: ${category}
求人: ${jobTitle || "一般"}
${testResults ? `テスト結果: ${JSON.stringify(testResults)}` : ""}`;

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

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system: systemPrompt,
        messages,
      });

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
      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: `以下の面接の会話履歴を総合的に評価してください。

カテゴリ: ${category}
会話履歴:
${JSON.stringify(conversationHistory, null, 2)}

${testResults ? `テスト結果: ${JSON.stringify(testResults)}` : ""}

以下のJSON形式で評価を返してください:
{
  "overallScore": 0-100の総合スコア,
  "technicalScore": 0-100の技術スコア,
  "communicationScore": 0-100のコミュニケーションスコア,
  "problemSolvingScore": 0-100の問題解決スコア,
  "summary": "総合評価の要約（3-4文）",
  "strengths": ["強み1", "強み2", "強み3"],
  "improvements": ["改善点1", "改善点2"],
  "recommendation": "採用推奨度（強く推奨/推奨/条件付き推奨/非推奨）",
  "detailedFeedback": "詳細なフィードバック（5-6文）"
}

JSONのみを出力してください。`,
          },
        ],
      });

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
    console.error("Interview API error:", errMsg);
    return NextResponse.json({ error: errMsg || "Internal server error" }, { status: 500 });
  }
}
