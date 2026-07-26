'use client';

import dynamic from 'next/dynamic';
import { Form, message } from 'antd';
import { useMemo, useRef } from 'react';

import 'react-quill-new/dist/quill.snow.css';

import { RichTextEditorProps } from './types';

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
}) as any;

export default function RichTextEditor({
  label,
  value,
  onChange,
  height = 300,
  folder = 'authform',
}: RichTextEditorProps) {
  const quillRef = useRef<any>(null);

  const imageHandler = async () => {
    try {
      const input = document.createElement('input');

      input.type = 'file';
      input.accept = 'image/*';

      input.click();

      input.onchange = async () => {
        const file = input.files?.[0];

        if (!file) return;

        const formData = new FormData();

        formData.append('file', file);
        formData.append('folder', folder);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await res.json();

        if (!result.success) {
          message.error(result.message || 'Image upload failed.');
          return;
        }

        const quill = quillRef.current?.getEditor();

        if (!quill) return;

        const range = quill.getSelection(true);

        quill.insertEmbed(range ? range.index : quill.getLength(), 'image', result.url);

        quill.setSelection((range ? range.index : quill.getLength()) + 1);
      };
    } catch (error) {
      console.error(error);
      message.error('Failed to upload image.');
    }
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ color: [] }, { background: [] }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ align: [] }],
          ['link', 'image'],
          ['clean'],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    [folder]
  );

  return (
    <Form.Item label={label}>
      <ReactQuill
        ref={quillRef}
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
