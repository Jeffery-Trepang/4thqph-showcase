import { Resend } from "resend";

export interface BookingEmailData {
  sessionType: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  firstName: string;
  lastName: string;
  email: string;
  participants: number;
  gender: string;
  notes?: string | null;
}

export interface BookingEmailResult {
  adminSent: boolean;
  customerSent: boolean;
  adminError?: string;
  customerError?: string;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  return dt.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function fromAddress(): string {
  return (
    process.env.RESEND_FROM ||
    "4th Quarter Performance & Health <onboarding@resend.dev>"
  );
}

/**
 * Send the two booking emails via Resend. Never throws: it returns which send
 * succeeded so the caller can keep the booking and surface a warning.
 */
export async function sendBookingEmails(
  data: BookingEmailData
): Promise<BookingEmailResult> {
  const result: BookingEmailResult = {
    adminSent: false,
    customerSent: false,
  };

  const resend = getResend();
  if (!resend) {
    result.adminError = "RESEND_API_KEY is not set";
    result.customerError = "RESEND_API_KEY is not set";
    return result;
  }

  const from = fromAddress();

  // 1) Notify the admin (HTML table).
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    result.adminError = "ADMIN_EMAIL is not set";
  } else {
    const adminHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <h2 style="color: #2B4160; border-bottom: 2px solid #8C703E; padding-bottom: 10px;">New Session Registration</h2>
  <p>Hi John,</p>
  <p>A new client has registered for a session at 4th Quarter. Here are the details:</p>

  <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold; width: 35%;">Client Name</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${data.firstName} ${data.lastName}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Client Email</td>
      <td style="padding: 10px; border: 1px solid #ddd;"><a href="mailto:${data.email}">${data.email}</a></td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Gender</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${data.gender}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Participants</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${data.participants}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Session Type</td>
      <td style="padding: 10px; border: 1px solid #ddd; color: #2B4160; font-weight: bold;">${data.sessionType}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Date &amp; Time</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${formatDate(data.date)} at ${data.startTime}</td>
    </tr>
  </table>

  <p style="margin-top: 30px; font-size: 12px; color: #777;">This is an automated notification from the 4th Quarter booking system.</p>
</div>`;

    try {
      const { error } = await resend.emails.send({
        from,
        to: adminEmail,
        subject: `New Booking: ${data.firstName} ${data.lastName} - ${data.sessionType} (${formatDate(data.date)})`,
        html: adminHtml,
      });
      if (error) result.adminError = error.message;
      else result.adminSent = true;
    } catch (err) {
      result.adminError = err instanceof Error ? err.message : String(err);
    }
  }

  // 2) Confirm to the customer.
  const summaryLines = [
    `Session type: ${data.sessionType}`,
    `Date: ${formatDate(data.date)}`,
    `Time: ${data.startTime} - ${data.endTime}`,
    `Name: ${data.firstName} ${data.lastName}`,
    `Email: ${data.email}`,
    `Number of participants: ${data.participants}`,
    `Gender: ${data.gender}`,
  ];
  if (data.notes) summaryLines.push(`Notes: ${data.notes}`);
  const summary = summaryLines.join("\n");

  try {
    const { error } = await resend.emails.send({
      from,
      to: data.email,
      subject: `Booking confirmation — ${formatDate(data.date)} ${data.startTime}`,
      text: `Hi ${data.firstName},\n\nThanks for registering! Here are your session details:\n\n${summary}\n\nWe'll see you there!\n\n— 4th Quarter Performance & Health`,
    });
    if (error) result.customerError = error.message;
    else result.customerSent = true;
  } catch (err) {
    result.customerError = err instanceof Error ? err.message : String(err);
  }

  return result;
}

export interface CancellationEmailData {
  sessionType: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  firstName: string;
  email: string;
}

/**
 * Send a session-cancellation apology email to a single customer via Resend.
 * Never throws: returns whether the send succeeded.
 */
export async function sendCancellationEmail(
  data: CancellationEmailData
): Promise<{ sent: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) {
    return { sent: false, error: "RESEND_API_KEY is not set" };
  }

  const from = fromAddress();

  const html = `
    <p>Hi ${data.firstName},</p>
    <p>We are writing to let you know that your upcoming session at 4th Quarter Performance &amp; Health has unfortunately been cancelled.</p>
    <p><strong>Session Details:</strong><br/>
    Type: ${data.sessionType}<br/>
    Date &amp; Time: ${formatDate(data.date)} at ${data.startTime}</p>
    <p>We sincerely apologize for any inconvenience this may cause. Please visit our website to book a new session at your convenience, or reply to this email if you have any questions.</p>
    <p>We look forward to seeing you at the gym soon.</p>
    <p>Best regards,<br/>The 4th Quarter Team</p>
  `;

  try {
    const { error } = await resend.emails.send({
      from,
      to: data.email,
      subject: "Important Update: Your 4th Quarter Session has been Cancelled",
      html,
    });
    if (error) return { sent: false, error: error.message };
    return { sent: true };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : String(err) };
  }
}
