export function ContentSection() {
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Left Column */}
      <div className="bg-[#fafafa] rounded-3xl p-10">
        <h2 className="text-[28px] font-semibold mb-4">
          Stable Diffusion 3 Medium.
        </h2>
        <p className="text-[16px] leading-[1.6] text-[#666666] mb-8">
          Is our most advanced text-to-image AI model with two billion parameters, excelling in photorealism, handling complex prompts, generating clear text, and offering unparalleled creative possibilities.
        </p>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-[14px] font-medium text-white bg-black rounded-lg hover:bg-black/90 transition-colors">
            Get Started with API
          </button>
          <button className="px-4 py-2 text-[14px] font-medium text-black border border-[#eaeaea] rounded-lg hover:bg-gray-50 transition-colors">
            Show Info
          </button>
        </div>
      </div>

      {/* Right Column */}
      <div className="grid grid-cols-2 gap-4">
        <img
          src="/placeholder.svg?height=280&width=420"
          alt="Fantasy landscape with houses near water"
          className="w-full aspect-[3/2] rounded-2xl object-cover"
        />
        <img
          src="/placeholder.svg?height=280&width=420"
          alt="Pagoda temple in misty mountains"
          className="w-full aspect-[3/2] rounded-2xl object-cover"
        />
        <img
          src="/placeholder.svg?height=280&width=420"
          alt="Close-up portrait of a tiger"
          className="w-full aspect-[3/2] rounded-2xl object-cover"
        />
        <img
          src="/placeholder.svg?height=280&width=420"
          alt="Portrait of a person with red hair"
          className="w-full aspect-[3/2] rounded-2xl object-cover"
        />
      </div>
    </div>
  )
}

