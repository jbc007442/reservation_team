'use client';

import RichTextEditor from './RichTextEditor';
import { TermsConditionsProps } from './types';

export default function TermsConditions({ value, onChange }: TermsConditionsProps) {
  return (
    <RichTextEditor label="Terms & Conditions" value={value} onChange={onChange} height={350} />
  );
}
