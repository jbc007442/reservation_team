'use client';

import { Row, Col, Tag } from 'antd';
import {
  formatAirportDate,
  formatAirportTime,
  formatDuration,
  firstSegment,
  getStops,
  lastSegment,
  overnight,
} from './FlightUtils';

interface Props {
  flight: any;
}

export default function FlightTimeline({ flight }: Props) {
  const first = firstSegment(flight);
  const last = lastSegment(flight);

  const stops = getStops(flight);

  return (
    <div style={{ marginTop: 18 }}>
      <div
        style={{
          fontWeight: 600,
          marginBottom: 18,
        }}
      >
        Departure • {formatAirportDate(first.departure_airport)}
      </div>

      <Row gutter={24} align="middle">
        {/* Departure */}

        <Col flex="210px">
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            {formatAirportTime(first.departure_airport)}
          </div>

          <div
            style={{
              fontWeight: 700,
            }}
          >
            {first.departure_airport.id}
          </div>

          <div
            style={{
              color: '#666',
              fontSize: 13,
            }}
          >
            {first.departure_airport.name}
          </div>
        </Col>

        {/* Timeline */}

        <Col flex="auto">
          <div
            style={{
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontWeight: 600,
              }}
            >
              {formatDuration(flight.total_duration)}
            </div>

            <div
              style={{
                color: '#666',
                marginBottom: 10,
              }}
            >
              {stops === 0 ? 'Nonstop' : `${stops} Stop`}
            </div>

            <div
              style={{
                position: 'relative',
                height: 2,
                background: '#cfcfcf',
              }}
            >
              {/* Left */}

              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#1677ff',
                  position: 'absolute',
                  left: 0,
                  top: -4,
                }}
              />

              {/* Plane */}

              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: -14,
                  transform: 'translateX(-50%)',
                  fontSize: 20,
                }}
              >
                ✈
              </div>

              {/* Right */}

              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#1677ff',
                  position: 'absolute',
                  right: 0,
                  top: -4,
                }}
              />
            </div>

            {overnight(flight) && (
              <Tag
                color="purple"
                style={{
                  marginTop: 12,
                }}
              >
                Overnight
              </Tag>
            )}
          </div>
        </Col>

        {/* Arrival */}

        <Col
          flex="210px"
          style={{
            textAlign: 'right',
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            {formatAirportTime(last.arrival_airport)}
          </div>

          <div
            style={{
              fontWeight: 700,
            }}
          >
            {last.arrival_airport.id}
          </div>

          <div
            style={{
              color: '#666',
              fontSize: 13,
            }}
          >
            {last.arrival_airport.name}
          </div>
        </Col>
      </Row>
    </div>
  );
}
