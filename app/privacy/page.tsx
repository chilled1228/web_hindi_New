import { Metadata } from 'next'
import { defaultMetadata } from '../metadata'
import { Suspense } from "react"
import { ArrowRight, Shield, Lock, Bell, UserCheck, Cookie, Link2, Users, RefreshCw, Mail } from 'lucide-react';
import { AnimatedBackground } from '@/components/ui/animated-background'

// Generate metadata for SEO
export const metadata: Metadata = {
  ...defaultMetadata,
  title: 'Privacy Policy - Naya Bharat Yojana',
  description: 'Privacy policy for Naya Bharat Yojana platform. Learn how we collect, use, and protect your personal information.',
}

export default function PrivacyPolicy() {
  return (
    <>
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center justify-center p-2 mb-4 rounded-2xl bg-white/20 backdrop-blur-sm">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
            Privacy Policy
          </h1>
          <p className="text-white/80 text-lg">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Introduction Section */}
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <p className="text-lg text-white/90 leading-relaxed mb-6">
            At NayaBharatYojana, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.
          </p>
          <div className="flex items-center justify-center gap-3 text-sm text-white/80">
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4" />
              Data Protection
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" />
              User Control
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
            <span className="flex items-center gap-1.5">
              <Cookie className="w-4 h-4" />
              Cookie Policy
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="grid gap-8">
          <section className="group rounded-3xl bg-white/90 backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-lg hover:shadow-white/10">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-[#F1F1FF] group-hover:scale-110 transition-transform duration-300">
                <Lock className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  Information We Collect
                  <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </h2>
                <div className="prose prose-gray">
                  <p className="text-muted-foreground/90">
                    We may collect the following types of information:
                  </p>
                  <ul className="mt-4 space-y-3 text-muted-foreground/90">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Personal information (name, email, phone number)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Usage data and analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Device information
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Cookies and tracking technologies
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="group rounded-3xl bg-white/90 backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-lg hover:shadow-white/10">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-[#F1F1FF] group-hover:scale-110 transition-transform duration-300">
                <UserCheck className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  How We Use Your Information
                  <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </h2>
                <div className="prose prose-gray">
                  <p className="text-muted-foreground/90">
                    We use your information for the following purposes:
                  </p>
                  <ul className="mt-4 space-y-3 text-muted-foreground/90">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Providing and improving our services
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Communicating with you about updates
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Personalizing your experience
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Ensuring security and preventing fraud
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="group rounded-3xl bg-white/90 backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-lg hover:shadow-white/10">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-[#F1F1FF] group-hover:scale-110 transition-transform duration-300">
                <Cookie className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  Cookies and Tracking
                  <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </h2>
                <div className="prose prose-gray">
                  <p className="text-muted-foreground/90">
                    Our cookie policy includes:
                  </p>
                  <ul className="mt-4 space-y-3 text-muted-foreground/90">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Essential cookies for site functionality
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Analytics cookies to improve user experience
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Third-party cookies for enhanced features
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Options to manage cookie preferences
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section with Special Styling */}
          <section className="group rounded-3xl bg-white/90 backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-lg hover:shadow-white/10">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-[#F1F1FF] group-hover:scale-110 transition-transform duration-300">
                <Mail className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  Contact Us About Privacy
                  <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </h2>
                <div className="prose prose-gray">
                  <p className="text-muted-foreground/90">
                    If you have any questions about our Privacy Policy, please contact us:
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <a href="mailto:privacy@nayabharatyojana.in" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F1F1FF] hover:bg-[#E1E1FF] transition-colors duration-200">
                      <Mail className="w-4 h-4" />
                      privacy@nayabharatyojana.in
                    </a>
                    <a href="/contact" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F1F1FF] hover:bg-[#E1E1FF] transition-colors duration-200">
                      <Users className="w-4 h-4" />
                      Contact Form
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
} 