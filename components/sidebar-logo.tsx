"use client";

import React from "react";
import { motion } from "motion/react";
import { useSidebar } from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import Link from "next/link";

export function SidebarLogo() {
  const { open, animate } = useSidebar();

  return (
    // This wrapper provides spacing and ensures the logo is centered when collapsed
    <div className="flex items-center justify-start mb-6 h-8">
      <Link href="/dashboard" className="flex items-center py-2">
        {/* This is the full logo. 
          We use motion.span to animate its display and opacity
          based on the sidebar's 'open' state.
        */}
        <motion.span
          animate={{
            display: animate ? (open ? "inline-block" : "none") : "inline-block",
            opacity: animate ? (open ? 1 : 0) : 1,
          }}
          className="whitespace-pre inline-block !p-0 !m-0"
        >
          {/* We set a height of 6, which looks good with the nav icons */}
          <Logo className="h-6 w-auto" />
        </motion.span>
      </Link>
    </div>
  );
}