import { useState, useEffect } from 'react';
import { InformationCircleIcon } from './Icons';

export default function TemplateForm({ schema, data, onChange, title }) {
  const [formData, setFormData] = useState(data || {});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(data || {});
  }, [data]);

  const handleFieldChange = (fieldName, value) => {
    const newData = { ...formData, [fieldName]: value };
    setFormData(newData);
    onChange(newData);

    // Clear error for this field
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: null }));
    }
  };

  const validateField = (field, value) => {
    if (field.required && (!value || value.trim() === '')) {
      return `${field.label} is required`;
    }

    if (field.type === 'email' && value && !/\S+@\S+\.\S+/.test(value)) {
      return 'Please enter a valid email address';
    }

    if (field.type === 'url' && value && !/^https?:\/\/.+/.test(value)) {
      return 'Please enter a valid URL (starting with http:// or https://)';
    }

    if (field.type === 'number' && value && isNaN(value)) {
      return 'Please enter a valid number';
    }

    return null;
  };

  const renderField = (field) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <label className="form-label">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              onBlur={(e) => {
                const fieldError = validateField(field, e.target.value);
                if (fieldError) {
                  setErrors(prev => ({ ...prev, [field.name]: fieldError }));
                }
              }}
              placeholder={field.placeholder}
              rows={field.rows || 4}
              className={`form-textarea ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            {error && <p className="form-error">{error}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <label className="form-label">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className={`form-input ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            >
              <option value="">Select {field.label.toLowerCase()}...</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {error && <p className="form-error">{error}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.name} className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={value === true || value === 'true'}
                onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>
            {error && <p className="form-error">{error}</p>}
          </div>
        );

      default:
        return (
          <div key={field.name} className="space-y-2">
            <label className="form-label">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              onBlur={(e) => {
                const fieldError = validateField(field, e.target.value);
                if (fieldError) {
                  setErrors(prev => ({ ...prev, [field.name]: fieldError }));
                }
              }}
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              className={`form-input ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            {error && <p className="form-error">{error}</p>}
          </div>
        );
    }
  };

  if (!schema || !schema.fields) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-gray-600">No form schema available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {title && (
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {schema.description && (
            <p className="text-gray-600 mt-1">{schema.description}</p>
          )}
        </div>
      )}

      {/* Group fields by sections if available */}
      {schema.sections && schema.sections.length > 0 ? (
        <div className="space-y-8">
          {schema.sections.map((section, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-center">
                <h4 className="text-md font-medium text-gray-900">{section.title}</h4>
                {section.description && (
                  <div className="ml-2 group relative">
                    <InformationCircleIcon className="h-4 w-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      {section.description}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid gap-4">
                {schema.fields
                  .filter(field => section.placeholders.includes(field.name))
                  .map(renderField)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {schema.fields.map(renderField)}
        </div>
      )}

      {/* Form Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-700">Form Progress</span>
            <div className="text-xs text-gray-500 mt-1">
              {Object.keys(formData).filter(key => formData[key] && formData[key].toString().trim()).length} of {schema.fields.length} fields completed
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-700">
              {Math.round((Object.keys(formData).filter(key => formData[key] && formData[key].toString().trim()).length / schema.fields.length) * 100)}%
            </div>
            <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(Object.keys(formData).filter(key => formData[key] && formData[key].toString().trim()).length / schema.fields.length) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
