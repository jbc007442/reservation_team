'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Card, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import DprForm, { DprData } from './DprForm';
import DprTable from './DprTable';

export default function Dpr() {
  const [dprs, setDprs] = useState<DprData[]>([]);
  const [editingRecord, setEditingRecord] = useState<DprData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    fetchDprs();
  }, [fetchDprs]);

  const handleSubmit = async (values: DprData) => {
    try {
      if (editingRecord?._id) {
        await axios.put(`/api/dpr/${editingRecord._id}`, values);

        message.success('DPR updated successfully');
      } else {
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

  const handleAdd = () => {
    setEditingRecord(null);
    setModalOpen(true);
  };

  const handleEdit = (record: DprData) => {
    setEditingRecord(record);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/dpr/${id}`);

      message.success('DPR deleted successfully');

      fetchDprs();
    } catch (error) {
      console.error(error);
      message.error('Failed to delete DPR');
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
    setEditingRecord(null);
  };

  return (
    <Card
      title="DPR Management"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add DPR
        </Button>
      }
    >
      <DprTable data={dprs} onEdit={handleEdit} onDelete={handleDelete} />

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
