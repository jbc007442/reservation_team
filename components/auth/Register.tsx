'use client';

import { useMemo } from 'react';
import { z } from 'zod';
import axios from 'axios';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Button, Card, Input, Typography, message, Divider } from 'antd';

import {
  IdcardOutlined,
  UserOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterForm = z.infer<typeof schema>;

export default function Register() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      password: '',
    },
  });

  const name = useWatch({
    control,
    name: 'name',
  });

  const previewId = useMemo(() => {
    const now = new Date();

    const date =
      String(now.getFullYear()).slice(2) +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0');

    const prefix = name
      ? name
          .replace(/[^a-zA-Z]/g, '')
          .substring(0, 3)
          .toUpperCase()
      : 'XXX';

    return `EMP-${prefix}-${date}-XXXX`;
  }, [name]);

  const onSubmit = async (values: RegisterForm) => {
    try {
      const { data } = await axios.post('/api/auth/register', values);

      message.success(data.message);

      reset();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Registration Failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <Card
        className="w-full max-w-lg rounded-3xl border-0 shadow-2xl backdrop-blur-xl"
        styles={{
          body: {
            padding: 40,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 24,
          },
        }}
      >
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl">
            <SafetyCertificateOutlined
              style={{
                fontSize: 38,
              }}
            />
          </div>

          <Title
            level={2}
            style={{
              color: 'white',
              marginBottom: 5,
            }}
          >
            Employee Registration
          </Title>

          <Text style={{ color: '#cbd5e1' }}>Secure Employee Management Portal</Text>
        </div>

        <Divider />

        <div className="mb-6">
          <Text
            style={{
              color: '#94a3b8',
            }}
          >
            Employee ID
          </Text>

          <Input
            size="large"
            readOnly
            value={previewId}
            prefix={<IdcardOutlined />}
            className="mt-2"
          />

          <Text
            style={{
              fontSize: 12,
              color: '#94a3b8',
            }}
          >
            Automatically generated after registration
          </Text>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <>
                <Input
                  {...field}
                  size="large"
                  placeholder="Full Name"
                  prefix={<UserOutlined />}
                  status={errors.name ? 'error' : ''}
                />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
              </>
            )}
          />
   

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <>
                <Input.Password
                  {...field}
                  size="large"
                  placeholder="Password"
                  prefix={<LockOutlined />}
                  status={errors.password ? 'error' : ''}
                />
              </>
            )}
          />

          <Button
            htmlType="submit"
            size="large"
            loading={isSubmitting}
            block
            style={{
              height: 52,
              borderRadius: 12,
              background: 'linear-gradient(90deg,#2563eb,#06b6d4)',
              border: 0,
              fontWeight: 600,
            }}
          >
            Create Employee Account
          </Button>
        </form>
        <Divider />

        <div className="space-y-2 text-center">
          <Text type="secondary" className="block">
            Employee Management System
          </Text>

          <Text type="secondary">
            Don't have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Login Now
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
}
