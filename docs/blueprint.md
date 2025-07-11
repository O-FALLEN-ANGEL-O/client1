# **App Name**: SmartFeeTracker+

## Core Features:

- Secure Authentication: User authentication system with JWT-based secure login for Admin and Staff roles, and bcrypt password hashing.
- Advanced Dashboard: Dashboard with date range picker and filters for payment type, school name, course name, student ID/Name, and amount range, displayed in a paginated, searchable table.
- Excel Export: Export filtered data to Excel with a 'Payment Report' sheet and a 'Power BI' sheet (normalized headers).
- User Management: Admin interface for managing students, courses and schools
- Role based Access: Role-based access control to restrict specific functionality to admins or staff
- Theme Selection: Allow light/dark theme selection

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to convey trust and stability in financial management.
- Background color: Light gray (#F5F5F5) to ensure a clean and professional look, suitable for data-heavy interfaces.
- Accent color: Teal (#009688) as a contrasting accent color for key interactive elements.
- Body and headline font: 'Inter', a sans-serif font that offers excellent readability and a modern aesthetic, suitable for both headlines and body text.  Note: currently only Google Fonts are supported.
- Use a consistent set of icons from a library like Material Design Icons, with an emphasis on clarity and ease of understanding, particularly for actions related to payment and data management.
- A clean and organized layout with clear section headings and consistent spacing to aid navigation and readability, especially important for the dashboard and data tables.
- Subtle transitions and loading animations (skeleton loaders) to provide feedback during data processing, improving user experience by indicating activity.