'use client';

import { useParams } from 'next/navigation';
import OrdersPage from '@/app/orders/page';

export default function OrderByIdPage() {
  useParams<{ id: string }>();

  return <OrdersPage />;
}
