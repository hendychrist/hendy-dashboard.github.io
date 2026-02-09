import fs from "fs";
import path from "path";
import Papa from "papaparse";

interface OrderItemsRow {
  order_id: string;
  product_id: string;
  seller_id: string;
  price: number;
}

interface ProductsRow {
  product_id: string;
  product_category_name: string;
}

interface CategoryTranslationRow {
  product_category_name: string;
  product_category_name_english: string;
}

export async function GET() {
  try {
    const orderItemsPath = path.join(process.cwd(), "data/olist_order_items_dataset.csv");
    const productsPath = path.join(process.cwd(), "data/olist_products_dataset.csv");
    const translationPath = path.join(process.cwd(), "data/product_category_name_translation.csv");

    const [orderItemsContent, productsContent, translationContent] = [
      fs.readFileSync(orderItemsPath, "utf8"),
      fs.readFileSync(productsPath, "utf8"),
      fs.readFileSync(translationPath, "utf8"),
    ];

    // Parse order items
    const orderItemsParsed = Papa.parse<OrderItemsRow>(orderItemsContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    // Parse products
    const productsParsed = Papa.parse<ProductsRow>(productsContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    // Parse translations
    const translationParsed = Papa.parse<CategoryTranslationRow>(translationContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    // Create product category lookup
    const productCategoryMap = new Map<string, string>();
    productsParsed.data.forEach((product) => {
      productCategoryMap.set(product.product_id, product.product_category_name);
    });

    // Create translation map
    const translationMap = new Map<string, string>();
    translationParsed.data.forEach((trans) => {
      translationMap.set(trans.product_category_name, trans.product_category_name_english);
    });

    // Aggregate by category
    const categoryStats = new Map<string, { count: number; revenue: number }>();

    orderItemsParsed.data.forEach((item) => {
      const category = productCategoryMap.get(item.product_id);
      if (!category) return;

      const englishCategory = translationMap.get(category) || category;

      if (!categoryStats.has(englishCategory)) {
        categoryStats.set(englishCategory, { count: 0, revenue: 0 });
      }

      const stats = categoryStats.get(englishCategory)!;
      stats.count++;
      stats.revenue += item.price;
    });

    // Convert to result array and sort by revenue
    const result = Array.from(categoryStats.entries())
      .map(([category, stats]) => ({
        category,
        orderCount: stats.count,
        revenue: Math.round(stats.revenue * 100) / 100,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 20); // Top 20 categories

    return Response.json(result);
  } catch (error) {
    console.error('Error processing product categories:', error);
    return Response.json(
      { error: 'Failed to process product categories', details: (error as Error).message },
      { status: 500 }
    );
  }
}
