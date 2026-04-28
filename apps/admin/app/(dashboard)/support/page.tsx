import 'server-only';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Підтримка · TrashFlow Admin' };
export const dynamic = 'force-dynamic';

// ── types ──────────────────────────────────────────────────────────────────────

type MessageType = 'question' | 'feedback' | 'other';
type MessageStatus = 'new' | 'read' | 'replied';

interface SupportMessage {
  id: string;
  community_id: string | null;
  name: string | null;
  email: string | null;
  type: MessageType;
  message: string;
  status: MessageStatus;
  reply: string | null;
  replied_at: string | null;
  created_at: string;
}

// ── helpers ───────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<MessageType, string> = {
  question: 'Питання',
  feedback: 'Відгук',
  other: 'Інше',
};

const STATUS_CONFIG: Record<
  MessageStatus,
  { label: string; className: string }
> = {
  new: {
    label: 'Нове',
    className:
      'inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700',
  },
  read: {
    label: 'Прочитано',
    className:
      'inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700',
  },
  replied: {
    label: 'Відповідь надіслана',
    className:
      'inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700',
  },
};

const kyivFormatter = new Intl.DateTimeFormat('uk-UA', {
  timeZone: 'Europe/Kyiv',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

function formatDate(iso: string): string {
  return kyivFormatter.format(new Date(iso));
}

// ── data fetch ────────────────────────────────────────────────────────────────

async function listSupportMessages(): Promise<SupportMessage[]> {
  const client = createClient();
  const { data, error } = await client
    .from('support_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as SupportMessage[];
}

// ── page ──────────────────────────────────────────────────────────────────────

export default async function SupportPage() {
  const messages = await listSupportMessages();
  const newCount = messages.filter((m) => m.status === 'new').length;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Підтримка</h1>
          <p className="text-sm text-muted-foreground">
            Повідомлення від мешканців: питання, відгуки та звернення. Відповідати можна
            безпосередньо на email відправника.
          </p>
        </div>
        {newCount > 0 && (
          <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
            Нових: {newCount}
          </span>
        )}
      </header>

      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Час</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{"Ім'я"}</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Тип</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                    Повідомлення
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                    Статус
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {messages.map((msg) => (
                  <MessageRow key={msg.id} msg={msg} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── sub-components ─────────────────────────────────────────────────────────────

function MessageRow({ msg }: { msg: SupportMessage }) {
  const statusCfg = STATUS_CONFIG[msg.status] ?? STATUS_CONFIG.new;
  const typeLabel = TYPE_LABELS[msg.type] ?? msg.type;

  return (
    <tr className="transition-colors hover:bg-muted/30">
      <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted-foreground">
        {formatDate(msg.created_at)}
      </td>
      <td className="px-4 py-3 font-medium">
        {msg.name?.trim() || <span className="italic text-muted-foreground">—</span>}
      </td>
      <td className="px-4 py-3">
        {msg.email?.trim() ? (
          <a
            href={`mailto:${msg.email}`}
            className="text-primary underline-offset-4 hover:underline"
          >
            {msg.email}
          </a>
        ) : (
          <span className="italic text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
          {typeLabel}
        </span>
      </td>
      <td className="max-w-sm px-4 py-3">
        <p className="line-clamp-3 whitespace-pre-wrap">{msg.message}</p>
      </td>
      <td className="px-4 py-3">
        <span className={statusCfg.className}>{statusCfg.label}</span>
      </td>
    </tr>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border bg-card px-8 py-16 text-center">
      <p className="text-lg font-semibold">Звернень ще немає</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {"Коли мешканці надішлють питання або відгуки через застосунок, вони з’являться тут. Форма зворотного зв’язку доступна в публічному PWA у розділі «Контакти»."}

      </p>
    </div>
  );
}
