"use client";

import React from "react";
import { SocialProvider } from "./SocialContext";
import SocialShell from "./SocialShell";

export default function SocialLayout({ children }: { children: React.ReactNode }) {
  return (
    <SocialProvider>
      <SocialShell>{children}</SocialShell>
    </SocialProvider>
  );
}
