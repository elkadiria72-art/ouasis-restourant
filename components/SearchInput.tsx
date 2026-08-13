'use client';

import { Search } from 'lucide-react';
import { ar } from '@/lib/ar';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = ar.searchPlaceholder,
  className = '',
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        size={18}
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir="rtl"
        className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2.5 pl-4 pr-10 text-slate-100 placeholder-slate-500 transition-colors focus:border-amber-600 focus:outline-none"
      />
    </div>
  );
}
