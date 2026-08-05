import { Booking } from '@/components/admin/booking/types';

interface Passenger {
  title: string;
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  eTicketNo?: string;
}

interface EticketTemplateProps {
  booking: Booking;
  authForm: any;
  passenger: Passenger;
}

export function eticketTemplate({ booking, authForm, passenger }: EticketTemplateProps) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>E-Ticket Confirmation</title>
</head>

<body style="margin:0;padding:30px;background:#eef2f7;font-family:Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">

<table width="680" cellpadding="0" cellspacing="0"
style="background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 10px 35px rgba(0,0,0,.08);">

<!-- Header -->
<tr>
<td style="background:#0f172a;padding:28px;text-align:center;">

<div style="font-size:34px;">✈️</div>

<h1 style="margin:10px 0 5px;color:#fff;font-size:28px;">
Reservation Desk
</h1>

<div style="color:#cbd5e1;font-size:15px;">
Electronic Ticket Confirmation
</div>

<div style="
display:inline-block;
margin-top:18px;
background:#16a34a;
color:#fff;
padding:8px 20px;
border-radius:999px;
font-weight:bold;
font-size:14px;">
✓ CONFIRMED
</div>

</td>
</tr>

<!-- Greeting -->
<tr>
<td style="padding:35px;">

<p style="font-size:18px;margin:0 0 15px;">
Hello <strong>${booking.customer.name}</strong>,
</p>

<p style="font-size:15px;color:#475569;line-height:26px;margin:0;">
Your booking has been successfully ticketed.
Please find your itinerary below.
</p>

</td>
</tr>

<!-- Booking -->
<tr>
<td style="padding:0 35px 25px;">

<table width="100%"
style="border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc;">

<tr>
<td style="padding:18px;">

<div style="font-size:12px;color:#64748b;">
BOOKING REFERENCE
</div>

<div style="font-size:22px;font-weight:bold;color:#0f172a;">
${authForm.bookingReferenceNo}
</div>

</td>

<td align="right" style="padding:18px;">

<div style="font-size:12px;color:#64748b;">
SERVICE
</div>

<div style="font-size:18px;font-weight:bold;">
${booking.service}
</div>

</td>
</tr>

</table>

</td>
</tr>

<!-- Passenger -->
<tr>
<td style="padding:0 35px;">

<h3 style="margin:0 0 15px;">
Passenger
</h3>

<table width="100%" style="border-collapse:collapse;">

<tr>
<td style="padding:14px;border:1px solid #e5e7eb;">
Passenger
</td>

<td style="padding:14px;border:1px solid #e5e7eb;">
${passenger.title} ${passenger.firstName} ${passenger.lastName}
</td>
</tr>

<tr>

<td style="padding:14px;border:1px solid #e5e7eb;">
Gender
</td>

<td style="padding:14px;border:1px solid #e5e7eb;">
${passenger.gender}
</td>

</tr>

<tr>

<td style="padding:14px;border:1px solid #e5e7eb;">
E-Ticket Number
</td>

<td style="
padding:14px;
border:1px solid #e5e7eb;
font-size:20px;
font-weight:bold;
color:#2563eb;">

${passenger.eTicketNo}

</td>

</tr>

</table>

</td>
</tr>

<!-- Flight -->
<tr>

<td style="padding:35px;">

<h3 style="margin-top:0;">
Journey
</h3>

<table width="100%"
style="background:#f8fafc;border-radius:10px;">

<tr>

<td style="padding:20px;text-align:center;">

<div style="font-size:13px;color:#64748b;">
FROM
</div>

<div style="font-size:24px;font-weight:bold;">
${booking.journey.fromCity}
</div>

</td>

<td style="
font-size:34px;
text-align:center;">
✈️
</td>

<td style="padding:20px;text-align:center;">

<div style="font-size:13px;color:#64748b;">
TO
</div>

<div style="font-size:24px;font-weight:bold;">
${booking.journey.toCity}
</div>

</td>

</tr>

</table>

</td>

</tr>

<!-- Travel Notice -->

<tr>

<td style="padding:0 35px 35px;">

<div style="
background:#eff6ff;
border-left:5px solid #2563eb;
padding:18px;
border-radius:8px;">

<strong>Travel Reminder</strong>

<ul style="margin:12px 0 0 18px;color:#475569;line-height:24px;">

<li>Carry a valid Passport / Government ID.</li>

<li>Arrive at least 3 hours before departure.</li>

<li>Check baggage allowance with your airline.</li>

<li>Keep this email for future reference.</li>

</ul>

</div>

</td>

</tr>

<!-- Footer -->

<tr>

<td style="
background:#0f172a;
color:#cbd5e1;
padding:22px;
text-align:center;
font-size:13px;">

Reservation Desk<br>

support@reservation.team

</td>

</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
}
