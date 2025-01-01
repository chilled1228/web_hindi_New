'use client'
import { useState } from 'react'
import { Image, BookOpen, Music, Brain, Box } from 'lucide-react'
import { LucideIcon } from 'lucide-react'

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

type TabItem = [string | [string, boolean], LucideIcon];

export function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  return (
    <div className="flex justify-center mb-4 md:mb-8 lg:mb-16">
      <div className="inline-flex flex-wrap p-1 rounded-full bg-[#f5f5f5] dark:bg-gray-800 max-w-full overflow-x-auto no-scrollbar">
        {([
          ['Image', Image],
          ['Blog', BookOpen],
          ['Audio', Music],
          ['Language Models', Brain],
          [['3D Objects', true], Box]
        ] as TabItem[]).map(([item, Icon]) => (
          <button
            key={Array.isArray(item) ? item[0].toString() : item}
            onClick={() => setActiveTab(Array.isArray(item) ? item[0].toString() : item)}
            className={`
              px-2 py-1 text-[11px] sm:text-[12px] md:px-4 md:py-2 md:text-[14px] font-medium rounded-full 
              flex items-center gap-1.5 sm:gap-2 transition-colors shrink-0
              ${(Array.isArray(item) ? item[0].toString() : item) === activeTab 
                ? 'bg-white dark:bg-gray-900 shadow-sm text-black dark:text-white' 
                : 'text-[#666666] dark:text-gray-400 hover:text-black dark:hover:text-white'}
              whitespace-nowrap
            `}
          >
            {/* @ts-ignore - Icon is a valid Lucide component */}
            <Icon className="w-4 h-4" />
            {Array.isArray(item) ? (
              <>
                {item[0]}
                <span className="px-1 py-0.5 text-[9px] sm:text-[10px] md:text-[11px] font-medium bg-[#0066FF] text-white rounded">
                  NEW
                </span>
              </>
            ) : (
              item
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

