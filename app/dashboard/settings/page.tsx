"use client"; // This page uses client-side hooks like useState and useRouter

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Label } from "@/components/ui/label";
import {
  IconUser,
  IconLock,
  IconTrash,
  IconChevronRight,
  IconLoader,
} from "@tabler/icons-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
// ✅ 1. Import the new server action
import { deleteAccount } from "./actions";
// ✅ 2. Import client-side supabase and router
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // ✅ 3. Initialize router and supabase client
  const router = useRouter();
  const supabase = createClient();

  // ✅ 4. Updated function to call the server action
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      // Call the server action
      const result = await deleteAccount();

      if (result?.error) {
        throw new Error(result.error);
      }

      // If the server action redirect doesn't trigger,
      // sign out client-side and push to home.
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      if (error instanceof Error) {
        setDeleteError(error.message);
      } else {
        setDeleteError("An unknown error occurred.");
      }
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* --- Appearance Card --- */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize the look and feel of your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-y-2">
            <Label htmlFor="theme" className="font-medium">
              Theme
            </Label>
            <ThemeSwitcher />
          </div>
        </CardContent>
      </Card>

      {/* --- Account Card --- */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Manage your account and password settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto rounded-none"
            asChild
          >
            <Link href="/dashboard/profile">
              <div className="flex items-center gap-3">
                <IconUser className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Edit Profile</span>
              </div>
              <IconChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto rounded-none"
            asChild
          >
            <Link href="/auth/update-password">
              <div className="flex items-center gap-3">
                <IconLock className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Change Password</span>
              </div>
              <IconChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* --- Danger Zone Card --- */}
      <AlertDialog>
        <Card className="border-destructive/50 dark:border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              These actions are permanent and cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">
                <IconTrash className="w-4 h-4 mr-2" />
                Delete My Account
              </Button>
            </AlertDialogTrigger>
            {deleteError && (
              <p className="text-destructive text-sm mt-4">{deleteError}</p>
            )}
          </CardContent>
        </Card>

        {/* --- Delete Confirmation Dialog --- */}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and all your quiz data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <IconLoader className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}