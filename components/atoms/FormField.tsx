import React from 'react';
import { input as inputTokens, text } from '@/config/theme';

interface FormFieldProps {
  label: string;
  type?: 'text' | 'tel' | 'number' | 'url' | 'password' | 'email';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

interface FormTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  error?: string;
}

interface FormSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
}

export function FormField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  disabled,
}: FormFieldProps) {
  return (
    <div>
      <label className={`block mb-1.5 ${text.label}`}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`${inputTokens.base} ${error ? inputTokens.error : ''}`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  error,
}: FormTextareaProps) {
  return (
    <div>
      <label className={`block mb-1.5 ${text.label}`}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`${inputTokens.textarea} ${error ? inputTokens.error : ''}`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export function FormSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
}: FormSelectProps) {
  return (
    <div>
      <label className={`block mb-1.5 ${text.label}`}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputTokens.select} ${error ? inputTokens.error : ''}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
