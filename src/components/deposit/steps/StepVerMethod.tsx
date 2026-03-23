'use client'

import { useDepositStore, VerificationMethod } from '@/store/deposit.store'
import { Link2, Image, MessageSquare, ChevronDown } from 'lucide-react'
import clsx from 'clsx'

const DEMO_PHOTOS: Record<string, Record<string, string>> = {
  CBE:       { SCREENSHOT: 'https://res.cloudinary.com/dv5ngz0tc/image/upload/photo_2026-03-20_10-10-21_nuzzcb.jpg', SMS: 'https://res.cloudinary.com/dv5ngz0tc/image/upload/photo_2026-03-20_10-10-21_nuzzcb.jpg', LINK: 'https://res.cloudinary.com/dv5ngz0tc/image/upload/photo_2026-03-20_10-10-21_nuzzcb.jpg' },
  TELEBIRR:  { SCREENSHOT: 'https://res.cloudinary.com/dv5ngz0tc/image/upload/photo_2026-03-20_10-10-21_nuzzcb.jpg', SMS: 'https://res.cloudinary.com/dv5ngz0tc/image/upload/photo_2026-03-20_10-10-21_nuzzcb.jpg', LINK: 'https://res.cloudinary.com/dv5ngz0tc/image/upload/photo_2026-03-20_10-10-21_nuzzcb.jpg' },
  EBIRR:     { SCREENSHOT: 'https://res.cloudinary.com/dv5ngz0tc/image/upload/photo_2026-03-20_10-10-21_nuzzcb.jpg', SMS: 'https://res.cloudinary.com/dv5ngz0tc/image/upload/photo_2026-03-20_10-10-21_nuzzcb.jpg', LINK: 'https://res.cloudinary.com/dv5ngz0tc/image/upload/photo_2026-03-20_10-10-21_nuzzcb.jpg' },
  ABYSSINIA: { SCREENSHOT: 'https://res.cloudinary.com/dv5ngz0tc/image/upload/photo_2026-03-20_10-10-21_nuzzcb.jpg', SMS: 'https://res.cloudinary.com/dv5ngz0tc/image/upload/photo_2026-03-20_10-10-21_nuzzcb.jpg', LINK: 'https://res.cloudinary.com/dv5ngz0tc/image/upload/photo_2026-03-20_10-10-21_nuzzcb.jpg' },
  NIB:       { SCREENSHOT: 'https://res.cloudinary.com/dv5ngz0tc/image/upload/photo_2026-03-20_10-10-21_nuzzcb.jpg', SMS: 'https://res.cloudinary.com/dv5ngz0tc/image/upload/photo_2026-03-20_10-10-21_nuzzcb.jpg', LINK: 'https://res.cloudinary.com/dv5ngz0tc/image/upload/photo_2026-03-20_10-10-21_nuzzcb.jpg' },
}

const CAPTIONS: Record<VerificationMethod, { title: string; desc: string }> = {
  LINK: {
    title: 'How to get the transaction link',
    desc: 'Open your bank app → Transaction History → tap the transfer → copy the share or detail link and paste it in the next step.',
  },
  SCREENSHOT: {
    title: 'What screenshot to upload',
    desc: 'Take a screenshot of the transaction confirmation screen showing the amount, date, and recipient. Make sure all details are fully visible and not cropped.',
  },
  SMS: {
    title: 'Which SMS to forward',
    desc: 'Copy and paste the exact SMS your bank sent after the transfer. Do not edit or shorten it — include the full message with transaction ID and any links.',
  },
}

const METHODS: {
  key: VerificationMethod
  label: string
  badge: string
  icon: React.ElementType
}[] = [
  { key: 'LINK',       label: 'Transaction Link', badge: 'Fastest',  icon: Link2 },
  { key: 'SCREENSHOT', label: 'Screenshot',        badge: 'Easy',     icon: Image },
  { key: 'SMS',        label: 'Forward SMS',       badge: 'Reliable', icon: MessageSquare },
]

export default function StepVerMethod() {
  const { verificationMethod, paymentMethod, setVerificationMethod, setStep } = useDepositStore()

  function select(key: VerificationMethod) {
    // toggle off if clicking same one
    setVerificationMethod(verificationMethod === key ? null as any : key)
  }

  return (
    <div className="space-y-4 stagger">
      <div>
        <h2 className="text-lg font-semibold text-white">Verification Method</h2>
        <p className="text-sm text-zinc-500 mt-0.5">How would you like to prove the transfer?</p>
      </div>

      <div className="space-y-2">
        {METHODS.map(({ key, label, badge, icon: Icon }) => {
          const isOpen = verificationMethod === key
          const photoUrl = paymentMethod ? DEMO_PHOTOS[paymentMethod]?.[key] : null
          const caption = CAPTIONS[key]

          return (
            <div
              key={key}
              className={clsx(
                'card-sm overflow-hidden transition-all duration-200',
                isOpen ? 'border-blue-500' : 'hover:border-zinc-600',
              )}
            >
              {/* ── Method row ── */}
              <button
                onClick={() => select(key)}
                className="w-full p-4 flex items-center gap-4 text-left"
              >
                <div className={clsx(
                  'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                  isOpen ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-400',
                )}>
                  <Icon size={16} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{label}</span>
                    <span className="badge bg-zinc-800 text-zinc-400 text-[10px]">{badge}</span>
                  </div>
                </div>

                <ChevronDown
                  size={15}
                  className={clsx(
                    'text-zinc-500 transition-transform duration-200 shrink-0',
                    isOpen && 'rotate-180 text-blue-400',
                  )}
                />
              </button>

              {/* ── Expandable: photo + description ── */}
              {isOpen && (
                <div className="border-t border-zinc-800 animate-fade-in">
                  {/* Photo */}
                  {photoUrl && (
                    <div className="bg-zinc-950">
                      <img
                        src={photoUrl}
                        alt={`${key} example`}
                        className="w-full object-contain max-h-56"
                      />
                    </div>
                  )}

                  {/* Description */}
                  <div className="px-4 py-3 bg-zinc-900/60 space-y-1">
                    <p className="text-xs font-semibold text-white">{caption.title}</p>
                    <p className="text-xs text-zinc-400 leading-relaxed">{caption.desc}</p>
                  </div>

                  {/* Select button */}
                  <div className="px-4 pb-4 pt-2">
                    <button
                      onClick={() => setStep(4)}
                      className="btn-primary w-full"
                    >
                      Use {label} →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}