# SmartFeeTracker+

SmartFeeTracker+ is a comprehensive, modern web application designed for educational institutions to efficiently manage and track student fee payments. It provides a secure, role-based interface for administrators and staff to oversee payments, manage school and course data, and generate reports.

Built with a professional tech stack, this application serves as a powerful starter template for building robust, data-driven applications with Next.js and Supabase.

## Features

- **Secure Authentication:** Role-based access control (Admin, Staff) using Supabase Auth.
- **Interactive Dashboard:** A central hub for viewing and filtering all payment records.
- **Advanced Filtering:** Filter payments by student name/ID, date range, payment type, school, and course.
- **CRUD Operations:** Full Create, Read, Update, and Delete functionality for:
  - **Users:** Manage administrator and staff accounts.
  - **Schools:** Manage school branches or institutions.
  - **Courses:** Manage available courses.
- **Excel Export:** Download filtered payment data into a professionally styled Excel spreadsheet.
- **Responsive Design:** A clean, modern UI built with ShadCN and Tailwind CSS that works seamlessly on desktop and mobile devices.
- **Theme Customization:** Light and dark mode support.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **UI:** [React](https://reactjs.org/) & [TypeScript](https://www.typescriptlang.org/)
- **Backend & Database:** [Supabase](https://supabase.io/) (PostgreSQL, Auth)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Component Library:** [ShadCN UI](https://ui.shadcn.com/)
- **AI Integration:** [Google Genkit](https://firebase.google.com/docs/genkit) (for potential future AI features)
- **Forms:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) for validation
- **Icons:** [Lucide React](https://lucide.dev/)

---

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v20 or later recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- A [Supabase](https://supabase.io/) account and a new project.

### Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    - Create a file named `.env.local` in the root of your project.
    - Go to your Supabase project dashboard.
    - In the left sidebar, navigate to **Project Settings** > **API**.
    - Copy the **Project URL** and the **`anon` public key**.
    - In the left sidebar, navigate to **Project Settings** > **Database**.
    - Under **Connection string**, copy the `service_role` key (you may need to reveal it).
    - Add these values to your `.env.local` file like this:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY
    SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
    ```

### Running the Application

1.  **Seed the Database:**
    Run the following command to populate your Supabase database with realistic mock data. This will create users, schools, courses, and payment records.

    ```bash
    npm run db:seed
    ```
    **Default Login Credentials:**
    - **Admin:** `admin@example.com` / `password`
    - **Staff:** `staff@example.com` / `password`

2.  **Start the Development Server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:9002`.

---

## Deployment

This application is optimized for deployment on [Vercel](https://vercel.com/).

1.  Push your code to a Git repository (e.g., GitHub, GitLab).
2.  Import the project into Vercel.
3.  Add the same environment variables from your `.env.local` file to your Vercel project's settings.
4.  Deploy! Vercel will automatically detect the Next.js framework and build your application.
