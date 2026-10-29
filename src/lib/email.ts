import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'techa5174@gmail.com';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export type BookingEmailData = {
  bookingId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  totalNights?: number;
  totalAmount: number;
  notes?: string;
};

export async function sendGuestConfirmation(data: BookingEmailData) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Resend Warning]: RESEND_API_KEY is missing. Email not sent.");
    return { success: false, error: "RESEND_API_KEY missing" };
  }

  const recipient = data.guestEmail.trim();
  const nights = data.totalNights || 1;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reservation Confirmed - Signature Art Hotel</title>
    </head>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F7F5F0; margin: 0; padding: 30px 15px; color: #2E2620;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #d7b56d; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        
        <!-- Header Banner -->
        <tr>
          <td style="background-color: #000000; padding: 35px 30px; text-align: center; border-bottom: 3px solid #d7b56d;">
            <h1 style="color: #FFFFFF; font-size: 26px; font-weight: 300; letter-spacing: 5px; margin: 0; text-transform: uppercase;">Signature</h1>
            <p style="color: #d7b56d; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 8px 0 0 0;">Signature Art Hotel</p>
          </td>
        </tr>

        <!-- Greeting & Confirmation -->
        <tr>
          <td style="padding: 35px 30px 20px 30px;">
            <p style="font-size: 16px; margin: 0 0 15px 0; color: #000000;">Dear <strong>${data.guestName}</strong>,</p>
            <p style="font-size: 14.5px; line-height: 1.6; color: #4A4036; margin: 0 0 20px 0;">
              Thank you for choosing Signature Art Hotel. Your luxury reservation has been confirmed and registered in our guest directory. We look forward to welcoming you.
            </p>
          </td>
        </tr>

        <!-- Booking Details Card -->
        <tr>
          <td style="padding: 0 30px 30px 30px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border: 1px solid #d7b56d; border-left: 4px solid #d7b56d;">
              <tr>
                <td style="padding: 20px;">
                  <h3 style="margin: 0 0 15px 0; font-size: 16px; text-transform: uppercase; letter-spacing: 1.5px; color: #000000;">Reservation Folio</h3>
                  
                  <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13.5px; color: #000000;">
                    <tr>
                      <td style="width: 40%; color: #000000; border-bottom: 1px solid #FFFFFF;"><strong>Confirmation ID:</strong></td>
                      <td style="border-bottom: 1px solid #FFFFFF; font-family: monospace; font-size: 14px; font-weight: bold; color: #000000;">${data.bookingId}</td>
                    </tr>
                    <tr>
                      <td style="color: #000000; border-bottom: 1px solid #FFFFFF;"><strong>Suite / Accommodation:</strong></td>
                      <td style="border-bottom: 1px solid #FFFFFF; font-weight: bold; color: #000000;">${data.roomName}</td>
                    </tr>
                    <tr>
                      <td style="color: #000000; border-bottom: 1px solid #FFFFFF;"><strong>Check-In Date:</strong></td>
                      <td style="border-bottom: 1px solid #FFFFFF;">${data.checkIn} <span style="color: #000000; font-size: 12px;">(From 3:00 PM)</span></td>
                    </tr>
                    <tr>
                      <td style="color: #000000; border-bottom: 1px solid #FFFFFF;"><strong>Check-Out Date:</strong></td>
                      <td style="border-bottom: 1px solid #FFFFFF;">${data.checkOut} <span style="color: #000000; font-size: 12px;">(Until 11:00 AM)</span></td>
                    </tr>
                    <tr>
                      <td style="color: #000000; border-bottom: 1px solid #FFFFFF;"><strong>Contact Phone:</strong></td>
                      <td style="border-bottom: 1px solid #FFFFFF;">${data.guestPhone}</td>
                    </tr>
                    <tr>
                      <td style="color: #000000; border-bottom: 1px solid #FFFFFF;"><strong>Payment Status:</strong></td>
                      <td style="border-bottom: 1px solid #FFFFFF; color: #008060; font-weight: bold;">Pay upon Arrival</td>
                    </tr>
                    <tr>
                      <td style="color: #000000; padding-top: 12px;"><strong>Total Amount:</strong></td>
                      <td style="padding-top: 12px; font-size: 18px; font-weight: bold; color: #d7b56d;">$${data.totalAmount.toLocaleString()}</td>
                    </tr>
                  </table>

                  ${data.notes ? `
                    <div style="margin-top: 15px; padding-top: 12px; border-top: 1px dashed #d7b56d; font-size: 12.5px; color: #000000;">
                      <strong>Special Request:</strong> "${data.notes}"
                    </div>
                  ` : ''}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Included Hotel Amenities -->
        <tr>
          <td style="padding: 0 30px 25px 30px; font-size: 13px; color: #594F45; line-height: 1.5;">
            <p style="margin: 0 0 8px 0; font-weight: bold; color: #000000;">Your Stay Includes:</p>
            <ul style="margin: 0; padding-left: 20px; color: #000000;">
              <li>Complimentary High-Speed Wi-Fi & Valet Parking</li>
              <li>Signature Welcome Beverage upon arrival</li>
              <li>Access to Signature Spa & Wellness Centre</li>
            </ul>
          </td>
        </tr>

        <!-- Concierge Contact & Address -->
        <tr>
          <td style="background-color: #FFFFFF; padding: 25px 30px; border-top: 1px solid #d7b56d; font-size: 12.5px; color: #000000; text-align: center; line-height: 1.6;">
            <strong style="color: #000000;">Signature Art Hotel</strong><br>
            F-8, Islamabad, Pakistan<br>
            Direct Concierge: <a href="tel:+4722000000" style="color: #d7b56d; text-decoration: none;">+47 22 00 00 00</a> &bull; Email: <a href="mailto:concierge@grandluxe.com" style="color: #d7b56d; text-decoration: none;">concierge@grandluxe.com</a>
          </td>
        </tr>

      </table>
    </body>
    </html>
  `;

  try {
    const result = await resend.emails.send({
      from: `Signature Art Hotel <${FROM_EMAIL}>`,
      to: recipient,
      subject: `Reservation Confirmed: ${data.roomName} - Signature Art Hotel (${data.bookingId.slice(0, 8)})`,
      html,
    });

    if (result.error) {
      console.warn("[Resend Warning - Direct Guest Send Failed]:", result.error.message);

      // If Resend gives 403 sandbox limitation (can only send to account owner's email techa5174@gmail.com)
      if (result.error.message?.includes("only send testing emails") || (result.error as any).statusCode === 403) {
        console.log(`[Resend Sandbox Notice]: Forwarding guest confirmation to registered Resend account email: ${ADMIN_EMAIL}`);
        const fallbackResult = await resend.emails.send({
          from: `Signature Art Hotel <${FROM_EMAIL}>`,
          to: ADMIN_EMAIL,
          subject: `[Test Mode - Guest Folio: ${recipient}] Reservation Confirmed: ${data.roomName} (${data.bookingId.slice(0, 8)})`,
          html: `
            <div style="background-color: #FEF3C7; border: 2px solid #F59E0B; padding: 15px; margin-bottom: 20px; font-family: sans-serif; font-size: 13px; color: #92400E;">
              <strong>ℹ️ Resend Sandbox Mode Notice:</strong><br>
              In Resend free test mode (using <code>onboarding@resend.dev</code>), emails can only be sent to the verified account owner (<code>${ADMIN_EMAIL}</code>).<br>
              This is a full copy of the confirmation email intended for <strong>${recipient}</strong>.<br>
              <em>To send directly to external guest emails in production, verify your custom domain at <a href="https://resend.com/domains" target="_blank">resend.com/domains</a>.</em>
            </div>
            ${html}
          `,
        });
        return { success: true, forwardedToAdmin: true, data: fallbackResult.data };
      }

      return { success: false, error: result.error };
    }

    console.log(`[Resend Success]: Booking confirmation successfully dispatched to guest email: ${recipient} (Resend ID: ${result.data?.id})`);
    return { success: true, data: result.data };
  } catch (err: any) {
    console.error("[Resend Exception - Guest Confirmation]:", err);
    return { success: false, error: err?.message || err };
  }
}

export async function sendAdminAlert(data: BookingEmailData) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Resend Warning]: RESEND_API_KEY is missing. Email not sent.");
    return;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px;">
      <h2 style="color: #d7b56d; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-top: 0;">New Reservation Received</h2>
      <p>A new reservation has been placed by <strong>${data.guestName}</strong>.</p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
        <tr><td style="padding: 10px; border-bottom: 1px solid #eee; width: 35%;"><strong>Confirmation ID:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.bookingId}</td></tr>
        <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Guest Name:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.guestName}</td></tr>
        <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Guest Email:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;"><a href="mailto:${data.guestEmail}">${data.guestEmail}</a></td></tr>
        <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Guest Phone:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.guestPhone}</td></tr>
        <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Suite:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.roomName}</td></tr>
        <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Check-In:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.checkIn}</td></tr>
        <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Check-Out:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.checkOut}</td></tr>
        <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Total Revenue:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #d7b56d;">$${data.totalAmount.toLocaleString()}</td></tr>
      </table>
      <div style="text-align: center; margin-top: 25px;">
        <a href="https://osloelitehotel.com/admin/bookings" style="display: inline-block; padding: 12px 24px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 2px; font-weight: bold;">View Reservation in Admin Dashboard</a>
      </div>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from: `Signature Art Hotel System <${FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `[New Reservation] ${data.roomName} - ${data.guestName}`,
      html,
    });

    if (result.error) {
      console.error("[Resend Error - Admin Email]:", result.error);
    } else {
      console.log(`[Resend Success - Admin Alert]: Sent to ${ADMIN_EMAIL} (${result.data?.id})`);
    }
    return result;
  } catch (err) {
    console.error("[Resend Exception - Admin Email]:", err);
  }
}
