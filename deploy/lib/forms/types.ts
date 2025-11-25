export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'radio'
  | 'select'
  | 'checkbox';

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FieldVisibilityRule {
  fieldId: string;
  equals: Array<string | boolean>;
}

export interface BaseFormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  description?: string;
  helperText?: string;
  required?: boolean;
  width?: 'full' | 'half' | 'third';
  visibleWhen?: FieldVisibilityRule;
}

export interface TextField extends BaseFormField {
  type: 'text' | 'textarea' | 'number';
}

export interface RadioField extends BaseFormField {
  type: 'radio';
  options: FormFieldOption[];
}

export interface SelectField extends BaseFormField {
  type: 'select';
  options: FormFieldOption[];
}

export interface CheckboxField extends BaseFormField {
  type: 'checkbox';
}

export type FormField = TextField | RadioField | SelectField | CheckboxField;

export interface FormSection {
  id: string;
  title?: string;
  description?: string;
  columns?: 1 | 2 | 3;
  fields: FormField[];
}

export interface FormDefinition {
  id: string;
  title: string;
  description?: string;
  sections: FormSection[];
  pdf?: {
    fileName?: string;
    template?: 'default' | 'aquapol';
  };
}

export type FormValue = string | number | boolean | null;

export type FormValues = Record<string, FormValue>;

export interface ProjectFormResponse {
  id: string;
  project_id: string;
  form_slug: string;
  data: FormValues;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  submitted_at: string | null;
}
