/**
 * Email utility using Resend API.
 * Falls back gracefully when RESEND_API_KEY is not set (logs to console instead).
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'PET ID <noreply@petid.app>';
const APP_NAME = 'PET ID';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email via Resend API.
 * If RESEND_API_KEY is not configured, logs the email to console.
 */
async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.log('[EMAIL - Dev Mode] Would send email:');
    console.log(`  To: ${options.to}`);
    console.log(`  Subject: ${options.subject}`);
    console.log(`  Body: ${options.text || options.html.substring(0, 200)}...`);
    return true;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[EMAIL] Failed to send email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[EMAIL] Error sending email:', error);
    return false;
  }
}

/**
 * Send a "pet found" notification to the pet owner.
 */
export async function sendFoundPetNotification(params: {
  ownerEmail: string;
  ownerName: string;
  petName: string;
  petCode: string;
  finderName?: string;
  finderPhone?: string;
  finderEmail?: string;
  message?: string;
  latitude?: number;
  longitude?: number;
}): Promise<boolean> {
  const locationLink =
    params.latitude && params.longitude
      ? `<p><strong>Location:</strong> <a href="https://maps.google.com/?q=${params.latitude},${params.longitude}">View on map</a></p>`
      : '';

  const finderInfo = [
    params.finderName ? `<p><strong>Finder name:</strong> ${params.finderName}</p>` : '',
    params.finderPhone ? `<p><strong>Phone:</strong> ${params.finderPhone}</p>` : '',
    params.finderEmail ? `<p><strong>Email:</strong> ${params.finderEmail}</p>` : '',
    params.message ? `<p><strong>Message:</strong> ${params.message}</p>` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return sendEmail({
    to: params.ownerEmail,
    subject: `🐾 ${APP_NAME}: Someone found ${params.petName}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6C63FF;">🐾 Good news!</h1>
        <p>Hi ${params.ownerName},</p>
        <p>Someone has found your pet <strong>${params.petName}</strong> (${params.petCode}) and submitted a report.</p>
        
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="margin-top: 0;">Finder Details</h3>
          ${finderInfo || '<p>No contact info provided</p>'}
          ${locationLink}
        </div>
        
        <p>Log in to your ${APP_NAME} dashboard to view the full report and respond.</p>
        <p style="color: #888; font-size: 12px;">This is an automated message from ${APP_NAME}.</p>
      </div>
    `,
    text: `Good news, ${params.ownerName}! Someone found ${params.petName} (${params.petCode}). ${params.finderName ? `Finder: ${params.finderName}` : ''} ${params.finderPhone ? `Phone: ${params.finderPhone}` : ''} ${params.message ? `Message: ${params.message}` : ''}`,
  });
}

/**
 * Send a welcome email to a new user.
 */
export async function sendWelcomeEmail(params: {
  email: string;
  displayName: string;
}): Promise<boolean> {
  return sendEmail({
    to: params.email,
    subject: `🐾 Welcome to ${APP_NAME}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6C63FF;">Welcome to ${APP_NAME}! 🐾</h1>
        <p>Hi ${params.displayName},</p>
        <p>Your account has been created successfully. Here's what you can do:</p>
        <ul>
          <li>🏷️ Create digital ID cards for your pets</li>
          <li>📸 Upload photos and organize them in albums</li>
          <li>📝 Keep medical notes and vaccination records</li>
          <li>📅 Schedule vet appointments with reminders</li>
          <li>👥 Connect with friends and share pet locations</li>
          <li>🔍 Get notified if someone finds your lost pet</li>
        </ul>
        <p>Get started by adding your first pet!</p>
        <p style="color: #888; font-size: 12px;">This is an automated message from ${APP_NAME}.</p>
      </div>
    `,
    text: `Welcome to ${APP_NAME}, ${params.displayName}! Your account has been created. Get started by adding your first pet.`,
  });
}
