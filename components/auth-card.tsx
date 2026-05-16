import Link from "next/link";
import { X } from "lucide-react";

import { Logo } from "@/components/logo";

type AuthCardProps = {
  title: string;
  subtitle: string;
  footerText: string;
  footerLink: { label: string; href: string };
  children: React.ReactNode;
};

export function AuthCard({
  title,
  subtitle,
  footerText,
  footerLink,
  children,
}: AuthCardProps) {
  return (
    <div className="relative w-auto overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <Link
        href="/"
        className="absolute right-4 top-4 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        aria-label="Close"
      >
        <X className="size-4" />
      </Link>

      <div className="px-8 pb-6 pt-10 text-center">
        <div className="mb-4 flex justify-center">
          <Logo />
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-gray-900">
          {title}
        </h1>
        <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
      </div>

      <div className="px-8 pb-8">{children}</div>

      <div className="border-t border-gray-100 bg-gray-50 px-8 py-4 text-center text-sm text-gray-600">
        {footerText}{" "}
        <Link
          href={footerLink.href}
          className="font-semibold text-gray-900 hover:underline"
        >
          {footerLink.label}
        </Link>
      </div>
    </div>
  );
}
