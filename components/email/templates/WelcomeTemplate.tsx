interface WelcomeTemplateProps {
  customerName?: string;
}

export default function WelcomeTemplate({ customerName = 'John Doe' }: WelcomeTemplateProps) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Welcome to Trip Fare</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
<tr>
<td align="center">

<table width="650" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;">

<!-- Header -->

<tr>
<td align="center" style="background:#0F4C81;padding:50px 40px;">

<div style="font-size:13px;color:#b8d7ff;letter-spacing:2px;text-transform:uppercase;">
Trip Fare
</div>

<h1 style="margin:18px 0;color:#ffffff;font-size:36px;">
Welcome Aboard ✈️
</h1>

<p style="margin:0;color:#edf5ff;font-size:17px;line-height:28px;">
Your trusted partner for domestic and international flight bookings.
</p>

</td>
</tr>

<!-- Content -->

<tr>
<td style="padding:45px;">

<p style="font-size:16px;margin-top:0;">
Hello <strong>${customerName}</strong>,
</p>

<p style="font-size:15px;color:#555;line-height:28px;">
Thank you for choosing <strong>Trip Fare</strong>. Your account has been created successfully.
</p>

<p style="font-size:15px;color:#555;line-height:28px;">
You can now search, compare and book flights from leading airlines at competitive prices with instant confirmation.
</p>

<table width="100%" cellpadding="15" style="margin:25px 0;background:#f8fafc;border-radius:8px;">

<tr>

<td align="center" width="33%">
<div style="font-size:34px;">✈️</div>
<div style="font-weight:bold;">Flight Booking</div>
</td>

<td align="center" width="33%">
<div style="font-size:34px;">💳</div>
<div style="font-weight:bold;">Secure Payments</div>
</td>

<td align="center" width="33%">
<div style="font-size:34px;">📞</div>
<div style="font-weight:bold;">24×7 Support</div>
</td>

</tr>

</table>

<p style="text-align:center;margin:40px 0 20px;">

<a href="https://tripfare.in"
style="
display:inline-block;
background:#1677ff;
color:#ffffff;
padding:15px 38px;
border-radius:6px;
text-decoration:none;
font-size:16px;
font-weight:bold;
">
Search Flights
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
Book Flights with Confidence
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
