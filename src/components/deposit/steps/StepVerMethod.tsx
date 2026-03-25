"use client";

import { useDepositStore, VerificationMethod } from "@/store/deposit.store";
import { Link2, Image, MessageSquare, ChevronDown } from "lucide-react";
import clsx from "clsx";

function SmsBubble({ senderName, text }: { senderName: string; text: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);

  return (
    <div className="rounded-xl overflow-hidden border border-zinc-700/50 bg-zinc-950">
      {/* Phone-style header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-3 py-2 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300 shrink-0">
          {senderName.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="text-[11px] font-semibold text-white leading-none">
            {senderName}
          </p>
          <p className="text-[9px] text-zinc-500 mt-0.5">
            SMS · Example message
          </p>
        </div>
      </div>

      {/* Bubble */}
      <div className="p-3 bg-zinc-950">
        <div className="flex items-end gap-2">
          <div className="relative max-w-[92%] bg-zinc-800 rounded-2xl rounded-bl-sm px-3 py-2.5">
            <p className="text-[11px] text-zinc-200 leading-relaxed break-words whitespace-pre-wrap font-mono">
              {parts.map((part, i) =>
                part.match(/^https?:\/\//) ? (
                  <span
                    key={i}
                    className="text-blue-400 underline underline-offset-2 break-all"
                  >
                    {part}
                  </span>
                ) : (
                  <span key={i}>{part}</span>
                ),
              )}
            </p>
            {/* Tail */}
            <span
              className="absolute -bottom-[1px] -left-[5px] w-3 h-3 bg-zinc-800"
              style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
            />
          </div>
        </div>
        <p className="text-[9px] text-zinc-500 mt-2 ml-1">
          Copy the <span className="text-zinc-300">full message</span> exactly
          as shown and paste it in the next step.
        </p>
      </div>
    </div>
  );
}

// ── Link preview ──────────────────────────────────────────────────────────────
function LinkPreview({ url }: { url: string }) {
  const splitIdx = url.indexOf("?");
  const base = splitIdx !== -1 ? url.slice(0, splitIdx) : url;
  const query = splitIdx !== -1 ? url.slice(splitIdx) : "";

  return (
    <div className="rounded-xl overflow-hidden border border-zinc-700/50 bg-zinc-950">
      {/* Fake browser bar */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-3 py-2 flex items-center gap-2">
        <div className="flex gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-red-500/70" />
          <span className="w-2 h-2 rounded-full bg-yellow-500/70" />
          <span className="w-2 h-2 rounded-full bg-green-500/70" />
        </div>
        <div className="flex-1 mx-2 bg-zinc-800 rounded px-2 py-0.5 flex items-center gap-1.5 min-w-0">
          <span className="text-[9px] text-green-400 shrink-0">🔒</span>
          <span className="text-[10px] text-zinc-400 font-mono truncate">
            {base}
          </span>
        </div>
      </div>

      {/* URL body */}
      <div className="p-3 space-y-2">
        <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-medium">
          Example transaction link
        </p>
        <div className="bg-zinc-900 rounded-lg px-3 py-2.5 border border-zinc-800">
          <span className="font-mono text-[11px] break-all leading-relaxed">
            <span className="text-zinc-400">{base}</span>
            <span className="text-blue-400">{query}</span>
          </span>
        </div>
        <p className="text-[9px] text-zinc-500">
          Open your bank app → Transaction History → tap the transfer → copy the
          share link and paste it in the next step.
        </p>
      </div>
    </div>
  );
}

// ── Methods config ────────────────────────────────────────────────────────────
const METHODS: {
  key: VerificationMethod;
  label: string;
  badge: string;
  icon: React.ElementType;
  badgeColor: string;
}[] = [
  {
    key: "LINK",
    label: "Transaction Link",
    badge: "Fastest",
    icon: Link2,
    badgeColor: "bg-blue-500/10 text-blue-400",
  },
  {
    key: "SCREENSHOT",
    label: "Screenshot",
    badge: "Easy",
    icon: Image,
    badgeColor: "bg-emerald-500/10 text-emerald-400",
  },
  {
    key: "SMS",
    label: "Forward SMS",
    badge: "Reliable",
    icon: MessageSquare,
    badgeColor: "bg-violet-500/10 text-violet-400",
  },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function StepVerMethod() {
  const { verificationMethod, paymentMethod, setVerificationMethod, setStep } =
    useDepositStore();

  function select(key: VerificationMethod) {
    setVerificationMethod(verificationMethod === key ? (null as any) : key);
  }

  const demoSms = paymentMethod ? DEMO_SMS[paymentMethod] : null;
  const demoLink = paymentMethod ? DEMO_LINK[paymentMethod] : null;
  const demoPhoto = paymentMethod ? DEMO_PHOTOS[paymentMethod] : null;
  const senderName = paymentMethod ? BANK_SENDER[paymentMethod] : "Bank";

  return (
    <div className="space-y-4 stagger">
      <div>
        <h2 className="text-lg font-semibold text-white">
          Verification Method
        </h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          How would you like to prove the transfer?
        </p>
      </div>

      <div className="space-y-2">
        {METHODS.map(({ key, label, badge, icon: Icon, badgeColor }) => {
          const isOpen = verificationMethod === key;

          return (
            <div
              key={key}
              className={clsx(
                "card-sm overflow-hidden transition-all duration-200",
                isOpen ? "border-blue-500" : "hover:border-zinc-600",
              )}
            >
              {/* ── Row ── */}
              <button
                onClick={() => select(key)}
                className="w-full p-4 flex items-center gap-4 text-left"
              >
                <div
                  className={clsx(
                    "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                    isOpen
                      ? "bg-blue-500 text-white"
                      : "bg-zinc-800 text-zinc-400",
                  )}
                >
                  <Icon size={16} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {label}
                    </span>
                    <span
                      className={clsx(
                        "text-[10px] px-1.5 py-0.5 rounded font-medium",
                        badgeColor,
                      )}
                    >
                      {badge}
                    </span>
                  </div>
                </div>

                <ChevronDown
                  size={15}
                  className={clsx(
                    "text-zinc-500 transition-transform duration-200 shrink-0",
                    isOpen && "rotate-180 text-blue-400",
                  )}
                />
              </button>

              {/* ── Helper panel ── */}
              {isOpen && (
                <div className="border-t border-zinc-800 animate-fade-in px-4 pb-4 pt-3 space-y-3">
                  {key === "LINK" && demoLink && <LinkPreview url={demoLink} />}

                  {key === "SCREENSHOT" && demoPhoto && (
                    <div className="rounded-xl overflow-hidden border border-zinc-800">
                      <img
                        src={demoPhoto}
                        alt="Screenshot example"
                        className="w-full object-contain max-h-60"
                      />
                      <div className="px-3 py-2 bg-zinc-900 border-t border-zinc-800">
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          Make sure{" "}
                          <span className="text-white font-medium">
                            amount, date, recipient
                          </span>{" "}
                          and{" "}
                          <span className="text-white font-medium">
                            transaction ID
                          </span>{" "}
                          are fully visible and not cropped.
                        </p>
                      </div>
                    </div>
                  )}

                  {key === "SMS" && demoSms && (
                    <SmsBubble senderName={senderName} text={demoSms} />
                  )}

                  <button
                    onClick={() => setStep(4)}
                    className="btn-primary w-full"
                  >
                    Use {label} →
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
// ── Per-bank demo SMS text ────────────────────────────────────────────────────
const DEMO_SMS: Record<string, string> = {
  CBE: `Dear Mr, You have transfered ETB 1.00 to Ephrem Mesfin on 24/03/2026 at 14:55:21 from your account 1*********8625. Your account has been debited with a S.charge of ETB 0.00 and VAT(15%) of ETB0.00 and Disaster Fund (5%) of ETB0.00, with a total of ETB 1.00. Your Current Balance is ETB 612.64. Thank you for Banking with CBE! https://apps.cbe.com.et:100/?id=FT26083LN1YR80798625 For feedback click the link https://forms.gle/R1s9nkJ6qZVCxRVu9`,

  TELEBIRR: `Dear Ephrem You have transferred ETB 1.00 to CHALTU HIRPHASA (2519****7857) on 24/03/2026 20:59:48. Your transaction number is DCK82EGB8C. Your current E-Money Account balance is ETB 0.00. https://transactioninfo.ethiotelecom.et/receipt/DCK82EGB8C Thank you for using telebirr  Ethio telecom`,

  EBIRR: `[-EBIRR-KAAFI-] Dear Ephrem, You have successfully transferred ETB1.00 to Chaltu Hirphasa on 24/03/2026 at 15:02:11. Transfer-Id: 2034819274651. Charges: ETB0.00 with VAT: ETB0.00. Your current balance is ETB 0.00. https://transactioninfo.ebirr.com/kaafimf-Ebirr/receipt/2034819274651`,

  ABYSSINIA: `Dear Customer, ETB 1.00 has been debited from your account and transferred to Ephrem Mesfin on 24/03/2026 at 14:58:00. Transaction Ref FT26083J258M. Your current balance is ETB 1,204.50. Thank you for banking with Bank of Abyssinia. https://cs.bankofabyssinia.com/slip/?trx=FT26083J258M`,

  NIB: `Dear Customer, Your account has been debited with ETB 1.00 on 24/03/2026 at 15:01:44. Beneficiary: Ephrem Mesfin. Reference: NIB2026083001234. Available Balance: ETB 8,540.00. Thank you for choosing NIB International Bank.`,
};

// ── Per-bank demo link ────────────────────────────────────────────────────────
const DEMO_LINK: Record<string, string> = {
  CBE: "https://apps.cbe.com.et:100/?id=FT26083LN1YR80798625",
  TELEBIRR: "https://transactioninfo.ethiotelecom.et/receipt/DCK82EGB8C",
  EBIRR:
    "https://transactioninfo.ebirr.com/kaafimf-Ebirr/receipt/2034819274651",
  ABYSSINIA: "https://cs.bankofabyssinia.com/slip/?trx=FT26083J258M",
  NIB: "https://nibbank.et/transaction/NIB2026083001234",
};

// ── Demo photo (screenshot method only) ──────────────────────────────────────
const DEMO_PHOTOS: Record<string, string> = {
  CBE: "https://res.cloudinary.com/dv5ngz0tc/image/upload/photo_2026-03-20_10-10-21_nuzzcb.jpg",
  TELEBIRR:
    "https://res.cloudinary.com/dv5ngz0tc/image/upload/photo_2026-03-20_10-10-21_nuzzcb.jpg",
  EBIRR:
    "https://res.cloudinary.com/dv5ngz0tc/image/upload/photo_2026-03-20_10-10-21_nuzzcb.jpg",
  ABYSSINIA:
    "https://res.cloudinary.com/dv5ngz0tc/image/upload/photo_2026-03-20_10-10-21_nuzzcb.jpg",
  NIB: "https://res.cloudinary.com/dv5ngz0tc/image/upload/photo_2026-03-20_10-10-21_nuzzcb.jpg",
};

const BANK_SENDER: Record<string, string> = {
  CBE: "CBE",
  TELEBIRR: "Telebirr",
  EBIRR: "eBirr",
  ABYSSINIA: "Bank of Abyssinia",
  NIB: "NIB Bank",
};
