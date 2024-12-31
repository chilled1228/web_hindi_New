export function TabNavigation() {
  return (
    <div className="flex justify-center mb-16">
      <div className="inline-flex p-1 rounded-full bg-[#f5f5f5]">
        {[
          'Image',
          'Video',
          'Audio',
          'Language Models',
          ['3D Objects', true]
        ].map((item, i) => (
          <button
            key={Array.isArray(item) ? item[0] : item}
            className={`px-4 py-2 text-[14px] font-medium rounded-full flex items-center gap-1.5 transition-colors
              ${i === 0 ? 'bg-white shadow-sm' : 'text-[#666666] hover:text-black'}`}
          >
            {Array.isArray(item) ? (
              <>
                {item[0]}
                <span className="px-1.5 py-0.5 text-[11px] font-medium bg-[#0066FF] text-white rounded">
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

