import fs from "fs";
import path from "path";
import Papa from "papaparse";

interface ReviewRow {
  review_id: string;
  order_id: string;
  review_score: number;
  review_creation_date: string;
}

export async function GET() {
  try {
    const reviewsPath = path.join(process.cwd(), "data/olist_order_reviews_dataset.csv");
    const reviewsContent = fs.readFileSync(reviewsPath, "utf8");

    // Parse reviews
    const reviewsParsed = Papa.parse<ReviewRow>(reviewsContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    // Aggregate by score
    const scoreCounts = new Map<number, number>();
    let totalScore = 0;

    reviewsParsed.data.forEach((review) => {
      const score = review.review_score;
      const current = scoreCounts.get(score) || 0;
      scoreCounts.set(score, current + 1);
      totalScore += score;
    });

    // Convert to result array
    const scoreDistribution = Array.from(scoreCounts.entries())
      .map(([score, count]) => ({
        score,
        count,
      }))
      .sort((a, b) => a.score - b.score);

    // Calculate average score
    const avgScore = totalScore / reviewsParsed.data.length;

    // Calculate percentage of positive reviews (4-5 stars)
    const positiveReviews = (scoreCounts.get(5) ?? 0) + (scoreCounts.get(4) ?? 0);
    const positivePercentage = (positiveReviews / reviewsParsed.data.length) * 100;

    return Response.json({
      scoreDistribution,
      averageScore: Math.round(avgScore * 100) / 100,
      positivePercentage: Math.round(positivePercentage * 10) / 10,
      negativePercentage: Math.round((100 - positivePercentage) * 10) / 10,
    });
  } catch (error) {
    console.error('Error processing reviews analysis:', error);
    return Response.json(
      { error: 'Failed to process reviews analysis', details: (error as Error).message },
      { status: 500 }
    );
  }
}
