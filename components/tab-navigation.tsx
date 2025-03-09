'use client'
import { useState } from 'react'
import { Image, Text, Code, Wand2, BookOpen } from 'lucide-react'
import { LucideIcon } from 'lucide-react'

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

type TabItem = [string | [string, boolean], LucideIcon];

export function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  const tabs = [
    {
      value: 'Image to Prompt',
      label: 'Image to Prompt',
      icon: Image
    },
    {
      value: 'Text Humanizer',
      label: 'Text Humanizer',
      icon: Wand2
    },
    {
      value: 'Backstory',
      label: 'Backstory',
      icon: BookOpen
    },
    {
      value: 'Text',
      label: 'Text',
      icon: Text
    },
    {
      value: 'Code',
      label: 'Code',
      icon: Code
    }
  ]

  return (
    <div className="flex justify-center mb-4 md:mb-6">
      <div className="inline-flex flex-wrap p-1 rounded-full bg-[#f5f5f5] max-w-full overflow-x-auto no-scrollbar">
        {tabs.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setActiveTab(value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === value
                ? 'bg-white shadow-sm text-black'
                : 'text-[#666666] hover:text-black'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

