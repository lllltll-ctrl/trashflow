import Link from 'next/link';
import { Camera, MapPin, AlertTriangle } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@trashflow/ui';

const actions = [
  {
    href: '/classify',
    icon: Camera,
    title: 'Класифікувати сміття',
    description: 'Зробіть фото — застосунок підкаже категорію і найближчу точку прийому.',
  },
  {
    href: '/report',
    icon: AlertTriangle,
    title: 'Повідомити про звалище',
    description: 'Фото + геолокація автоматично. Диспетчер отримає скаргу миттєво.',
  },
  {
    href: '/points',
    icon: MapPin,
    title: 'Мапа точок збору',
    description: 'Де здати пластик, скло, батарейки та небезпечні відходи.',
  },
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 p-4 pt-8">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">TrashFlow</p>
        <h1 className="text-3xl font-bold leading-tight">
          Громада чистішої Прилуки — у твоїй кишені
        </h1>
        <p className="text-sm text-muted-foreground">
          Сортуй правильно, скаржся швидко, очищай громаду разом.
        </p>
      </header>

      <section className="grid gap-4">
        {actions.map(({ href, icon: Icon, title, description }) => (
          <Link key={href} href={href} className="group">
            <Card className="transition-colors group-hover:border-primary group-focus-visible:border-primary">
              <CardHeader className="flex flex-row items-start gap-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden />
                </div>
                <div className="space-y-1">
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </section>

      <footer className="mt-auto pt-8 text-center text-xs text-muted-foreground">
        Пілот: Прилуцька міська ТГ · Хакатон Життєздатності 3
      </footer>
    </main>
  );
}
