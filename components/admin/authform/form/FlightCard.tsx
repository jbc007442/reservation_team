'use client';

import { Card, Row, Col, Button } from 'antd';

interface FlightCardProps {
  flight: any;
  selected?: boolean;
  showButton?: boolean;
  buttonText?: string;
  loading?: boolean;
  onClick?: () => void;
}

const FlightCard = ({
  flight,
  selected = false,
  showButton = true,
  buttonText = 'Select Flight',
  loading = false,
  onClick,
}: FlightCardProps) => {
  const segment = flight.flights[0];

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

 return (
   <Card
     hoverable={!selected}
     style={{
       marginBottom: 16,
       borderRadius: 14,
       border: selected ? '2px solid #52c41a' : '1px solid #e5e7eb',
       background: selected ? '#f6ffed' : '#fff',
     }}
   >
     <Row align="middle" gutter={24}>
       {/* Airline */}
       <Col xs={24} md={5}>
         <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
           <img
             src={flight.airline_logo}
             alt={segment.airline}
             style={{
               width: 48,
               height: 48,
               objectFit: 'contain',
             }}
           />

           <div>
             <div
               style={{
                 fontWeight: 600,
                 fontSize: 16,
               }}
             >
               {segment.airline}
             </div>

             <div
               style={{
                 color: '#888',
                 fontSize: 13,
               }}
             >
               {segment.flight_number}
             </div>

             <div
               style={{
                 color: '#16a34a',
                 fontSize: 12,
                 marginTop: 2,
               }}
             >
               {segment.travel_class}
             </div>
           </div>
         </div>
       </Col>

       {/* Flight Timing */}
       <Col xs={24} md={13}>
         <Row align="middle">
           <Col span={7} style={{ textAlign: 'center' }}>
             <div
               style={{
                 fontSize: 24,
                 fontWeight: 700,
               }}
             >
               {segment.departure_airport.time}
             </div>

             <div>{segment.departure_airport.id}</div>
           </Col>

           <Col span={10} style={{ textAlign: 'center' }}>
             <div
               style={{
                 color: '#666',
                 fontSize: 13,
                 marginBottom: 6,
               }}
             >
               {formatDuration(flight.total_duration)}
             </div>

             <div
               style={{
                 borderTop: '2px solid #d9d9d9',
                 position: 'relative',
                 margin: '0 12px',
               }}
             >
               <span
                 style={{
                   position: 'absolute',
                   top: -10,
                   right: -2,
                   color: '#1677ff',
                   fontSize: 18,
                 }}
               >
                 ✈
               </span>
             </div>

             <div
               style={{
                 color: '#666',
                 fontSize: 13,
                 marginTop: 6,
               }}
             >
               {segment.stops === 0 ? 'Non-stop' : `${segment.stops || 1} Stop`}
             </div>
           </Col>

           <Col span={7} style={{ textAlign: 'center' }}>
             <div
               style={{
                 fontSize: 24,
                 fontWeight: 700,
               }}
             >
               {segment.arrival_airport.time}
             </div>

             <div>{segment.arrival_airport.id}</div>
           </Col>
         </Row>

         <div
           style={{
             marginTop: 14,
             display: 'flex',
             gap: 10,
             flexWrap: 'wrap',
           }}
         >
           <span
             style={{
               background: '#f3f4f6',
               padding: '4px 10px',
               borderRadius: 20,
               fontSize: 12,
             }}
           >
             Cabin: {segment.travel_class}
           </span>

           {segment.airplane && (
             <span
               style={{
                 background: '#f3f4f6',
                 padding: '4px 10px',
                 borderRadius: 20,
                 fontSize: 12,
               }}
             >
               {segment.airplane}
             </span>
           )}

           {flight.extensions?.[0] && (
             <span
               style={{
                 background: '#ecfeff',
                 color: '#0369a1',
                 padding: '4px 10px',
                 borderRadius: 20,
                 fontSize: 12,
               }}
             >
               {flight.extensions[0]}
             </span>
           )}
         </div>
       </Col>

       {/* Action */}
       <Col xs={24} md={6}>
         <div
           style={{
             display: 'flex',
             justifyContent: 'center',
             alignItems: 'center',
             height: '100%',
           }}
         >
           {showButton && (
             <Button
               type={selected ? 'default' : 'primary'}
               size="large"
               loading={loading}
               disabled={selected}
               onClick={onClick}
             >
               {buttonText}
             </Button>
           )}
         </div>
       </Col>
     </Row>
   </Card>
 );
};

export default FlightCard;
