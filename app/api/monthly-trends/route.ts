import fs from "fs";
import path from "path";
import Papa from "papaparse";

interface OrderRow {
  order_id: string;
  order_status: string;
  order_purchase_timestamp: string;
}

interface OrderItemsRow {
  order_id: string;
  price: number;
}

export async function GET() {
  try {
    const ordersPath = path.join(process.cwd(), "data/olist_orders_dataset.csv");
    const orderItemsPath = path.join(process.cwd(), "data/olist_order_items_dataset.csv");

    const ordersContent = fs.readFileSync(ordersPath, "utf8");
    const orderItemsContent = fs.readFileSync(orderItemsPath, "utf8");

    // Parse orders
    const ordersParsed = Papa.parse<OrderRow>(ordersContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    // Parse order items
    const orderItemsParsed = Papa.parse<OrderItemsRow>(orderItemsContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    // Create order value lookup
    const orderValueMap = new Map<string, number>();
    orderItemsParsed.data.forEach((item) => {
      const currentValue = orderValueMap.get(item.order_id) || 0;
      orderValueMap.set(item.order_id, currentValue + item.price);
    });

    // Aggregate by month
    const monthlyTrends = new Map<string, {
      totalOrders: number;
      delivered: number;
      canceled: number;
      revenue: number;
    }>();

    ordersParsed.data.forEach((order) => {
      const date = new Date(order.order_purchase_timestamp);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyTrends.has(monthKey)) {
        monthlyTrends.set(monthKey, {
          totalOrders: 0,
          delivered: 0,
          canceled: 0,
          revenue: 0,
        });
      }

      const trend = monthlyTrends.get(monthKey)!;
      trend.totalOrders++;
      trend.revenue += orderValueMap.get(order.order_id) || 0;

      if (order.order_status === 'delivered') {
        trend.delivered++;
      } else if (order.order_status === 'canceled') {
        trend.canceled++;
      }
    });

    // Convert to result array and sort
    const result = Array.from(monthlyTrends.entries())
      .map(([monthYear, stats]) => {
        const [year, month] = monthYear.split('-');
        return {
          month: new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short' }),
          year: parseInt(year),
          monthYear,
          totalOrders: stats.totalOrders,
          delivered: stats.delivered,
          canceled: stats.canceled,
          revenue: Math.round(stats.revenue),
        };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        const monthA = new Date(a.monthYear).getMonth();
        const monthB = new Date(b.monthYear).getMonth();
        return monthA - monthB;
      });

    return Response.json(result);
  } catch (error) {
    console.error('Error processing monthly trends:', error);
    return Response.json(
      { error: 'Failed to process monthly trends', details: (error as Error).message },
      { status: 500 }
    );
  }
}
