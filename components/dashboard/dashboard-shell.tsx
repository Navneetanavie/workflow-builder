"use client";

import { useState } from "react";
import { SignOutButton } from "@clerk/nextjs";
import {
  Search,
  ChevronUp,
  Settings,
  Gift,
  PanelLeft,
  LayoutGrid,
  BookOpen,
  Megaphone,
  GraduationCap,
  Image,
  Video,
  LogOut,
  ChevronDown,
} from "lucide-react";

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen bg-gray-50 overflow-hidden relative">
      {/* Left Sidebar (Full-height h-screen) */}
      <aside
        className={`h-screen border-gray-200 bg-white transition-[width,opacity] duration-300 ease-in-out shrink-0 flex flex-col overflow-hidden z-30 ${sidebarOpen
          ? "w-64 opacity-100 border-r"
          : "w-0 opacity-0 pointer-events-none border-r-0"
          }`}
      >
        <div className="w-64 h-full flex flex-col shrink-0">
          {/* Top of Sidebar - Concentric Rings Logo and Toggle Button */}
          <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-2">
              <svg className="size-8 shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" fill="black" />
                <circle cx="16" cy="16" r="10" stroke="white" strokeWidth="1.5" />
                <circle cx="16" cy="16" r="6" stroke="white" strokeWidth="1.5" />
                <circle cx="16" cy="16" r="2" fill="white" />
              </svg>
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
              title="Collapse Sidebar"
            >
              <PanelLeft className="size-5" />
            </button>
          </div>

          {/* Quick Search */}
          <div className="px-3 py-2 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Quick search..."
                readOnly
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-1.5 pl-9 pr-10 text-xs text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-300 focus:bg-white cursor-default"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-gray-400">
                ⌘K
              </span>
            </div>
          </div>

          {/* Nav List */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
            {/* Primary navigation */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between rounded-xl bg-gray-100/80 px-3 py-2 text-sm font-semibold text-gray-900 cursor-pointer">
                <div className="flex items-center gap-3">
                  <LayoutGrid className="size-4.5 text-gray-700" />
                  <span>All Tools</span>
                </div>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                  5933
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer transition-colors">
                <svg className="size-4.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
                <span>Platform</span>
              </div>

              <div className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer transition-colors">
                <BookOpen className="size-4.5 text-gray-500" />
                <span>API Docs</span>
              </div>

              <div className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer transition-colors">
                <Gift className="size-4.5 text-gray-500" />
                <span>Free Credits</span>
              </div>

              <div className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer transition-colors">
                <svg className="size-4.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Become an Affiliate</span>
              </div>

              <div className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer transition-colors">
                <svg className="size-4.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                </svg>
                <span>Feature Requests</span>
              </div>
            </div>

            {/* Unfair Advantage */}
            <div>
              <div className="flex items-center justify-between px-3 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                <span>Unfair Advantage</span>
                <ChevronUp className="size-3 text-gray-400" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer transition-colors">
                  <BookOpen className="size-4.5 text-gray-500" />
                  <span>Prompt Library</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer transition-colors">
                  <GraduationCap className="size-4.5 text-gray-500" />
                  <span>Tutorials</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer transition-colors">
                  <Megaphone className="size-4.5 text-gray-500" />
                  <span>Ad Library</span>
                </div>
              </div>
            </div>

            {/* Generation History */}
            <div>
              <div className="flex items-center justify-between px-3 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                <span>Generation History</span>
                <ChevronUp className="size-3 text-gray-400" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer transition-colors">
                  <Image className="size-4.5 text-gray-500" />
                  <span>Image Library</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer transition-colors">
                  <Video className="size-4.5 text-gray-500" />
                  <span>Video Library</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Controls & User profile */}
          <div className="border-t border-gray-200 p-4 shrink-0 bg-white flex flex-col items-center">
            {/* Settings button */}
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
            >
              <Settings className="size-4 text-gray-500" />
              Settings
            </button>

            {/* Claim offer button */}
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#535bf2] py-2 text-sm font-medium text-white hover:bg-[#434bcf] transition-colors shadow-sm mt-2"
            >
              <Gift className="size-4" />
              Claim Offer
            </button>

            {/* Chevron down separator */}
            <ChevronDown className="size-4 text-gray-400 mt-2" />

            {/* User Profile avatar */}
            <div className="flex w-full items-center gap-3 mt-2">
              <SignOutButton>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 text-left hover:bg-gray-50 p-1.5 rounded-xl transition-colors"
                  title="Click to Sign out"
                >

                  <div className="flex-1 min-w-0">

                    <p className="text-[12px] text-gray-600 flex items-center gap-1">
                      <LogOut className="size-5" /> Sign out
                    </p>
                  </div>
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </aside>

      {/* Floating Toggle Button when Sidebar is closed */}
      {!sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="absolute top-2.5 left-4 z-40 flex size-9 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md text-gray-700 hover:text-gray-900 transition-all hover:scale-105"
          title="Expand Sidebar"
        >
          <PanelLeft className="size-4.5" />
        </button>
      )}

      {/* Right Column (Header + Content) */}
      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden relative bg-gray-50">
        <header className="border-b border-gray-200 bg-white shrink-0">
          <div className="flex h-14 items-center justify-between px-6">
            <div className="flex items-center gap-3">
              {!sidebarOpen && <div className="w-10" />}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
