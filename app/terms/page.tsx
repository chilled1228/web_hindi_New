'use client';

import { ArrowRight, Scale, Shield, FileCheck, AlertCircle, Users, RefreshCw, Mail, Gavel, Handshake } from 'lucide-react';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-64 h-64 bg-gray-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-gray-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16 relative">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center justify-center p-2 mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800/50 backdrop-blur-sm">
            <Scale className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">
            Terms & Conditions
          </h1>
          <p className="text-muted-foreground text-lg">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Introduction Section */}
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <p className="text-lg text-muted-foreground/90 leading-relaxed mb-6">
            Welcome to NayaBharatYojana. By accessing or using our services, you agree to be bound by these Terms & Conditions. Please read them carefully before using our platform.
          </p>
          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground/80">
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              Protected Service
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
            <span className="flex items-center gap-1.5">
              <FileCheck className="w-4 h-4" />
              Legal Compliance
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
            <span className="flex items-center gap-1.5">
              <Handshake className="w-4 h-4" />
              Fair Usage
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="grid gap-12">
          <section className="group rounded-3xl bg-gradient-to-b from-background to-gray-100/10 dark:to-gray-800/10 p-8 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/20 dark:hover:shadow-gray-800/20 border border-gray-200/30 dark:border-gray-800/30">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 group-hover:scale-110 transition-transform duration-300">
                <Gavel className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  Acceptance of Terms
                  <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </h2>
                <div className="prose prose-gray dark:prose-invert">
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

          <section className="group rounded-3xl bg-gradient-to-b from-background to-gray-100/10 dark:to-gray-800/10 p-8 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/20 dark:hover:shadow-gray-800/20 border border-gray-200/30 dark:border-gray-800/30">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  User Responsibilities
                  <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </h2>
                <div className="prose prose-gray dark:prose-invert">
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

          <section className="group rounded-3xl bg-gradient-to-b from-background to-gray-100/10 dark:to-gray-800/10 p-8 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/20 dark:hover:shadow-gray-800/20 border border-gray-200/30 dark:border-gray-800/30">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 group-hover:scale-110 transition-transform duration-300">
                <AlertCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  Prohibited Activities
                  <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </h2>
                <div className="prose prose-gray dark:prose-invert">
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
          <section className="group rounded-3xl bg-gradient-to-b from-gray-100 to-background dark:from-gray-800 dark:to-background p-8 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/20 dark:hover:shadow-gray-800/20 border border-gray-200/30 dark:border-gray-800/30">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-gray-200 dark:bg-gray-700 group-hover:scale-110 transition-transform duration-300">
                <Mail className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  Contact Us
                  <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </h2>
                <div className="prose prose-gray dark:prose-invert">
                  <p className="text-muted-foreground/90">
                    If you have any questions about these Terms & Conditions, please contact us:
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <a href="mailto:support@nayabharatyojana.in" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200">
                      <Mail className="w-4 h-4" />
                      support@nayabharatyojana.in
                    </a>
                    <a href="/contact" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200">
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
    </div>
  );
} 