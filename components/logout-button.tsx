"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { IconLogout } from "@tabler/icons-react"; // 1. Use the correct icon
import { useSidebar } from "@/components/ui/sidebar";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function LogoutButton() {
  const router = useRouter();
  const { open, animate } = useSidebar();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <button
      onClick={logout}
      className={cn(
        // 2. Base styles for alignment and transition
        "flex items-center justify-start gap-2 group/sidebar py-2 w-full text-left",
        // 3. Color styles: white text, red on hover
        "text-neutral-200 hover:text-red-500 transition-colors duration-150"
      )}
    >
      {/* 4. The icon will automatically inherit the text color */}
      <IconLogout className="h-5 w-5" />

      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        Logout
      </motion.span>
    </button>
  );
}