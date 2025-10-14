'use client';

import { useMemo } from 'react';
import type { FormDefinition, FormField, FormValues } from '@/lib/forms/types';

interface DynamicFormProps {
  definition: FormDefinition;
  values: FormValues;
  onChange: (fieldId: string, value: string | number | boolean) => void;
  onSubmit?: () => void | Promise<void>;
  isSubmitting?: boolean;
  disabled?: boolean;
  actions?: React.ReactNode;
}

function isFieldVisible(field: FormField, values: FormValues): boolean {
  if (!field.visibleWhen) {
    return true;
  }

  const dependentValue = values[field.visibleWhen.fieldId];
  return field.visibleWhen.equals.includes(dependentValue as string | boolean);
}

function getFieldWidth(field: FormField): string {
  switch (field.width) {
    case 'half':
      return 'md:col-span-1';
    case 'third':
      return 'md:col-span-1 lg:col-span-1 xl:col-span-1';
    default:
      return 'md:col-span-2';
  }
}

export default function DynamicForm({
  definition,
  values,
  onChange,
  onSubmit,
  isSubmitting = false,
  disabled = false,
  actions,
}: DynamicFormProps) {
  const visibleSections = useMemo(() => {
    return definition.sections.map((section) => ({
      ...section,
      fields: section.fields.filter((field) => isFieldVisible(field, values)),
    }));
  }, [definition.sections, values]);

  return (
    <form
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      {visibleSections.map((section) => (
        <section
          key={section.id}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-6"
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {section.title}
            </h2>
            {section.description && (
              <p className="mt-2 text-sm text-gray-600">{section.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {section.fields.map((field) => (
              <div key={field.id} className={getFieldWidth(field)}>
                <label
                  htmlFor={field.id}
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {field.label}
                  {field.required && <span className="text-red-500"> *</span>}
                </label>

                {field.type === 'text' || field.type === 'number' ? (
                  <input
                    id={field.id}
                    name={field.id}
                    type={field.type === 'number' ? 'number' : 'text'}
                    disabled={disabled || isSubmitting}
                    placeholder={field.placeholder}
                    value={(values[field.id] as string | number | '') ?? ''}
                    onChange={(event) =>
                      onChange(
                        field.id,
                        field.type === 'number'
                          ? event.target.value === ''
                            ? ''
                            : Number(event.target.value)
                          : event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                ) : null}

                {field.type === 'textarea' ? (
                  <textarea
                    id={field.id}
                    name={field.id}
                    disabled={disabled || isSubmitting}
                    placeholder={field.placeholder}
                    value={(values[field.id] as string) ?? ''}
                    onChange={(event) => onChange(field.id, event.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                ) : null}

                {field.type === 'radio' ? (
                  <div className="flex items-center gap-4">
                    {field.options.map((option) => (
                      <label
                        key={option.value}
                        className="inline-flex items-center gap-2 text-sm text-gray-700"
                      >
                        <input
                          type="radio"
                          name={field.id}
                          value={option.value}
                          checked={values[field.id] === option.value}
                          onChange={() => onChange(field.id, option.value)}
                          disabled={disabled || isSubmitting}
                          className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                ) : null}

                {field.type === 'select' ? (
                  <select
                    id={field.id}
                    name={field.id}
                    disabled={disabled || isSubmitting}
                    value={(values[field.id] as string | number | '') ?? ''}
                    onChange={(event) => onChange(field.id, event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="">Válassz...</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : null}

                {field.type === 'checkbox' ? (
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name={field.id}
                      checked={Boolean(values[field.id])}
                      onChange={(event) => onChange(field.id, event.target.checked)}
                      disabled={disabled || isSubmitting}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {field.placeholder ?? 'Kiválasztás'}
                  </label>
                ) : null}

                {field.helperText && (
                  <p className="mt-2 text-xs text-gray-500">{field.helperText}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      {actions && <div className="flex justify-end gap-4">{actions}</div>}
    </form>
  );
}
