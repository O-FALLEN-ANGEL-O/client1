export type User = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Staff';
  password?: string; // Should not be in a real User type from an API
};

export type School = {
  id: string;
  name: string;
  city: string;
};

export type Course = {
  id: string;
  name: string;
  code: string;
};

export type Payment = {
  id: string;
  studentId: string;
  studentName: string;
  course: string;
  school: string;
  amount: number;
  paymentType: 'Credit Card' | 'Bank Transfer' | 'Cash';
  date: Date;
};

export const users: User[] = [
  { id: 'usr_001', name: 'Admin User', email: 'admin@example.com', role: 'Admin', password: 'password' },
  { id: 'usr_002', name: 'Staff User', email: 'staff@example.com', role: 'Staff', password: 'password' },
  { id: 'usr_101', name: 'Alice Johnson', email: 'alice@example.com', role: 'Staff' },
  { id: 'usr_102', name: 'Bob Williams', email: 'bob@example.com', role: 'Staff' },
  { id: 'usr_103', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Staff' },
  { id: 'usr_104', name: 'Diana Prince', email: 'diana@example.com', role: 'Staff' },
];

export const schools: School[] = [
  { id: 'sch_01', name: 'Northwood High', city: 'Metropolis' },
  { id: 'sch_02', name: 'Southside Secondary', city: 'Gotham' },
  { id: 'sch_03', name: 'West Valley College', city: 'Star City' },
];

export const courses: Course[] = [
  { id: 'crs_101', name: 'Computer Science 101', code: 'CS101' },
  { id: 'crs_102', name: 'Advanced Mathematics', code: 'MATH202' },
  { id: 'crs_103', name: 'History of Art', code: 'ART301' },
  { id: 'crs_104', name: 'Quantum Physics', code: 'PHY404' },
];

export const payments: Payment[] = [
  { id: 'pay_001', studentId: 'stu_001', studentName: 'Eva Green', course: 'Computer Science 101', school: 'Northwood High', amount: 1200, paymentType: 'Credit Card', date: new Date('2023-08-15') },
  { id: 'pay_002', studentId: 'stu_002', studentName: 'Frank Miller', course: 'Advanced Mathematics', school: 'Southside Secondary', amount: 950, paymentType: 'Bank Transfer', date: new Date('2023-09-01') },
  { id: 'pay_003', studentId: 'stu_003', studentName: 'Grace Hopper', course: 'History of Art', school: 'West Valley College', amount: 750, paymentType: 'Cash', date: new Date('2023-09-05') },
  { id: 'pay_004', studentId: 'stu_004', studentName: 'Henry Ford', course: 'Quantum Physics', school: 'Northwood High', amount: 1500, paymentType: 'Credit Card', date: new Date('2024-01-20') },
  { id: 'pay_005', studentId: 'stu_001', studentName: 'Eva Green', course: 'Advanced Mathematics', school: 'Northwood High', amount: 1200, paymentType: 'Bank Transfer', date: new Date('2024-02-10') },
  { id: 'pay_006', studentId: 'stu_005', studentName: 'Ivy Queen', course: 'Computer Science 101', school: 'Southside Secondary', amount: 1100, paymentType: 'Cash', date: new Date('2024-03-12') },
  { id: 'pay_007', studentId: 'stu_002', studentName: 'Frank Miller', course: 'History of Art', school: 'Southside Secondary', amount: 800, paymentType: 'Credit Card', date: new Date('2024-04-18') },
  { id: 'pay_008', studentId: 'stu_006', studentName: 'Jack Black', course: 'Quantum Physics', school: 'West Valley College', amount: 1600, paymentType: 'Bank Transfer', date: new Date('2024-05-21') },
];
