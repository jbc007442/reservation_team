'use client';

import { Button, Tag } from 'antd';

import './FlightCard.css';

interface Props {
  flight: any;

  selected?: boolean;

  showButton?: boolean;

  buttonText?: string;

  loading?: boolean;

  onClick?: () => void;
}

export default function FlightHeader({
  flight,

  selected,

  showButton,

  buttonText,

  loading,

  onClick,
}: Props) {
  const first = flight.flights[0];

  return (
    <div className="flight-header">
      <div className="flight-airline">
        <img src={flight.airline_logo} alt="" />

        <div>
          <div className="flight-airline-name">{first.airline}</div>

          <div className="flight-airline-number">{first.flight_number}</div>

          <div className="flight-class">
            <Tag color="blue">{first.travel_class}</Tag>

            <Tag>{first.airplane}</Tag>
          </div>
        </div>
      </div>

      <div className="flight-right">
        {showButton && (
          <Button
            className="flight-select"
            type={selected ? 'default' : 'primary'}
            loading={loading}
            disabled={selected}
            onClick={onClick}
          >
            {buttonText}
          </Button>
        )}
      </div>
    </div>
  );
}
