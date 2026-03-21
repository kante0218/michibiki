import { NextResponse } from "next/server";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

// Verify the webhook signature from Supabase
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Email templates
function getConfirmationEmail(confirmUrl: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 40px auto; padding: 0 20px; background-color: #f8fafc;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 28px; font-weight: 800; color: #4f46e5; margin: 0;">Michibiki</h1>
        <p style="font-size: 13px; color: #94a3b8; margin-top: 4px;">キャリアの道を照らす</p>
      </div>
      <div style="background: white; border-radius: 16px; padding: 40px 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; width: 56px; height: 56px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 16px; line-height: 56px; font-size: 28px;">✉️</div>
        </div>
        <h2 style="text-align: center; font-size: 20px; font-weight: 700; color: #1e293b; margin: 0 0 12px;">メールアドレスを確認してください</h2>
        <p style="text-align: center; font-size: 14px; color: #64748b; line-height: 1.6; margin: 0 0 32px;">
          Michibikiへのご登録ありがとうございます。<br>以下のボタンをクリックして、アカウントを有効化してください。
        </p>
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${confirmUrl}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; text-decoration: none; border-radius: 12px; font-size: 15px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(79,70,229,0.3);">
            アカウントを確認する
          </a>
        </div>
        <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="font-size: 12px; color: #94a3b8; margin: 0 0 8px;">ボタンが機能しない場合：</p>
          <p style="font-size: 11px; color: #6366f1; margin: 0; word-break: break-all;">${confirmUrl}</p>
        </div>
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">このメールに心当たりがない場合は、無視してください。</p>
      </div>
      <div style="text-align: center; margin-top: 24px;">
        <p style="font-size: 12px; color: #94a3b8;">© 2026 Michibiki. All rights reserved.</p>
      </div>
    </div>`;
}

function getRecoveryEmail(recoveryUrl: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 40px auto; padding: 0 20px; background-color: #f8fafc;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 28px; font-weight: 800; color: #4f46e5; margin: 0;">Michibiki</h1>
        <p style="font-size: 13px; color: #94a3b8; margin-top: 4px;">キャリアの道を照らす</p>
      </div>
      <div style="background: white; border-radius: 16px; padding: 40px 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; width: 56px; height: 56px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 16px; line-height: 56px; font-size: 28px;">🔑</div>
        </div>
        <h2 style="text-align: center; font-size: 20px; font-weight: 700; color: #1e293b; margin: 0 0 12px;">パスワードをリセット</h2>
        <p style="text-align: center; font-size: 14px; color: #64748b; line-height: 1.6; margin: 0 0 32px;">
          パスワードリセットのリクエストを受け付けました。<br>以下のボタンをクリックして、新しいパスワードを設定してください。
        </p>
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${recoveryUrl}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; text-decoration: none; border-radius: 12px; font-size: 15px; font-weight: 600;">
            パスワードをリセットする
          </a>
        </div>
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">このリクエストに心当たりがない場合は、無視してください。</p>
      </div>
      <div style="text-align: center; margin-top: 24px;">
        <p style="font-size: 12px; color: #94a3b8;">© 2026 Michibiki. All rights reserved.</p>
      </div>
    </div>`;
}

function getMagicLinkEmail(magicUrl: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 40px auto; padding: 0 20px; background-color: #f8fafc;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 28px; font-weight: 800; color: #4f46e5; margin: 0;">Michibiki</h1>
        <p style="font-size: 13px; color: #94a3b8; margin-top: 4px;">キャリアの道を照らす</p>
      </div>
      <div style="background: white; border-radius: 16px; padding: 40px 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
        <h2 style="text-align: center; font-size: 20px; font-weight: 700; color: #1e293b; margin: 0 0 12px;">ログインリンク</h2>
        <p style="text-align: center; font-size: 14px; color: #64748b; line-height: 1.6; margin: 0 0 32px;">
          以下のボタンをクリックしてログインしてください。
        </p>
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${magicUrl}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; text-decoration: none; border-radius: 12px; font-size: 15px; font-weight: 600;">
            ログインする
          </a>
        </div>
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">このメールに心当たりがない場合は、無視してください。</p>
      </div>
    </div>`;
}

const subjectMap: Record<string, string> = {
  confirmation: "【Michibiki】メールアドレスの確認",
  recovery: "【Michibiki】パスワードのリセット",
  magic_link: "【Michibiki】ログインリンク",
  invite: "【Michibiki】招待されました",
  email_change: "【Michibiki】メールアドレス変更の確認",
};

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    // Verify webhook signature from Supabase
    const signature = request.headers.get("x-supabase-signature");
    const hookSecret = process.env.SUPABASE_HOOK_SECRET;
    if (hookSecret && signature) {
      if (!verifyWebhookSignature(rawBody, signature, hookSecret)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);

    // Supabase Send Email Hook payload
    const { user, email_data } = body;
    const emailType = email_data?.email_action_type || "confirmation";
    const toEmail = user?.email;
    const confirmationUrl = email_data?.confirmation_url || email_data?.action_link || "";
    const token = email_data?.token || "";
    const tokenHash = email_data?.token_hash || "";
    const redirectTo = email_data?.redirect_to || "https://www.michibiki.tech/home";

    if (!toEmail) {
      return NextResponse.json({ error: "No email address" }, { status: 400 });
    }

    // Build the confirmation URL if not provided
    let finalUrl = confirmationUrl;
    if (!finalUrl && tokenHash) {
      finalUrl = `https://njfsqtmzxfjbxsrqfjyi.supabase.co/auth/v1/verify?token=${tokenHash}&type=${emailType}&redirect_to=${encodeURIComponent(redirectTo)}`;
    }

    // Select template based on email type
    let html: string;
    switch (emailType) {
      case "recovery":
        html = getRecoveryEmail(finalUrl);
        break;
      case "magic_link":
        html = getMagicLinkEmail(finalUrl);
        break;
      default:
        html = getConfirmationEmail(finalUrl);
        break;
    }

    const subject = subjectMap[emailType] || subjectMap.confirmation;

    const { error } = await resend.emails.send({
      from: "Michibiki <noreply@michibiki.tech>",
      to: toEmail,
      subject,
      html,
    });

    if (error) {
      // Log but still return 200 so Supabase creates the user
      console.error("Resend send error:", error);
    }

    // Always return 200 to Supabase so user creation succeeds
    // even if email delivery fails
    return NextResponse.json({});
  } catch (err) {
    console.error("Send email hook error:", err);
    // Still return 200 to avoid blocking user creation
    return NextResponse.json({});
  }
}
