"use client";
import React from "react";

/**
 * Reusable input component for forms.
 * - Tailwind styled: rounded-xl, shadow, focus ring
 * - Supports input or textarea
 */
export type InputFieldProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  as?: "input" | "textarea";
  rows?: number;
  autoComplete?: string;
};

export default function InputField({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  error,
  as = "input",
  rows = 3,
  autoComplete
}: InputFieldProps) {
  const common =
    "block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/40";

  return (
    <div className="space-y-1">
      <label htmlFor={name} className="text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {as === "textarea" ? (
        <textarea
          id={name}
          name={name}
          rows={rows}
          placeholder={placeholder}
          className={common}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          className={common}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          autoComplete={autoComplete}
        />
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
