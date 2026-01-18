import { NextResponse } from "next/server";

export async function GET() {
  const cryptoData = [
    { symbol: "BTC", name: "Bitcoin", price: 65000, change: "+2.3%" },
    { symbol: "ETH", name: "Ethereum", price: 3200, change: "+1.1%" },
  ];
  return NextResponse.json(cryptoData);
}
