'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, Wand2, Loader2 } from "lucide-react";
import { auth } from '@/lib/firebase';

export function TextHumanizerSection() {
  const [text, setText] = useState("");
  const [humanizationLevel, setHumanizationLevel] = useState(59);
  const [formalityLevel, setFormalityLevel] = useState(46);
  const [useSpellingVariations, setUseSpellingVariations] = useState(false);
  const [contextualAwareness, setContextualAwareness] = useState(false);
  const [phraseRandomization, setPhraseRandomization] = useState(false);
  const [readabilityLevel, setReadabilityLevel] = useState("medium");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [humanizedText, setHumanizedText] = useState<string | null>(null);

  const handleHumanize = async () => {
    if (!text) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the current user's token
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        setError('Please sign in to use this feature');
        return;
      }

      const response = await fetch('/api/humanizer-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text,
          humanizationLevel,
          formalityLevel,
          useSpellingVariations,
          contextualAwareness,
          phraseRandomization,
          readabilityLevel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to humanize text');
      }

      setHumanizedText(data.output);
      
      // Dispatch credit update event
      window.dispatchEvent(new Event('creditUpdate'));

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to humanize text');
      console.error('Error humanizing text:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setText("");
    setHumanizationLevel(59);
    setFormalityLevel(46);
    setUseSpellingVariations(false);
    setContextualAwareness(false);
    setPhraseRandomization(false);
    setReadabilityLevel("medium");
    setHumanizedText(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* Top Bar with Glass Effect */}
      <div className="backdrop-blur-sm bg-background/50 rounded-xl p-4 mb-6 shadow-sm border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <p className="text-sm font-medium">Readability Level</p>
            <Select value={readabilityLevel} onValueChange={setReadabilityLevel}>
              <SelectTrigger className="w-[180px] h-9 text-sm bg-background/50">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Box - Text Input Section */}
        <div className="space-y-4">
          <div className="backdrop-blur-sm bg-background/50 rounded-xl p-4 shadow-sm border">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">AI-generated Text</label>
                <Textarea
                  placeholder="Paste your AI-generated text here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[200px] lg:min-h-[300px] resize-none bg-background/50"
                />
                <div className="text-xs text-muted-foreground mt-1.5">
                  {text.length}/1000 characters
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-500">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  className="flex-1" 
                  onClick={handleHumanize}
                  disabled={!text || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4 mr-2" />
                  )}
                  {isLoading ? 'Humanizing...' : 'Humanize Text'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  disabled={!text && humanizationLevel === 59 && formalityLevel === 46}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Box - Output and Controls */}
        <div className="space-y-4">
          {/* Output Box */}
          <div className="backdrop-blur-sm bg-background/50 rounded-xl p-4 shadow-sm border">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Humanized Result</label>
                <div className={`min-h-[200px] lg:min-h-[300px] p-4 rounded-lg bg-muted/50 text-sm whitespace-pre-wrap prose prose-sm max-w-none dark:prose-invert ${!humanizedText ? 'flex items-center justify-center text-muted-foreground' : ''}`}>
                  {humanizedText || 'Humanized text will appear here...'}
                </div>
              </div>
            </div>
          </div>

          {/* Controls Box */}
          <div className="backdrop-blur-sm bg-background/50 rounded-xl p-4 shadow-sm border">
            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-sm font-medium">Humanization Level</label>
                  <span className="text-sm text-muted-foreground">{humanizationLevel}%</span>
                </div>
                <Slider
                  value={[humanizationLevel]}
                  onValueChange={(values: number[]) => setHumanizationLevel(values[0])}
                  max={100}
                  step={1}
                  className="my-2"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-sm font-medium">Formality Level</label>
                  <span className="text-sm text-muted-foreground">{formalityLevel}%</span>
                </div>
                <Slider
                  value={[formalityLevel]}
                  onValueChange={(values: number[]) => setFormalityLevel(values[0])}
                  max={100}
                  step={1}
                  className="my-2"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Use Spelling Variations</label>
                  <Switch
                    checked={useSpellingVariations}
                    onCheckedChange={setUseSpellingVariations}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Contextual Awareness</label>
                  <Switch
                    checked={contextualAwareness}
                    onCheckedChange={setContextualAwareness}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Phrase Randomization</label>
                  <Switch
                    checked={phraseRandomization}
                    onCheckedChange={setPhraseRandomization}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 