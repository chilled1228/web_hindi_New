'use client'
import { useState } from 'react'
import { Image, Text, Code } from 'lucide-react'
import { LucideIcon } from 'lucide-react'

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

type TabItem = [string | [string, boolean], LucideIcon];

export function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  const tabs = [
    {
      value: 'Image',
      label: 'Image',
      icon: Image
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
    <div className="flex justify-center mb-4 md:mb-8 lg:mb-16">
      <div className="inline-flex flex-wrap p-1 rounded-full bg-[#f5f5f5] dark:bg-gray-800 max-w-full overflow-x-auto no-scrollbar">
        {tabs.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setActiveTab(value)}
            className={`
              px-2 py-1 text-[11px] sm:text-[12px] md:px-4 md:py-2 md:text-[14px] font-medium rounded-full 
              flex items-center gap-1.5 sm:gap-2 transition-colors shrink-0
              ${value === activeTab 
                ? 'bg-white dark:bg-gray-900 shadow-sm text-black dark:text-white' 
                : 'text-[#666666] dark:text-gray-400 hover:text-black dark:hover:text-white'}
            `}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

