'use client'

import { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  preview: string | null
  fileName: string | null
  onFile: (file: File) => void
  onClear: () => void
}

export default function ScreenshotUpload({ preview, fileName, onFile, onClear }: Props) {
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <>
      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-zinc-700">
          <img src={preview} alt="Preview" className="w-full object-contain max-h-56" />
          <button
            onClick={onClear}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-zinc-900/90 border border-zinc-700 flex items-center justify-center hover:bg-zinc-800 transition-colors"
          >
            <X size={13} className="text-zinc-300" />
          </button>
          <div className="px-3 py-2 bg-zinc-900 border-t border-zinc-800">
            <p className="text-xs text-zinc-400 truncate">{fileName}</p>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            const f = e.dataTransfer.files[0]
            if (f) onFile(f)
          }}
          onClick={() => fileRef.current?.click()}
          className={clsx(
            'border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors duration-150',
            dragOver ? 'border-blue-500 bg-blue-500/5' : 'border-zinc-700 hover:border-zinc-500',
          )}
        >
          <Upload size={22} className="text-zinc-500" />
          <div className="text-center">
            <p className="text-sm text-zinc-300">Drop image here or click to browse</p>
            <p className="text-xs text-zinc-600 mt-1">PNG, JPG up to 10 MB</p>
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
        }}
      />
    </>
  )
}
