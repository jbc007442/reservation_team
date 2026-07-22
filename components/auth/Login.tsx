'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';

import { Button, Card, Divider, Input, Typography, message } from 'antd';

import {
  MailOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  LoginOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';




const { Title, Text } = Typography;

const schema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof schema>;

export default function Login() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginForm) => {
    try {
      const { data } = await axios.post('/api/auth/login', values);

      // Fetch current user
      const me = await axios.get('/api/auth/me');

      // Save user in Zustand
      setUser(me.data.user);

      message.success(data.message);

      if (me.data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }

      router.refresh();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <Card
        className="w-full max-w-md rounded-3xl border-0 shadow-2xl"
        styles={{
          body: {
            padding: 40,
          },
        }}
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-xl">
            <SafetyCertificateOutlined
              style={{
                fontSize: 38,
                color: '#fff',
              }}
            />
          </div>

          <Title level={2} style={{ marginBottom: 4 }}>
            Welcome Back
          </Title>

          <Text type="secondary">Sign in to your Employee Portal</Text>
        </div>

        <Divider />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <>
                <Input
                  {...field}
                  size="large"
                  placeholder="Email Address"
                  prefix={<MailOutlined />}
                  status={errors.email ? 'error' : ''}
                />

                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
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

                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                )}
              </>
            )}
          />

          <div className="flex justify-end">
            <button type="button" className="text-sm text-blue-600 hover:underline">
              Forgot Password?
            </button>
          </div>

          <Button
            htmlType="submit"
            loading={isSubmitting}
            size="large"
            block
            icon={<LoginOutlined />}
            style={{
              height: 52,
              borderRadius: 12,
              background: 'linear-gradient(90deg,#2563eb,#06b6d4)',
              border: 0,
              color: '#fff',
              fontWeight: 600,
            }}
          >
            Login
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
              href="/register"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Register Now
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
}
