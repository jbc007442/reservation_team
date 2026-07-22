'use client';

import { SearchOutlined } from '@ant-design/icons';
import { Col, Input, Row, Typography } from 'antd';

const { Title, Text } = Typography;

interface HeaderProps {
  total: number;
  search: string;
  onSearch: (value: string) => void;
}

export default function Header({ total, search, onSearch }: HeaderProps) {
  return (
    <Row
      justify="space-between"
      align="middle"
      gutter={[16, 16]}
      style={{
        marginBottom: 20,
      }}
    >
      <Col>
        <Title
          level={4}
          style={{
            marginBottom: 4,
          }}
        >
          Authorization Forms
        </Title>

        <Text type="secondary">Total Forms: {total}</Text>
      </Col>

      <Col>
        <Input
          allowClear
          value={search}
          prefix={<SearchOutlined />}
          placeholder="Search authorization form..."
          style={{
            width: 320,
          }}
          onChange={(e) => onSearch(e.target.value)}
        />
      </Col>
    </Row>
  );
}
