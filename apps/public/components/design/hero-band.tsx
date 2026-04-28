import type { ReactNode } from 'react';
import { Grain } from './grain';

type Props = {
  eyebrow: string;
  titleBefore: string;
  titleEm: string;
  titleAfter?: string;
  sub?: string;
  pale?: boolean;
  right?: ReactNode;
};

/**
 * Top-of-page title band. Dark variant is the signature eco green gradient
 * used on the landing hero; `pale` is a sage-on-cream alternative for
 * inner pages so they don't feel like six home screens stacked.
 */
export function HeroBand({ eyebrow, titleBefore, titleEm, titleAfter = '', sub, pale, right }: Props) {
  const bg = pale
    ? 'linear-gradient(165deg, #E8F5EC 0%, #F4F9F1 100%)'
    : 'linear-gradient(165deg, #1F7A4A 0%, #0E3A23 100%)';

  return (
    <div
      className="relative mx-5 mb-[18px] mt-[6px] overflow-hidden rounded-[28px] px-[22px] py-5 md:mx-6"
      style={{
        background: bg,
        color: pale ? 'var(--green-deep)' : '#fff',
        border: pale ? '1px solid rgba(14,58,35,0.08)' : undefined,
      }}
    >
      <Grain opacity={pale ? 0.12 : 0.2} />
      <div className="relative flex justify-between gap-4">
        <div>
          <div
            className="text-[10.5px] uppercase tracking-[0.24em] opacity-70"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {eyebrow}
          </div>
          <h2
            className="mt-[6px] text-[30px] font-normal leading-[1.05] tracking-[-0.025em]"
            style={{ fontFamily: 'var(--font-display)', textWrap: 'pretty' }}
          >
            {titleBefore}
            <em
              className="font-medium not-italic"
              style={{
                fontStyle: 'italic',
                color: pale ? 'var(--green-light)' : 'var(--yellow)',
              }}
            >
              {titleEm}
            </em>
            {titleAfter}
          </h2>
          {sub ? (
            <p className="mt-2.5 max-w-[320px] text-[13.5px] leading-[1.5] opacity-80">{sub}</p>
          ) : null}
        </div>
        {right ? <div>{right}</div> : null}
      </div>
    </div>
  );
}
