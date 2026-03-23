'use client'

import type { VerificationMethod } from '@/store/deposit.store'

interface Props {
  verificationMethod: VerificationMethod
  value: string
  onChange: (val: string) => void
}

export default function TextProofInput({ verificationMethod, value, onChange }: Props) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={verificationMethod === 'SMS' ? 5 : 2}
      placeholder={verificationMethod === 'SMS' ? 'Paste full SMS here…' : 'https://…'}
      className="input resize-none font-mono text-xs leading-relaxed"
    />
  )
}
