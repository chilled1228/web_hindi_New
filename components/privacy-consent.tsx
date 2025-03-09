'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/app/providers';

export function PrivacyConsent() {
  const [showConsent, setShowConsent] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkConsent = async () => {
      // First check localStorage for immediate UI feedback
      const localConsent = localStorage.getItem('privacy-accepted');
      
      if (user && db) {
        // If user is logged in, check database
        try {
          const consentRef = doc(db, 'users', user.uid);
          const consentDoc = await getDoc(consentRef);
          
          if (consentDoc.exists() && consentDoc.data().privacyAccepted) {
            setShowConsent(false);
            // Update localStorage to match database
            localStorage.setItem('privacy-accepted', 'true');
          } else {
            setShowConsent(!localConsent);
          }
        } catch (error) {
          console.error('Error checking consent:', error);
          setShowConsent(!localConsent);
        }
      } else {
        // For non-logged in users, rely on localStorage
        setShowConsent(!localConsent);
      }
    };

    checkConsent();
  }, [user]);

  const handleAccept = async () => {
    try {
      // Save to localStorage for immediate feedback
      localStorage.setItem('privacy-accepted', 'true');
      
      // If user is logged in, save to database
      if (user && db) {
        const consentRef = doc(db, 'users', user.uid);
        await setDoc(consentRef, {
          privacyAccepted: true,
          privacyAcceptedAt: new Date().toISOString(),
          privacyAcceptedVersion: '1.0', // You can update this when privacy policy changes
        }, { merge: true }); // Use merge to preserve other user data
      }
      
      setShowConsent(false);
    } catch (error) {
      console.error('Error saving consent:', error);
      // Still hide the consent even if database save fails
      // as we have localStorage as backup
      setShowConsent(false);
    }
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-gray-200 p-4 z-50">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-gray-600" />
          <p className="text-sm text-gray-600">
            This website uses cookies to ensure you get the best experience. By continuing to use this site, you consent to our{' '}
            <Link href="/privacy" className="underline hover:text-gray-900">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleAccept}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
} 