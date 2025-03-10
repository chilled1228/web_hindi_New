import { Metadata } from 'next'
import { defaultMetadata } from '../metadata'
import { Suspense } from "react"
import { ArrowRight, Scale, Shield, FileCheck, AlertCircle, Users, RefreshCw, Mail, Gavel, Handshake } from 'lucide-react';
import { AnimatedBackground } from '@/components/ui/animated-background'

// Generate metadata for SEO
export const metadata: Metadata = {
  ...defaultMetadata,
  title: 'Terms & Conditions - Naya Bharat Yojana',
  description: 'Terms and conditions for using Naya Bharat Yojana platform. Learn about our policies, user responsibilities, and guidelines.',
}

export default function TermsAndConditions() {
  return (
    <>
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center justify-center p-2 mb-4 rounded-2xl bg-white/20 backdrop-blur-sm">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
            Terms & Conditions
          </h1>
          <p className="text-white/80 text-lg">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Introduction Section */}
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <p className="text-lg text-white/90 leading-relaxed mb-6">
            Welcome to NayaBharatYojana. By accessing or using our services, you agree to be bound by these Terms & Conditions. Please read them carefully before using our platform.
          </p>
          <div className="flex items-center justify-center gap-3 text-sm text-white/80">
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              Protected Service
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
            <span className="flex items-center gap-1.5">
              <FileCheck className="w-4 h-4" />
              Legal Compliance
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
            <span className="flex items-center gap-1.5">
              <Handshake className="w-4 h-4" />
              Fair Usage
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="grid gap-8">
          <section className="group rounded-3xl bg-white/90 backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-lg hover:shadow-white/10">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-[#F1F1FF] group-hover:scale-110 transition-transform duration-300">
                <Gavel className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  Acceptance of Terms
                  <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </h2>
                <div className="prose prose-gray">
                  <p className="text-muted-foreground/90">
                    By accessing or using NayaBharatYojana, you agree to:
                  </p>
                  <ul className="mt-4 space-y-3 text-muted-foreground/90">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Comply with these Terms & Conditions
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Follow our community guidelines
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Respect intellectual property rights
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Use the service responsibly
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="group rounded-3xl bg-white/90 backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-lg hover:shadow-white/10">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-[#F1F1FF] group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  User Responsibilities
                  <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </h2>
                <div className="prose prose-gray">
                  <p className="text-muted-foreground/90">
                    As a user of NayaBharatYojana, you are responsible for:
                  </p>
                  <ul className="mt-4 space-y-3 text-muted-foreground/90">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Maintaining account security
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Creating appropriate content
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Respecting other users
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Following platform guidelines
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="group rounded-3xl bg-white/90 backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-lg hover:shadow-white/10">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-[#F1F1FF] group-hover:scale-110 transition-transform duration-300">
                <AlertCircle className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  Prohibited Activities
                  <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </h2>
                <div className="prose prose-gray">
                  <p className="text-muted-foreground/90">
                    The following activities are strictly prohibited:
                  </p>
                  <ul className="mt-4 space-y-3 text-muted-foreground/90">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Unauthorized access or use
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Sharing inappropriate content
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Harassment or abuse
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Violation of intellectual property
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
                  Contact Us
                  <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </h2>
                <div className="prose prose-gray">
                  <p className="text-muted-foreground/90">
                    If you have any questions about these Terms & Conditions, please contact us:
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <a href="mailto:support@nayabharatyojana.in" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F1F1FF] hover:bg-[#E1E1FF] transition-colors duration-200">
                      <Mail className="w-4 h-4" />
                      support@nayabharatyojana.in
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