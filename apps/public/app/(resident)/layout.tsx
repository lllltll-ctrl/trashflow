/**
 * Resident chrome — cream canvas + phone-frame on desktop. Tab bar is gone:
 * navigation now happens through the home page tile grid + the back button
 * on every PageHead. Less dock-style noise on the screenshots, more space
 * for actual content (which on small phones the tab bar was eating).
 */
export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen justify-center"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 10% -10%, rgba(111, 211, 154, 0.18), transparent 60%),
          radial-gradient(ellipse 80% 50% at 110% 110%, rgba(255, 210, 63, 0.10), transparent 55%),
          var(--cream)
        `,
      }}
    >
      <div
        className="relative flex w-full max-w-[460px] flex-col overflow-hidden md:my-10 md:min-h-[860px] md:rounded-[44px] md:border md:border-[rgba(14,58,35,0.08)]"
        style={{
          background: 'var(--cream)',
          boxShadow:
            'var(--tf-shadow-lg), inset 0 1px 0 rgba(255,255,255,0.7)',
        }}
      >
        <main className="tf-fade-slide flex flex-1 flex-col pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
