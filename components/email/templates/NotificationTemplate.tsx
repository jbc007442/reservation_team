interface NotificationTemplateProps {
  title?: string;
  message?: string;
}

export default function NotificationTemplate({
  title = 'Booking Notification',
  message = 'Your booking status has been updated.',
}: NotificationTemplateProps) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${title}</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
<tr>
<td align="center">

<table width="650" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;">

<!-- Header -->

<tr>
<td align="center" style="background:#0F4C81;padding:45px;">

<div style="font-size:13px;color:#b8d7ff;letter-spacing:2px;text-transform:uppercase;">
Trip Fare
</div>

<h1 style="margin:18px 0 10px;color:#ffffff;font-size:34px;">
${title}
</h1>

<p style="margin:0;color:#edf5ff;font-size:16px;">
Travel Update
</p>

</td>
</tr>

<!-- Body -->

<tr>
<td style="padding:45px;">

<div
style="
background:#eaf4ff;
border-left:5px solid #1677ff;
padding:20px;
border-radius:6px;
font-size:16px;
color:#0f4c81;
line-height:28px;
margin-bottom:30px;
">
${message}
</div>

<p style="font-size:15px;color:#555;line-height:28px;">
You can log in to your <strong>Trip Fare</strong> account anytime to view your latest booking details, download your itinerary, or manage your upcoming trip.
</p>

<p style="font-size:15px;color:#555;line-height:28px;">
If you need any assistance regarding your booking, our travel experts are available 24×7 to help you.
</p>

<p style="text-align:center;margin:40px 0 10px;">

<a
href="https://tripfare.in"
style="
display:inline-block;
background:#1677ff;
color:#ffffff;
padding:15px 36px;
border-radius:6px;
text-decoration:none;
font-weight:bold;
font-size:16px;
">
View Booking
</a>

</p>

</td>
</tr>

<!-- Footer -->

<tr>
<td align="center" style="background:#0f172a;padding:30px;">

<div style="font-size:24px;font-weight:bold;color:#ffffff;">
✈️ Trip Fare
</div>

<div style="margin-top:10px;color:#cbd5e1;">
Your Trusted Flight Booking Partner
</div>

<div style="margin-top:15px;color:#94a3b8;font-size:13px;">
Domestic Flights • International Flights • Best Airfares
</div>

<div style="margin-top:8px;color:#94a3b8;font-size:13px;">
www.tripfare.in
</div>

<div style="margin-top:15px;color:#64748b;font-size:12px;">
© 2026 Trip Fare. All Rights Reserved.
</div>

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
