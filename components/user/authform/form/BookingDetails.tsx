'use client';

import { Card, Typography, Upload } from 'antd';
import { InboxOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { Booking } from '@/components/user/booking/types';

const { Text } = Typography;

interface BookingDetailsProps {
  booking: Booking;
  value: UploadFile | null;
  onChange: (file: UploadFile | null) => void;
}

const BookingDetails = ({ booking, value, onChange }: BookingDetailsProps) => {
  return (
    <Card
      title="Booking Details"
      style={{
        marginTop: 16,
        borderRadius: 10,
      }}
    >
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
                    display: 'block',
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
                  padding: 24,
                  textAlign: 'center',
                }}
              >
                <InboxOutlined
                  style={{
                    fontSize: 52,
                    color: '#1677ff',
                    marginBottom: 16,
                  }}
                />

                <h2 style={{ margin: 0, marginBottom: 8 }}>Click or drag image to select</h2>

                <Text type="secondary">JPG, PNG, WEBP (Single Image)</Text>
              </div>
            )}
          </div>
        </Upload>
      </div>

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
