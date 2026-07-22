'use client';

import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Row,
  Skeleton,
  Table,
  Tag,
  Typography,
} from 'antd';
import { ArrowLeftOutlined, DownloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title } = Typography;

interface Props {
  id: string;
}

export default function AuthView({ id }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authForm, setAuthForm] = useState<any>();

  useEffect(() => {
    fetchAuthForm();
  }, [id]);

  async function fetchAuthForm() {
    try {
      const res = await fetch(`/api/authform/${id}`);
      const json = await res.json();

      if (json.success) {
        setAuthForm(json.data);
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Skeleton active paragraph={{ rows: 15 }} />;

  if (!authForm) return <>Not Found</>;

  return (
    <>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
            Back
          </Button>
        </Col>

        <Col>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => window.open(`/api/authform/${id}/pdf`, '_blank')}
          >
            Download PDF
          </Button>
        </Col>
      </Row>

      <Title level={3}>Authorization Form</Title>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Customer Details">
            <Descriptions column={1}>
              <Descriptions.Item label="Name">{authForm.bookingId.customer.name}</Descriptions.Item>

              <Descriptions.Item label="Email">
                {authForm.bookingId.customer.email}
              </Descriptions.Item>

              <Descriptions.Item label="Mobile">
                {authForm.bookingId.customer.mobile}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Booking Details">
            <Descriptions column={1}>
              <Descriptions.Item label="Booking No">
                {authForm.bookingId.bookingNo}
              </Descriptions.Item>

              <Descriptions.Item label="Booking Type">{authForm.bookingType}</Descriptions.Item>

              <Descriptions.Item label="Service">{authForm.serviceType}</Descriptions.Item>

              <Descriptions.Item label="Status">
                <Tag color="green">{authForm.approval.status}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="Itinerary Details">
            {authForm.bookingDetails ? (
              <div
                className="pnr-itinerary"
                dangerouslySetInnerHTML={{
                  __html: authForm.bookingDetails,
                }}
              />
            ) : (
              <Descriptions column={2}>
                <Descriptions.Item label="From">
                  {authForm.bookingId?.journey?.fromCity || '-'}
                </Descriptions.Item>

                <Descriptions.Item label="To">
                  {authForm.bookingId?.journey?.toCity || '-'}
                </Descriptions.Item>

                <Descriptions.Item label="Departure">
                  {authForm.bookingId?.journey?.departureDate || '-'}
                </Descriptions.Item>

                <Descriptions.Item label="Return">
                  {authForm.bookingId?.journey?.returnDate || '-'}
                </Descriptions.Item>

                <Descriptions.Item label="Adults">
                  {authForm.bookingId?.journey?.adults || 0}
                </Descriptions.Item>

                <Descriptions.Item label="Children">
                  {authForm.bookingId?.journey?.child || 0}
                </Descriptions.Item>

                <Descriptions.Item label="Infants">
                  {authForm.bookingId?.journey?.infant || 0}
                </Descriptions.Item>

                <Descriptions.Item label="Trip Type">
                  {authForm.bookingId?.journey?.tripType || '-'}
                </Descriptions.Item>
              </Descriptions>
            )}
          </Card>
        </Col>
      </Row>

      <Divider />

      <Card title="Passengers">
        <Table
          rowKey="_id"
          pagination={false}
          dataSource={authForm.passengers}
          columns={[
            {
              title: 'Title',
              dataIndex: 'title',
            },
            {
              title: 'First Name',
              dataIndex: 'firstName',
            },
            {
              title: 'Last Name',
              dataIndex: 'lastName',
            },
            {
              title: 'DOB',
              dataIndex: 'dob',
            },
            {
              title: 'Passport',
              dataIndex: 'passportNumber',
            },
          ]}
        />
      </Card>

      <Divider />

      <Card title="Billing">
        <Table
          rowKey="_id"
          pagination={false}
          dataSource={authForm.charges}
          columns={[
            {
              title: 'Description',
              dataIndex: 'label',
            },
            {
              title: 'Amount',
              dataIndex: 'amount',
            },
          ]}
        />
      </Card>

      <Divider />

      <Card title="Card Details">
        <Table
          rowKey="_id"
          pagination={false}
          dataSource={authForm.cards}
          columns={[
            {
              title: 'Card Holder',
              dataIndex: 'cardHolder',
            },
            {
              title: 'Card Type',
              dataIndex: 'cardType',
            },
            {
              title: 'Amount',
              dataIndex: 'amount',
            },
          ]}
        />
      </Card>

      <Divider />

      <Card title="Terms & Conditions">
        <div
          dangerouslySetInnerHTML={{
            __html: authForm.terms || '',
          }}
        />
      </Card>

      <Divider />

      <Card title="Approval Details">
        <Descriptions column={2}>
          <Descriptions.Item label="Status">{authForm.approval.status}</Descriptions.Item>

          <Descriptions.Item label="Approved At">{authForm.approval.approvedAt}</Descriptions.Item>

          <Descriptions.Item label="IP Address">
            {authForm.approval.approvedBy?.ipAddress}
          </Descriptions.Item>

          <Descriptions.Item label="Browser">
            {authForm.approval.approvedBy?.userAgent}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </>
  );
}
