import { transporter } from './transporter';
import { eticketTemplate } from './templates/eticketTemplate';

interface SendEticketEmailProps {
  to: string;
  booking: any;
  authForm: any;
}

export async function sendEticketEmail({ to, booking, authForm }: SendEticketEmailProps) {
  const html = eticketTemplate({
    booking,
    authForm,
  });

  await transporter.sendMail({
    from: `"Reservation Desk" <${process.env.SMTP_USER}>`,
    to,
    replyTo: process.env.SMTP_USER,
    subject: `E-Ticket Confirmation | ${authForm.bookingReferenceNo}`,
    html,
  });

  return html;
}
