'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Card, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import DprForm, { DprData } from './DprForm';
import DprTable from './DprTable';

import { useAuthStore } from '@/store/authStore';

export default function Dpr() {
  const [dprs, setDprs] = useState<DprData[]>([]);
  const [editingRecord, setEditingRecord] = useState<DprData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Auth
  |--------------------------------------------------------------------------
  */

  const { user } = useAuthStore();

  const isAdmin = user?.role === 'admin';

  const permissions: string[] = (user as { permissions?: string[] } | null)?.permissions || [];

  /*
  |--------------------------------------------------------------------------
  | DPR Permissions
  |--------------------------------------------------------------------------
  */

  // View DPR
  const canView = isAdmin || permissions.includes('booking.dpr');

  // Create DPR
  const canCreate = isAdmin || permissions.includes('booking.dpr.create');

  // Edit DPR
  const canEdit = isAdmin || permissions.includes('booking.dpr.edit');

  // Delete DPR
  const canDelete = isAdmin || permissions.includes('booking.dpr.delete');

  /*
  |--------------------------------------------------------------------------
  | Fetch DPRs
  |--------------------------------------------------------------------------
  */

  const fetchDprs = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await axios.get('/api/dpr');

      setDprs(data.data || []);
    } catch (error) {
      console.error(error);

      message.error('Failed to load DPRs');
    } finally {
      setLoading(false);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (canView) {
      fetchDprs();
    }
  }, [fetchDprs, canView]);

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (values: DprData) => {
    try {
      /*
      |--------------------------------------------------------------------------
      | Edit
      |--------------------------------------------------------------------------
      */

      if (editingRecord?._id) {
        if (!canEdit) {
          message.error('You do not have permission to edit DPR.');

          return;
        }

        await axios.put(`/api/dpr/${editingRecord._id}`, values);

        message.success('DPR updated successfully');
      } else {
        /*
      |--------------------------------------------------------------------------
      | Create
      |--------------------------------------------------------------------------
      */
        if (!canCreate) {
          message.error('You do not have permission to create DPR.');

          return;
        }

        await axios.post('/api/dpr', values);

        message.success('DPR added successfully');
      }

      setModalOpen(false);
      setEditingRecord(null);

      fetchDprs();
    } catch (error) {
      console.error(error);

      message.error('Something went wrong');
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Add
  |--------------------------------------------------------------------------
  */

  const handleAdd = () => {
    if (!canCreate) {
      message.error('You do not have permission to create DPR.');

      return;
    }

    setEditingRecord(null);
    setModalOpen(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Edit
  |--------------------------------------------------------------------------
  */

  const handleEdit = (record: DprData) => {
    if (!canEdit) {
      message.error('You do not have permission to edit DPR.');

      return;
    }

    setEditingRecord(record);
    setModalOpen(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Delete
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      message.error('You do not have permission to delete DPR.');

      return;
    }

    try {
      await axios.delete(`/api/dpr/${id}`);

      message.success('DPR deleted successfully');

      fetchDprs();
    } catch (error) {
      console.error(error);

      message.error('Failed to delete DPR');
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Cancel
  |--------------------------------------------------------------------------
  */

  const handleCancel = () => {
    setModalOpen(false);
    setEditingRecord(null);
  };

  /*
  |--------------------------------------------------------------------------
  | Access Denied
  |--------------------------------------------------------------------------
  */

  if (!canView) {
    return (
      <Card>
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-800">Access Denied</h2>

            <p className="mt-2 text-slate-500">You do not have permission to view DPR.</p>
          </div>
        </div>
      </Card>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <Card
      title="DPR Management"
      extra={
        canCreate ? (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add DPR
          </Button>
        ) : null
      }
    >
      <DprTable
        data={dprs}
        loading={loading}
        onEdit={canEdit ? handleEdit : undefined}
        onDelete={canDelete ? (id: string) => handleDelete(id) : undefined}
      />

      <Modal
        title={editingRecord ? 'Edit DPR' : 'Add DPR'}
        open={modalOpen}
        onCancel={handleCancel}
        footer={null}
        width={800}
        destroyOnHidden
      >
        <DprForm
          editingRecord={editingRecord}
          onSubmit={handleSubmit}
          onCancelEdit={handleCancel}
        />
      </Modal>
    </Card>
  );
}