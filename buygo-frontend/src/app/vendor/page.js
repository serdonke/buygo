'use client';

import dynamic from 'next/dynamic';

const VendorMap = dynamic(() => import('../../components/VendorMap'), { ssr: false });

export default function VendorPage() {
  return <VendorMap />;
}
