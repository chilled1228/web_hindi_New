export function TabNavigation() {
  return (
    <div className="flex justify-center mb-4 md:mb-8 lg:mb-16">
      <div className="inline-flex flex-wrap p-1 rounded-full bg-[#f5f5f5] max-w-full overflow-x-auto no-scrollbar">
        {[
          'Image',
          'Video',
          'Audio',
          'Language Models',
          ['3D Objects', true]
        ].map((item, i) => (
          <button
            key={Array.isArray(item) ? item[0].toString() : item}
            className={`
              px-2 py-1 text-[11px] sm:text-[12px] md:px-4 md:py-2 md:text-[14px] font-medium rounded-full 
              flex items-center gap-1 sm:gap-1.5 transition-colors shrink-0
              ${i === 0 ? 'bg-white shadow-sm' : 'text-[#666666] hover:text-black'}
              whitespace-nowrap
            `}
          >
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

