'use client';

import { Card } from 'antd';

import FlightHeader from './FlightHeader';
import FlightTimeline from './FlightTimeline';
import FlightDetails from './FlightDetails';

import './FlightCard.css';

interface FlightCardProps {
  flight: any;
  selected?: boolean;
  showButton?: boolean;
  buttonText?: string;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function FlightCard({
  flight,
  selected = false,
  showButton = true,
  buttonText = 'Select Flight',
  loading = false,
  onClick,
  className = '',
}: FlightCardProps) {
  return (
    <Card
      hoverable={!selected}
      className={`flight-card ${selected ? 'flight-card-selected' : ''} ${className}`}
      styles={{
        body: {
          padding: 16,
        },
      }}
    >
      <FlightHeader
        flight={flight}
        selected={selected}
        showButton={showButton}
        buttonText={buttonText}
        loading={loading}
        onClick={onClick}
      />

      <div
        style={{
          marginTop: 16,
        }}
      >
        <FlightTimeline flight={flight} />
      </div>

      <div
        style={{
          marginTop: 12,
        }}
      >
        <FlightDetails flight={flight} />
      </div>
    </Card>
  );
}
