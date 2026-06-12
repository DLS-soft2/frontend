import type { DeliveryReceipt as DeliveryReceiptType } from '../../api/receipts';
import { formatDateTime, toTitleCase } from '../../utils/format';
import { Card, CardHeader } from './Card';

interface DeliveryReceiptProps {
  receipt: DeliveryReceiptType;
}

export function DeliveryReceipt({ receipt }: DeliveryReceiptProps) {
  return (
    <Card className="border-green-200 bg-green-50/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <h2 className="text-lg font-semibold text-green-900">Delivery Receipt</h2>
        </div>
      </CardHeader>

      <dl className="grid gap-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500">Order ID</dt>
          <dd className="font-mono font-medium">{receipt.order_id.slice(0, 8)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Delivered at</dt>
          <dd className="font-medium">{formatDateTime(receipt.delivered_at)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Receipt generated at</dt>
          <dd className="font-medium">{formatDateTime(receipt.generated_at)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Status</dt>
          <dd className="font-medium">{toTitleCase(receipt.status)}</dd>
        </div>
      </dl>
    </Card>
  );
}
