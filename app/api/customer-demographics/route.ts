import fs from "fs";
import path from "path";
import Papa from "papaparse";

interface CustomerRow {
  customer_id: string;
  customer_state: string;
  customer_city: string;
}

interface OrderRow {
  order_id: string;
  customer_id: string;
}

export async function GET() {
  try {
    const customersPath = path.join(process.cwd(), "data/olist_customers_dataset.csv");
    const ordersPath = path.join(process.cwd(), "data/olist_orders_dataset.csv");

    const [customersContent, ordersContent] = [
      fs.readFileSync(customersPath, "utf8"),
      fs.readFileSync(ordersPath, "utf8"),
    ];

    // Parse customers
    const customersParsed = Papa.parse<CustomerRow>(customersContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    // Parse orders
    const ordersParsed = Papa.parse<OrderRow>(ordersContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    // Create customer set (customers who made orders)
    const activeCustomers = new Set<string>();
    ordersParsed.data.forEach((order) => {
      activeCustomers.add(order.customer_id);
    });

    // Aggregate by state
    const stateStats = new Map<string, { count: number; cities: Set<string> }>();

    customersParsed.data.forEach((customer) => {
      if (!activeCustomers.has(customer.customer_id)) return;

      const state = customer.customer_state;

      if (!stateStats.has(state)) {
        stateStats.set(state, { count: 0, cities: new Set() });
      }

      const stats = stateStats.get(state)!;
      stats.count++;
      stats.cities.add(customer.customer_city);
    });

    // Convert to result array and sort
    const result = Array.from(stateStats.entries())
      .map(([state, stats]) => ({
        state,
        customerCount: stats.count,
        cityCount: stats.cities.size,
      }))
      .sort((a, b) => b.customerCount - a.customerCount);

    // Get top cities
    const cityStats = new Map<string, number>();
    customersParsed.data.forEach((customer) => {
      if (!activeCustomers.has(customer.customer_id)) return;
      const current = cityStats.get(customer.customer_city) || 0;
      cityStats.set(customer.customer_city, current + 1);
    });

    const topCities = Array.from(cityStats.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return Response.json({
      byState: result,
      topCities,
    });
  } catch (error) {
    console.error('Error processing customer demographics:', error);
    return Response.json(
      { error: 'Failed to process customer demographics', details: (error as Error).message },
      { status: 500 }
    );
  }
}
