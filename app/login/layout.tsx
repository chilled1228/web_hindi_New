import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | Hindi Blog',
  description: 'Sign in to your account to access all features',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center">
      {children}
    </section>
  );
} 