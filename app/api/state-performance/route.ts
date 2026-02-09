import fs from "fs";
import path from "path";
import Papa from "papaparse";

interface OrderRow {
  order_id: string;
  customer_id: string;
  order_status: string;
  order_purchase_timestamp: string;
  order_approved_at: string;
  order_delivered_carrier_date: string;
  order_delivered_customer_date: string;
  order_estimated_delivery_date: string;
}

interface CustomerRow {
  customer_id: string;
  customer_state: string;
}

export async function GET() {
  try {
    const ordersPath = path.join(process.cwd(), "data/olist_orders_dataset.csv");
    const customersPath = path.join(process.cwd(), "data/olist_customers_dataset.csv");

    const ordersContent = fs.readFileSync(ordersPath, "utf8");
    const customersContent = fs.readFileSync(customersPath, "utf8");

    // Parse orders
    const ordersParsed = Papa.parse<OrderRow>(ordersContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    // Parse customers
    const customersParsed = Papa.parse<CustomerRow>(customersContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    // Create customer state lookup
    const customerStateMap = new Map<string, string>();
    customersParsed.data.forEach((customer) => {
      customerStateMap.set(customer.customer_id, customer.customer_state);
    });

    // Aggregate by state
    const stateStats = new Map<string, {
      total: number;
      deliveredOnTime: number;
      deliveredLate: number;
      canceled: number;
      totalDelayDays: number;
      delayedCount: number;
    }>();

    ordersParsed.data.forEach((order) => {
      const state = customerStateMap.get(order.customer_id);
      if (!state) return;

      if (!stateStats.has(state)) {
        stateStats.set(state, {
          total: 0,
          deliveredOnTime: 0,
          deliveredLate: 0,
          canceled: 0,
          totalDelayDays: 0,
          delayedCount: 0,
        });
      }

      const stats = stateStats.get(state)!;
      stats.total++;

      if (order.order_status === 'delivered') {
        const deliveredDate = new Date(order.order_delivered_customer_date);
        const estimatedDate = new Date(order.order_estimated_delivery_date);

        if (deliveredDate <= estimatedDate) {
          stats.deliveredOnTime++;
        } else {
          stats.deliveredLate++;
          // Calculate delay in days
          const delayDays = Math.floor(
            (deliveredDate.getTime() - estimatedDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          stats.totalDelayDays += delayDays;
          stats.delayedCount++;
        }
      } else if (order.order_status === 'canceled') {
        stats.canceled++;
      }
    });

    // Convert to result array
    const result = Array.from(stateStats.entries())
      .map(([state, stats]) => ({
        state,
        totalOrders: stats.total,
        deliveredOnTime: stats.deliveredOnTime,
        deliveredLate: stats.deliveredLate,
        canceled: stats.canceled,
        avgDelayDays: stats.delayedCount > 0
          ? Math.round((stats.totalDelayDays / stats.delayedCount) * 10) / 10
          : 0,
      }))
      .sort((a, b) => b.totalOrders - a.totalOrders)
      .slice(0, 15); // Top 15 states

    return Response.json(result);
  } catch (error) {
    console.error('Error processing state performance:', error);
    return Response.json(
      { error: 'Failed to process state performance data', details: (error as Error).message },
      { status: 500 }
    );
  }
}
