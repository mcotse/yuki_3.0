import { SignIn } from "@clerk/nextjs";

export function generateStaticParams() {
  return [{ login: [] }];
}

export default function LoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-surface-dim">
      <div className="w-full max-w-sm px-4">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-on-surface">Yuki</h1>
          <p className="mt-1 text-sm text-on-surface-muted">
            Pet medication tracker
          </p>
        </div>
        <SignIn
          routing="path"
          path="/login"
          afterSignInUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none w-full",
            },
          }}
        />
      </div>
    </div>
  );
}
