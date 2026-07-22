'use client';

import { DeleteOutlined, EditOutlined, EyeOutlined, MoreOutlined } from '@ant-design/icons';
import { Button, Dropdown, Modal, message } from 'antd';
import { useRouter } from 'next/navigation';

interface ActionMenuProps {
  id: string;
}

export default function ActionMenu({ id }: ActionMenuProps) {
  const router = useRouter();

  const handleDelete = () => {
    Modal.confirm({
      title: 'Delete Authorization Form',
      content: 'Are you sure you want to delete this authorization form?',
      okText: 'Delete',
      okButtonProps: {
        danger: true,
      },
      onOk: async () => {
        try {
          const res = await fetch(`/api/authform/${id}`, {
            method: 'DELETE',
          });

          const result = await res.json();

          if (!res.ok) {
            throw new Error(result.message);
          }

          message.success('Authorization form deleted successfully');

          router.refresh();
        } catch (error: any) {
          message.error(error.message || 'Failed to delete authorization form');
        }
      },
    });
  };

  const handleClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'view':
        router.push(`/admin/authform/${id}`);
        break;

      case 'edit':
        router.push(`/admin/authform/${id}/edit`);
        break;

      case 'delete':
        handleDelete();
        break;

      default:
        break;
    }
  };

  return (
    <Dropdown
      trigger={['click']}
      placement="bottomRight"
      menu={{
        onClick: handleClick,
        items: [
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'View',
          },
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Edit',
          },
          {
            type: 'divider',
          },
          {
            key: 'delete',
            danger: true,
            icon: <DeleteOutlined />,
            label: 'Delete',
          },
        ],
      }}
    >
      <Button type="text" icon={<MoreOutlined />} style={{ borderRadius: 8 }} />
    </Dropdown>
  );
}
