'use client';

import { useState } from 'react';
import { MessageCircle, Send, CheckCircle2 } from 'lucide-react';
import { palette } from '@/components/design/tokens';
import { clientEnv } from '@/lib/env';
import { useAuth } from '@/lib/auth-context';

type MsgType = 'question' | 'feedback' | 'other';

const TYPE_OPTIONS: { value: MsgType; label: string; icon: string }[] = [
  { value: 'question', label: 'Питання',  icon: '❓' },
  { value: 'feedback', label: 'Відгук',   icon: '💬' },
  { value: 'other',    label: 'Інше',     icon: '📝' },
];

export function SupportForm() {
  const { session, showSignIn } = useAuth();

  const [type, setType]       = useState<MsgType>('question');
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setLoading(true);
    setError(null);

    const base = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
    const key  = clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Resolve community_id for pryluky
    const commRes = await fetch(
      `${base}/rest/v1/communities?slug=eq.${clientEnv.NEXT_PUBLIC_DEFAULT_COMMUNITY_SLUG}&select=id&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    const [comm] = await commRes.json() as Array<{ id: string }>;

    if (!comm) { setError('Помилка конфігурації'); setLoading(false); return; }

    const res = await fetch(`${base}/rest/v1/support_messages`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        community_id: comm.id,
        name: name.trim(),
        email: email.trim(),
        type,
        message: message.trim(),
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const txt = await res.text();
      setError(`Помилка: ${txt}`);
      return;
    }
    setSent(true);
  }

  if (!session) {
    return (
      <div className="tf-fade-slide flex flex-col items-center gap-5 pt-12 text-center">
        <div
          className="grid size-14 place-items-center rounded-full"
          style={{ background: `${palette.greenLight}15` }}
        >
          <MessageCircle className="size-7" style={{ color: palette.greenLight }} />
        </div>
        <div>
          <div
            className="text-[18px] font-bold tracking-[-0.02em]"
            style={{ color: palette.greenDeep, fontFamily: 'var(--font-display)' }}
          >
            Служба підтримки
          </div>
          <p className="mt-2 text-[13px] leading-snug" style={{ color: 'var(--ink-mute)' }}>
            Увійдіть в акаунт, щоб написати нам повідомлення.
          </p>
        </div>
        <button
          type="button"
          onClick={showSignIn}
          className="rounded-[16px] px-6 py-3.5 text-[15px] font-bold text-white"
          style={{
            background: `linear-gradient(165deg, ${palette.greenLight}, ${palette.greenMid})`,
            boxShadow: `0 6px 16px -6px ${palette.greenLight}88`,
          }}
        >
          Увійти в акаунт
        </button>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="tf-fade-slide flex flex-col items-center gap-5 pt-10 text-center">
        <div
          className="grid size-16 place-items-center rounded-full"
          style={{ background: `${palette.greenLight}15` }}
        >
          <CheckCircle2 className="size-8" style={{ color: palette.greenLight }} />
        </div>
        <div>
          <div
            className="text-[22px] font-bold tracking-[-0.02em]"
            style={{ color: palette.greenDeep, fontFamily: 'var(--font-display)' }}
          >
            Повідомлення надіслано!
          </div>
          <p className="mt-2 text-[13px] leading-snug" style={{ color: 'var(--ink-mute)' }}>
            Ми відповімо на{' '}
            <span className="font-semibold" style={{ color: palette.greenDeep }}>{email}</span>{' '}
            впродовж 1–2 робочих днів.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setSent(false); setMessage(''); setName(''); }}
          className="text-[13px] font-semibold"
          style={{ color: 'var(--ink-mute)' }}
        >
          Надіслати ще одне
        </button>
      </div>
    );
  }

  return (
    <div className="tf-fade-slide flex flex-col gap-5 pt-2">
      {/* Header */}
      <div>
        <div
          className="text-[10.5px] uppercase tracking-[0.2em]"
          style={{ color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}
        >
          Служба підтримки
        </div>
        <div
          className="mt-1.5 text-[26px] font-normal leading-tight tracking-[-0.03em]"
          style={{ color: 'var(--green-deep)', fontFamily: 'var(--font-display)' }}
        >
          Написати нам
        </div>
        <p className="mt-1 text-[13px] leading-[1.5]" style={{ color: 'var(--ink-mute)' }}>
          Задайте питання, залиште відгук або повідомте про проблему. Відповімо на вашу пошту.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Type selector */}
        <div className="flex gap-2">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value)}
              className="flex flex-1 flex-col items-center gap-1 rounded-[16px] border py-3 text-center transition-all"
              style={{
                borderColor: type === opt.value ? palette.greenLight : 'rgba(14,58,35,0.1)',
                background: type === opt.value ? `${palette.greenLight}12` : 'white',
                boxShadow: type === opt.value ? `0 0 0 1.5px ${palette.greenLight}` : undefined,
              }}
            >
              <span className="text-[18px]">{opt.icon}</span>
              <span
                className="text-[11px] font-semibold"
                style={{ color: type === opt.value ? palette.greenDeep : 'var(--ink-mute)' }}
              >
                {opt.label}
              </span>
            </button>
          ))}
        </div>

        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold" style={{ color: 'var(--ink-mute)' }}>
            {"Ваше ім'я"}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Іван Іваненко"
            required
            className="rounded-[14px] border px-4 py-3 text-[14px] outline-none transition-all"
            style={{ borderColor: 'rgba(14,58,35,0.15)', color: palette.greenDeep }}
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold" style={{ color: 'var(--ink-mute)' }}>
            Email для відповіді
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="rounded-[14px] border px-4 py-3 text-[14px] outline-none transition-all"
            style={{ borderColor: 'rgba(14,58,35,0.15)', color: palette.greenDeep }}
          />
        </div>

        {/* Message */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold" style={{ color: 'var(--ink-mute)' }}>
            Повідомлення
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Опишіть ваше питання або проблему…"
            required
            rows={5}
            className="resize-none rounded-[14px] border px-4 py-3 text-[14px] outline-none transition-all"
            style={{ borderColor: 'rgba(14,58,35,0.15)', color: palette.greenDeep, lineHeight: 1.5 }}
          />
        </div>

        {error && (
          <div className="rounded-[12px] bg-red-50 px-4 py-2.5 text-[12.5px] text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !name.trim() || !email.trim() || !message.trim()}
          className="flex w-full items-center justify-between rounded-[18px] px-5 py-4 text-white transition-opacity disabled:opacity-50"
          style={{
            background: `linear-gradient(165deg, ${palette.greenLight} 0%, ${palette.greenMid} 100%)`,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 8px 20px -8px rgba(14,58,35,0.5)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <MessageCircle className="size-[18px]" strokeWidth={2} />
            <span className="text-[15px] font-bold">
              {loading ? 'Надсилаємо…' : 'Надіслати'}
            </span>
          </div>
          <Send className="size-[16px] opacity-70" strokeWidth={2} />
        </button>
      </form>
    </div>
  );
}
