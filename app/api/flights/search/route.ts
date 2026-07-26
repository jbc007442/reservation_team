import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const params = new URLSearchParams({
    engine: 'google_flights',
    departure_id: searchParams.get('departure_id') || '',
    arrival_id: searchParams.get('arrival_id') || '',
    outbound_date: searchParams.get('outbound_date') || '',
    return_date: searchParams.get('return_date') || '',
    type: searchParams.get('type') || '1',
    adults: searchParams.get('adults') || '1',
    currency: searchParams.get('currency') || 'USD',
    api_key: process.env.SEARCHAPI_API_KEY!,
  });

  const response = await fetch(`${process.env.SEARCHAPI_BASE_URL}?${params.toString()}`);

  const data = await response.json();

  return NextResponse.json(data);
}
