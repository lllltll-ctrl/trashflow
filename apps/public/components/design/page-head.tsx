'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  backHref?: string;
  right?: ReactNode;
};

/**
 * Inner-page header: compact back button + serif title. Falls back to
 * router.back() when no explicit href is supplied, so deep-linked users land
 * on home rather than on a dead-end stack.
 */
export function PageHead({ title, backHref = '/', right }: Props) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-3 md:px-6">
      <div className="flex items-center gap-3">
        {backHref ? (
          <Link
            href={backHref}
            aria-label="Назад"
            className="grid size-10 place-items-center rounded-[14px] bg-[rgba(14,58,35,0.06)] text-[color:var(--green-deep)] transition-colors hover:bg-[rgba(14,58,35,0.12)]"
          >
            <ArrowLeft className="size-[18px]" strokeWidth={2} />
          </Link>
        ) : (
          <button
            type="button"
            aria-label="Назад"
            onClick={() => router.back()}
            className="grid size-10 place-items-center rounded-[14px] bg-[rgba(14,58,35,0.06)] text-[color:var(--green-deep)] transition-colors hover:bg-[rgba(14,58,35,0.12)]"
          >
            <ArrowLeft className="size-[18px]" strokeWidth={2} />
          </button>
        )}
        <h1
          className="text-[22px] font-medium leading-none tracking-[-0.02em] text-[color:var(--green-deep)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </h1>
      </div>
      {right ? <div>{right}</div> : null}
    </div>
  );
}
