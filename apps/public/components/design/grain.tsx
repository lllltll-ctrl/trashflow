export function Grain({ opacity = 0.2, className = '' }: { opacity?: number; className?: string }) {
  return <div aria-hidden className={`tf-grain ${className}`} style={{ opacity }} />;
}
