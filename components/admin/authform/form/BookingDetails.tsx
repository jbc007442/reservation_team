'use client';
import { useState } from 'react';

import { Card, Typography, Upload, Tabs, Input, Button, Alert, message, Skeleton, Row, Col } from 'antd';
import { InboxOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { Booking } from '@/components/admin/booking/types';

const { Text } = Typography;

interface BookingDetailsProps {
  booking: Booking;
  value: UploadFile | null;
  onChange: (file: UploadFile | null) => void;
  selectedFlight?: any;
  onFlightSelect?: (flight: any) => void;
}

const BookingDetails = ({
  booking,
  value,
  onChange,
  selectedFlight,
  onFlightSelect,
}: BookingDetailsProps) => {
  const [departureId, setDepartureId] = useState('DEL');
  const [arrivalId, setArrivalId] = useState('DXB');
  const [outboundDate, setOutboundDate] = useState('2026-08-15');
  const [returnDate, setReturnDate] = useState('2026-08-22');
  const [tripType, setTripType] = useState('1');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [travelClass, setTravelClass] = useState('economy');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any[]>([]);
  const flights = selectedFlight ? [selectedFlight] : result;

  const fetchFlights = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        '/api/flights/search?' +
          new URLSearchParams({
            departure_id: departureId,
            arrival_id: arrivalId,
            outbound_date: outboundDate,
            return_date: returnDate,
            type: tripType,
            adults: adults.toString(),
            children: children.toString(),
            infants_on_lap: infants.toString(),
            travel_class: travelClass,
            currency: 'USD',
          })
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setResult(data.best_flights || []);
      message.success('Flights loaded');
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="Booking Details"
      style={{
        marginTop: 16,
        borderRadius: 10,
      }}
    >
      <Tabs
        defaultActiveKey="image"
        items={[
          {
            key: 'image',
            label: 'Upload Image',
            children: (
              <>
                <Text type="secondary">Upload itinerary, ticket, voucher or booking image.</Text>

                <div style={{ marginTop: 20 }}>
                  <Upload
                    accept="image/*"
                    maxCount={1}
                    showUploadList={false}
                    beforeUpload={(file) => {
                      onChange({
                        uid: file.uid,
                        name: file.name,
                        originFileObj: file,
                      });

                      return false;
                    }}
                  >
                    <div style={{ width: '100%' }}>
                      {value ? (
                        <div
                          className="booking-upload-preview"
                          style={{
                            position: 'relative',
                            width: '100%',
                            height: 260,
                            border: '1px dashed #d9d9d9',
                            borderRadius: 10,
                            overflow: 'hidden',
                            cursor: 'pointer',
                          }}
                        >
                          <img
                            src={
                              value.originFileObj
                                ? URL.createObjectURL(value.originFileObj as File)
                                : value.url
                            }
                            alt="Booking"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />

                          <div className="booking-upload-overlay">
                            <DeleteOutlined
                              onClick={(e) => {
                                e.stopPropagation();
                                onChange(null);
                              }}
                              style={{
                                color: '#fff',
                                fontSize: 32,
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            minHeight: 260,
                            border: '1px dashed #d9d9d9',
                            borderRadius: 10,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <InboxOutlined
                            style={{
                              fontSize: 52,
                              color: '#1677ff',
                              marginBottom: 16,
                            }}
                          />

                          <h2>Click or drag image to select</h2>

                          <Text type="secondary">JPG, PNG, WEBP (Single Image)</Text>
                        </div>
                      )}
                    </div>
                  </Upload>
                </div>
              </>
            ),
          },

          {
            key: 'api',
            label: 'Fetch Itinerary',
            children: (
              <>
                {!selectedFlight && (
                  <Card
                    size="small"
                    style={{
                      marginBottom: 20,
                      borderRadius: 12,
                      background: '#fafafa',
                    }}
                  >
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12}>
                        <Input
                          addonBefore="From"
                          placeholder="DEL"
                          value={departureId}
                          onChange={(e) => setDepartureId(e.target.value.toUpperCase())}
                        />
                      </Col>

                      <Col xs={24} md={12}>
                        <Input
                          addonBefore="To"
                          placeholder="DXB"
                          value={arrivalId}
                          onChange={(e) => setArrivalId(e.target.value.toUpperCase())}
                        />
                      </Col>

                      <Col xs={24} md={12}>
                        <Input
                          type="date"
                          value={outboundDate}
                          onChange={(e) => setOutboundDate(e.target.value)}
                        />
                      </Col>

                      <Col xs={24} md={12}>
                        <Input
                          type="date"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                        />
                      </Col>

                      <Col span={24}>
                        <Button
                          type="primary"
                          size="large"
                          block
                          loading={loading}
                          onClick={fetchFlights}
                        >
                          Search Flights
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                )}

                {loading &&
                  [...Array(3)].map((_, i) => (
                    <Card key={i} style={{ marginBottom: 16, borderRadius: 12 }}>
                      <Skeleton active avatar paragraph={{ rows: 3 }} />
                    </Card>
                  ))}

                {!loading &&
                  flights.map((flight: any, index: number) => {
                    const segment = flight.flights[0];

                    return (
                      <Card
                        key={index}
                        hoverable
                        style={{
                          marginBottom: 16,
                          borderRadius: 12,
                        }}
                      >
                        <Row align="middle" gutter={16}>
                          <Col flex="70px">
                            <img
                              src={flight.airline_logo}
                              alt={segment.airline}
                              style={{
                                width: 56,
                                height: 56,
                                objectFit: 'contain',
                              }}
                            />
                          </Col>

                          <Col flex="auto">
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                              }}
                            >
                              <div>
                                <div
                                  style={{
                                    fontSize: 18,
                                    fontWeight: 600,
                                  }}
                                >
                                  {selectedFlight && (
                                    <div
                                      style={{
                                        color: '#52c41a',
                                        fontWeight: 600,
                                        marginBottom: 6,
                                      }}
                                    >
                                      ✓ Selected Flight
                                    </div>
                                  )}
                                  {segment.airline}
                                </div>

                                <div style={{ color: '#888' }}>{segment.flight_number}</div>

                                <div style={{ marginTop: 10 }}>
                                  <strong>{segment.departure_airport.time}</strong>

                                  {'  '}
                                  {segment.departure_airport.id}

                                  <span
                                    style={{
                                      margin: '0 12px',
                                      color: '#1677ff',
                                    }}
                                  >
                                    ─────────►
                                  </span>

                                  <strong>{segment.arrival_airport.time}</strong>

                                  {'  '}
                                  {segment.arrival_airport.id}
                                </div>

                                <div
                                  style={{
                                    color: '#666',
                                    marginTop: 6,
                                  }}
                                >
                                  Duration: {flight.total_duration} min
                                </div>
                              </div>

                              <div
                                style={{
                                  textAlign: 'right',
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 26,
                                    fontWeight: 700,
                                    color: '#1677ff',
                                  }}
                                >
                                  ${flight.price}
                                </div>

                                {selectedFlight ? (
                                  <Button danger onClick={() => onFlightSelect?.(null)}>
                                    Change Flight
                                  </Button>
                                ) : (
                                  <Button type="primary" onClick={() => onFlightSelect?.(flight)}>
                                    Select Flight
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </Card>
                    );
                  })}
              </>
            ),
          },
        ]}
      />

      <style jsx>{`
        :global(.ant-upload) {
          display: block;
          width: 100%;
        }

        .booking-upload-preview .booking-upload-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        .booking-upload-preview:hover .booking-upload-overlay {
          opacity: 1;
        }
      `}</style>
    </Card>
  );
};

export default BookingDetails;
