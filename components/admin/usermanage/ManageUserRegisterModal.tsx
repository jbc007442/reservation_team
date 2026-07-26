'use client';

import { useMemo } from 'react';
import axios from 'axios';
import { z } from 'zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, Input, Button, Typography, Divider, message, Card } from 'antd';
import { IdcardOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';

const { Text } = Typography;

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterForm = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ManageUserRegisterModal({ open, onClose }: Props) {
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
      onClose();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Registration Failed');
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      centered
      width={560}
      title={null}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <UserOutlined
              style={{
                fontSize: 28,
                color: '#1677ff',
              }}
            />
          </div>

          <Typography.Title
            level={3}
            style={{
              marginTop: 16,
              marginBottom: 4,
            }}
          >
            Create Employee
          </Typography.Title>

          <Typography.Text type="secondary">Create a new employee account.</Typography.Text>
        </div>

        {/* Employee ID */}

        <Card
          size="small"
          style={{
            background: '#f8fafc',
            borderRadius: 12,
          }}
        >
          <Text type="secondary">Employee ID</Text>

          <Input
            readOnly
            value={previewId}
            prefix={<IdcardOutlined />}
            style={{
              marginTop: 8,
            }}
          />

          <Text
            type="secondary"
            style={{
              fontSize: 12,
            }}
          >
            Generated automatically after registration.
          </Text>
        </Card>

        {/* Form */}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <div>
                <Text strong>Employee Name</Text>

                <Input
                  {...field}
                  size="large"
                  placeholder="Enter employee name"
                  prefix={<UserOutlined />}
                  status={errors.name ? 'error' : ''}
                  style={{
                    marginTop: 8,
                    borderRadius: 10,
                  }}
                />

                {errors.name && (
                  <div className="mt-1 text-red-500 text-sm">{errors.name.message}</div>
                )}
              </div>
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <div>
                <Text strong>Password</Text>

                <Input.Password
                  {...field}
                  size="large"
                  placeholder="Enter password"
                  prefix={<LockOutlined />}
                  status={errors.password ? 'error' : ''}
                  style={{
                    marginTop: 8,
                    borderRadius: 10,
                  }}
                />

                {errors.password && (
                  <div className="mt-1 text-red-500 text-sm">{errors.password.message}</div>
                )}
              </div>
            )}
          />

          <Divider
            style={{
              margin: '8px 0 0',
            }}
          />

          <div className="flex justify-end gap-3">
            <Button size="large" onClick={onClose}>
              Cancel
            </Button>

            <Button htmlType="submit" type="primary" size="large" loading={isSubmitting}>
              Create Employee
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
