import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

// Types for better error handling
interface EmailError extends Error {
    code?: string // SMTP error codes like 'EAUTH', 'ECONNECTION', 'ETIMEDOUT'
    response?: string // SMTP server response
}

function isEmailError(e: unknown): e is EmailError {
    return (
        typeof e === 'object' &&
        e !== null &&
        'message' in e
    )
}

interface EmailResult {
    success: boolean
    messageId?: string // Nodemailer message ID for tracking
}

// Email configuration validation
function validateEmailConfig(): void {
    const required = ['SMTP_HOST', 'EMAIL', 'EMAIL_PASSWORD']
    const missing = required.filter(key => !process.env[key])

    if (missing.length > 0) {
        throw new Error(`Missing email configuration: ${missing.join(', ')}`)
    }
}

// Create transporter with fallback configuration
function createEmailTransporter(): Transporter | null {
    try {
        validateEmailConfig()

        const port = parseInt(process.env.SMTP_PORT || '465')
        const secure = port === 465 // true for 465, false for other ports

        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port,
            secure,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
            // Add connection timeout and retry options
            connectionTimeout: 10000, // 10 seconds
            greetingTimeout: 5000, // 5 seconds
            socketTimeout: 10000, // 10 seconds
        })
    } catch (error: unknown) {
        const msg = isEmailError(error) ? error.message : 'Unknown error'
        console.warn('Email configuration not available:', msg)
        return null
    }
}

const transporter = createEmailTransporter()

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }): Promise<EmailResult> {
    // Check if email is configured
    if (!transporter) {
        console.warn('Email not configured')
        throw new Error('Email service not configured. Please set up SMTP settings.')
    }

    const mailOptions = {
        from: `"${process.env.EMAIL_FROM || 'Serve'}" <${process.env.EMAIL}>`,
        to,
        subject,
        html,

    }

    try {
        const info = await transporter.sendMail(mailOptions)
        return { success: true, messageId: info.messageId }
    } catch (error: unknown) {
        console.error('Failed to send magic link email:', error)

        // Provide more specific error messages based on SMTP error codes
        const emailError = isEmailError(error) ? error : undefined
        if (emailError?.code === 'EAUTH') {
            throw new Error('Email authentication failed. Please check your email credentials.')
        } else if (emailError?.code === 'ECONNECTION') {
            throw new Error('Cannot connect to email server. Please check your SMTP settings.')
        } else if (emailError?.code === 'ETIMEDOUT') {
            throw new Error('Email sending timed out. Please try again.')
        } else {
            throw new Error(`Failed to send email: ${emailError?.message || 'Unknown error'}`)
        }
    }
}

export async function sendInformAdminEmail({
    to,
    subject,
    type,
    name,
    email,
    phone,
    message,
}: {
    to: string
    subject: string
    type: 'early-access' | 'founder-contact'
    name: string
    email: string
    phone?: string | null
    message?: string | null
}) {

    const safePhone = phone && phone.trim().length > 0 ? phone : 'N/A'
    const safeMessage = message && message.trim().length > 0 ? message : 'N/A'
    const title = type === 'founder-contact'
        ? 'New Founder Contact Submission'
        : 'New Early Access Request'
    const intro = type === 'founder-contact'
        ? 'Someone has just submitted a new founder contact message with the following details:'
        : 'Someone has just requested early access with the following details:'

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #111827; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f9fafb;">
          <div style="background: #ffffff; border-radius: 12px; padding: 24px 24px 20px 24px; margin: 0 0 16px 0; border: 1px solid #e5e7eb; box-shadow: 0 10px 15px -3px rgba(15,23,42,0.08);">
            <h2 style="color: #111827; margin-top: 0; margin-bottom: 8px; font-size: 20px;">${title}</h2>
            <p style="color: #4b5563; margin: 0 0 16px 0; font-size: 14px;">
              ${intro}
            </p>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tbody>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #374151; width: 120px;">Name</td>
                  <td style="padding: 8px 0; color: #111827;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #374151;">Email</td>
                  <td style="padding: 8px 0; color: #111827;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #374151;">Phone</td>
                  <td style="padding: 8px 0; color: #111827;">${safePhone}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #374151; vertical-align: top;">Message</td>
                  <td style="padding: 8px 0; color: #111827; white-space: pre-wrap;">${safeMessage}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p style="color: #9ca3af; font-size: 12px; margin-top: 0; text-align: center;">
            You are receiving this email because you are configured as an admin for Serve.
          </p>

          <div style="text-align: center; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 11px; margin: 0;">
              This email was sent from Serve File Storage Server
            </p>
          </div>
        </body>
      </html>
    `

    return sendEmail({ to, subject, html })
}

// Test email configuration
export async function testEmailConfiguration(): Promise<{ success: boolean; error?: string }> {
    if (!transporter) {
        return { success: false, error: 'Email not configured' }
    }

    try {
        await transporter.verify()
        return { success: true }
    } catch (error: unknown) {
        const msg = isEmailError(error) ? error.message : 'Unknown verification error'
        return { success: false, error: msg }
    }
}



