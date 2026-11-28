"use server";

import { Resend } from "resend";

export type ContactFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
};

export async function submitContactFormAction(data: ContactFormData) {
  try {
    const { firstName, lastName, email, phone, message } = data;

    if (!firstName?.trim()) {
      return { success: false, error: "First name is required." };
    }
    if (!email?.trim()) {
      return { success: false, error: "Email address is required." };
    }
    if (!message?.trim()) {
      return { success: false, error: "Message is required." };
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn("[Resend Warning]: RESEND_API_KEY is missing. Contact message logged but email not sent.");
      return { success: true };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const targetEmail = process.env.ADMIN_EMAIL || "signaturearthotel@gmail.com";
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const fullName = `${firstName.trim()} ${lastName?.trim() || ""}`.trim();

    const html = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 25px; background-color: #ffffff;">
        <div style="background-color: #000000; padding: 20px; text-align: center; border-bottom: 3px solid #d7b56d; margin: -25px -25px 25px -25px;">
          <h1 style="color: #ffffff; font-size: 22px; font-weight: 300; letter-spacing: 3px; margin: 0; text-transform: uppercase;">Signature Art Hotel</h1>
          <p style="color: #d7b56d; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin: 6px 0 0 0;">New Contact Form Inquiry</p>
        </div>
        
        <h3 style="color: #111111; margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">Guest Message Details</h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; width: 35%; font-weight: bold; color: #555;">Sender Name:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #111;">${fullName}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Email Address:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #111;">
              <a href="mailto:${email}" style="color: #d7b56d; text-decoration: none;">${email}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Phone Number:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #111;">
              ${phone ? `<a href="tel:${phone}" style="color: #111; text-decoration: none;">${phone}</a>` : "Not provided"}
            </td>
          </tr>
        </table>

        <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #d7b56d; border-radius: 2px;">
          <strong style="display: block; margin-bottom: 8px; color: #222; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Message:</strong>
          <p style="margin: 0; line-height: 1.6; font-size: 14px; white-space: pre-wrap; color: #333;">${message.trim()}</p>
        </div>

        <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #888;">
          Signature Art Hotel • Plot # 3 Street 64, F-8/4, Islamabad • +92 333 7660360
        </div>
      </div>
    `;

    const result = await resend.emails.send({
      from: `Signature Art Hotel Website <${fromEmail}>`,
      to: targetEmail,
      replyTo: email,
      subject: `[Contact Inquiry] Message from ${fullName}`,
      html,
    });

    if (result.error) {
      console.error("[Contact Form Resend Error]:", result.error);
      return { success: false, error: result.error.message };
    }

    console.log(`[Contact Form Resend Success]: Delivered to ${targetEmail} (${result.data?.id})`);
    return { success: true };
  } catch (error: any) {
    console.error("[Contact Form Unexpected Error]:", error);
    return { success: false, error: error?.message || "Failed to send message. Please try again." };
  }
}
