import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import './SearchableSelect.css';

type SearchableOption = {
  value: string;
  label: string;
  sublabel?: string;
};

type SearchableSelectProps = {
  options: SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  required?: boolean;
  disabled?: boolean;
};

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  required,
  disabled,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const filtered = options.filter(
    (o) =>
      o.label.toLowerCase().includes(search.toLowerCase()) ||
      (o.sublabel?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
    setSearch('');
  };

  return (
    <div className={`searchable-select ${open ? 'searchable-select-open' : ''}`} ref={containerRef}>
      <button
        type="button"
        className="searchable-select-trigger"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
      >
        <span className="searchable-select-value">
          {selected ? (
            <>
              {selected.label}
              {selected.sublabel && <span className="searchable-select-sublabel">{selected.sublabel}</span>}
            </>
          ) : (
            <span className="searchable-select-placeholder">{placeholder}</span>
          )}
        </span>
        <ChevronDown size={18} className="searchable-select-chevron" />
      </button>

      {open && (
        <div className="searchable-select-dropdown">
          <div className="searchable-select-search">
            <Search size={18} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setOpen(false);
              }}
              autoFocus
            />
          </div>
          <div className="searchable-select-list">
            {filtered.length === 0 ? (
              <div className="searchable-select-empty">No matches</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`searchable-select-option ${opt.value === value ? 'searchable-select-option-selected' : ''}`}
                  onClick={() => handleSelect(opt.value)}
                >
                  {opt.label}
                  {opt.sublabel && <span className="searchable-select-option-sublabel">{opt.sublabel}</span>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
