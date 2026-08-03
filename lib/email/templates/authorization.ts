interface AuthorizationEmailProps {
  authForm: any;
  approvalLink: string;
}

export function authorizationTemplate({
  authForm,
  approvalLink,
}: AuthorizationEmailProps) {
  const booking = authForm.bookingId;

  const formatDate = (date: any) => {
    if (!date) return '-';

    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const passengers =
    authForm.passengers
      ?.map(
        (p: any) => `
<tr>
<td style="padding:12px;border:1px solid #e5e7eb;">${p.title}</td>
<td style="padding:12px;border:1px solid #e5e7eb;">${p.firstName}</td>
<td style="padding:12px;border:1px solid #e5e7eb;">${p.lastName}</td>
<td style="padding:12px;border:1px solid #e5e7eb;">${p.gender || '-'}</td>
<td style="padding:12px;border:1px solid #e5e7eb;">${formatDate(p.dob)}</td>
</tr>
`
      )
      .join('') || '';

  const charges =
    authForm.charges
      ?.map(
        (c: any) => `
<tr>
<td style="padding:12px;border:1px solid #e5e7eb;">
${c.description || '-'}
</td>

<td style="padding:12px;border:1px solid #e5e7eb;text-align:right;font-weight:600;">
${c.amount} ${c.currency || ''}
</td>
</tr>
`
      )
      .join('') || '';

  const cardsInformation =
    authForm.cards
      ?.map(
        (card: any) => `
<tr>
<td style="padding:12px;border:1px solid #e5e7eb;">${card.cardType || '-'}</td>
<td style="padding:12px;border:1px solid #e5e7eb;">${card.cardHolderName || '-'}</td>
<td style="padding:12px;border:1px solid #e5e7eb;">${
          card.cardNumber
            ? card.cardNumber
                .replace(/\s/g, '')
                .replace(/\d(?=\d{4})/g, '*')
                .replace(/(.{4})/g, '$1 ')
                .trim()
            : '-'
        }</td>
<td style="padding:12px;border:1px solid #e5e7eb;">${card.expiryDate || '-'}</td>
<td style="padding:12px;border:1px solid #e5e7eb;text-align:right;">
${card.amount || '-'} ${card.currency || ''}
</td>
</tr>
`
      )
      .join('') || '';

  const renderFlightCard = (
    sectionTitle: string,
    itinerary: any
  ) => {
    if (!itinerary?.flights?.length) return '';

    return `
<h2 style="
margin:35px 0 18px;
font-size:22px;
color:#1e40af;
border-left:5px solid #2563eb;
padding-left:12px;
">
${sectionTitle}
</h2>

${itinerary.flights
  .map(
    (flight: any) => `
<div style="
border:1px solid #dbeafe;
border-radius:18px;
padding:24px;
margin-bottom:24px;
background:#ffffff;
box-shadow:0 6px 18px rgba(0,0,0,.06);
">

<table width="100%" cellpadding="0" cellspacing="0">

<tr>

<td width="65">

<img
src="${flight.airline_logo}"
width="52"
style="
display:block;
border-radius:8px;
"
/>

</td>

<td>

<div style="
font-size:20px;
font-weight:700;
color:#111827;
">
${flight.airline}
</div>

<div style="
margin-top:6px;
font-size:14px;
color:#6b7280;
">
Flight ${flight.flight_number}
</div>

<div style="
margin-top:4px;
font-size:13px;
color:#6b7280;
">
${flight.travel_class}
</div>

</td>

<td align="right">

<div style="
font-size:26px;
font-weight:700;
color:#2563eb;
">
$${itinerary.price}
</div>

<div style="
font-size:12px;
color:#6b7280;
">
Total Fare
</div>

</td>

</tr>

</table>

<div style="
margin:24px 0;
height:1px;
background:#e5e7eb;
"></div>

<table width="100%">

<tr>

<td width="40%">

<div style="
font-size:30px;
font-weight:700;
color:#111827;
">
${flight.departure_airport.time}
</div>

<div style="
margin-top:5px;
font-size:18px;
font-weight:600;
">
${flight.departure_airport.id}
</div>

<div style="
font-size:13px;
color:#6b7280;
margin-top:6px;
">
${flight.departure_airport.name}
</div>

<div style="
font-size:12px;
color:#9ca3af;
margin-top:4px;
">
${flight.departure_airport.date}
</div>

</td>

<td align="center" width="20%">

<div style="
font-size:13px;
color:#6b7280;
font-weight:600;
">
${flight.duration} mins
</div>

<div style="
margin:12px 0;
font-size:26px;
color:#2563eb;
">
✈
</div>

<div style="
font-size:12px;
color:#9ca3af;
">
Direct / Stops
</div>

</td>

<td width="40%" align="right">

<div style="
font-size:30px;
font-weight:700;
color:#111827;
">
${flight.arrival_airport.time}
</div>

<div style="
margin-top:5px;
font-size:18px;
font-weight:600;
">
${flight.arrival_airport.id}
</div>

<div style="
font-size:13px;
color:#6b7280;
margin-top:6px;
">
${flight.arrival_airport.name}
</div>

<div style="
font-size:12px;
color:#9ca3af;
margin-top:4px;
">
${flight.arrival_airport.date}
</div>

</td>

</tr>

</table>

</div>
`
  )
  .join('')}
`;
  };

  return `
<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Booking Authorization</title>
</head>

<body style="
margin:0;
padding:0;
background:#eef3fb;
font-family:Arial,Helvetica,sans-serif;
color:#1f2937;
">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#eef3fb;padding:40px 0;">

<tr>

<td align="center">

<table
width="820"
cellpadding="0"
cellspacing="0"
style="
background:#ffffff;
border-radius:20px;
overflow:hidden;
box-shadow:0 10px 35px rgba(0,0,0,.08);
">

<tr>





















<td
style="
background:linear-gradient(135deg,#0B1F3A,#1E4FA8);
padding:35px 40px;
color:#ffffff;
">

<table
width="100%"
cellpadding="0"
cellspacing="0"
style="border-collapse:collapse;"
>

<tr>

<td width="90" valign="middle">

<img
src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHPKHPz2biprEeK9MMKKjXAkkV1OxSCu14fc5TGlY6-A&s"
alt="Company Logo"
width="70"
style="
display:block;
background:#ffffff;
padding:8px;
border-radius:12px;
"
/>

</td>

<td valign="middle">

<div
style="
font-size:30px;
font-weight:700;
letter-spacing:.5px;
line-height:36px;
">
Booking Authorization
</div>

<div
style="
margin-top:8px;
font-size:15px;
opacity:.9;
line-height:24px;
">
Please review your itinerary and authorize your booking securely.
</div>

</td>

<td
align="right"
valign="middle"
style="white-space:nowrap;"
>

<div
style="
display:inline-block;
background:rgba(255,255,255,.15);
padding:10px 18px;
border-radius:30px;
font-size:14px;
font-weight:600;
">
${booking.bookingNo}
</div>

</td>

</tr>

</table>

</td>

</tr>

<tr>

<td style="padding:40px;">

<p style="font-size:18px;margin:0;">
Dear
<strong>${booking.customer.name}</strong>,
</p>

<p
style="
margin-top:18px;
font-size:15px;
line-height:28px;
color:#555;
">
Thank you for choosing us.

Please review your booking carefully.

If everything is correct, click the
<strong>AUTHORIZE BOOKING</strong>
button below.
</p>

<table
width="100%"
cellpadding="12"
cellspacing="0"
style="
margin-top:30px;
border-collapse:separate;
border-spacing:15px;
">

<tr>

<td
style="
background:#f8fbff;
border:1px solid #dbeafe;
border-radius:14px;
">

<div style="font-size:12px;color:#6b7280;">
Booking No
</div>

<div style="
margin-top:8px;
font-size:20px;
font-weight:bold;
color:#111827;
">
${booking.bookingNo}
</div>

</td>

<td
style="
background:#f8fbff;
border:1px solid #dbeafe;
border-radius:14px;
">

<div style="font-size:12px;color:#6b7280;">
Booking Type
</div>

<div style="
margin-top:8px;
font-size:20px;
font-weight:bold;
color:#111827;
">
${authForm.bookingType}
</div>

</td>

</tr>

<tr>

<td
style="
background:#f8fbff;
border:1px solid #dbeafe;
border-radius:14px;
">

<div style="font-size:12px;color:#6b7280;">
Service
</div>

<div style="
margin-top:8px;
font-size:20px;
font-weight:bold;
color:#111827;
">
${authForm.serviceType}
</div>

</td>

<td
style="
background:#f8fbff;
border:1px solid #dbeafe;
border-radius:14px;
">

<div style="font-size:12px;color:#6b7280;">
Customer
</div>

<div style="
margin-top:8px;
font-size:18px;
font-weight:bold;
color:#111827;
">
${booking.customer.email}
</div>

<div style="
margin-top:6px;
font-size:14px;
color:#6b7280;
">
${booking.customer.mobile}
</div>

</td>

</tr>

</table>

${
  authForm.bookingDetailsType === 'image' && authForm.bookingDetails
    ? `

<h2 style="
margin-top:45px;
font-size:24px;
color:#1d4ed8;
">
Flight Itinerary
</h2>

<div
style="
border:1px solid #dbeafe;
border-radius:18px;
padding:25px;
background:#f8fbff;
text-align:center;
">

<img
src="${process.env.NEXT_PUBLIC_APP_URL}${authForm.bookingDetails}"
style="
max-width:100%;
border-radius:14px;
"
/>

</div>

`
    : authForm.bookingDetailsType === 'api' && authForm.itineraryData
      ? `

<h2 style="
margin-top:45px;
font-size:24px;
color:#1d4ed8;
">
Flight Itinerary
</h2>

${renderFlightCard('🛫 Departure Flight', authForm.itineraryData.departure)}

${
  authForm.itineraryData.return
    ? renderFlightCard('🛬 Return Flight', authForm.itineraryData.return)
    : ''
}

`
      : ''
}
<h2 style="
margin-top:45px;
font-size:24px;
color:#1d4ed8;
">
👨‍👩‍👧 Passenger Details
</h2>

<table
width="100%"
cellpadding="0"
cellspacing="0"
style="
border-collapse:collapse;
margin-top:20px;
border:1px solid #e5e7eb;
border-radius:12px;
overflow:hidden;
">

<tr style="background:#2563eb;color:#fff;text-align:left;">

<th style="padding:14px;">Title</th>
<th style="padding:14px;">First Name</th>
<th style="padding:14px;">Last Name</th>
<th style="padding:14px;">Gender</th>
<th style="padding:14px;">Date of Birth</th>

</tr>

${passengers}

</table>


<h2 style="
margin-top:45px;
font-size:24px;
color:#1d4ed8;
">
💰 Charges Summary
</h2>

<table
width="100%"
cellpadding="0"
cellspacing="0"
style="
border-collapse:collapse;
margin-top:20px;
border:1px solid #e5e7eb;
border-radius:12px;
overflow:hidden;
">

<tr style="background:#2563eb;color:#fff;">

<th style="padding:14px;text-align:left;">
Description
</th>

<th style="padding:14px;text-align:right;">
Amount
</th>

</tr>

${charges}

</table>


<h2 style="
margin-top:45px;
font-size:24px;
color:#1d4ed8;
">
💳 Card Information
</h2>

<table
width="100%"
cellpadding="0"
cellspacing="0"
style="
border-collapse:collapse;
margin-top:20px;
border:1px solid #e5e7eb;
border-radius:12px;
overflow:hidden;
">

<tr style="background:#2563eb;color:#fff;text-align:left;">

<th style="padding:14px;">Card</th>
<th style="padding:14px;">Holder</th>
<th style="padding:14px;">Number</th>
<th style="padding:14px;">Expiry</th>
<th style="padding:14px;">Amount</th>

</tr>

${cardsInformation}

</table>


${
  authForm.terms
    ? `

<h2 style="
margin-top:45px;
font-size:24px;
color:#1d4ed8;
">
📜 Terms & Conditions
</h2>

<div
style="
margin-top:18px;
padding:25px;
border-left:5px solid #2563eb;
background:#f8fbff;
border-radius:12px;
font-size:14px;
line-height:26px;
color:#4b5563;
">

${authForm.terms}

</div>

`
    : ''
}


<div
style="
margin-top:55px;
text-align:center;
">

<a

href="${approvalLink}"

style="
display:inline-block;
background:linear-gradient(135deg,#2563eb,#1d4ed8);
color:#fff;
padding:18px 48px;
font-size:18px;
font-weight:700;
text-decoration:none;
border-radius:12px;
box-shadow:0 8px 20px rgba(37,99,235,.25);
">

AUTHORIZE BOOKING

</a>

</div>


<div
style="
margin-top:50px;
padding:25px;
background:#eff6ff;
border-radius:12px;
">

<div
style="
font-size:16px;
font-weight:700;
color:#1e3a8a;
margin-bottom:12px;
">

Important Notice

</div>

<div
style="
font-size:14px;
line-height:26px;
color:#4b5563;
">

Please verify all passenger names, travel dates,
flight information, and payment details carefully.

By clicking
<strong>AUTHORIZE BOOKING</strong>,
you confirm that all information is correct
and authorize us to process your booking.

</div>

</div>


<hr
style="
margin:50px 0 30px;
border:none;
border-top:1px solid #e5e7eb;
">


<div
style="
text-align:center;
font-size:13px;
color:#6b7280;
line-height:24px;
">

Thank you for choosing us.

<br><br>

If you have any questions regarding your booking,
please contact our support team.

<br><br>

© ${new Date().getFullYear()} All Rights Reserved.

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

