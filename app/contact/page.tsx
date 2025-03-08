'use client';

import { ArrowRight, Mail, MessageSquare, Send } from 'lucide-react';
import { useState, useEffect } from 'react';

// Declare the global grecaptcha type
declare global {
  interface Window {
    grecaptcha: any;
    onloadCallback: () => void;
  }
}

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string | null;
  }>({ type: null, message: null });

  useEffect(() => {
    // Define the callback function
    window.onloadCallback = () => {
      setRecaptchaLoaded(true);
      window.grecaptcha.render('recaptcha-container', {
        sitekey: '6LeKB7AqAAAAAIs6uPfOq1obJL5lDXZ3GkcOHr-t',
        theme: 'light',
        callback: (response: string) => {
          console.log('reCAPTCHA verified:', response);
        }
      });
    };

    // Load reCAPTCHA script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      (window.onloadCallback as any) = null;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setSubmitStatus({ type: null, message: null });

      // Get reCAPTCHA response
      const recaptchaResponse = await window.grecaptcha.getResponse();
      
      if (!recaptchaResponse) {
        setSubmitStatus({
          type: 'error',
          message: 'Please complete the reCAPTCHA verification'
        });
        return;
      }

      // Send data to API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken: recaptchaResponse
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Show success message
      setSubmitStatus({
        type: 'success',
        message: 'Message sent successfully! We will get back to you soon.'
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        message: ''
      });

      // Reset reCAPTCHA
      window.grecaptcha.reset();
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to send message. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
            <MessageSquare className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">
            Contact Us
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have a question or feedback? We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.
          </p>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="group rounded-3xl bg-gradient-to-b from-background to-gray-100/10 dark:to-gray-800/10 p-8 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/20 dark:hover:shadow-gray-800/20 border border-gray-200/30 dark:border-gray-800/30">
              <div className="space-y-6">
                {/* Name Input */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500/50 transition-all duration-200"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500/50 transition-all duration-200"
                    placeholder="john@example.com"
                  />
                </div>

                {/* Message Input */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500/50 transition-all duration-200"
                    placeholder="Type your message here..."
                  />
                </div>

                {/* reCAPTCHA Container */}
                <div className="flex justify-center">
                  <div id="recaptcha-container"></div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white dark:border-gray-900 border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Message
                </>
              )}
            </button>

            {/* Status Messages */}
            {submitStatus.message && (
              <div className={`mt-4 p-4 rounded-xl ${
                submitStatus.type === 'success' 
                  ? 'bg-green-50 dark:bg-green-900/10 text-green-800 dark:text-green-200' 
                  : 'bg-red-50 dark:bg-red-900/10 text-red-800 dark:text-red-200'
              }`}>
                {submitStatus.message}
              </div>
            )}
          </form>

          {/* Alternative Contact Method */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">
              Prefer email? Reach us directly at{' '}
              <a
                href="mailto:support@nayabharatyojana.in"
                className="text-gray-900 dark:text-gray-100 hover:underline"
              >
                support@nayabharatyojana.in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 