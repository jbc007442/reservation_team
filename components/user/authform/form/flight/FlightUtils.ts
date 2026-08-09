export const getDate = (airport: any) => {
  if (!airport) return null;

  if (airport.date && airport.time) {
    return new Date(`${airport.date}T${airport.time}:00`);
  }

  if (airport.time) {
    return new Date(airport.time);
  }

  return null;
};

export const formatAirportTime = (airport: any) => {
  const date = getDate(airport);

  if (!date || isNaN(date.getTime())) return '--';

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const formatAirportDate = (airport: any) => {
  const date = getDate(airport);

  if (!date || isNaN(date.getTime())) return '--';

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDuration = (minutes: number) => {
  if (!minutes) return '--';

  const h = Math.floor(minutes / 60);

  const m = minutes % 60;

  return m ? `${h} hr ${m} min` : `${h} hr`;
};

export const getStops = (flight: any) => {
  return Math.max(0, (flight.flights?.length || 1) - 1);
};

export const firstSegment = (flight: any) => flight.flights[0];

export const lastSegment = (flight: any) => flight.flights[flight.flights.length - 1];

export const overnight = (flight: any) => {
  const first = firstSegment(flight);

  const last = lastSegment(flight);

  const d1 = getDate(first.departure_airport);

  const d2 = getDate(last.arrival_airport);

  if (!d1 || !d2) return false;

  return d1.toDateString() != d2.toDateString();
};
