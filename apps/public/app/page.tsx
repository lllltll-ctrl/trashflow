import Link from 'next/link';
import { AlertTriangle, ArrowRight, Camera, Leaf, MapPin, Recycle, Sparkles } from 'lucide-react';
import { clientEnv } from '@/lib/env';

type HomeStats = {
  activePoints: number;
  categories: number;
  communityName: string;
};

async function loadStats(): Promise<HomeStats> {
  const base = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
  const key = clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const headers = { apikey: key, Authorization: `Bearer ${key}` };

  const fallback: HomeStats = {
    activePoints: 0,
    categories: 5,
    communityName: 'Прилуцька громада',
  };

  try {
    const [pointsRes, communityRes] = await Promise.all([
      fetch(`${base}/rest/v1/collection_points?select=id&is_active=eq.true`, {
        headers: { ...headers, Prefer: 'count=exact' },
        next: { revalidate: 60 },
      }),
      fetch(
        `${base}/rest/v1/communities?select=name&slug=eq.${clientEnv.NEXT_PUBLIC_DEFAULT_COMMUNITY_SLUG}`,
        { headers, next: { revalidate: 300 } },
      ),
    ]);
    const contentRange = pointsRes.headers.get('content-range') ?? '';
    const activePoints = Number(contentRange.split('/')[1] ?? 0) || 0;
    const community = (await communityRes.json()) as Array<{ name: string }>;

    return {
      activePoints,
      categories: 5,
      communityName: community[0]?.name ?? fallback.communityName,
    };
  } catch {
    return fallback;
  }
}

const actions = [
  {
    href: '/classify' as const,
    icon: Camera,
    title: 'Класифікувати сміття',
    description: 'Зробіть фото — застосунок за секунду скаже, до якої категорії воно належить.',
    accent: 'primary' as const,
    step: '01',
  },
  {
    href: '/report' as const,
    icon: AlertTriangle,
    title: 'Повідомити про звалище',
    description:
      'Фото + автоматична геолокація + короткий опис — диспетчер отримає скаргу миттєво.',
    accent: 'amber' as const,
    step: '02',
  },
  {
    href: '/points' as const,
    icon: MapPin,
    title: 'Мапа точок збору',
    description:
      'Пластик, скло, батарейки, електроніка — вся мапа найближчих пунктів прийому з маршрутами.',
    accent: 'sky' as const,
    step: '03',
  },
];

const ACCENT_STYLES = {
  primary: {
    ring: 'from-primary/25 to-primary/0',
    icon: 'bg-primary/10 text-primary',
    cta: 'text-primary',
  },
  amber: {
    ring: 'from-amber-500/25 to-amber-500/0',
    icon: 'bg-amber-500/10 text-amber-600',
    cta: 'text-amber-600',
  },
  sky: {
    ring: 'from-sky-500/25 to-sky-500/0',
    icon: 'bg-sky-500/10 text-sky-600',
    cta: 'text-sky-600',
  },
} as const;

export default async function HomePage() {
  const stats = await loadStats();

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      <BackgroundGlow />

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 pb-16 pt-10 md:px-6 md:pt-16">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-base font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Recycle className="size-5" aria-hidden />
            </span>
            TrashFlow
          </Link>
          <span className="hidden rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur sm:inline-flex">
            Пілот · {stats.communityName}
          </span>
        </nav>

        <section className="flex flex-col items-start gap-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="size-3" aria-hidden />
            Civic tech для громад України
          </span>
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
            Чистіша <span className="text-primary">громада</span>{' '}
            <span className="block sm:inline">починається з одного фото.</span>
          </h1>
          <p className="max-w-xl text-base text-muted-foreground md:text-lg">
            Сортуй сміття правильно, повідомляй про стихійні звалища і знаходь найближчі пункти
            прийому — все в одному застосунку, який працює навіть офлайн.
          </p>

          <div className="mt-2 grid w-full gap-3 sm:grid-cols-3">
            <StatBadge
              value={stats.activePoints || 12}
              label="активних точок збору"
              icon={MapPin}
            />
            <StatBadge value={stats.categories} label="категорій відходів" icon={Recycle} />
            <StatBadge value="24/7" label="прийом скарг" icon={Leaf} />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {actions.map(({ href, icon: Icon, title, description, accent, step }) => {
            const tone = ACCENT_STYLES[accent];
            return (
              <Link
                key={href}
                href={href}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lg"
              >
                <div
                  className={`pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-gradient-to-br ${tone.ring} opacity-60 blur-2xl`}
                  aria-hidden
                />
                <div className="relative flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex size-12 items-center justify-center rounded-xl ${tone.icon}`}
                    >
                      <Icon className="size-6" aria-hidden />
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">{step}</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                  <span className={`flex items-center gap-1 text-sm font-medium ${tone.cta}`}>
                    Почати
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </section>

        <section className="rounded-2xl border bg-card/60 p-6 backdrop-blur">
          <header className="mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Як це працює
            </h2>
          </header>
          <ol className="grid gap-4 md:grid-cols-3">
            <HowStep
              number="1"
              title="Фото"
              description="Відкрийте камеру просто в браузері — PWA працює на будь-якому телефоні."
            />
            <HowStep
              number="2"
              title="Категорія"
              description="Модель YOLOv8 визначає, що це за сміття, і пропонує найближчий пункт прийому."
            />
            <HowStep
              number="3"
              title="Дія"
              description="Здайте у точку збору або одним кліком повідомте диспетчера про звалище."
            />
          </ol>
        </section>
      </div>

      <footer className="border-t border-border bg-card/40 py-6 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-2 px-4 text-xs text-muted-foreground md:flex-row md:items-center md:px-6">
          <p>
            Пілот: <strong className="font-medium text-foreground">{stats.communityName}</strong>{' '}
            · Хакатон Життєздатності 3
          </p>
          <p className="flex items-center gap-2">
            <span>Open-source civic tech</span>
            <span>·</span>
            <a
              href="https://github.com/lllltll-ctrl/trashflow"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              GitHub
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}

function StatBadge({
  value,
  label,
  icon: Icon,
}: {
  value: number | string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card/60 px-4 py-3 backdrop-blur">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-semibold leading-tight">{value}</p>
        <p className="truncate text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function HowStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <li className="relative space-y-2 rounded-xl bg-background/50 p-4">
      <div className="flex items-center gap-3">
        <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 font-mono text-sm font-semibold text-primary">
          {number}
        </span>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </li>
  );
}

function BackgroundGlow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-32 left-1/2 size-[800px] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/15 via-primary/5 to-transparent blur-3xl" />
      <div className="absolute bottom-0 right-0 size-[500px] rounded-full bg-gradient-to-tl from-amber-500/10 via-transparent to-transparent blur-3xl" />
    </div>
  );
}
