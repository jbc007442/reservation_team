interface MarketingTemplateProps {
  title?: string;
  description?: string;
}

export default function MarketingTemplate({
  title = '🔥 Limited Time Offer',
  description = 'Book today and unlock exclusive discounts on flights, hotels and holiday packages.',
}: MarketingTemplateProps) {
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

<!-- HERO -->
<tr>
<td align="center" style="background:#0F4C81;padding:55px 40px;">

<div style="font-size:13px;color:#b9d8ff;letter-spacing:2px;text-transform:uppercase;">
Trip Fare
</div>

<h1 style="margin:18px 0;color:#ffffff;font-size:38px;">
${title}
</h1>

<p style="margin:0 0 30px;color:#edf5ff;font-size:18px;line-height:28px;">
${description}
</p>

<a
href="https://tripfare.in"
style="
display:inline-block;
background:#ffffff;
color:#0F4C81;
padding:14px 32px;
border-radius:6px;
text-decoration:none;
font-weight:bold;
">
Search Flights
</a>

</td>
</tr>

<!-- SERVICES -->

<tr>
<td style="padding:45px;">

<h2 style="margin-top:0;text-align:center;color:#222;">
Why Book With Trip Fare?
</h2>

<table width="100%" cellpadding="15">

<tr>

<td align="center" width="33%">
<div style="font-size:42px;">✈️</div>
<h3>Flight Booking</h3>
<p style="color:#666;line-height:24px;">
Domestic & International Flights
</p>
</td>

<td align="center" width="33%">
<div style="font-size:42px;">💺</div>
<h3>Lowest Fares</h3>
<p style="color:#666;line-height:24px;">
Compare airlines and save more.
</p>
</td>

<td align="center" width="33%">
<div style="font-size:42px;">🛡️</div>
<h3>Secure Payment</h3>
<p style="color:#666;line-height:24px;">
Fast, safe and instant confirmation.
</p>
</td>

</tr>

</table>

</td>
</tr>

<!-- CTA -->

<tr>
<td align="center" style="background:#f8fafc;padding:45px;">

<h2 style="margin:0;color:#222;">
Ready to Fly?
</h2>

<p style="margin:20px 0 30px;color:#666;font-size:16px;line-height:28px;">
Book your next domestic or international flight with confidence and enjoy the best available fares.
</p>

<a
href="https://tripfare.in"
style="
display:inline-block;
background:#1677ff;
color:#ffffff;
padding:14px 34px;
border-radius:6px;
text-decoration:none;
font-weight:bold;
">
Book Flight Now
</a>

</td>
</tr>

<!-- FOOTER -->

<tr>
<td align="center" style="background:#0f172a;padding:30px;">

<div style="font-size:24px;font-weight:bold;color:#ffffff;">
✈️ Trip Fare
</div>

<div style="margin-top:10px;color:#cbd5e1;">
Your Trusted Flight Booking Partner
</div>

<div style="margin-top:15px;color:#94a3b8;font-size:13px;">
Domestic Flights • International Flights • Group Bookings
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
