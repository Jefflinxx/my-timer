import { NextResponse } from "next/server";

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || "YOUR_API_KEY";

const SYMBOLS = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"];

async function getStockData(symbol) {
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Error fetching data for ${symbol}: ${response.statusText}`);
    return null;
  }
  const data = await response.json();
  const quote = data["Global Quote"];
  if (!quote || Object.keys(quote).length === 0) {
    console.warn(`No data returned for ${symbol}. This might be due to API limits.`);
    return null;
  }
  return {
    symbol: quote["01. symbol"],
    name: symbol,
    price: parseFloat(quote["05. price"]),
    change: quote["10. change percent"],
  };
}

export async function GET() {
  if (ALPHA_VANTAGE_API_KEY === "YOUR_API_KEY") {
    console.warn("Alpha Vantage API key is not set. Using placeholder data.");
    const stockData = [
      { symbol: "AAPL", name: "Apple Inc.", price: 170.12, change: "+1.25%" },
      { symbol: "GOOGL", name: "Alphabet Inc.", price: 135.67, change: "-0.58%" },
    ];
    return NextResponse.json(stockData);
  }

  try {
    const stockDataPromises = SYMBOLS.map((symbol) => getStockData(symbol));
    const stockData = (await Promise.all(stockDataPromises)).filter(Boolean);

    if (stockData.length === 0) {
      return NextResponse.json(
        { error: "Failed to fetch stock data, possibly due to API rate limits." },
        { status: 503 },
      );
    }

    return NextResponse.json(stockData);
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 });
  }
}
