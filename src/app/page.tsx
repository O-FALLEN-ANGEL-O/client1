import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to login page, which will then redirect to dashboard if logged in.
  redirect('/login');
}
