'use client'

interface Props {
  message: string
}

export default function ErrorBox({ message }: Props) {
  return (
    <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3">
      {message}
    </div>
  )
}
