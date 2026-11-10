'use client';

import { Order } from '@/entities/order/model/types';
import { OrderStatusBadge } from '@/entities/order/ui/OrderStatusBadge';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { FlaskConical } from 'lucide-react';

interface OrdersTableDesktopProps {
  orders: Order[];
  onStartTest: (orderId: string) => void;
  onMarkSample: (orderId: string) => void;
  onCompleteOrder: (orderId: string) => void;
  className?: string;
}

export function OrdersTableDesktop({
  orders,
  onStartTest,
  onMarkSample,
  onCompleteOrder,
  className,
}: OrdersTableDesktopProps) {
  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders found"
        description="No verified and paid orders in the queue"
        icon={<FlaskConical className="h-12 w-12 text-muted-foreground" />}
        className={className}
      />
    );
  }

  const getActionButtons = (order: Order) => {
    switch (order.status) {
      case 'paid':
        return (
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={() => onStartTest(order.id)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Start
            </Button>
            <Button variant="outline" size="sm" onClick={() => onMarkSample(order.id)}>
              Sample
            </Button>
          </div>
        );
      case 'sample_collected':
        return (
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={() => onStartTest(order.id)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Start
            </Button>
          </div>
        );
      case 'processing':
        return (
          <Button
            size="sm"
            onClick={() => onCompleteOrder(order.id)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Complete Order
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`bg-card rounded-lg border border-border ${className}`}>
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">
          Verified & Paid Orders ({orders.length})
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground ">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground ">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground ">
                Test
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground ">
                Time Elapsed
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground ">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground ">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-muted">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                  {order.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {order.patient_name}
                </td>
                <td className="px-6 py-4 text-sm text-foreground">
                  <div className="max-w-xs truncate">
                    {order.tests.map((test) => test.name).join(', ')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {order.time_elapsed}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{getActionButtons(order)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
