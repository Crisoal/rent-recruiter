import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-gray-600">{label}</label>}
      <input
        {...props}
        className={`w-full px-3.5 py-2.5 text-sm border rounded-xl outline-none transition-all duration-200
          bg-white text-gray-800 placeholder:text-gray-400
          border-gray-200 focus:border-[#00C853] focus:ring-2 focus:ring-[#00C853]/20
          disabled:bg-gray-50 disabled:text-gray-500
          ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}
          ${className}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-gray-600">{label}</label>}
      <textarea
        {...props}
        className={`w-full px-3.5 py-2.5 text-sm border rounded-xl outline-none transition-all duration-200 resize-none
          bg-white text-gray-800 placeholder:text-gray-400
          border-gray-200 focus:border-[#00C853] focus:ring-2 focus:ring-[#00C853]/20
          ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}
          ${className}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export function Select({ label, error, children, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-gray-600">{label}</label>}
      <select
        {...props}
        className={`w-full px-3.5 py-2.5 text-sm border rounded-xl outline-none transition-all duration-200
          bg-white text-gray-800
          border-gray-200 focus:border-[#00C853] focus:ring-2 focus:ring-[#00C853]/20
          ${error ? 'border-red-400' : ''}
          ${className}`}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
