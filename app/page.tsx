'use client';

import { Button, Card, Layout, Menu, Typography, Row, Col, Space } from 'antd';
import {
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  CompassOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;

export default function HomePage() {
  return (
    <Layout className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        style={{
          background: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 40px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}
      >
        <Space size={8}>
          <CompassOutlined style={{ fontSize: '24px', color: '#1677ff' }} />
          <Title level={3} style={{ margin: 0, color: '#1677ff', fontWeight: 700 }}>
            Travel CRM
          </Title>
        </Space>

        <Menu
          mode="horizontal"
          selectable={false}
          items={[
            { key: '1', label: 'Home' },
            { key: '2', label: 'Packages' },
            { key: '3', label: 'Flights' },
            { key: '4', label: 'Hotels' },
            { key: '5', label: 'Contact' },
          ]}
          style={{ flex: 1, justifyContent: 'center', border: 0, background: 'transparent' }}
        />

        <Space>
          <Button type="default" href="/login">
            Login
          </Button>
          <Button type="primary" href="/register">
            Get Started
          </Button>
        </Space>
      </Header>

      {/* Hero Section */}
      <Content>
        <div
          style={{
            minHeight: '85vh',
            background: 'linear-gradient(135deg, #0958d9 0%, #1677ff 50%, #36cfc9 100%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#fff',
            textAlign: 'center',
            padding: '40px 20px',
          }}
        >
          <div style={{ maxWidth: 900 }}>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 500,
                display: 'inline-block',
                marginBottom: '20px',
                backdropFilter: 'blur(4px)',
              }}
            >
              🌍 Your Complete Travel Ecosystem
            </span>
            <Title
              style={{
                color: '#fff',
                fontSize: 'clamp(36px, 5vw, 56px)',
                fontWeight: 800,
                marginBottom: 20,
              }}
            >
              Explore the World with Confidence
            </Title>

            <Paragraph
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: 'clamp(16px, 2vw, 20px)',
                maxWidth: 750,
                margin: '0 auto 35px auto',
              }}
            >
              Flight Booking • Hotel Booking • Tour Packages • Visa Assistance • Travel Insurance
            </Paragraph>

            <Space size="middle">
              <Button
                type="primary"
                size="large"
                style={{
                  height: 48,
                  padding: '0 32px',
                  fontSize: 16,
                  background: '#fff',
                  color: '#1677ff',
                  fontWeight: 600,
                }}
              >
                Book Now <ArrowRightOutlined />
              </Button>
              <Button ghost size="large" style={{ height: 48, padding: '0 24px', fontSize: 16 }}>
                View Packages
              </Button>
            </Space>
          </div>
        </div>

        {/* Services Section */}
        <div style={{ padding: '80px 40px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <Text
              type="secondary"
              style={{ textTransform: 'uppercase', letterSpacing: 2, fontWeight: 600 }}
            >
              What We Offer
            </Text>
            <Title level={2} style={{ marginTop: 8, fontWeight: 700 }}>
              Our Premium Services
            </Title>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Card
                hoverable
                style={{ height: '100%', borderRadius: 12, border: '1px solid #f0f0f0' }}
                bodyStyle={{ padding: 32 }}
              >
                <div style={{ fontSize: 36, marginBottom: 16 }}>✈️</div>
                <Title level={4}>Flights</Title>
                <Paragraph type="secondary">
                  Seamless domestic and international flight booking with exclusive airline deals
                  and instant ticketing.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card
                hoverable
                style={{ height: '100%', borderRadius: 12, border: '1px solid #f0f0f0' }}
                bodyStyle={{ padding: 32 }}
              >
                <div style={{ fontSize: 36, marginBottom: 16 }}>🏨</div>
                <Title level={4}>Hotels</Title>
                <Paragraph type="secondary">
                  Handpicked accommodations ranging from budget stays to luxury resorts worldwide at
                  guaranteed best prices.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card
                hoverable
                style={{ height: '100%', borderRadius: 12, border: '1px solid #f0f0f0' }}
                bodyStyle={{ padding: 32 }}
              >
                <div style={{ fontSize: 36, marginBottom: 16 }}>🌴</div>
                <Title level={4}>Holiday Packages</Title>
                <Paragraph type="secondary">
                  Customized tour packages tailored for families, honeymooners, and corporate
                  retreats with end-to-end management.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>

      {/* Footer */}
      <Footer
        style={{
          background: '#001529',
          color: '#fff',
          padding: '60px 40px 24px 40px',
        }}
      >
        <Row gutter={[32, 32]} style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Col xs={24} md={8}>
            <Space size={8} style={{ marginBottom: 12 }}>
              <CompassOutlined style={{ fontSize: '20px', color: '#1677ff' }} />
              <Title level={4} style={{ color: '#fff', margin: 0 }}>
                Travel CRM
              </Title>
            </Space>

            <Paragraph style={{ color: '#aaa', maxWidth: 300 }}>
              Your trusted travel partner for comprehensive Flights, Hotels, Tours, and Visa
              services worldwide.
            </Paragraph>
          </Col>

          <Col xs={24} md={8}>
            <Title level={5} style={{ color: '#fff', marginBottom: 16 }}>
              Contact Us
            </Title>

            <Space direction="vertical" size={12} style={{ color: '#aaa' }}>
              <div>
                <PhoneOutlined style={{ marginRight: 8, color: '#1677ff' }} /> +91 98765 43210
              </div>
              <div>
                <MailOutlined style={{ marginRight: 8, color: '#1677ff' }} /> info@travelcrm.com
              </div>
              <div>
                <EnvironmentOutlined style={{ marginRight: 8, color: '#1677ff' }} /> Raigarh,
                Chhattisgarh
              </div>
            </Space>
          </Col>

          <Col xs={24} md={8}>
            <Title level={5} style={{ color: '#fff', marginBottom: 16 }}>
              Quick Links
            </Title>

            <Space direction="vertical" size={8}>
              <a href="#flights" style={{ color: '#aaa' }}>
                Flights Booking
              </a>
              <a href="#hotels" style={{ color: '#aaa' }}>
                Hotels & Resorts
              </a>
              <a href="#packages" style={{ color: '#aaa' }}>
                Holiday Packages
              </a>
              <a href="#visa" style={{ color: '#aaa' }}>
                Visa Assistance
              </a>
            </Space>
          </Col>
        </Row>

        <div
          style={{
            maxWidth: 1200,
            margin: '40px auto 0 auto',
            textAlign: 'center',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: 20,
            color: '#777',
          }}
        >
          © 2026 Travel CRM. All Rights Reserved.
        </div>
      </Footer>
    </Layout>
  );
}
