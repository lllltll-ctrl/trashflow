/**
 * Resident chrome — two modes:
 *
 * Mobile (< lg): cream canvas + phone-frame card centred on screen. Tab bar is
 * gone; navigation happens through the home tile grid and back buttons.
 *
 * Desktop (≥ lg): full-height three-column layout.
 *   Left  (264px sticky)  — DesktopSidebar (dark green)
 *   Centre (flex-1 scroll) — page content with TopBar
 *   Right  (320px sticky)  — DesktopRightPanel (pickup card, leaderboard, activity)
 */
import { DesktopSidebar } from '@/components/desktop-sidebar';
import { DesktopRightPanel } from '@/components/desktop-right-panel';

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* ── Mobile layout (< lg): cream canvas + centred phone-frame card ── */}
      <div
        className="flex min-h-screen justify-center lg:hidden"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 10% -10%, rgba(111, 211, 154, 0.18), transparent 60%),
            radial-gradient(ellipse 80% 50% at 110% 110%, rgba(255, 210, 63, 0.10), transparent 55%),
            var(--cream)
          `,
        }}
      >
        <div
          className={[
            'tf-phone-frame relative flex w-full max-w-[460px] flex-col overflow-hidden',
            'md:my-10 md:min-h-[860px] md:rounded-[44px] md:border md:border-[rgba(14,58,35,0.08)]',
          ].join(' ')}
          style={{ background: 'var(--cream)' }}
        >
          <main className="tf-fade-slide flex flex-1 flex-col pb-6">
            {children}
          </main>
        </div>
      </div>

      {/* ── Desktop layout (≥ lg): three-column full-height shell ────────── */}
      <div className="tf-desktop-shell hidden lg:flex">
        {/* Left: sticky dark-green sidebar */}
        <DesktopSidebar />

        {/* Centre: scrollable main content */}
        <div className="tf-desktop-main tf-fade-slide">
          <main className="flex flex-col pb-8">
            {children}
          </main>
        </div>

        {/* Right: sticky panel (pickup card + leaderboard + activity) */}
        <DesktopRightPanel />
      </div>
    </>
  );
}
