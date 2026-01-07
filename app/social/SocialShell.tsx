"use client";

import React, { useState } from "react";
import NavigationRail from "@/app/components/social/NavigationRail";
import SettingsModal from "@/app/components/social/SettingsModal";
import ProfileModal from "@/app/components/social/ProfileModal";
import DarkConfigProvider from "@/app/components/common/DarkConfigProvider";
import { useSocial } from "./SocialContext";

export default function SocialShell({ children }: { children: React.ReactNode }) {
  const { currentUser, contacts, groupCount } = useSocial();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <DarkConfigProvider>
      <div className="flex h-full bg-[#0f172a] overflow-hidden fixed inset-0">
        {/* Left Sidebar */}
        <NavigationRail onSettingsClick={() => setIsSettingsModalOpen(true)} onProfileClick={() => setIsProfileModalOpen(true)} user={currentUser} />

        {/* Main Content */}
        {children}

        {/* Global Modals */}
        <SettingsModal open={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={currentUser}
          friendCount={contacts.length}
          groupCount={groupCount}
        />
      </div>
    </DarkConfigProvider>
  );
}
