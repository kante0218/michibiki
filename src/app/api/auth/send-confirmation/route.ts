import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, confirmationUrl } = await request.json();

    if (!email || !confirmationUrl) {
      return NextResponse.json(
        { error: "メールアドレスと確認URLが必要です" },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: "Michibiki <noreply@michibiki.tech>",
      to: email,
      subject: "【Michibiki】メールアドレスの確認",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 560px; margin: 40px auto; padding: 0 20px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="font-size: 28px; font-weight: 800; color: #4f46e5; margin: 0; letter-spacing: -0.5px;">Michibiki</h1>
              <p style="font-size: 13px; color: #94a3b8; margin-top: 4px;">キャリアの道を照らす</p>
            </div>

            <!-- Card -->
            <div style="background: white; border-radius: 16px; padding: 40px 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
              <!-- Icon -->
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; width: 56px; height: 56px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 16px; line-height: 56px; font-size: 28px;">
                  ✉️
                </div>
              </div>

              <h2 style="text-align: center; font-size: 20px; font-weight: 700; color: #1e293b; margin: 0 0 12px 0;">
                メールアドレスを確認してください
              </h2>

              <p style="text-align: center; font-size: 14px; color: #64748b; line-height: 1.6; margin: 0 0 32px 0;">
                Michibikiへのご登録ありがとうございます。<br>
                以下のボタンをクリックして、アカウントを有効化してください。
              </p>

              <!-- Button -->
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${confirmationUrl}"
                   style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; text-decoration: none; border-radius: 12px; font-size: 15px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
                  アカウントを確認する
                </a>
              </div>

              <!-- Fallback link -->
              <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="font-size: 12px; color: #94a3b8; margin: 0 0 8px 0;">ボタンが機能しない場合は、以下のURLをブラウザにコピーしてください：</p>
                <p style="font-size: 11px; color: #6366f1; margin: 0; word-break: break-all;">${confirmationUrl}</p>
              </div>

              <!-- Note -->
              <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
                このメールに心当たりがない場合は、無視してください。
              </p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 24px;">
              <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                © 2026 Michibiki. All rights reserved.
              </p>
              <p style="font-size: 11px; color: #cbd5e1; margin-top: 4px;">
                <a href="https://www.michibiki.tech" style="color: #94a3b8; text-decoration: none;">www.michibiki.tech</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "メール送信に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error("Send confirmation error:", err);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
