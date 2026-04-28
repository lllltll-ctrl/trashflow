import { notFound } from 'next/navigation';
import { clientEnv } from '@/lib/env';
import { PageHead } from '@/components/design/page-head';
import { MyBinClient, type HouseholdInfo } from '@/components/my-bin-client';

export const metadata = { title: 'Мій бак · TrashFlow' };
export const dynamic = 'force-dynamic';

async function fetchHousehold(token: string): Promise<HouseholdInfo | null> {
  const url = `${clientEnv.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/claim_household_by_qr`;
  const key = clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ p_qr_token: token }),
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const rows = (await res.json()) as Array<Record<string, unknown>>;
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id as string,
    qrToken: row.qr_token as string,
    address: row.address as string,
    pricingTier: row.pricing_tier as 'standard' | 'sorted' | 'unscanned',
    lat: row.lat as number,
    lng: row.lng as number,
    hasOwner: Boolean(row.has_owner),
  };
}

export default async function MyBinPage({ params }: { params: { qr: string } }) {
  const household = await fetchHousehold(params.qr);
  if (!household) notFound();

  return (
    <>
      <PageHead title="Мій бак" backHref="/" />
      <div className="flex-1 overflow-y-auto px-5 pb-[120px]">
        <MyBinClient household={household} />
      </div>
    </>
  );
}
