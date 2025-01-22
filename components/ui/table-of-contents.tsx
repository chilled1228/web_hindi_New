'use client';

import { useEffect, useRef } from 'react';

interface TableOfContentsProps {
  contentRef: React.RefObject<HTMLDivElement>;
  defaultOpen?: boolean;
  excludeHeadings?: string[];
}

export function TableOfContents({
  contentRef,
  defaultOpen = false,
  excludeHeadings = [],
}: TableOfContentsProps) {
  const tocRef = useRef<HTMLDivElement>(null);
  const isOpen = useRef(defaultOpen);

  useEffect(() => {
    if (!contentRef.current || !tocRef.current) return;

    const generateTOC = () => {
      const contentArea = contentRef.current;
      const tocContainer = tocRef.current;
      
      if (!contentArea || !tocContainer) return;

      // Find the first h2 element
      const firstH2 = contentArea.querySelector('h2');
      if (!firstH2) return;

      // Create TOC container
      const toc = document.createElement('div');
      toc.className = 'p-6 w-full';

      // Create header with title
      const header = document.createElement('div');
      header.className = 'flex items-center gap-2 mb-6';
      
      const indicator = document.createElement('span');
      indicator.className = 'text-pink-500 dark:text-pink-400 text-2xl flex-shrink-0';
      indicator.textContent = '♦';
      header.appendChild(indicator);

      const title = document.createElement('h2');
      title.className = 'text-lg font-semibold text-gray-900 dark:text-white';
      title.textContent = 'Table of Contents';
      header.appendChild(title);
      
      toc.appendChild(header);

      // Create TOC list wrapper
      const tocListWrapper = document.createElement('div');
      tocListWrapper.id = 'toc-list';
      tocListWrapper.className = 'relative w-full';

      // Create main list
      const mainList = document.createElement('ul');
      mainList.className = 'flex flex-col w-full';

      // Create vertical line container
      const lineContainer = document.createElement('div');
      lineContainer.className = 'absolute left-0 top-0 bottom-0 w-[3px] bg-[#6366F1]';
      tocListWrapper.appendChild(lineContainer);

      // Only get h2 and h3 headings that come after the first h2
      const headings = Array.from(contentArea.querySelectorAll('h2, h3'))
        .filter(heading => {
          const rect = heading.getBoundingClientRect();
          const firstH2Rect = firstH2.getBoundingClientRect();
          return rect.top >= firstH2Rect.top;
        });

      headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.substring(1), 10) - 1; // Normalize so h2 is level 1
        const id = heading.id || `section-${Math.random().toString(36).substr(2, 9)}`;
        heading.id = id;
        const text = heading.textContent || '';

        const li = document.createElement('li');
        li.className = 'relative group w-full';

        const a = document.createElement('a');
        a.href = `#${id}`;
        a.className = level === 1
          ? 'flex items-center text-[15px] text-gray-600 hover:text-[#6366F1] transition-colors pl-6 py-2 relative block w-full break-words pr-4'
          : 'flex items-center text-[15px] text-gray-500 hover:text-[#6366F1] transition-colors pl-10 py-2 relative block w-full break-words pr-4';

        // Create active background element
        const activeBg = document.createElement('div');
        activeBg.className = 'absolute inset-0 bg-[#6366F1]/5 opacity-0 transition-opacity';
        a.appendChild(activeBg);

        // Create text container
        const textSpan = document.createElement('span');
        textSpan.className = 'relative z-10 w-full';
        textSpan.textContent = text;
        a.appendChild(textSpan);

        li.appendChild(a);
        mainList.appendChild(li);
      });

      tocListWrapper.appendChild(mainList);
      toc.appendChild(tocListWrapper);

      // Clear previous TOC and append new one
      tocContainer.innerHTML = '';
      tocContainer.appendChild(toc);

      // Add smooth scrolling
      tocListWrapper.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        const link = target.closest('a');
        if (link) {
          event.preventDefault();
          const targetId = link.getAttribute('href')?.substring(1);
          if (targetId) {
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
              window.scrollTo({
                top: targetElement.offsetTop - 100,
                behavior: 'smooth'
              });

              // Update active state
              const allLinks = tocListWrapper.querySelectorAll('a');
              allLinks.forEach(l => {
                const bg = l.querySelector('div');
                if (bg) bg.classList.add('opacity-0');
                l.classList.remove('text-[#6366F1]', 'font-medium');
              });
              const bg = link.querySelector('div');
              if (bg) bg.classList.remove('opacity-0');
              link.classList.add('text-[#6366F1]', 'font-medium');
            }
          }
        }
      });

      // Add scroll spy
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            const link = tocListWrapper.querySelector(`a[href="#${id}"]`);
            if (link) {
              const allLinks = tocListWrapper.querySelectorAll('a');
              allLinks.forEach(l => {
                const bg = l.querySelector('div');
                if (bg) bg.classList.add('opacity-0');
                l.classList.remove('text-[#6366F1]', 'font-medium');
              });
              const bg = link.querySelector('div');
              if (bg) bg.classList.remove('opacity-0');
              link.classList.add('text-[#6366F1]', 'font-medium');
            }
          }
        });
      }, {
        rootMargin: '-100px 0px -66%',
        threshold: 0
      });

      headings.forEach(heading => observer.observe(heading));
    };

    // Initial generation
    generateTOC();

    // Re-generate TOC when content changes
    const observer = new MutationObserver(generateTOC);
    observer.observe(contentRef.current, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return () => observer.disconnect();
  }, [contentRef, defaultOpen, excludeHeadings]);

  return (
    <div 
      ref={tocRef} 
      className="toc-container sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto"
    />
  );
} 