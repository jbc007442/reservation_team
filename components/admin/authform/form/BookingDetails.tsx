'use client';
import { useState, useEffect } from 'react';

import {
  Card,
  Typography,
  Upload,
  Tabs,
  Input,
  Button,
  DatePicker,
  message,
  Skeleton,
  Select,
  Row,
  Col,
} from 'antd';
import {
  InboxOutlined,
  DeleteOutlined,
  SwapOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  SearchOutlined,
  CarOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { Booking } from '@/components/admin/booking/types';
import FlightCard from './FlightCard';
import dayjs from 'dayjs';

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
  const [tripType, setTripType] = useState('round');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [travelClass, setTravelClass] = useState('economy');
  const [loading, setLoading] = useState(false);

  const [departureFlights, setDepartureFlights] = useState<any[]>([]);
  const [returnFlights, setReturnFlights] = useState<any[]>([]);

  const [selectedDeparture, setSelectedDeparture] = useState<any>(null);
  const [selectedReturn, setSelectedReturn] = useState<any>(null);

  const [step, setStep] = useState<'departure' | 'return'>('departure');

  // useEffect(() => {
  //   if (!selectedFlight) return;

  //   setSelectedDeparture(selectedFlight.departure || null);
  //   setSelectedReturn(selectedFlight.return || null);

  //   if (selectedFlight.return) {
  //     setStep('return');
  //   }
  // }, [selectedFlight]);

  useEffect(() => {
    if (!selectedFlight) {
      setSelectedDeparture(null);
      setSelectedReturn(null);
      setStep('departure');
      return;
    }

    setSelectedDeparture(selectedFlight.departure || null);
    setSelectedReturn(selectedFlight.return || null);

    if (selectedFlight.return) {
      setStep('return');
    } else {
      setStep('departure');
    }
  }, [selectedFlight]);

  const flights = step === 'departure' ? departureFlights : returnFlights;

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
            flight_type: tripType === 'round' ? 'round_trip' : 'one_way',
            adults: adults.toString(),
            children: children.toString(),
            infants_on_lap: infants.toString(),
            travel_class: travelClass === 'first' ? 'first_class' : travelClass,
            currency: 'USD',
          })
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setDepartureFlights(data.best_flights || []);
      setReturnFlights([]);

      setSelectedDeparture(null);
      setSelectedReturn(null);

      setStep('departure');
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
        onChange={(key) => {
          if (key === 'api') {
            onChange(null); // Clear uploaded image
          }

          if (key === 'image') {
            onFlightSelect?.(null); // Clear itinerary
          }
        }}
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
                      onFlightSelect?.(null); // Clear selected itinerary

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
                {!selectedFlight ? (
                  <Card
                    bordered={false}
                    style={{
                      borderRadius: 20,
                      background: '#f8fafc',
                      marginBottom: 24,
                      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    }}
                  >
                    {/* Top Options */}
                    <Row gutter={16} style={{ marginBottom: 20 }}>
                      <Col xs={24} sm={12} md={5}>
                        <Select
                          size="large"
                          value={tripType}
                          onChange={setTripType}
                          style={{ width: '100%' }}
                          suffixIcon={<SwapOutlined />}
                          options={[
                            { value: 'round', label: 'Round Trip' },
                            { value: 'oneway', label: 'One Way' },
                          ]}
                        />
                      </Col>

                      <Col xs={24} sm={12} md={6}>
                        <Select
                          size="large"
                          value={travelClass}
                          onChange={setTravelClass}
                          style={{ width: '100%' }}
                          suffixIcon={<CarOutlined />}
                          options={[
                            { value: 'economy', label: 'Economy' },
                            { value: 'premium_economy', label: 'Premium Economy' },
                            { value: 'business', label: 'Business' },
                            { value: 'first', label: 'First Class' },
                          ]}
                        />
                      </Col>
                    </Row>

                    {/* Search Fields */}
                    <Row gutter={16} align="middle">
                      <Col xs={24} md={6}>
                        <Input
                          size="large"
                          prefix={<EnvironmentOutlined />}
                          placeholder="From"
                          value={departureId}
                          onChange={(e) => setDepartureId(e.target.value.toUpperCase())}
                          style={{ height: 54, borderRadius: 14 }}
                        />
                      </Col>

                      <Col
                        xs={24}
                        md={1}
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        <Button
                          shape="circle"
                          icon={<SwapOutlined />}
                          size="large"
                          onClick={() => {
                            const temp = departureId;
                            setDepartureId(arrivalId);
                            setArrivalId(temp);
                          }}
                        />
                      </Col>

                      <Col xs={24} md={6}>
                        <Input
                          size="large"
                          prefix={<EnvironmentOutlined />}
                          placeholder="To"
                          value={arrivalId}
                          onChange={(e) => setArrivalId(e.target.value.toUpperCase())}
                          style={{ height: 54, borderRadius: 14 }}
                        />
                      </Col>

                      <Col xs={24} md={5}>
                        <DatePicker
                          size="large"
                          placeholder="Departure"
                          style={{
                            width: '100%',
                            height: 54,
                            borderRadius: 14,
                          }}
                          suffixIcon={<CalendarOutlined />}
                          value={outboundDate ? dayjs(outboundDate) : null}
                          onChange={(d) => setOutboundDate(d?.format('YYYY-MM-DD') || '')}
                        />
                      </Col>

                      {tripType === 'round' && (
                        <Col xs={24} md={5}>
                          <DatePicker
                            size="large"
                            placeholder="Return"
                            style={{
                              width: '100%',
                              height: 54,
                              borderRadius: 14,
                            }}
                            suffixIcon={<CalendarOutlined />}
                            value={returnDate ? dayjs(returnDate) : null}
                            onChange={(d) => setReturnDate(d?.format('YYYY-MM-DD') || '')}
                          />
                        </Col>
                      )}
                    </Row>

                    <div
                      style={{
                        marginTop: 28,
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                    >
                      <Button
                        type="primary"
                        size="large"
                        shape="round"
                        icon={<SearchOutlined />}
                        loading={loading}
                        onClick={fetchFlights}
                        style={{
                          minWidth: 220,
                          height: 52,
                          fontWeight: 600,
                          fontSize: 16,
                        }}
                      >
                        Search Flights
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <Button
                      danger
                      onClick={() => {
                        onFlightSelect?.(null);

                        setSelectedDeparture(null);
                        setSelectedReturn(null);

                        setDepartureFlights([]);
                        setReturnFlights([]);

                        setStep('departure');
                      }}
                    >
                      Change Itinerary
                    </Button>
                  </div>
                )}

                {loading &&
                  [...Array(3)].map((_, i) => (
                    <Card key={i} style={{ marginBottom: 16, borderRadius: 12 }}>
                      <Skeleton active avatar paragraph={{ rows: 3 }} />
                    </Card>
                  ))}

                {step === 'return' && selectedDeparture && (
                  <>
                    <h2 style={{ marginBottom: 16 }}>Selected Departure Flight</h2>

                    <FlightCard flight={selectedDeparture} selected showButton={false} />

                    <h2 style={{ marginBottom: 16 }}>Select Return Flight</h2>
                  </>
                )}

                {!loading &&
                  (step === 'return' && selectedReturn ? [selectedReturn] : flights).map(
                    (flight: any, index: number) => {
                      const isSelected =
                        selectedReturn?.flights?.[0]?.flight_number ===
                          flight.flights?.[0]?.flight_number &&
                        selectedReturn?.flights?.[0]?.departure_airport?.time ===
                          flight.flights?.[0]?.departure_airport?.time;

                      return (
                        <FlightCard
                          key={index}
                          flight={flight}
                          selected={isSelected}
                          showButton={!isSelected}
                          loading={loading}
                          buttonText={
                            isSelected
                              ? 'Selected'
                              : step === 'departure'
                                ? 'Select Departure'
                                : 'Select Return'
                          }
                          onClick={async () => {
                            if (step === 'departure') {
                              // One Way: save immediately
                              if (tripType === 'oneway') {
                                const itinerary = {
                                  tripType,
                                  departure: flight,
                                  return: null,
                                };

                                setSelectedDeparture(flight);
                                setSelectedReturn(null);

                                onChange(null); // Clear uploaded image
                                onFlightSelect?.(itinerary);

                                message.success('Flight selected');
                                return;
                              }

                              // Round Trip: continue to fetch return flights
                              try {
                                setLoading(true);

                                setSelectedDeparture(flight);

                                const params = new URLSearchParams({
                                  departure_token: flight.departure_token,
                                  departure_id: departureId,
                                  arrival_id: arrivalId,
                                  outbound_date: outboundDate,
                                  return_date: returnDate,
                                  flight_type: 'round_trip',
                                  adults: adults.toString(),
                                  children: children.toString(),
                                  infants_on_lap: infants.toString(),
                                  travel_class:
                                    travelClass === 'first' ? 'first_class' : travelClass,
                                  currency: 'USD',
                                });

                                const res = await fetch(`/api/flights/return?${params.toString()}`);

                                const data = await res.json();

                                if (!res.ok) {
                                  throw new Error(data.error || 'Unable to load return flights');
                                }

                                setReturnFlights(data.best_flights || []);
                                setStep('return');

                                message.success('Select your return flight');
                              } catch (err: any) {
                                message.error(err.message);
                              } finally {
                                setLoading(false);
                              }
                            } else {
                              const itinerary = {
                                tripType,
                                departure: selectedDeparture,
                                return: flight,
                              };

                              setSelectedReturn(flight);

                              onChange(null);
                              onFlightSelect?.(itinerary);

                              message.success('Round-trip itinerary selected');
                            }
                          }}
                        />
                      );
                    }
                  )}
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
