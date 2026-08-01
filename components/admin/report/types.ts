export interface ReportData {
  key: string;
  bookingNo: string;
  customerName: string;
  service: string;
  travelDate: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
}
