import { faker } from '@faker-js/faker';

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

// These two users are for the initial Supabase setup.
// You should create these users in your Supabase Auth dashboard.
export const users: User[] = [
  { id: 'usr_001', name: 'Admin User', email: 'admin@example.com', role: 'Admin', password: 'password' },
  { id: 'usr_002', name: 'Staff User', email: 'staff@example.com', role: 'Staff', password: 'password' },
];

// --- Generated Fake Data ---

export const schools: School[] = Array.from({ length: 50 }, (_, i) => ({
  id: `sch_${i + 1}`,
  name: `${faker.location.city()} High School`,
  city: faker.location.city(),
}));

// Helper to capitalize first letter
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const courses: Course[] = Array.from({ length: 100 }, (_, i) => ({
  id: `crs_${i + 1}`,
  name: `${capitalize(faker.word.adjective())} ${capitalize(faker.word.noun())}`,
  code: `${faker.lorem.word().substring(0,3).toUpperCase()}${faker.number.int({min: 100, max: 599})}`,
}));

const studentData = Array.from({ length: 500 }, (_, i) => ({
    id: `stu_${i + 1}`,
    name: faker.person.fullName(),
}))

export const payments: Payment[] = Array.from({ length: 1200 }, (_, i) => {
    const student = faker.helpers.arrayElement(studentData);
    const school = faker.helpers.arrayElement(schools);
    const course = faker.helpers.arrayElement(courses);
    const paymentType = faker.helpers.arrayElement(['Credit Card', 'Bank Transfer', 'Cash'] as const);
    
    return {
        id: `pay_${i + 1}`,
        studentId: student.id,
        studentName: student.name,
        course: course.name,
        school: school.name,
        amount: faker.number.int({ min: 500, max: 2500 }),
        paymentType: paymentType,
        date: faker.date.between({ from: '2022-01-01', to: '2024-06-01' }),
    }
});
