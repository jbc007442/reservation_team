export const statusOptions = [
  {
    label: 'Present',
    value: 'P',
    color: '#22c55e',
  },
  {
    label: 'Weekly Off',
    value: 'WO',
    color: '#f59e0b',
  },
  {
    label: 'Leave',
    value: 'L',
    color: '#3b82f6',
  },
  {
    label: 'Holiday',
    value: 'H',
    color: '#ef4444',
  },
  {
    label: 'Half Day',
    value: 'HD',
    color: '#8b5cf6',
  },
];

export const employees = [
  {
    id: 'EMP001',
    name: 'Tarun Kumar',
    department: 'IT',
    roster: {
      mon: 'P',
      tue: 'P',
      wed: 'P',
      thu: 'WO',
      fri: 'WO',
      sat: 'P',
      sun: 'P',
    },
  },
  {
    id: 'EMP002',
    name: 'Rahul Sharma',
    department: 'Sales',
    roster: {
      mon: 'P',
      tue: 'L',
      wed: 'L',
      thu: 'P',
      fri: 'P',
      sat: 'WO',
      sun: 'P',
    },
  },
  {
    id: 'EMP003',
    name: 'Amit Singh',
    department: 'HR',
    roster: {
      mon: 'WO',
      tue: 'WO',
      wed: 'P',
      thu: 'P',
      fri: 'P',
      sat: 'P',
      sun: 'H',
    },
  },
  {
    id: 'EMP004',
    name: 'Priya Sharma',
    department: 'Accounts',
    roster: {
      mon: 'P',
      tue: 'P',
      wed: 'P',
      thu: 'P',
      fri: 'WO',
      sat: 'WO',
      sun: 'P',
    },
  },
];
