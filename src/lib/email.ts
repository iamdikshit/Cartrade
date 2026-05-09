import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === 'production',
  },
})

export interface InquiryEmailData {
  carName: string
  carId: string
  senderName: string
  senderEmail: string
  senderPhone: string
  message: string
}

export async function sendInquiryEmail(data: InquiryEmailData) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>New Car Inquiry</title></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
      <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #c2410c, #ea580c); border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🚗 New Car Inquiry</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0;">CarTrade Platform</p>
        </div>
        
        <h2 style="color: #1e293b; border-bottom: 2px solid #f97316; padding-bottom: 8px;">Car Details</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 8px; color: #64748b; font-weight: bold; width: 40%;">Car Name:</td>
            <td style="padding: 8px; color: #1e293b;">${data.carName}</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 8px; color: #64748b; font-weight: bold;">Car ID:</td>
            <td style="padding: 8px; color: #1e293b;">${data.carId}</td>
          </tr>
        </table>

        <h2 style="color: #1e293b; border-bottom: 2px solid #f97316; padding-bottom: 8px;">Buyer Information</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 8px; color: #64748b; font-weight: bold; width: 40%;">Name:</td>
            <td style="padding: 8px; color: #1e293b;">${data.senderName}</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 8px; color: #64748b; font-weight: bold;">Email:</td>
            <td style="padding: 8px;"><a href="mailto:${data.senderEmail}" style="color: #ea580c;">${data.senderEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #64748b; font-weight: bold;">Phone:</td>
            <td style="padding: 8px; color: #1e293b;">${data.senderPhone}</td>
          </tr>
        </table>

        <h2 style="color: #1e293b; border-bottom: 2px solid #f97316; padding-bottom: 8px;">Message</h2>
        <div style="background: #f8fafc; border-left: 4px solid #f97316; padding: 16px; border-radius: 4px; color: #334155; line-height: 1.6;">
          ${data.message}
        </div>

        <div style="margin-top: 32px; text-align: center;">
          <a href="${appUrl}/admin/inquiries" style="background: linear-gradient(135deg, #c2410c, #ea580c); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            View in Admin Panel →
          </a>
        </div>
        
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
          This email was sent automatically by CarTrade Platform
        </p>
      </div>
    </body>
    </html>
  `

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.ADMIN_INQUIRY_EMAIL,
    replyTo: data.senderEmail,
    subject: `New Inquiry: ${data.carName} - from ${data.senderName}`,
    html,
  })
}

export async function sendWelcomeEmail(email: string, name: string, tempPassword: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h1 style="color: #c2410c;">Welcome to CarTrade Admin!</h1>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your admin account has been created. Here are your credentials:</p>
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Temporary Password:</strong> <code style="background: #fee2e2; padding: 4px 8px; border-radius: 4px;">${tempPassword}</code></p>
        </div>
        <p style="color: #dc2626;"><strong>⚠️ Please change your password immediately after first login.</strong></p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/login" style="background: #ea580c; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Login to Admin Panel</a>
      </div>
    </body>
    </html>
  `

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Welcome to CarTrade - Your Admin Account',
    html,
  })
}
