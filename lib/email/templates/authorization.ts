interface AuthorizationEmailProps {
  authForm: any;
  approvalLink: string;
}

export function authorizationTemplate({ authForm, approvalLink }: AuthorizationEmailProps) {
  const booking = authForm.bookingId;

  const passengers =
    authForm.passengers
      ?.map(
        (p: any) => `
<tr>
  <td style="padding:8px;border:1px solid #ddd;">${p.title}</td>
  <td style="padding:8px;border:1px solid #ddd;">${p.firstName} ${p.lastName}</td>
  <td style="padding:8px;border:1px solid #ddd;">${p.passengerType || '-'}</td>
</tr>`
      )
      .join('') || '';

  const charges =
    authForm.charges
      ?.map(
        (c: any) => `
<tr>
  <td style="padding:8px;border:1px solid #ddd;">
    ${c.description || '-'}
  </td>

  <td style="padding:8px;border:1px solid #ddd;text-align:right;">
    ${c.amount} ${c.currency || ''}
  </td>
</tr>`
      )
      .join('') || '';

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Booking Authorization</title>
</head>

<body style="margin:0;padding:30px;background:#f5f5f5;font-family:Arial,sans-serif;">

<div style="max-width:800px;margin:auto;background:#ffffff;border-radius:8px;overflow:hidden;">

<div style="background:#1677ff;color:#fff;padding:20px;">
<h2 style="margin:0;">Booking Authorization</h2>
</div>

<div style="padding:30px;">

<p>Dear <strong>${booking.customer.name}</strong>,</p>

<p>
Please review your booking details below. If everything is correct,
click the <strong>Authorize Booking</strong> button.
</p>

<h3>Booking Information</h3>

<table style="width:100%;border-collapse:collapse;">

<tr>
<td style="padding:8px;border:1px solid #ddd;"><strong>Booking No</strong></td>
<td style="padding:8px;border:1px solid #ddd;">${booking.bookingNo}</td>
</tr>

<tr>
<td style="padding:8px;border:1px solid #ddd;"><strong>Email</strong></td>
<td style="padding:8px;border:1px solid #ddd;">${booking.customer.email}</td>
</tr>

<tr>
<td style="padding:8px;border:1px solid #ddd;"><strong>Mobile</strong></td>
<td style="padding:8px;border:1px solid #ddd;">${booking.customer.mobile}</td>
</tr>

<tr>
<td style="padding:8px;border:1px solid #ddd;"><strong>Booking Type</strong></td>
<td style="padding:8px;border:1px solid #ddd;">${authForm.bookingType}</td>
</tr>

<tr>
<td style="padding:8px;border:1px solid #ddd;"><strong>Service</strong></td>
<td style="padding:8px;border:1px solid #ddd;">${authForm.serviceType}</td>
</tr>

</table>

${
  authForm.bookingDetails
    ? `
<h3 style="margin-top:30px;">Itinerary</h3>

${authForm.bookingDetails}
`
    : ''
}

<h3 style="margin-top:30px;">Passengers</h3>

<table style="width:100%;border-collapse:collapse;">
<tr style="background:#fafafa;">
<th style="padding:8px;border:1px solid #ddd;">Title</th>
<th style="padding:8px;border:1px solid #ddd;">Passenger</th>
<th style="padding:8px;border:1px solid #ddd;">Type</th>
</tr>

${passengers}

</table>

<h3 style="margin-top:30px;">Charges</h3>

<table style="width:100%;border-collapse:collapse;">
<tr style="background:#fafafa;">
<th style="padding:8px;border:1px solid #ddd;">Description</th>
<th style="padding:8px;border:1px solid #ddd;">Amount</th>
</tr>

${charges}

</table>

${
  authForm.terms
    ? `
<h3 style="margin-top:30px;">Terms & Conditions</h3>

<div style="border:1px solid #eee;padding:15px;">
${authForm.terms}
</div>
`
    : ''
}

<div style="text-align:center;margin-top:40px;">

<a
href="${approvalLink}"
style="
background:#1677ff;
color:#fff;
padding:16px 40px;
text-decoration:none;
border-radius:6px;
font-weight:bold;
display:inline-block;
">

AUTHORIZE BOOKING

</a>

</div>

<p style="margin-top:30px;color:#777;font-size:13px;">
If you did not request this booking, you may safely ignore this email.
</p>

</div>

</div>

</body>
</html>
`;
}
