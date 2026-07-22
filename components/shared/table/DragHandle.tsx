'use client';

import { MenuOutlined } from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';

export default function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <span
      {...attributes}
      {...listeners}
      style={{
        cursor: 'grab',
        fontSize: 18,
      }}
    >
      <MenuOutlined />
    </span>
  );
}
