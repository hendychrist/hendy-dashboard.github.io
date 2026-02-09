import fs from "fs";
import path from "path";
import Papa from "papaparse";

interface OrderRow {
  order_id: string;
  customer_id: string;
  order_status: string;
  order_purchase_timestamp: string;
  order_delivered_customer_date: string;
  order_estimated_delivery_date: string;
}

export async function GET() {
  try {
    const ordersPath = path.join(process.cwd(), "data/olist_orders_dataset.csv");
    const ordersContent = fs.readFileSync(ordersPath, "utf8");

    // Parse orders
    const ordersParsed = Papa.parse<OrderRow>(ordersContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    const totalOrders = ordersParsed.data.length;

    // Calculate metrics (simulated ML model performance)
    let delivered = 0;
    let canceled = 0;
    let lateDeliveries = 0;

    ordersParsed.data.forEach((order) => {
      if (order.order_status === 'delivered') {
        delivered++;

        const deliveredDate = new Date(order.order_delivered_customer_date);
        const estimatedDate = new Date(order.order_estimated_delivery_date);

        if (deliveredDate > estimatedDate) {
          lateDeliveries++;
        }
      } else if (order.order_status === 'canceled') {
        canceled++;
      }
    });

    const other = totalOrders - delivered - canceled;

    // Simulated ML metrics for delivery prediction
    // In real scenario, these would come from actual model evaluation
    const tp = delivered - lateDeliveries; // True positive: delivered on time
    const fp = lateDeliveries; // False positive: predicted on time but late
    const fn = canceled; // False negative: predicted delivered but canceled
    const tn = Math.round(totalOrders * 0.02); // True negative (simulated)

    const accuracy = ((tp + tn) / (tp + tn + fp + fn)) * 100;
    const precision = tp / (tp + fp) * 100;
    const recall = tp / (tp + fn) * 100;
    const f1Score = 2 * ((precision * recall) / (precision + recall));

    const result = {
      accuracy: Math.round(accuracy * 10) / 10,
      precision: Math.round(precision * 10) / 10,
      recall: Math.round(recall * 10) / 10,
      f1Score: Math.round(f1Score * 10) / 10,
      confusionMatrix: {
        tp,
        tn,
        fp,
        fn,
      },
      classDistribution: {
        delivered,
        canceled,
        other,
      },
      totalOrders,
    };

    return Response.json(result);
  } catch (error) {
    console.error('Error processing ML metrics:', error);
    return Response.json(
      { error: 'Failed to process ML metrics', details: (error as Error).message },
      { status: 500 }
    );
  }
}
