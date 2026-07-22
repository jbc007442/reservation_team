'use client';

import { useEffect, useState } from 'react';
import { message } from 'antd';
import ManageUsersTable from './ManageUsersTable';

export default function Manage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await fetch('/api/users', {
        cache: 'no-store',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }

      setUsers(data.users || []);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Delete failed');
      }

      message.success(data.message);

      setUsers((prev) => prev.filter((user) => user._id !== id));
    } catch (error: any) {
      message.error(error.message);
    }
  };

  return <ManageUsersTable users={users} loading={loading} onDelete={handleDelete} />;
}
