import { Metadata } from 'next'
import { defaultMetadata } from '../metadata'
import { Suspense } from "react"
import { ArrowRight, AlertTriangle, Scale, BookOpen, FileWarning, Shield, ExternalLink, HelpCircle, Mail, Users } from 'lucide-react';
import { AnimatedBackground } from '@/components/ui/animated-background'

// Generate metadata for SEO
export const metadata: Metadata = {
  ...defaultMetadata,
  title: 'Disclaimer - Naya Bharat Yojana',
  description: 'Disclaimer for Naya Bharat Yojana platform. Understand our limitations of liability and terms of use.',
}

export default function Disclaimer() {
  return (
    <>
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center justify-center p-2 mb-4 rounded-2xl bg-white/20 backdrop-blur-sm">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
            Disclaimer
          </h1>
          <p className="text-white/80 text-lg">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Introduction Section */}
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <p className="text-lg text-white/90 leading-relaxed mb-6">
            The information provided on NayaBharatYojana is for general informational purposes only. All information is provided in good faith, however, we make no representation or warranty regarding the accuracy, validity, or completeness of any information on this website.
          </p>
          <div className="flex items-center justify-center gap-3 text-sm text-white/80">
            <span className="flex items-center gap-1.5">
              <FileWarning className="w-4 h-4" />
              Use At Your Own Risk
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
            <span className="flex items-center gap-1.5">
              <Scale className="w-4 h-4" />
              No Legal Advice
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              Educational Only
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="grid gap-8">
          <section className="group rounded-3xl bg-white/90 backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-lg hover:shadow-white/10">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-[#F1F1FF] group-hover:scale-110 transition-transform duration-300">
                <AlertTriangle className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  No Liability
                  <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </h2>
                <div className="prose prose-gray">
                  <p className="text-muted-foreground/90">
                    Under no circumstances shall we have any liability to you for:
                  </p>
                  <ul className="mt-4 space-y-3 text-muted-foreground/90">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Any loss or damage incurred from using our website
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Decisions made based on information provided
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Inaccuracies or omissions in our content
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Technical issues or unavailability of the website
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="group rounded-3xl bg-white/90 backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-lg hover:shadow-white/10">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-[#F1F1FF] group-hover:scale-110 transition-transform duration-300">
                <Scale className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  Not Legal or Professional Advice
                  <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </h2>
                <div className="prose prose-gray">
                  <p className="text-muted-foreground/90">
                    Important considerations regarding our content:
                  </p>
                  <ul className="mt-4 space-y-3 text-muted-foreground/90">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Not a substitute for professional advice
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Consult qualified professionals for specific situations
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Information may not be applicable to your circumstances
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Laws and regulations vary by location
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="group rounded-3xl bg-white/90 backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-lg hover:shadow-white/10">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-[#F1F1FF] group-hover:scale-110 transition-transform duration-300">
                <ExternalLink className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  External Links
                  <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </h2>
                <div className="prose prose-gray">
                  <p className="text-muted-foreground/90">
                    Regarding external websites linked from our platform:
                  </p>
                  <ul className="mt-4 space-y-3 text-muted-foreground/90">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      We do not control third-party websites
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Not responsible for their content or practices
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Inclusion of links does not imply endorsement
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Use external sites at your own risk
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
                <HelpCircle className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  Questions About This Disclaimer
                  <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </h2>
                <div className="prose prose-gray">
                  <p className="text-muted-foreground/90">
                    If you have any questions about this disclaimer, please contact us:
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <a href="mailto:legal@nayabharatyojana.in" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F1F1FF] hover:bg-[#E1E1FF] transition-colors duration-200">
                      <Mail className="w-4 h-4" />
                      legal@nayabharatyojana.in
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