import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_HOST_USER,
    pass: process.env.EMAIL_HOST_PASSWORD,
  },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, phone, service, message } = body;

    // Validate required fields
    if (!fullName || !email || !service || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Email content for admin
    const adminMailOptions = {
      from: process.env.EMAIL_HOST_USER,
      to: process.env.EMAIL_TO,
      subject: `New Contact Form Submission from ${fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1254FF;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Service:</strong> ${service}</p>
          <h3 style="color: #00C4FF;">Message:</h3>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr style="border: 1px solid #1254FF; margin: 20px 0;">
          <p style="color: #8D8D8D; font-size: 12px;">This is an automated email. Please reply to ${email}</p>
        </div>
      `,
    };

    // Email content for user (confirmation)
    const userMailOptions = {
      from: process.env.EMAIL_HOST_USER,
      to: email,
      subject: 'We received your message - DMS Mehedi',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1254FF;">Thank You for Reaching Out!</h2>
          <p>Hi ${fullName},</p>
          <p>We have received your message and will get back to you as soon as possible.</p>
          <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Service:</strong> ${service}</p>
            <p><strong>Your Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>
          <p>Best regards,<br><strong>DMS Mehedi</strong></p>
          <hr style="border: 1px solid #1254FF; margin: 20px 0;">
          <p style="color: #8D8D8D; font-size: 12px;">If you have any questions, feel free to reply to this email.</p>
        </div>
      `,
    };

    // Send emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);

    return NextResponse.json(
      { message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

