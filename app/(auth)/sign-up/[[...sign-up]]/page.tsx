import { SignUp } from "@clerk/nextjs";

import { AuthCard } from "@/components/auth-card";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignUpPage() {
  return (
    <AuthCard
      title="Create your account"
      subtitle="Welcome! Please fill in the details to get started."
      footerText="Already have an account?"
      footerLink={{ label: "Sign in", href: "/sign-in" }}
    >
      <SignUp
        appearance={clerkAppearance}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        forceRedirectUrl="/dashboard"
        fallbackRedirectUrl="/dashboard"
        signInForceRedirectUrl="/dashboard"
        signInFallbackRedirectUrl="/dashboard"
      />
    </AuthCard>
  );
}
