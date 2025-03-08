'use client';

import { useEffect } from 'react';

interface Shortcut {
  key: string;
  handler: (e: KeyboardEvent) => void;
}

interface KeyboardShortcutsProps {
  shortcuts: Shortcut[];
}

export function KeyboardShortcuts({ shortcuts }: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlPressed = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      shortcuts.forEach((shortcut) => {
        const [modifier, shortcutKey] = shortcut.key.split('+');
        
        if (
          (modifier === 'ctrl' && isCtrlPressed && key === shortcutKey) ||
          (shortcut.key === key)
        ) {
          shortcut.handler(e);
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);

  // This component doesn't render anything
  return null;
} 