"use client";

import { useState } from "react";
import { type User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function UpdateProfileForm({ user }: { user: User }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Initialize state with user's current metadata
  const [fullName, setFullName] = useState<string>(
    user.user_metadata.full_name || "",
  );
  const [username, setUsername] = useState<string>(
    user.user_metadata.username || "",
  );
  // ✅ Added location state
  const [location, setLocation] = useState<string>(
    user.user_metadata.location || "",
  );

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // ✅ Update logic now includes location
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        username: username,
        location: location, // ✅ Save location
      },
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Profile updated successfully!");
      // ✅ Refresh the page to show the new data in the card above
      // You can also use router.refresh() if you prefer
      window.location.reload();
    }

    setLoading(false);
  };

  return (
    <Card>
      <form onSubmit={handleUpdateProfile}>
        <CardHeader>
          <CardTitle>Edit Your Profile</CardTitle>
          <CardDescription>
            Update your public profile information here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user.email} disabled />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="A public @username"
            />
          </div>
          {/* ✅ Added Location input field */}
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., New York, NY"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
          <Button type="submit" className="ml-auto" disabled={loading}>
            {loading ? "Updating..." : "Update Profile"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}