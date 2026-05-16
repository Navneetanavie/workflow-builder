import { SignIn } from "@clerk/nextjs";

import { AuthCard } from "@/components/auth-card";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignInPage() {
  return (
    <AuthCard
      title="Sign in to Magica"
      subtitle="Welcome back! Please sign in to continue"
      footerText="Don't have an account?"
      footerLink={{ label: "Sign up", href: "/sign-up" }}
    >
      <SignIn
        appearance={clerkAppearance}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        forceRedirectUrl="/dashboard"
        fallbackRedirectUrl="/dashboard"
        signUpForceRedirectUrl="/dashboard"
        signUpFallbackRedirectUrl="/dashboard"
      />
    </AuthCard>
  );
}
