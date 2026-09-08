'use client';

import { useEffect, useState } from 'react';

import { Booking } from '@/components/admin/booking/types';

import {
  CalendarOutlined,
  CarOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  InboxOutlined,
  SearchOutlined,
  SwapOutlined,
} from '@ant-design/icons';

import {
  Button,
  Card,
  Col,
  DatePicker,
  Input,
  message,
  Row,
  Select,
  Skeleton,
  Tabs,
  Typography,
  Upload,
} from 'antd';

import type { UploadFile } from 'antd/es/upload/interface';

import dayjs from 'dayjs';

import FlightCard from './flight/FlightCard';

const { Text } = Typography;

interface BookingDetailsProps {
  booking: Booking;

  value: UploadFile[];

  onChange: (files: UploadFile[]) => void;

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
  const [departureId, setDepartureId] = useState('');

  const [arrivalId, setArrivalId] = useState('');

  const [outboundDate, setOutboundDate] = useState('');

  const [returnDate, setReturnDate] = useState('');

  const [tripType, setTripType] = useState('round');

  const [adults, setAdults] = useState(1);

  const [children, setChildren] = useState(0);

  const [infants, setInfants] = useState(0);

  const [travelClass, setTravelClass] = useState('economy');

  const [loading, setLoading] = useState(false);

  const [departureFlights, setDepartureFlights] = useState<any[]>([]);

  const [returnFlights, setReturnFlights] = useState<any[]>([]);

  const [selectedStops, setSelectedStops] = useState<string[]>([]);

  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);

  const [selectedDeparture, setSelectedDeparture] = useState<any>(null);

  const [selectedReturn, setSelectedReturn] = useState<any>(null);

  const [step, setStep] = useState<'departure' | 'return'>('departure');

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

  const allFlights = step === 'departure' ? departureFlights : returnFlights;

  const airlines = [...new Set(allFlights.map((f) => f.flights?.[0]?.airline))];

  const flights = allFlights.filter((flight) => {
    const stops = Math.max(0, (flight.flights?.length || 1) - 1);

    const airline = flight.flights?.[0]?.airline;

    const stopMatch = selectedStops.length === 0 || selectedStops.includes(String(stops));

    const airlineMatch = selectedAirlines.length === 0 || selectedAirlines.includes(airline);

    return stopMatch && airlineMatch;
  });

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

  /**
   * Add multiple selected images.
   */
  const handleImageUpload = (fileList: UploadFile[]) => {
    onFlightSelect?.(null);

    const newFiles = fileList.map((file) => ({
      uid: file.uid,
      name: file.name,
      status: 'done' as const,
      originFileObj: file.originFileObj,
      url: file.url,
      thumbUrl: file.thumbUrl,
    }));

    onChange(newFiles);
  };

  /**
   * Remove one image.
   */
  const removeImage = (uid: string) => {
    const updatedFiles = value.filter((file) => file.uid !== uid);

    onChange(updatedFiles);
  };

  /**
   * Preview URL for uploaded or
   * API-loaded images.
   */
  const getImageUrl = (file: UploadFile) => {
    if (file.url) {
      return file.url;
    }

    if (file.thumbUrl) {
      return file.thumbUrl;
    }

    if (file.originFileObj) {
      return URL.createObjectURL(file.originFileObj as File);
    }

    return '';
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
            onChange([]);
          }

          if (key === 'image') {
            onFlightSelect?.(null);
          }
        }}
        items={[
          {
            key: 'image',
            label: 'Upload Images',
            children: (
              <>
                <Text type="secondary">Upload itinerary, ticket, voucher or booking images.</Text>

                <div
                  style={{
                    marginTop: 20,
                  }}
                >
                  <Upload
                    accept="image/*"
                    multiple
                    showUploadList={false}
                    beforeUpload={() => false}
                    onChange={({ fileList }) => {
                      handleImageUpload(fileList);
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        minHeight: 220,
                        border: '1px dashed #d9d9d9',
                        borderRadius: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 30,
                      }}
                    >
                      <InboxOutlined
                        style={{
                          fontSize: 52,
                          color: '#1677ff',
                          marginBottom: 16,
                        }}
                      />

                      <h2>Click or drag images to select</h2>

                      <Text type="secondary">JPG, PNG, WEBP — Multiple Images</Text>
                    </div>
                  </Upload>
                </div>

                {/* IMAGE PREVIEWS */}
                {value.length > 0 && (
                  <div
                    style={{
                      marginTop: 24,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                      gap: 16,
                    }}
                  >
                    {value.map((file) => {
                      const imageUrl = getImageUrl(file);

                      return (
                        <div
                          key={file.uid}
                          style={{
                            position: 'relative',
                            width: '100%',
                            height: 220,
                            border: '1px solid #e5e7eb',
                            borderRadius: 10,
                            overflow: 'hidden',
                            background: '#f8fafc',
                          }}
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={file.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Text type="secondary">Preview unavailable</Text>
                            </div>
                          )}

                          {/* IMAGE NAME */}
                          <div
                            style={{
                              position: 'absolute',
                              left: 0,
                              right: 0,
                              bottom: 0,
                              padding: '8px 45px 8px 10px',
                              background: 'rgba(0,0,0,0.55)',
                              color: '#fff',
                              fontSize: 13,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {file.name}
                          </div>

                          {/* DELETE */}
                          <Button
                            danger
                            type="primary"
                            shape="circle"
                            icon={<DeleteOutlined />}
                            onClick={() => removeImage(file.uid)}
                            style={{
                              position: 'absolute',
                              top: 10,
                              right: 10,
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {value.length > 0 && (
                  <Text
                    type="secondary"
                    style={{
                      display: 'block',
                      marginTop: 12,
                    }}
                  >
                    {value.length} image
                    {value.length !== 1 ? 's' : ''} selected
                  </Text>
                )}
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
                    <Row
                      gutter={16}
                      style={{
                        marginBottom: 20,
                      }}
                    >
                      <Col xs={24} sm={12} md={5}>
                        <Select
                          size="large"
                          value={tripType}
                          onChange={setTripType}
                          style={{
                            width: '100%',
                          }}
                          suffixIcon={<SwapOutlined />}
                          options={[
                            {
                              value: 'round',
                              label: 'Round Trip',
                            },
                            {
                              value: 'oneway',
                              label: 'One Way',
                            },
                          ]}
                        />
                      </Col>

                      <Col xs={24} sm={12} md={6}>
                        <Select
                          size="large"
                          value={travelClass}
                          onChange={setTravelClass}
                          style={{
                            width: '100%',
                          }}
                          suffixIcon={<CarOutlined />}
                          options={[
                            {
                              value: 'economy',
                              label: 'Economy',
                            },
                            {
                              value: 'premium_economy',
                              label: 'Premium Economy',
                            },
                            {
                              value: 'business',
                              label: 'Business',
                            },
                            {
                              value: 'first',
                              label: 'First Class',
                            },
                          ]}
                        />
                      </Col>
                    </Row>

                    <Row gutter={16} align="middle">
                      <Col xs={24} md={6}>
                        <Input
                          size="large"
                          prefix={<EnvironmentOutlined />}
                          placeholder="From"
                          value={departureId}
                          onChange={(e) => setDepartureId(e.target.value.toUpperCase())}
                          style={{
                            height: 54,
                            borderRadius: 14,
                          }}
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
                          style={{
                            height: 54,
                            borderRadius: 14,
                          }}
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
                  <div
                    style={{
                      textAlign: 'center',
                      marginBottom: 20,
                    }}
                  >
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

                {allFlights.length > 0 && (
                  <Card
                    size="small"
                    style={{
                      marginBottom: 20,
                      borderRadius: 12,
                    }}
                  >
                    <Row gutter={24}>
                      <Col xs={24} md={8}>
                        <div
                          style={{
                            fontWeight: 600,
                            marginBottom: 8,
                          }}
                        >
                          Stops
                        </div>

                        <Select
                          mode="multiple"
                          allowClear
                          placeholder="All Stops"
                          style={{
                            width: '100%',
                          }}
                          value={selectedStops}
                          onChange={setSelectedStops}
                          options={[
                            {
                              value: '0',
                              label: 'Nonstop',
                            },
                            {
                              value: '1',
                              label: '1 Stop',
                            },
                            {
                              value: '2',
                              label: '2+ Stops',
                            },
                          ]}
                        />
                      </Col>

                      <Col xs={24} md={16}>
                        <div
                          style={{
                            fontWeight: 600,
                            marginBottom: 8,
                          }}
                        >
                          Airlines
                        </div>

                        <Select
                          mode="multiple"
                          allowClear
                          placeholder="All Airlines"
                          style={{
                            width: '100%',
                          }}
                          value={selectedAirlines}
                          onChange={setSelectedAirlines}
                          options={airlines.map((airline) => ({
                            value: airline,
                            label: airline,
                          }))}
                        />
                      </Col>
                    </Row>
                  </Card>
                )}

                {loading &&
                  [...Array(3)].map((_, i) => (
                    <Card
                      key={i}
                      style={{
                        marginBottom: 16,
                        borderRadius: 12,
                      }}
                    >
                      <Skeleton
                        active
                        avatar
                        paragraph={{
                          rows: 3,
                        }}
                      />
                    </Card>
                  ))}

                {step === 'return' && selectedDeparture && (
                  <>
                    <h2
                      style={{
                        marginBottom: 16,
                      }}
                    >
                      Selected Departure Flight
                    </h2>

                    <FlightCard flight={selectedDeparture} selected showButton={false} />

                    <h2
                      style={{
                        marginBottom: 16,
                      }}
                    >
                      Select Return Flight
                    </h2>
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
                              if (tripType === 'oneway') {
                                const itinerary = {
                                  tripType,
                                  departure: flight,
                                  return: null,
                                };

                                setSelectedDeparture(flight);

                                setSelectedReturn(null);

                                onChange([]);

                                onFlightSelect?.(itinerary);

                                message.success('Flight selected');

                                return;
                              }

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

                              onChange([]);

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
      `}</style>
    </Card>
  );
};

export default BookingDetails;
