'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, ImageIcon } from 'lucide-react'

export function ImageUploadSection() {
  const [preview, setPreview] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  })

  return (
    <div className="max-w-[1400px] mx-auto px-6 mb-16">
      <div className="grid lg:grid-cols-[2fr,1fr] gap-8">
        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`
            relative flex flex-col items-center justify-center
            min-h-[400px] p-8 rounded-3xl border-2 border-dashed
            transition-colors cursor-pointer
            ${isDragActive 
              ? 'border-[#0066FF] bg-[#0066FF]/5' 
              : 'border-[#eaeaea] hover:border-[#0066FF] hover:bg-[#fafafa]'
            }
          `}
        >
          <input {...getInputProps()} />
          
          {preview ? (
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-[360px] rounded-2xl object-contain"
            />
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 mb-6 rounded-full bg-[#fafafa] flex items-center justify-center">
                <Upload className="w-8 h-8 text-[#666666]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Drop your image here
              </h3>
              <p className="text-[#666666] mb-6">
                or click to browse from your computer
              </p>
              <div className="flex items-center gap-2 text-[14px] text-[#666666]">
                <ImageIcon className="w-4 h-4" />
                Supports JPG, PNG and WEBP
              </div>
            </div>
          )}
        </div>

        {/* Generate Prompt Section */}
        <div className="bg-[#fafafa] rounded-3xl p-8">
          <h3 className="text-xl font-semibold mb-4">
            Generate Image Description
          </h3>
          <p className="text-[#666666] mb-6">
            Upload an image and our AI will generate a detailed description that you can use as a prompt.
          </p>
          <button 
            className="w-full px-4 py-3 text-[14px] font-medium text-white bg-black rounded-lg hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!preview}
          >
            Generate Prompt
          </button>
        </div>
      </div>
    </div>
  )
}

