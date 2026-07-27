import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const departureToken = searchParams.get('departure_token');

    if (!departureToken) {
      return NextResponse.json({ error: 'departure_token is required' }, { status: 400 });
    }

    const params = new URLSearchParams({
      engine: 'google_flights',

      departure_token: departureToken,

      departure_id: searchParams.get('departure_id') || '',
      arrival_id: searchParams.get('arrival_id') || '',
      outbound_date: searchParams.get('outbound_date') || '',
      return_date: searchParams.get('return_date') || '',
      flight_type: searchParams.get('flight_type') || 'round_trip',

      adults: searchParams.get('adults') || '1',
      children: searchParams.get('children') || '0',
      infants_on_lap: searchParams.get('infants_on_lap') || '0',
      travel_class: searchParams.get('travel_class') || 'economy',
      currency: searchParams.get('currency') || 'USD',

      api_key: process.env.SEARCHAPI_API_KEY!,
    });

    const response = await fetch(`${process.env.SEARCHAPI_BASE_URL}?${params.toString()}`);

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: 'Unable to fetch return flights' }, { status: 500 });
  }
}
