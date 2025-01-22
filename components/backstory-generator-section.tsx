'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2, BookOpen, HelpCircle, Zap, Lock, ChevronDown } from "lucide-react";
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';

// Add the SkeletonLoading component
function SkeletonLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-4 w-32 bg-gray-200/60 dark:bg-gray-700/60 rounded" />
        <div className="h-4 w-24 bg-gray-200/60 dark:bg-gray-700/60 rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-gray-200/60 dark:bg-gray-700/60 rounded" />
        <div className="h-4 w-[95%] bg-gray-200/60 dark:bg-gray-700/60 rounded" />
        <div className="h-4 w-[90%] bg-gray-200/60 dark:bg-gray-700/60 rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-[88%] bg-gray-200/60 dark:bg-gray-700/60 rounded" />
        <div className="h-4 w-[92%] bg-gray-200/60 dark:bg-gray-700/60 rounded" />
        <div className="h-4 w-[85%] bg-gray-200/60 dark:bg-gray-700/60 rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-[87%] bg-gray-200/60 dark:bg-gray-700/60 rounded" />
        <div className="h-4 w-[82%] bg-gray-200/60 dark:bg-gray-700/60 rounded" />
        <div className="h-4 w-[89%] bg-gray-200/60 dark:bg-gray-700/60 rounded" />
      </div>
    </div>
  );
}

// Custom hook for typewriter effect
function useTypewriter(text: string | null, speed: number = 10) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!text) {
      setDisplayedText("");
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    let index = 0;
    setDisplayedText("In");

    // Add a small delay before starting the rest of the text
    setTimeout(() => {
      const interval = setInterval(() => {
        if (index < text.length) {
          // Skip the first two characters if they are "In"
          if (index < 2 && text.startsWith("In")) {
            index = 2;
          }
          setDisplayedText((prev) => prev + text.charAt(index));
          index++;
        } else {
          setIsTyping(false);
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, 500); // 500ms delay before starting the rest

    return () => {
      setIsTyping(false);
    };
  }, [text, speed]);

  return { displayedText, isTyping };
}

export function BackstoryGeneratorSection() {
  const [characterName, setCharacterName] = useState("");
  const [setting, setSetting] = useState("");
  const [keyEvents, setKeyEvents] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedBackstory, setGeneratedBackstory] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  
  // Use the typewriter effect
  const { displayedText, isTyping } = useTypewriter(generatedBackstory, 20);

  const handleGenerateBackstory = async () => {
    if (!characterName || !setting || !keyEvents) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedBackstory(null); // Reset the backstory before generating new one
    
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        setError('Please sign in to use this feature');
        return;
      }

      const response = await fetch('/api/backstory-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          characterName,
          setting,
          keyEvents
        })
      });

      if (!response.ok) {
        if (response.status === 402) {
          setError('No credits remaining. Please purchase more credits to continue.');
          return;
        }
        throw new Error('Failed to generate backstory');
      }

      const data = await response.json();
      setGeneratedBackstory(data.backstory);
      
      // Dispatch credit update event
      window.dispatchEvent(new Event('creditUpdate'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAll = () => {
    setCharacterName("");
    setSetting("");
    setKeyEvents("");
    setGeneratedBackstory(null);
    setError(null);
  };

  const faqItems = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      question: "What makes a good character backstory?",
      answer: "A compelling backstory includes a clear character motivation, defining experiences, and connections to the world they inhabit. Focus on key moments that shaped your character's personality and beliefs."
    },
    {
      icon: <Zap className="w-5 h-5" />,
      question: "How detailed should my inputs be?",
      answer: "While being concise, include specific details that make your character unique. The setting and key events should give enough context for the AI to understand the character's world and experiences."
    },
    {
      icon: <Lock className="w-5 h-5" />,
      question: "Can I use the generated backstories in my work?",
      answer: "Yes, all generated backstories are free to use in your creative works, whether personal or commercial. You own the rights to the generated content."
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      question: "How can I improve the generated backstories?",
      answer: "Try different combinations of settings and key events. The more specific and unique your inputs are, the more interesting and detailed the generated backstory will be."
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* Top Bar with Glass Effect */}
      <div className="backdrop-blur-sm bg-background/50 rounded-xl p-4 mb-6 shadow-sm border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetAll}
            className="text-sm"
          >
            Reset All Fields
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Box - Input Section */}
        <div className="space-y-4">
          <div className="backdrop-blur-sm bg-background/50 rounded-xl p-4 shadow-sm border">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Character Name</label>
                <Input
                  placeholder="Enter the character's name..."
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  maxLength={50}
                  className="h-10 text-sm bg-background/50"
                />
                <div className="text-xs text-gray-500 mt-1 text-right">{characterName.length}/50</div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Setting</label>
                <Input
                  placeholder="Describe the setting (e.g., medieval fantasy, futuristic city)..."
                  value={setting}
                  onChange={(e) => setSetting(e.target.value)}
                  maxLength={100}
                  className="h-10 text-sm bg-background/50"
                />
                <div className="text-xs text-gray-500 mt-1 text-right">{setting.length}/100</div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Key Events</label>
                <Textarea
                  placeholder="List key events that shaped the character's life..."
                  value={keyEvents}
                  onChange={(e) => setKeyEvents(e.target.value)}
                  maxLength={200}
                  className="min-h-[150px] text-sm bg-background/50"
                />
                <div className="text-xs text-gray-500 mt-1 text-right">{keyEvents.length}/200</div>
              </div>
            </div>
          </div>

          {error && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-200">
              <p className="text-sm text-red-500 bg-red-500/10 rounded-xl px-4 py-3 border border-red-500/20">{error}</p>
            </div>
          )}
        </div>

        {/* Right Box - Generated Backstory Section */}
        <div className="space-y-4">
          <div className="backdrop-blur-sm bg-background/50 rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium">Generated Backstory</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-background/80"
                onClick={() => {
                  if (generatedBackstory) {
                    navigator.clipboard.writeText(generatedBackstory);
                  }
                }}
                disabled={!generatedBackstory || isTyping}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                >
                  <path
                    d="M5 2V1H10V2H5ZM4.75 0C4.33579 0 4 0.335786 4 0.75V1H3.5C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V2.5C13 1.67157 12.3284 1 11.5 1H11V0.75C11 0.335786 10.6642 0 10.25 0H4.75ZM11 2V2.25C11 2.66421 10.6642 3 10.25 3H4.75C4.33579 3 4 2.66421 4 2.25V2H3.5C3.22386 2 3 2.22386 3 2.5V12.5C3 12.7761 3.22386 13 3.5 13H11.5C11.7761 13 12 12.7761 12 12.5V2.5C12 2.22386 11.7761 2 11.5 2H11Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            </div>
            <div className="bg-background/50 rounded-xl p-4 min-h-[300px] border border-muted-foreground/10">
              {generatedBackstory ? (
                <div className="relative">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{displayedText}</p>
                  {isTyping && (
                    <span className="inline-block w-1 h-4 ml-0.5 align-middle bg-current animate-pulse" />
                  )}
                </div>
              ) : isLoading ? (
                <div className="h-full">
                  <SkeletonLoading />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
                  <div className="p-4 rounded-full bg-muted/30">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <p className="text-sm">Generated backstory will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="mt-6">
        <Button
          className="w-full h-12 text-base font-medium bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white shadow-lg transition-all duration-200 rounded-xl"
          onClick={handleGenerateBackstory}
          disabled={(!characterName || !setting || !keyEvents) || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="h-5 w-5 mr-2" />
              Generate Backstory
            </>
          )}
        </Button>
      </div>

      {/* How to Use Section */}
      <div className="mt-16 mb-8 relative">
        {/* Creative Background Elements */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-gray-200/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-gray-300/10 rounded-full blur-[100px]" />
        </div>

        <div className="text-center mb-12 relative">
          <span className="inline-block mb-2 px-4 py-1 bg-gray-100/60 dark:bg-gray-800/40 rounded-full text-xs font-medium text-gray-800/90 dark:text-gray-300/90 backdrop-blur-md">Quick Guide</span>
          <h2 className="text-2xl font-medium bg-gradient-to-r from-gray-900/90 via-gray-800/90 to-gray-900/90 dark:from-gray-200/90 dark:via-gray-300/90 dark:to-gray-200/90 bg-clip-text text-transparent">
            Create Your Perfect Character
          </h2>
          <div className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-600/80 dark:text-gray-400/80">
            <span className="inline-block w-12 h-[1px] bg-gradient-to-r from-transparent via-gray-400/40 dark:via-gray-600/40 to-transparent"></span>
            <p className="text-gray-700/80 dark:text-gray-400/80">Three simple steps</p>
            <span className="inline-block w-12 h-[1px] bg-gradient-to-r from-transparent via-gray-400/40 dark:via-gray-600/40 to-transparent"></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="group relative">
            <div className="bg-gradient-to-br from-white/90 to-white/50 dark:from-gray-800/50 dark:to-gray-800/30 backdrop-blur-xl rounded-xl p-6 
                          border border-white/20 dark:border-gray-700/30 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.1)] dark:shadow-gray-900/20
                          transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/20 dark:hover:shadow-gray-900/10 hover:-translate-y-1 group-hover:border-gray-200/40 dark:group-hover:border-gray-700/40">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-gray-800/80 to-gray-700/80 dark:from-gray-700/60 dark:to-gray-600/60
                            flex items-center justify-center text-white/90 font-medium text-sm ring-[3px] ring-white/60 dark:ring-gray-900/60 shadow-sm backdrop-blur-md">
                1
              </div>
              <div className="mb-4 p-3 bg-gradient-to-br from-gray-50/90 to-gray-100/50 dark:from-gray-700/50 dark:to-gray-700/30 rounded-lg w-fit backdrop-blur-md
                            group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <BookOpen className="h-5 w-5 text-gray-700/90 dark:text-gray-300/90" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-800/90 dark:text-gray-200/90 mb-2 group-hover:text-gray-900 dark:group-hover:text-white/90">Name Your Character</h3>
              <p className="text-xs text-gray-600/80 dark:text-gray-400/80 leading-relaxed">
                Give your character a memorable name that fits their world
              </p>
            </div>
            <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 text-gray-300/40 z-10">
              <div className="relative">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="animate-pulse opacity-70">
                  <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="absolute inset-0 blur-md -z-10">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="group relative">
            <div className="bg-gradient-to-br from-white/90 to-white/50 dark:from-gray-800/50 dark:to-gray-800/30 backdrop-blur-xl rounded-xl p-6 
                          border border-white/20 dark:border-gray-700/30 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.1)] dark:shadow-gray-900/20
                          transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/20 dark:hover:shadow-gray-900/10 hover:-translate-y-1 group-hover:border-gray-200/40 dark:group-hover:border-gray-700/40">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-gray-800/80 to-gray-700/80 dark:from-gray-700/60 dark:to-gray-600/60
                            flex items-center justify-center text-white/90 font-medium text-sm ring-[3px] ring-white/60 dark:ring-gray-900/60 shadow-sm backdrop-blur-md">
                2
              </div>
              <div className="mb-4 p-3 bg-gradient-to-br from-gray-50/90 to-gray-100/50 dark:from-gray-700/50 dark:to-gray-700/30 rounded-lg w-fit backdrop-blur-md
                            group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-700/90 dark:text-gray-300/90"
                >
                  <path d="M3 3h18v18H3z" />
                  <path d="M12 8v8m-4-4h8" />
                </svg>
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-800/90 dark:text-gray-200/90 mb-2 group-hover:text-gray-900 dark:group-hover:text-white/90">Set the Stage</h3>
              <p className="text-xs text-gray-600/80 dark:text-gray-400/80">
                Describe the world your character inhabits
              </p>
            </div>
            <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 text-gray-300/40 z-10">
              <div className="relative">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="animate-pulse opacity-70">
                  <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="group">
            <div className="bg-gradient-to-br from-white/90 to-white/50 dark:from-gray-800/50 dark:to-gray-800/30 backdrop-blur-xl rounded-xl p-6 
                          border border-white/20 dark:border-gray-700/30 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.1)] dark:shadow-gray-900/20
                          transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/20 dark:hover:shadow-gray-900/10 hover:-translate-y-1 group-hover:border-gray-200/40 dark:group-hover:border-gray-700/40">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-gray-800/80 to-gray-700/80 dark:from-gray-700/60 dark:to-gray-600/60
                            flex items-center justify-center text-white/90 font-medium text-sm ring-[3px] ring-white/60 dark:ring-gray-900/60 shadow-sm backdrop-blur-md">
                3
              </div>
              <div className="mb-4 p-3 bg-gradient-to-br from-gray-50/90 to-gray-100/50 dark:from-gray-700/50 dark:to-gray-700/30 rounded-lg w-fit backdrop-blur-md
                            group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <Wand2 className="h-5 w-5 text-gray-700/90 dark:text-gray-300/90" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-800/90 dark:text-gray-200/90 mb-2 group-hover:text-gray-900 dark:group-hover:text-white/90">Bring to Life</h3>
              <p className="text-xs text-gray-600/80 dark:text-gray-400/80">
                Let AI weave your character's story
              </p>
            </div>
          </div>
        </div>

        {/* Pro Tips with Creative Design */}
        <div className="mt-10">
          <div className="bg-gradient-to-br from-white/90 to-white/50 dark:from-gray-800/50 dark:to-gray-800/30 backdrop-blur-xl rounded-xl p-5 
                        border border-white/20 dark:border-gray-700/30 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.1)] dark:shadow-gray-900/20">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-gray-50/90 to-gray-100/50 dark:from-gray-700/50 dark:to-gray-700/30
                            flex items-center justify-center backdrop-blur-md shadow-sm">
                <HelpCircle className="w-5 h-5 text-gray-700/90 dark:text-gray-300/90" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800/90 dark:text-gray-200/90 mb-0.5">Quick Tip</p>
                <p className="text-xs text-gray-600/80 dark:text-gray-400/80">
                  Focus on pivotal moments in your character's life to create a more compelling backstory
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 mb-8 relative">
          <div className="absolute inset-0 overflow-hidden -z-10">
            <div className="absolute top-10 left-10 w-40 h-40 bg-gray-200/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-gray-300/10 rounded-full blur-[100px]" />
          </div>

          <div className="text-center mb-12 relative">
            <span className="inline-block mb-2 px-4 py-1 bg-gray-100/60 dark:bg-gray-800/40 rounded-full text-xs font-medium text-gray-800/90 dark:text-gray-300/90 backdrop-blur-md">FAQ</span>
            <h2 className="text-2xl font-medium bg-gradient-to-r from-gray-900/90 via-gray-800/90 to-gray-900/90 dark:from-gray-200/90 dark:via-gray-300/90 dark:to-gray-200/90 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid gap-4">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white/90 to-white/50 dark:from-gray-800/50 dark:to-gray-800/30 backdrop-blur-xl rounded-xl 
                          border border-white/20 dark:border-gray-700/30 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.1)] dark:shadow-gray-900/20
                          transition-all duration-200 hover:shadow-lg hover:shadow-gray-200/20 dark:hover:shadow-gray-900/10"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100/80 dark:bg-gray-800/80">
                      {item.icon}
                    </div>
                    <h3 className="text-base font-semibold text-gray-800/90 dark:text-gray-200/90">
                      {item.question}
                    </h3>
                  </div>
                  <ChevronDown 
                    className={cn(
                      "w-5 h-5 text-gray-500 transition-transform duration-200",
                      openFaqIndex === index ? "transform rotate-180" : ""
                    )} 
                  />
                </button>
                <div className={cn(
                  "grid transition-all duration-200",
                  openFaqIndex === index ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}>
                  <div className="overflow-hidden">
                    <p className="px-6 pb-4 text-sm text-gray-600/80 dark:text-gray-400/80">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 