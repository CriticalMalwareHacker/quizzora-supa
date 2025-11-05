// /components/update-profile-form.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { type User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

export function UpdateProfileForm({ user }: { user: User }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  // Initialize state with existing user metadata
  const [fullName, setFullName] = useState(user.user_metadata.full_name || "");
  const [username, setUsername] = useState(user.user_metadata.username || "");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        username: username,
      },
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Profile updated successfully!");
      // Refresh the page to show new server-rendered data
      router.refresh(); 
    }

    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Your Profile</CardTitle>
        <CardDescription>
          Set your display name and username.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleUpdateProfile}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name (e.g., Jane Doe)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="A unique username (e.g., jdoe)"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
          <Button type="submit" className="ml-auto" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}