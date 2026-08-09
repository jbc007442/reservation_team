'use client';

import { Collapse, Divider, Row, Col, Tag } from 'antd';
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  RocketOutlined,
  ApartmentOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';

import { formatAirportTime, formatAirportDate, formatDuration } from './FlightUtils';

interface Props {
  flight: any;
}

export default function FlightDetails({ flight }: Props) {
  return (
    <Collapse
      ghost
      size="large"
      style={{
        marginTop: 20,
      }}
      items={[
        {
          key: 'details',

          label: (
            <div
              style={{
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              Flight Details
            </div>
          ),

          children: (
            <div>
              {flight.flights.map((segment: any, index: number) => (
                <div
                  key={index}
                  style={{
                    border: '1px solid #ececec',
                    borderRadius: 14,
                    padding: 20,
                    marginBottom: 18,
                    background: '#fafafa',
                  }}
                >
                  {/* Header */}

                  <Row justify="space-between" align="middle">
                    <Col>
                      <div
                        style={{
                          display: 'flex',
                          gap: 12,
                          alignItems: 'center',
                        }}
                      >
                        <img
                          src={segment.airline_logo}
                          style={{
                            width: 38,
                            height: 38,
                            objectFit: 'contain',
                          }}
                        />

                        <div>
                          <div
                            style={{
                              fontWeight: 600,
                            }}
                          >
                            {segment.airline}
                          </div>

                          <div
                            style={{
                              color: '#666',
                              fontSize: 13,
                            }}
                          >
                            {segment.flight_number}
                          </div>
                        </div>
                      </div>
                    </Col>

                    <Col>
                      <Tag color="blue">{segment.travel_class}</Tag>
                    </Col>
                  </Row>

                  <Divider />

                  {/* Timeline */}

                  <Row gutter={24} align="middle">
                    {/* Departure */}

                    <Col span={8}>
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 700,
                        }}
                      >
                        {formatAirportTime(segment.departure_airport)}
                      </div>

                      <div
                        style={{
                          fontWeight: 600,
                        }}
                      >
                        {segment.departure_airport.id}
                      </div>

                      <div
                        style={{
                          color: '#666',
                          fontSize: 13,
                        }}
                      >
                        {segment.departure_airport.name}
                      </div>

                      <div
                        style={{
                          marginTop: 6,
                          color: '#888',
                          fontSize: 12,
                        }}
                      >
                        {formatAirportDate(segment.departure_airport)}
                      </div>

                      {segment.departure_terminal && (
                        <Tag
                          style={{
                            marginTop: 8,
                          }}
                        >
                          Terminal {segment.departure_terminal}
                        </Tag>
                      )}
                    </Col>

                    {/* Middle */}

                    <Col span={8}>
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
                          {formatDuration(segment.duration)}
                        </div>

                        <div
                          style={{
                            margin: '12px 0',
                            position: 'relative',
                            height: 2,
                            background: '#d9d9d9',
                          }}
                        >
                          <div
                            style={{
                              position: 'absolute',
                              left: 0,
                              top: -5,
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              background: '#1677ff',
                            }}
                          />

                          <ArrowRightOutlined
                            style={{
                              position: 'absolute',
                              left: '50%',
                              top: -9,
                              transform: 'translateX(-50%)',
                              fontSize: 18,
                              color: '#1677ff',
                            }}
                          />

                          <div
                            style={{
                              position: 'absolute',
                              right: 0,
                              top: -5,
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              background: '#1677ff',
                            }}
                          />
                        </div>

                        <Tag>Nonstop</Tag>
                      </div>
                    </Col>

                    {/* Arrival */}

                    <Col
                      span={8}
                      style={{
                        textAlign: 'right',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 700,
                        }}
                      >
                        {formatAirportTime(segment.arrival_airport)}
                      </div>

                      <div
                        style={{
                          fontWeight: 600,
                        }}
                      >
                        {segment.arrival_airport.id}
                      </div>

                      <div
                        style={{
                          color: '#666',
                          fontSize: 13,
                        }}
                      >
                        {segment.arrival_airport.name}
                      </div>

                      <div
                        style={{
                          marginTop: 6,
                          color: '#888',
                          fontSize: 12,
                        }}
                      >
                        {formatAirportDate(segment.arrival_airport)}
                      </div>

                      {segment.arrival_terminal && (
                        <Tag
                          style={{
                            marginTop: 8,
                          }}
                        >
                          Terminal {segment.arrival_terminal}
                        </Tag>
                      )}
                    </Col>
                  </Row>

                  <Divider />
                  {/* Flight Information */}

                  <Row gutter={[20, 20]}>
                    <Col xs={24} md={12}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 12,
                        }}
                      >
                        <RocketOutlined
                          style={{
                            color: '#1677ff',
                            fontSize: 18,
                            marginTop: 2,
                          }}
                        />

                        <div>
                          <div
                            style={{
                              fontWeight: 600,
                              marginBottom: 4,
                            }}
                          >
                            Aircraft
                          </div>

                          <div
                            style={{
                              color: '#555',
                            }}
                          >
                            {segment.airplane || '--'}
                          </div>
                        </div>
                      </div>
                    </Col>

                    <Col xs={24} md={12}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 12,
                        }}
                      >
                        <ClockCircleOutlined
                          style={{
                            color: '#1677ff',
                            fontSize: 18,
                            marginTop: 2,
                          }}
                        />

                        <div>
                          <div
                            style={{
                              fontWeight: 600,
                              marginBottom: 4,
                            }}
                          >
                            Flight Duration
                          </div>

                          <div
                            style={{
                              color: '#555',
                            }}
                          >
                            {formatDuration(segment.duration)}
                          </div>
                        </div>
                      </div>
                    </Col>

                    <Col xs={24} md={12}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 12,
                        }}
                      >
                        <ApartmentOutlined
                          style={{
                            color: '#1677ff',
                            fontSize: 18,
                            marginTop: 2,
                          }}
                        />

                        <div>
                          <div
                            style={{
                              fontWeight: 600,
                              marginBottom: 4,
                            }}
                          >
                            Cabin
                          </div>

                          <Tag color="blue">{segment.travel_class}</Tag>
                        </div>
                      </div>
                    </Col>

                    <Col xs={24} md={12}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 12,
                        }}
                      >
                        <EnvironmentOutlined
                          style={{
                            color: '#1677ff',
                            fontSize: 18,
                            marginTop: 2,
                          }}
                        />

                        <div>
                          <div
                            style={{
                              fontWeight: 600,
                              marginBottom: 4,
                            }}
                          >
                            Route
                          </div>

                          <div
                            style={{
                              color: '#555',
                            }}
                          >
                            {segment.departure_airport.id} → {segment.arrival_airport.id}
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>

                  {/* Layover */}

                  {flight.layovers?.[index] && (
                    <>
                      <Divider />

                      <div
                        style={{
                          background: '#fff7e6',
                          border: '1px solid #ffd591',
                          borderRadius: 10,
                          padding: 14,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                          }}
                        >
                          Layover
                        </div>

                        <div
                          style={{
                            color: '#666',
                            marginTop: 6,
                          }}
                        >
                          {flight.layovers[index].duration}
                        </div>

                        <div
                          style={{
                            color: '#888',
                          }}
                        >
                          {flight.layovers[index].name}
                        </div>
                      </div>
                    </>
                  )}

                  {index !== flight.flights.length - 1 && <Divider />}
                </div>
              ))}
            </div>
          ),
        },
      ]}
    />
  );
}
