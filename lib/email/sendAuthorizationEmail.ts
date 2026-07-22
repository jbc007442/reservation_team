import { transporter } from './transporter';
import { authorizationTemplate } from './templates/authorization';

interface SendAuthorizationEmailProps {
  to: string;
  subject: string;
  approvalLink: string;
  authForm: any;
}

export async function sendAuthorizationEmail({
  to,
  subject,
  approvalLink,
  authForm,
}: SendAuthorizationEmailProps) {
  try {
    const info = await transporter.sendMail({
      from: `"Travel CRM" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      html: authorizationTemplate({
        authForm,
        approvalLink,
      }),
    });

    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
    };
  } catch (error) {
    console.error('Email Send Error:', error);
    throw error;
  }
}