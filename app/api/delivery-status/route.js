import fs from "fs";
import path from "path";
import Papa from "papaparse";

export async function GET() {
  try {
    const ordersPath = path.join(process.cwd(), "data/olist_orders_dataset.csv");
    const fileContent = fs.readFileSync(ordersPath, "utf8");

    // Parse CSV using PapaParse
    const parsed = Papa.parse(fileContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true
    });

    // Count delivery statuses
    const statusCount = {};

    parsed.data.forEach(row => {
      const status = row.order_status;
      if (status) {
        statusCount[status] = (statusCount[status] || 0) + 1;
      }
    });

    // Convert to array format
    const result = Object.entries(statusCount).map(([status, count]) => ({
      status,
      count
    }));

    return Response.json(result);
  } catch (error) {
    console.error('Error reading CSV:', error);
    return Response.json(
      { error: 'Failed to read delivery data', details: error.message },
      { status: 500 }
    );
  }
}
