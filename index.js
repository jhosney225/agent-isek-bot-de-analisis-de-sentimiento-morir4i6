
```javascript
const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic();

const financialNews = [
  "Apple Inc. reported record quarterly earnings, exceeding analyst expectations with a 15% increase in revenue.",
  "Stock market crashes 5% amid concerns about rising interest rates and inflation concerns.",
  "Tesla unveils new manufacturing plant, creating thousands of jobs and boosting investor confidence.",
  "Banking sector faces regulatory scrutiny as deposit withdrawals continue, causing market uncertainty.",
  "Tech giants announce massive cost-cutting measures, laying off thousands of employees amid economic slowdown.",
  "Oil prices surge to highest level in months as OPEC+ extends production cuts, benefiting energy stocks.",
  "Consumer spending shows resilience with retail sales up 2.3%, surprising economists and lifting market sentiment.",
  "Federal Reserve signals potential interest rate hike in upcoming meeting, sparking market volatility.",
];

interface SentimentAnalysis {
  news: string;
  sentiment: string;
  confidence: number;
  explanation: string;
  market_impact: string;
  key_entities: string[];
}

async function analyzeSentiment(newsText: string): Promise<SentimentAnalysis> {
  const prompt = `Analyze the sentiment of the following financial news and provide a structured analysis.

Financial News: "${newsText}"

Please provide your analysis in the following JSON format:
{
  "sentiment": "positive/negative/neutral",
  "confidence": <number between 0 and 1>,
  "explanation": "<brief explanation of the sentiment>",
  "market_impact": "<expected market impact (bullish/bearish/neutral)>",
  "key_entities": ["<entity1>", "<entity2>", ...]
}

Respond ONLY with the JSON object, no additional text.`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse sentiment analysis response");
  }

  const analysis = JSON.parse(jsonMatch[0]);

  return {
    news: newsText,
    sentiment: analysis.sentiment,
    confidence: analysis.confidence,
    explanation: analysis.explanation,
    market_impact: analysis.market_impact,
    key_entities: analysis.key_entities,
  };
}

async function analyzeBatch(newsArray: string[]): Promise<SentimentAnalysis[]> {
  const results: SentimentAnalysis[] = [];

  for (const news of newsArray) {
    const analysis = await analyzeSentiment(news);
    results.push(analysis);
    console.log(`✓ Analyzed: ${news.substring(0, 50)}...`);
  }

  return results;
}

function generateReport(analyses: SentimentAnalysis[]): void {
  console.log("\n" + "=".repeat(80));
  console.log("FINANCIAL NEWS SENTIMENT ANALYSIS REPORT");
  console.log("=".repeat(80) + "\n");

  const sentimentCounts = {
    positive: 0,
    negative: 0,
    neutral: 0,
  };

  const marketImpactCounts = {
    bullish: 0,
    bearish: 0,
    neutral: 0,
  };

  console.log("DETAILED ANALYSIS:\n");

  analyses.forEach((analysis, index) => {
    console.log(`News ${index + 1}:`);
    console.log(`Text: ${analysis.news}`);
    console.log(`Sentiment: ${analysis.sentiment.toUpperCase()}`);
    console.log(`Confidence: ${(analysis.confidence * 100).toFixed(1)}%`);
    console.log(`Explanation: ${analysis.explanation}`);
    console.log(`Market Impact: ${analysis.market_impact.toUpperCase()}`);
    console.log(`Key Entities: ${analysis.key_entities.join(", ")}`);
    console.log("-".repeat(80) + "\n");

    sentimentCounts[
      analysis.sentiment as keyof typeof sentimentCounts
    ]++;
    marketImpactCounts[
      analysis.market_impact.toLowerCase() as keyof typeof marketImpactCounts
    ]++;
  });

  console.log("SUMMARY STATISTICS:\n");
  console.log("Sentiment Distribution:");
  console.log(
    `  Positive: ${sentimentCounts.positive} (${((sentimentCounts.positive / analyses.length) * 100).toFixed(1)}%)`
  );
  console.log(
    `  Negative: ${sentimentCounts.negative} (${((sentimentCounts.negative / analyses.length) * 100).toFixed(1)}%)`
  );
  console.log(
    `  Neutral:  ${sentimentCounts.neutral} (${((sentimentCounts.neutral / analyses.length) * 100).toFixed(1)}%)`
  );

  console.log("\nMarket Impact Distribution:");
  console.log(
    `  Bullish: ${marketImpactCounts.bullish} (${((marketImpactCounts.bullish / analyses.length) * 100).toFixed(1)}%)`
  );
  console.log(
    `  Bearish: ${marketImpactCounts.bearish} (${((marketImpactCounts.bearish / analyses.length) * 100).toFixed(1)}%)`
  );
  console.log(
    `  Neutral: ${marketImpactCounts.neutral} (${((marketImpactCounts.neutral / analyses.length) * 100).toFixed(1)}%)`
  );

  const positiveNews = analyses.filter((a) => a.sentiment === "positive");
  const negativeNews = analyses.filter((a