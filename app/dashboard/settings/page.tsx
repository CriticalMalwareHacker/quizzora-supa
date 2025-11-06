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
  IconPalette,
  IconId, // ✅ Added for Account
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
// ✅ Removed CardBody and CardContainer imports

// import { createClient } from "@/lib/supabase/client"; // Uncomment when implementing delete
// import { useRouter } from "next/navigation"; // Uncomment when implementing delete

export default function SettingsPage() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // const router = useRouter(); // Uncomment when implementing delete

  // This is a placeholder function.
  // Deleting a user is a complex, secure operation that must be
  // handled in a Server Action that calls `supabase.auth.admin.deleteUser(userId)`
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    console.error("Account deletion must be implemented securely on the server.");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setDeleteError("This feature is not yet implemented.");
    setIsDeleting(false);

    // On successful deletion, you would sign the user out and redirect:
    // const supabase = createClient();
    // await supabase.auth.signOut();
    // router.push('/');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* ✅ --- NEW: Balanced 2-Column Grid (No 3D Animation) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* --- COLUMN 1: Account Card --- */}
        <div className="lg:col-span-1">
          {/* ✅ Using standard Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <IconId className="w-6 h-6" />
                <CardTitle>Account</CardTitle>
              </div>
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
        </div>

        {/* --- COLUMN 2: Stacked Cards --- */}
        <div className="lg:col-span-1 space-y-8">
          {/* --- Appearance Card --- */}
          {/* ✅ Using standard Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <IconPalette className="w-6 h-6" />
                <CardTitle>Appearance</CardTitle>
              </div>
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

          {/* --- Danger Zone Card --- */}
          <AlertDialog>
            {/* ✅ Using standard Card */}
            <Card className="border-destructive/50 dark:border-destructive/30">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  This action is permanent and cannot be undone.
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
      </div>
    </div>
  );
}