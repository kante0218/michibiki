import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimit } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY);
const limiter = rateLimit({ maxRequests: 5, windowMs: 300_000 }); // 5 requests per 5 minutes

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "anonymous";
  const { success } = limiter(ip);
  if (!success) {
    return NextResponse.json(
      { error: "送信回数の上限に達しました。しばらくしてからもう一度お試しください。" },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { companyName, name, email, phone, employees, plan, message } = body;

    if (!companyName || !name || !email) {
      return NextResponse.json(
        { error: "必須項目が入力されていません" },
        { status: 400 }
      );
    }

    // Send notification email to team
    await resend.emails.send({
      from: "導 みちびき <noreply@michibiki.tech>",
      to: ["t.kante@michibiki.tech"],
      subject: `【導】${plan || "お問い合わせ"}: ${companyName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">新しいお問い合わせ</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #6b7280; width: 120px;">会社名</td><td style="padding: 8px 0; font-weight: 600;">${companyName}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">担当者名</td><td style="padding: 8px 0;">${name}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">メール</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
            ${phone ? `<tr><td style="padding: 8px 0; color: #6b7280;">電話番号</td><td style="padding: 8px 0;">${phone}</td></tr>` : ""}
            ${employees ? `<tr><td style="padding: 8px 0; color: #6b7280;">従業員数</td><td style="padding: 8px 0;">${employees}</td></tr>` : ""}
            ${plan ? `<tr><td style="padding: 8px 0; color: #6b7280;">ご希望プラン</td><td style="padding: 8px 0;">${plan}</td></tr>` : ""}
          </table>
          ${message ? `<div style="margin-top: 16px; padding: 16px; background: #f9fafb; border-radius: 8px;"><p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">お問い合わせ内容:</p><p style="margin: 0; white-space: pre-wrap;">${message}</p></div>` : ""}
        </div>
      `,
    });

    // Send auto-reply to the customer
    await resend.emails.send({
      from: "導 みちびき <noreply@michibiki.tech>",
      to: [email],
      subject: "【導】お問い合わせを受け付けました",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">お問い合わせありがとうございます</h2>
          <p>${name} 様</p>
          <p>この度は導（みちびき）にお問い合わせいただき、誠にありがとうございます。</p>
          <p>以下の内容でお問い合わせを受け付けました。1営業日以内に担当者よりご連絡いたします。</p>
          <div style="margin: 24px 0; padding: 16px; background: #f9fafb; border-radius: 8px;">
            <p style="margin: 0;"><strong>会社名:</strong> ${companyName}</p>
            ${plan ? `<p style="margin: 8px 0 0;"><strong>ご希望プラン:</strong> ${plan}</p>` : ""}
            ${message ? `<p style="margin: 8px 0 0;"><strong>お問い合わせ内容:</strong><br/>${message}</p>` : ""}
          </div>
          <p style="color: #6b7280; font-size: 14px;">ーーーーー<br/>導（みちびき）<br/>support@michibiki.tech</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "送信に失敗しました。しばらくしてからもう一度お試しください。" },
      { status: 500 }
    );
  }
}
