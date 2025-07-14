"use server";

import { createClient } from "@supabase/supabase-js";
import { type User } from "@/lib/mock-data";
import { z } from "zod";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase credentials for server actions.");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Invalid email address."),
  role: z.enum(["Admin", "Staff"]),
  password: z.string().min(6, "Password must be at least 6 characters.").optional(),
});

type FormResult = {
  error?: string;
  success?: string;
};

export async function addUser(data: Partial<User>): Promise<FormResult> {
  const validation = userSchema.safeParse(data);
  if (!validation.success) {
    return { error: validation.error.errors.map(e => e.message).join(", ") };
  }

  const { name, email, role, password } = validation.data;

  if (!password) {
      return { error: "Password is required for new users." };
  }

  // 1. Create the user in Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (authError) {
    return { error: `Failed to create auth user: ${authError.message}` };
  }

  if (!authData.user) {
    return { error: "Could not create user, please try again." };
  }

  // 2. Create the user profile in the 'users' table
  const { error: profileError } = await supabaseAdmin.from("users").insert({
    id: authData.user.id,
    name,
    email,
    role,
  });

  if (profileError) {
    // If profile creation fails, we should delete the auth user to avoid orphans
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return { error: `Failed to create user profile: ${profileError.message}` };
  }

  return { success: "User created successfully." };
}

export async function updateUser(data: Partial<User>): Promise<FormResult> {
  const validation = userSchema.safeParse(data);
  if (!validation.success) {
    return { error: validation.error.errors.map(e => e.message).join(", ") };
  }

  const { id, name, role } = validation.data;

  if (!id) {
    return { error: "User ID is missing." };
  }
  
  // Note: We are not updating email or password here, only name and role.
  // Updating auth details requires a different flow.
  const { error } = await supabaseAdmin
    .from("users")
    .update({ name, role })
    .eq("id", id);

  if (error) {
    return { error: `Failed to update user: ${error.message}` };
  }

  return { success: "User updated successfully." };
}

export async function deleteUser(userId: string): Promise<FormResult> {
  if (!userId) {
    return { error: "User ID is missing." };
  }
  
  // Important: The order matters here. Delete the profile first, then the auth user.
  // Although transactionality is not guaranteed, it's a safer order.
  const { error: profileError } = await supabaseAdmin
    .from("users")
    .delete()
    .eq("id", userId);

  if (profileError) {
    return { error: `Could not delete user profile: ${profileError.message}` };
  }
  
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (authError) {
    // This is tricky. The profile is deleted but auth user is not.
    // The app will be in an inconsistent state for this user.
    // For a production app, you might want to log this for manual intervention.
    return { error: `Profile deleted, but failed to delete auth user: ${authError.message}` };
  }

  return { success: "User deleted successfully from auth and profiles." };
}
