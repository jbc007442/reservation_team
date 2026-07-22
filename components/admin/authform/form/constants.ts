import type { SelectProps } from 'antd';

export const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['clean'],
  ],
};

export type BookingType =
  | 'Package'
  | 'Flight'
  | 'Hotel'
  | 'Hotel + Flight'
  | 'Cargo'
  | 'Pet'
  | 'Car'
  | 'Cruise'
  | 'Amtrak'
  | 'Other';

export const bookingTypeOptions: SelectProps['options'] = [
  { label: 'Package', value: 'Package' },
  { label: 'Flight', value: 'Flight' },
  { label: 'Hotel', value: 'Hotel' },
  { label: 'Hotel + Flight', value: 'Hotel + Flight' },
  { label: 'Cargo', value: 'Cargo' },
  { label: 'Pet', value: 'Pet' },
  { label: 'Car', value: 'Car' },
  { label: 'Cruise', value: 'Cruise' },
  { label: 'Amtrak', value: 'Amtrak' },
  { label: 'Other', value: 'Other' },
];

const commonTerms = `
<h2>Terms &amp; Conditions</h2>

<h3>Booking Acknowledgement</h3>

<p>
By confirming your booking, you acknowledge that you have read,
understood, and accepted these Terms &amp; Conditions.
</p>

<h3>Reconfirmation</h3>

<ul>
<li>Flights and other travel services must be reconfirmed at least <strong>72 hours prior to departure</strong>, where applicable.</li>
<li>Special requests including meals, seats, wheelchair assistance, hotel arrangements, pet requests, or any additional services remain subject to availability and should also be reconfirmed.</li>
</ul>

<h3>Changes &amp; Cancellations</h3>

<ul>
<li>Bookings are non-transferable and non-refundable unless permitted by the applicable supplier or fare rules.</li>
<li>Refunds are subject to supplier penalties and Reservation Desk service charges.</li>
<li>Once a supplier has processed a refund, chargebacks will not be accepted.</li>
<li>Name corrections may be permitted according to supplier policy and applicable fees.</li>
</ul>

<h3>Travel Documents</h3>

<p>
Passengers are solely responsible for ensuring they possess valid passports,
visas and all required travel documents.
Reservation Desk is not liable for denied boarding or denied entry.
</p>

<h3>Refunds</h3>

<p>
Refunds for third-party bookings must be processed through the issuing agency.
Refund processing may take approximately <strong>12–16 weeks</strong>.
</p>

<h3>Official Contact Information</h3>

<p>
<strong>Email:</strong> support@reservation.team<br/>
<strong>Phone:</strong> +1 (888) 881-8251
</p>

<p>
Reservation Desk is not responsible for communications received from
any other email address or phone number.
</p>

<h3>Promotional Communication</h3>

<p>
By completing your booking you agree that Reservation Desk may contact
you regarding travel updates, promotions and marketing communications.
</p>

<h3>Declaration</h3>

<ul>
<li>Your itinerary is correct.</li>
<li>Your name exactly matches your passport or government-issued ID.</li>
<li>You understand and accept all supplier rules.</li>
<li>You will reconfirm your travel before departure whenever required.</li>
</ul>

<h3>Additional Information</h3>

<ul>
<li><strong>Customer Support:</strong> Our team is available before, during and after your trip.</li>

<li><strong>Itinerary Changes:</strong> Additional fees may apply according to supplier policies.</li>

<li><strong>Force Majeure:</strong> Reservation Desk is not responsible for delays caused by events beyond our control.</li>

<li><strong>Refund Updates:</strong> We will keep you informed throughout the refund process.</li>

<li><strong>Non-Refundable Fees:</strong> Certain agency fees and processing charges remain non-refundable.</li>

<li><strong>Policy Changes:</strong> Airline and supplier policies may change without notice.</li>

<li><strong>Refund Disputes:</strong> Please contact Reservation Desk before raising disputes with your bank.</li>
</ul>

<h3>Final Confirmation</h3>

<p>
By proceeding with this booking you confirm that all information provided
is accurate and you accept these Terms &amp; Conditions.
</p>

<p>
For assistance contact us at
<strong>+1 (888) 881-8251</strong>.
</p>

<p>
<strong>Thank you for choosing Reservation Desk.</strong><br/>
We look forward to serving you.
</p>
`;

export const termsTemplates: Record<BookingType, string> = {
  Package: commonTerms,
  Flight: commonTerms,
  Hotel: commonTerms,
  'Hotel + Flight': commonTerms,
  Cargo: commonTerms,
  Pet: commonTerms,
  Car: commonTerms,
  Cruise: commonTerms,
  Amtrak: commonTerms,
  Other: commonTerms,
};