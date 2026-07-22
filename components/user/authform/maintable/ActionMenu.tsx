'use client';

import { DeleteOutlined, EditOutlined, EyeOutlined, MoreOutlined } from '@ant-design/icons';
import { Button, Dropdown, message } from 'antd';

interface ActionMenuProps {
  id: string;
}

export default function ActionMenu({ id }: ActionMenuProps) {
  const handleClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'view':
        message.info(`View Query #${id}`);
        // router.push(`/dashboard/authform/${id}`);
        break;

      case 'edit':
        message.success(`Edit Query #${id}`);
        // router.push(`/dashboard/authform/${id}/edit`);
        break;

      case 'delete':
        message.error(`Delete Query #${id}`);
        // Call delete API here
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
      <Button
        type="text"
        icon={<MoreOutlined />}
        style={{
          borderRadius: 8,
        }}
      />
    </Dropdown>
  );
}
