'use client';

import { useEffect, useRef } from 'react';

interface TableOfContentsProps {
  content?: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const tocRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tocContainer = tocRef.current;
    
    if (!tocContainer) return;

    const generateTOC = () => {
      // Create a temporary div to parse the HTML content
      const tempDiv = document.createElement('div');
      if (content) {
        tempDiv.innerHTML = content;
      }
      
      // Find all headings in the content
      const headings = Array.from(tempDiv.querySelectorAll('h2, h3'));
      if (headings.length === 0) {
        // If no headings in content, try to find headings in the article element
        const contentArea = document.querySelector('article');
        if (contentArea) {
          const articleHeadings = Array.from(contentArea.querySelectorAll('h2, h3'));
          if (articleHeadings.length > 0) {
            generateTOCFromHeadings(articleHeadings, tocContainer);
            return;
          }
        }
        
        // If still no headings, hide the TOC
        tocContainer.innerHTML = '<p class="text-sm text-gray-500">No sections found in this article.</p>';
        return;
      }
      
      generateTOCFromHeadings(headings, tocContainer);
    };

    const generateTOCFromHeadings = (headings: Element[], tocContainer: HTMLDivElement) => {
      const mainList = document.createElement('ul');
      mainList.className = 'flex flex-col w-full';

      headings.forEach((heading) => {
        const level = parseInt(heading.tagName.substring(1), 10) - 1;
        const id = heading.id || `section-${Math.random().toString(36).substr(2, 9)}`;
        heading.id = id;
        const text = heading.textContent || '';

        const li = document.createElement('li');
        li.className = 'relative group w-full';

        const a = document.createElement('a');
        a.href = `#${id}`;
        a.className = level === 1
          ? 'flex items-center text-[15px] text-gray-600 hover:text-[#6366F1] transition-colors py-2 relative block w-full break-words'
          : 'flex items-center text-[15px] text-gray-500 hover:text-[#6366F1] transition-colors pl-4 py-2 relative block w-full break-words';

        const activeBg = document.createElement('div');
        activeBg.className = 'absolute inset-0 bg-[#6366F1]/5 opacity-0 transition-opacity';
        a.appendChild(activeBg);

        const textSpan = document.createElement('span');
        textSpan.className = 'relative z-10 w-full';
        textSpan.textContent = text;
        a.appendChild(textSpan);

        li.appendChild(a);
        mainList.appendChild(li);
      });

      tocContainer.innerHTML = '';
      tocContainer.appendChild(mainList);

      // Add click event listener for smooth scrolling
      mainList.addEventListener('click', (event) => {
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

              const allLinks = mainList.querySelectorAll('a');
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

      // Set up intersection observer for scroll spy
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            const link = mainList.querySelector(`a[href="#${id}"]`);
            if (link) {
              const allLinks = mainList.querySelectorAll('a');
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

      // Observe all headings in the actual DOM
      const articleHeadings = Array.from(document.querySelectorAll('h2, h3'));
      articleHeadings.forEach(heading => observer.observe(heading));
    };

    generateTOC();

    // Set up mutation observer to regenerate TOC if content changes
    const contentArea = document.querySelector('article');
    if (contentArea) {
      const observer = new MutationObserver(generateTOC);
      observer.observe(contentArea, {
        childList: true,
        subtree: true,
        characterData: true
      });
      
      return () => observer.disconnect();
    }
  }, [content]);

  return (
    <div className="relative">
      <h2 className="flex items-center gap-2 font-semibold text-base lg:text-lg mb-4 lg:mb-6 text-zinc-900">
        <span className="text-indigo-500">✦</span> Table of Contents
      </h2>
      
      <div 
        ref={tocRef} 
        className="relative w-full max-h-[calc(100vh-24rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300" 
      />
    </div>
  );
} 