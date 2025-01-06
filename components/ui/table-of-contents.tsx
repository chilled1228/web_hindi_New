'use client';

import { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';

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
      toc.id = 'geekdroid-toc-container';

      // Create toggle button
      const toggleButton = document.createElement('button');
      toggleButton.id = 'toc-toggle';
      toggleButton.innerHTML = `<i class="fa ${isOpen.current ? 'fa-angle-up' : 'fa-angle-down'}"></i>`;
      toc.appendChild(toggleButton);

      // Create title
      const title = document.createElement('p');
      title.className = 'geekdroid-toc-title';
      title.textContent = 'Contents';
      toc.appendChild(title);

      // Create TOC list wrapper
      const tocListWrapper = document.createElement('div');
      tocListWrapper.id = 'toc-list';
      tocListWrapper.style.display = isOpen.current ? 'block' : 'none';

      // Only get h2 and h3 headings that come after the first h2
      const headings = Array.from(contentArea.querySelectorAll('h2, h3'))
        .filter(heading => {
          const rect = heading.getBoundingClientRect();
          const firstH2Rect = firstH2.getBoundingClientRect();
          return rect.top >= firstH2Rect.top;
        });

      let currentLevel = 0;
      let mainIndex = 1;
      let subIndex = 1;
      const indexStack = [0];

      headings.forEach(heading => {
        const level = parseInt(heading.tagName.substring(1), 10) - 1; // Normalize so h2 is level 1
        const id = `section-${mainIndex}`;

        if (excludeHeadings.includes(heading.tagName.toLowerCase())) return;
        
        heading.id = id;
        const text = heading.textContent || '';

        if (currentLevel < level) {
          while (currentLevel < level) {
            const ul = document.createElement('ul');
            const lastUl = tocListWrapper.querySelector('ul:last-child') || tocListWrapper;
            lastUl.appendChild(ul);
            currentLevel++;
            indexStack.push(0);
          }
        } else if (currentLevel > level) {
          while (currentLevel > level) {
            const lastUl = tocListWrapper.querySelector('ul:last-child');
            if (lastUl) lastUl.remove();
            currentLevel--;
            indexStack.pop();
          }
        }

        const li = document.createElement('li');
        li.className = 'geekdroid-toc-entry';

        // Handle numbering
        if (level === 1) { // h2
          li.setAttribute('data-index', mainIndex.toString());
          mainIndex++;
          subIndex = 1;
        } else { // h3
          const parentNumber = indexStack[indexStack.length - 2] + 1;
          li.setAttribute('data-index', `${parentNumber}.${subIndex}`);
          subIndex++;
        }

        const a = document.createElement('a');
        a.href = `#${id}`;
        a.textContent = text;
        li.appendChild(a);

        const currentUl = tocListWrapper.querySelector('ul:last-child') || tocListWrapper;
        currentUl.appendChild(li);

        indexStack[indexStack.length - 1]++;
      });

      toc.appendChild(tocListWrapper);

      // Clear previous TOC and append new one
      tocContainer.innerHTML = '';
      tocContainer.appendChild(toc);

      // Insert TOC before the first h2
      firstH2.parentNode?.insertBefore(tocContainer, firstH2);

      // Add event listeners
      const tocToggle = document.getElementById('toc-toggle');
      const tocList = document.getElementById('toc-list');
      
      if (tocToggle && tocList) {
        tocToggle.addEventListener('click', () => {
          isOpen.current = !isOpen.current;
          tocList.style.display = isOpen.current ? 'block' : 'none';
          const icon = tocToggle.querySelector('i');
          if (icon) {
            icon.className = `fa ${isOpen.current ? 'fa-angle-up' : 'fa-angle-down'}`;
          }
        });
      }

      // Add smooth scrolling
      tocListWrapper.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'A') {
          event.preventDefault();
          const targetId = target.getAttribute('href')?.substring(1);
          if (targetId) {
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
              window.scrollTo({
                top: targetElement.offsetTop - 100,
                behavior: 'smooth'
              });
            }
          }
        }
      });
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

  return <div ref={tocRef} className="toc-container" />;
} 