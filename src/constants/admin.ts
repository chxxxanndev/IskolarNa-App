// Frontend-only mock: any email in this list is sent to /admin after signing in.
// Replace with a real role check (e.g. a custom claim or an `admins` table) when the backend is ready.
export const ADMIN_EMAILS: string[] = [
  'admin@iskolarna.ph',
  // add more admin emails here
];

export const isAdminEmail = (email: string) => ADMIN_EMAILS.includes(email.trim().toLowerCase());
