'use client';

import dynamic from 'next/dynamic';
import { Form } from 'antd';

import 'react-quill-new/dist/quill.snow.css';

import { modules } from './constants';
import { RichTextEditorProps } from './types';

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
});

export default function RichTextEditor({
  label,
  value,
  onChange,
  height = 300,
}: RichTextEditorProps) {
  return (
    <Form.Item label={label}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        style={{
          height,
          marginBottom: 50,
        }}
      />
    </Form.Item>
  );
}
