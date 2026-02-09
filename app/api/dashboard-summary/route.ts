import { NextRequest, NextResponse } from "next/server";
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

interface CustomerRow {
  customer_id: string;
  customer_state: string;
  customer_city: string;
}

interface OrderItemsRow {
  order_id: string;
  product_id: string;
  price: number;
}

interface ProductsRow {
  product_id: string;
  product_category_name: string;
}

interface PaymentRow {
  order_id: string;
  payment_type: string;
  payment_value: number;
}

interface ReviewRow {
  order_id: string;
  review_score: number;
}

interface CategoryTranslationRow {
  product_category_name: string;
  product_category_name_english: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";
    const payment = searchParams.get("payment") || "all";
    const state = searchParams.get("state") || "all";
    const monthStart = searchParams.get("month_start");
    const monthEnd = searchParams.get("month_end");

    // Read all necessary CSV files
    const ordersPath = path.join(process.cwd(), "data/olist_orders_dataset.csv");
    const customersPath = path.join(process.cwd(), "data/olist_customers_dataset.csv");
    const orderItemsPath = path.join(process.cwd(), "data/olist_order_items_dataset.csv");
    const productsPath = path.join(process.cwd(), "data/olist_products_dataset.csv");
    const paymentsPath = path.join(process.cwd(), "data/olist_order_payments_dataset.csv");
    const reviewsPath = path.join(process.cwd(), "data/olist_order_reviews_dataset.csv");
    const translationPath = path.join(process.cwd(), "data/product_category_name_translation.csv");

    const [
      ordersContent,
      customersContent,
      orderItemsContent,
      productsContent,
      paymentsContent,
      reviewsContent,
      translationContent,
    ] = [
      fs.readFileSync(ordersPath, "utf8"),
      fs.readFileSync(customersPath, "utf8"),
      fs.readFileSync(orderItemsPath, "utf8"),
      fs.readFileSync(productsPath, "utf8"),
      fs.readFileSync(paymentsPath, "utf8"),
      fs.readFileSync(reviewsPath, "utf8"),
      fs.readFileSync(translationPath, "utf8"),
    ];

    // Parse all CSVs
    const ordersParsed = Papa.parse<OrderRow>(ordersContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    const customersParsed = Papa.parse<CustomerRow>(customersContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    const orderItemsParsed = Papa.parse<OrderItemsRow>(orderItemsContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    const productsParsed = Papa.parse<ProductsRow>(productsContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    const paymentsParsed = Papa.parse<PaymentRow>(paymentsContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    const reviewsParsed = Papa.parse<ReviewRow>(reviewsContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    const translationParsed = Papa.parse<CategoryTranslationRow>(translationContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    // Create lookup maps
    const customerMap = new Map<string, CustomerRow>();
    customersParsed.data.forEach((c) => customerMap.set(c.customer_id, c));

    const productCategoryMap = new Map<string, string>();
    productsParsed.data.forEach((p) => productCategoryMap.set(p.product_id, p.product_category_name));

    const translationMap = new Map<string, string>();
    translationParsed.data.forEach((t) =>
      translationMap.set(t.product_category_name, t.product_category_name_english)
    );

    // Create order lookup maps
    const orderPaymentMap = new Map<string, PaymentRow[]>();
    paymentsParsed.data.forEach((p) => {
      const arr = orderPaymentMap.get(p.order_id) || [];
      arr.push(p);
      orderPaymentMap.set(p.order_id, arr);
    });

    const orderReviewMap = new Map<string, ReviewRow>();
    reviewsParsed.data.forEach((r) => orderReviewMap.set(r.order_id, r));

    const orderItemsMap = new Map<string, OrderItemsRow[]>();
    orderItemsParsed.data.forEach((item) => {
      const arr = orderItemsMap.get(item.order_id) || [];
      arr.push(item);
      orderItemsMap.set(item.order_id, arr);
    });

    // Filter orders based on query parameters
    let filteredOrders = ordersParsed.data.filter((order) => {
      // Status filter
      if (status !== "all" && order.order_status !== status) return false;

      // Month range filter
      const orderDate = new Date(order.order_purchase_timestamp);
      const orderMonth = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, "0")}`;

      if (monthStart && orderMonth < monthStart) return false;
      if (monthEnd && orderMonth > monthEnd) return false;

      return true;
    });

    // Apply additional filters based on joined data
    filteredOrders = filteredOrders.filter((order) => {
      const customer = customerMap.get(order.customer_id);
      if (!customer) return false;

      // State filter
      if (state !== "all" && customer.customer_state !== state) return false;

      // Payment filter
      if (payment !== "all") {
        const orderPayments = orderPaymentMap.get(order.order_id) || [];
        const hasPaymentType = orderPayments.some((p) => p.payment_type === payment);
        if (!hasPaymentType) return false;
      }

      return true;
    });

    // Calculate KPIs
    const totalOrders = filteredOrders.length;
    const deliveredCount = filteredOrders.filter((o) => o.order_status === "delivered").length;
    const deliveredRate = totalOrders > 0 ? (deliveredCount / totalOrders) * 100 : 0;

    // Calculate total revenue
    let totalRevenue = 0;
    filteredOrders.forEach((order) => {
      const items = orderItemsMap.get(order.order_id) || [];
      items.forEach((item) => {
        totalRevenue += item.price;
      });
    });

    // Calculate average review score
    let totalScore = 0;
    let reviewCount = 0;
    filteredOrders.forEach((order) => {
      const review = orderReviewMap.get(order.order_id);
      if (review) {
        totalScore += review.review_score;
        reviewCount++;
      }
    });
    const avgReviewScore = reviewCount > 0 ? totalScore / reviewCount : 0;

    // Status distribution
    const statusCounts = new Map<string, number>();
    filteredOrders.forEach((order) => {
      const count = statusCounts.get(order.order_status) || 0;
      statusCounts.set(order.order_status, count + 1);
    });
    const deliveryStatus = Array.from(statusCounts.entries()).map(([status, count]) => ({
      status,
      count,
    }));

    // State performance
    const stateStats = new Map<
      string,
      { total: number; onTime: number; late: number; canceled: number }
    >();
    filteredOrders.forEach((order) => {
      const customer = customerMap.get(order.customer_id);
      if (!customer) return;

      const s = customer.customer_state;
      if (!stateStats.has(s)) {
        stateStats.set(s, { total: 0, onTime: 0, late: 0, canceled: 0 });
      }
      const stats = stateStats.get(s)!;
      stats.total++;

      if (order.order_status === "delivered") {
        const deliveredDate = new Date(order.order_delivered_customer_date);
        const estimatedDate = new Date(order.order_estimated_delivery_date);
        if (deliveredDate <= estimatedDate) {
          stats.onTime++;
        } else {
          stats.late++;
        }
      } else if (order.order_status === "canceled") {
        stats.canceled++;
      }
    });

    const statePerformance = Array.from(stateStats.entries())
      .map(([state, stats]) => ({
        state,
        totalOrders: stats.total,
        deliveredOnTime: stats.onTime,
        deliveredLate: stats.late,
        canceled: stats.canceled,
      }))
      .sort((a, b) => b.totalOrders - a.totalOrders)
      .slice(0, 15);

    // Monthly trends
    const monthlyStats = new Map<string, number>();
    filteredOrders.forEach((order) => {
      const date = new Date(order.order_purchase_timestamp);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const count = monthlyStats.get(monthKey) || 0;
      monthlyStats.set(monthKey, count + 1);
    });

    const monthlyTrends = Array.from(monthlyStats.entries())
      .map(([monthYear, count]) => {
        const [year, month] = monthYear.split("-");
        return {
          month: new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString("en-US", {
            month: "short",
          }),
          year: parseInt(year),
          monthYear,
          totalOrders: count,
        };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.monthYear.localeCompare(b.monthYear);
      });

    // Product categories
    const categoryStats = new Map<string, { count: number; revenue: number }>();
    filteredOrders.forEach((order) => {
      const items = orderItemsMap.get(order.order_id) || [];
      items.forEach((item) => {
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
    });

    const productCategories = Array.from(categoryStats.entries())
      .map(([category, stats]) => ({
        category,
        orderCount: stats.count,
        revenue: Math.round(stats.revenue * 100) / 100,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 20);

    // Payment methods
    const paymentStats = new Map<string, number>();
    filteredOrders.forEach((order) => {
      const payments = orderPaymentMap.get(order.order_id) || [];
      payments.forEach((p) => {
        const count = paymentStats.get(p.payment_type) || 0;
        paymentStats.set(p.payment_type, count + 1);
      });
    });

    const totalTransactions = Array.from(paymentStats.values()).reduce((a, b) => a + b, 0);
    const paymentMethods = Array.from(paymentStats.entries())
      .map(([paymentType, count]) => ({
        paymentType,
        transactionCount: count,
        percentage: totalTransactions > 0 ? (count / totalTransactions) * 100 : 0,
      }))
      .sort((a, b) => b.transactionCount - a.transactionCount);

    // Reviews analysis
    const scoreCounts = new Map<number, number>();
    let totalReviewScore = 0;
    let totalReviewCount = 0;

    filteredOrders.forEach((order) => {
      const review = orderReviewMap.get(order.order_id);
      if (review) {
        const count = scoreCounts.get(review.review_score) || 0;
        scoreCounts.set(review.review_score, count + 1);
        totalReviewScore += review.review_score;
        totalReviewCount++;
      }
    });

    const scoreDistribution = Array.from(scoreCounts.entries())
      .map(([score, count]) => ({ score, count }))
      .sort((a, b) => a.score - b.score);

    const positiveReviews = (scoreCounts.get(5) || 0) + (scoreCounts.get(4) || 0);
    const positivePercentage =
      totalReviewCount > 0 ? (positiveReviews / totalReviewCount) * 100 : 0;

    // Customer demographics
    const customerStateStats = new Map<string, number>();
    const customerCityStats = new Map<string, number>();

    filteredOrders.forEach((order) => {
      const customer = customerMap.get(order.customer_id);
      if (!customer) return;

      const stateCount = customerStateStats.get(customer.customer_state) || 0;
      customerStateStats.set(customer.customer_state, stateCount + 1);

      const cityCount = customerCityStats.get(customer.customer_city) || 0;
      customerCityStats.set(customer.customer_city, cityCount + 1);
    });

    const byState = Array.from(customerStateStats.entries())
      .map(([state, count]) => ({ state, customerCount: count }))
      .sort((a, b) => b.customerCount - a.customerCount)
      .slice(0, 10);

    const topCities = Array.from(customerCityStats.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const customerDemographics = {
      byState,
      topCities,
    };

    const result = {
      kpi: {
        totalOrders,
        deliveredRate: Math.round(deliveredRate * 10) / 10,
        totalRevenue: Math.round(totalRevenue),
        avgReviewScore: Math.round(avgReviewScore * 10) / 10,
      },
      deliveryStatus,
      statePerformance,
      monthlyTrends,
      productCategories,
      paymentMethods,
      reviewsAnalysis: {
        scoreDistribution,
        averageScore: Math.round(avgReviewScore * 10) / 10,
        positivePercentage: Math.round(positivePercentage * 10) / 10,
        negativePercentage: Math.round((100 - positivePercentage) * 10) / 10,
      },
      customerDemographics,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in dashboard-summary API:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data", details: (error as Error).message },
      { status: 500 }
    );
  }
}
