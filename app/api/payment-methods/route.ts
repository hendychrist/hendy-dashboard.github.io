import fs from "fs";
import path from "path";
import Papa from "papaparse";

interface PaymentRow {
  order_id: string;
  payment_type: string;
  payment_value: number;
}

export async function GET() {
  try {
    const paymentsPath = path.join(process.cwd(), "data/olist_order_payments_dataset.csv");
    const paymentsContent = fs.readFileSync(paymentsPath, "utf8");

    // Parse payments
    const paymentsParsed = Papa.parse<PaymentRow>(paymentsContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    // Aggregate by payment type
    const paymentStats = new Map<string, { count: number; totalValue: number }>();

    paymentsParsed.data.forEach((payment) => {
      const paymentType = payment.payment_type;

      if (!paymentStats.has(paymentType)) {
        paymentStats.set(paymentType, { count: 0, totalValue: 0 });
      }

      const stats = paymentStats.get(paymentType)!;
      stats.count++;
      stats.totalValue += payment.payment_value;
    });

    // Convert to result array
    const result = Array.from(paymentStats.entries())
      .map(([paymentType, stats]) => ({
        paymentType,
        transactionCount: stats.count,
        totalValue: Math.round(stats.totalValue * 100) / 100,
        avgValue: Math.round((stats.totalValue / stats.count) * 100) / 100,
      }))
      .sort((a, b) => b.transactionCount - a.transactionCount);

    // Calculate total for percentages
    const totalTransactions = result.reduce((sum, r) => sum + r.transactionCount, 0);

    return Response.json(
      result.map((r) => ({
        ...r,
        percentage: Math.round((r.transactionCount / totalTransactions) * 1000) / 10,
      }))
    );
  } catch (error) {
    console.error('Error processing payment methods:', error);
    return Response.json(
      { error: 'Failed to process payment methods', details: (error as Error).message },
      { status: 500 }
    );
  }
}
