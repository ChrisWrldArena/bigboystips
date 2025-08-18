import { FormFieldProps } from '@/app/lib/interface';
import { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import BlogEditor from './BlogEditor';
import { OutputData } from '@editorjs/editorjs';
import { Controller, UseFormRegister, FieldValues } from 'react-hook-form';

export interface FormFieldPropsWithChange extends FormFieldProps {
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  editorContent?: (data: OutputData | null) => void;
  setValue?: (name: string, value: string | number) => void;
  initialValue?: string | number;
}

// Accordion Select Component
interface AccordionSelectProps {
  name: string;
  register: UseFormRegister<FieldValues>;
  groupedOptions: Record<string, { label: string; value: string | number; country?: string }[]> | undefined;
  baseInputClasses: string;
  errorClasses: string;
  disabled: boolean;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  label: string;
  setValue?: (name: string, value: string | number) => void;
  initialValue?: string | number;
}

function AccordionSelect({
  name,
  register,
  groupedOptions,
  baseInputClasses,
  errorClasses,
  disabled,
  required,
  onChange,
  label,
  setValue,
  initialValue,
}: AccordionSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    // Auto-expand important groups by default
    const initialExpanded: Record<string, boolean> = {};
    if (groupedOptions) {
      Object.keys(groupedOptions).forEach(country => {
        if (['International', 'UEFA', 'England', 'Spain', 'Germany', 'Italy', 'France'].includes(country)) {
          initialExpanded[country] = true;
        }
      });
    }
    return initialExpanded;
  });

  // Initialize state with initial value if available
  const [selectedValue, setSelectedValue] = useState(() => initialValue ? String(initialValue) : '');
  const [inputValue, setInputValue] = useState(() => {
    if (initialValue && groupedOptions) {
      // Find the label for the initial value
      for (const countryOptions of Object.values(groupedOptions)) {
        const foundOption = countryOptions?.find(option => String(option.value) === String(initialValue));
        if (foundOption) {
          return foundOption.label;
        }
      }
    }
    return '';
  });
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Register the field with the form
  useEffect(() => {
    if (register && setValue) {
      // Register the field with default empty value
      register(name, { required });
    }
  }, [register, name, required, setValue]);

  // Auto-expand the group containing the initial value
  useEffect(() => {
    if (initialValue && groupedOptions) {
      for (const [country, countryOptions] of Object.entries(groupedOptions)) {
        const foundOption = countryOptions?.find(option => String(option.value) === String(initialValue));
        if (foundOption) {
          setExpandedGroups(prev => ({ ...prev, [country]: true }));
          break;
        }
      }
    }
  }, [initialValue, groupedOptions]);

  // Reset state when groupedOptions change (e.g., when sport type changes)
  useEffect(() => {
    if (!initialValue || initialValue === '') {
      setSelectedValue('');
      setInputValue('');
    } else {
      // Update state if initialValue changes to a valid value
      const stringValue = String(initialValue);
      if (stringValue !== selectedValue && groupedOptions) {
        for (const countryOptions of Object.values(groupedOptions)) {
          const foundOption = countryOptions?.find(option => String(option.value) === stringValue);
          if (foundOption) {
            setSelectedValue(stringValue);
            setInputValue(foundOption.label);
            break;
          }
        }
      }
    }
  }, [groupedOptions, initialValue, selectedValue]);

  // Close dropdown when clicking outside and handle custom input
  const handleCustomInput = useCallback((value: string) => {
    setSelectedValue(value);
    setInputValue(value);
    
    // Update the form value using setValue
    if (setValue) {
      setValue(name, value);
    }
    
    // Trigger the onChange event for form registration
    if (onChange) {
      const event = {
        target: { value }
      } as React.ChangeEvent<HTMLSelectElement>;
      onChange(event);
    }
  }, [setValue, name, onChange]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // If no option is selected and input has value, treat it as custom input
        if (!selectedValue && inputValue.trim()) {
          handleCustomInput(inputValue.trim());
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [inputValue, selectedValue, handleCustomInput]);

  // Filter options based on search term
  const filteredGroups = useMemo(() => {
    return groupedOptions ? Object.entries(groupedOptions).reduce((acc, [country, countryOptions]) => {
      const filteredOptions = countryOptions?.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filteredOptions && filteredOptions.length > 0) {
        acc[country] = filteredOptions;
      }
      return acc;
    }, {} as Record<string, { label: string; value: string | number; country?: string }[]>) : {};
  }, [groupedOptions, searchTerm]);

  // Auto-expand groups when filtering
  useEffect(() => {
    if (searchTerm && Object.keys(filteredGroups).length > 0) {
      const newExpanded: Record<string, boolean> = {};
      Object.keys(filteredGroups).forEach(country => {
        newExpanded[country] = true;
      });
      setExpandedGroups(prev => ({ ...prev, ...newExpanded }));
    }
  }, [searchTerm, filteredGroups]);

  const toggleGroup = (country: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [country]: !prev[country]
    }));
  };

  const selectOption = (value: string | number, label: string) => {
    const stringValue = String(value);
    setSelectedValue(stringValue);
    setInputValue(label);
    setSearchTerm('');
    setIsOpen(false);
    
    // Update the form value using setValue
    if (setValue) {
      setValue(name, stringValue);
    }
    
    // Trigger the onChange event for form registration
    if (onChange) {
      const event = {
        target: { value: stringValue }
      } as React.ChangeEvent<HTMLSelectElement>;
      onChange(event);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSearchTerm(value);
    
    // If input is cleared, clear selection
    if (!value.trim()) {
      setSelectedValue('');
      if (setValue) {
        setValue(name, '');
      }
    }
    
    // Open dropdown when typing
    if (!isOpen && value.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    // Select all text when focusing
    if (inputRef.current) {
      inputRef.current.select();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim() && !selectedValue) {
        handleCustomInput(inputValue.trim());
        setIsOpen(false);
      }
    }
    
    if (e.key === 'Escape') {
      setIsOpen(false);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };

  const sortedGroups = Object.entries(filteredGroups);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Input field that acts as both input and select trigger */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={`Type or select ${label.toLowerCase()}...`}
          className={`${baseInputClasses} ${errorClasses} px-4 py-2 pr-10`}
        />
        
        {/* Dropdown arrow */}
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen && inputRef.current) {
              inputRef.current.focus();
            }
          }}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-auto"
        >
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Clear button */}
        {inputValue && (
          <button
            type="button"
            onClick={() => {
              setInputValue('');
              setSelectedValue('');
              setSearchTerm('');
              if (setValue) {
                setValue(name, '');
              }
              if (inputRef.current) {
                inputRef.current.focus();
              }
            }}
            className="absolute inset-y-0 right-8 flex items-center pr-1 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown content */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-y-auto">
          {sortedGroups.length === 0 && searchTerm ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              No matches found. Press Enter to use &quot;{searchTerm}&quot; as custom input.
            </div>
          ) : sortedGroups.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              No options available
            </div>
          ) : (
            sortedGroups.map(([country, countryOptions]) => (
              <div key={country} className="border-b border-gray-100 last:border-b-0">
                {/* Country header */}
                <button
                  type="button"
                  onClick={() => toggleGroup(country)}
                  className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 flex items-center justify-between"
                >
                  <span>{country} ({countryOptions?.length || 0})</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${expandedGroups[country] ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Country options */}
                {expandedGroups[country] && (
                  <div className="bg-white">
                    {countryOptions?.sort((a: { label: string; value: string | number }, b: { label: string; value: string | number }) => a.label.localeCompare(b.label)).map((option: { label: string; value: string | number }) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => selectOption(option.value, option.label)}
                        className={`w-full px-6 py-2 text-left text-sm hover:bg-orange-50 hover:text-orange-600 transition-colors ${
                          selectedValue === String(option.value) ? 'bg-orange-100 text-orange-600 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function FormField({
  type,
  name,
  label,
  register,
  hidden,
  error,
  required,
  options,
  placeholder,
  disabled = false,
  className = '',
  onChange,
  editorContent: _editorContent,
  control,
  setValue,
  initialValue,
}: FormFieldPropsWithChange) {
  const getErrorMessage = useCallback((fieldName: string) => {
    const fieldError = error?.[fieldName];
    if (fieldError) {
      return fieldError.message as string;
    }
    return '';
  }, [error]);

  const baseInputClasses = `mt-1 block w-full rounded-lg border border-neutral-300 focus:border-orange-500 focus:ring-orange-500 ${className} outline-none transition-colors focus:ring-1`;
  const errorClasses = error?.[name] ? 'border-red-500' : '';

  const renderField = () => {
    switch (type) {
      case 'select':
        return (
          <select
            {...register(name)}
            className={`${baseInputClasses} ${errorClasses} px-4 py-2`}
            disabled={disabled}
            required={required}
            onChange={onChange}>
            <option value="">Select {label}</option>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'grouped-select':
        // Group options by country
        const groupedOptions = options?.reduce((acc, option) => {
          // Check if option has a country property (for leagues)
          if ('country' in option && option.country) {
            const country = option.country as string;
            if (!acc[country]) {
              acc[country] = [];
            }
            acc[country].push(option);
          } else {
            // Handle ungrouped options
            if (!acc['Other']) {
              acc['Other'] = [];
            }
            acc['Other'].push(option);
          }
          return acc;
        }, {} as Record<string, typeof options>);

        return <AccordionSelect 
          name={name}
          register={register}
          groupedOptions={groupedOptions}
          baseInputClasses={baseInputClasses}
          errorClasses={errorClasses}
          disabled={disabled}
          required={required}
          onChange={onChange}
          label={label}
          setValue={setValue}
          initialValue={initialValue}
        />;

      case 'textarea':
        return (
          <textarea
            {...register(name)}
            placeholder={placeholder}
            className={`${baseInputClasses} ${errorClasses} px-4 py-2`}
            rows={8}
            disabled={disabled}
            required={required}
          />
        );

      case 'checkbox':
        return (
          <input
            type="checkbox"
            {...register(name)}
            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 accent-orange-600"
            disabled={disabled}
            required={required}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            step="any"
            {...register(name)}
            className={`${baseInputClasses} ${errorClasses}  px-4 py-2`}
            disabled={disabled}
            required={required}
            placeholder={placeholder}
          />
        );
      case 'datetime-local':
        return (
          <input
            type="datetime-local"
            {...register(name)}
            className={`${baseInputClasses} ${errorClasses}  px-4 py-2`}
            disabled={disabled}
            required={required}
            placeholder={placeholder}
          />
        );
      case 'editor':
        return control ? (
          <Controller
            name={name}
            control={control}
            defaultValue={null}
            render={({ field: { onChange, value } }) => (
              <BlogEditor onChange={onChange} blockvalue={value} />
            )}
          />
        ) : null;

      default:
        return (
          <input
            type={type}
            {...register(name)}
            placeholder={placeholder}
            className={`${baseInputClasses} ${errorClasses}  px-4 py-2`}
            disabled={disabled}
            required={required}
          />
        );
    }
  };

  return (
    <div className="flex w-full space-y-1">
      <div className="w-full">
        <label className={`block text-sm font-medium text-gray-700 ${hidden && "hidden"}`}>
          {label}
          {required && <span className={`text-red-500 ml-1`}>*</span>}
        </label>
        {renderField()}
        {error?.[name] && (
          <p className="text-red-500 text-xs mt-1">
            {getErrorMessage(name)}
          </p>
        )}
      </div>
    </div>
  );
}
