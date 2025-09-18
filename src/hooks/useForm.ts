import { useState, useCallback, useEffect } from 'react';
import { validateRequiredField, isValidEmail, isValidPhone } from '@/utils/validationUtils';

type ValidationRule = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: string) => string | null;
  email?: boolean;
  phone?: boolean;
};

type FieldConfig<T> = {
  [K in keyof T]: {
    value: T[K];
    error: string | null;
    touched: boolean;
    rules?: ValidationRule;
  };
};

type UseFormReturn<T> = {
  values: T;
  errors: { [K in keyof T]: string | null };
  touched: { [K in keyof T]: boolean };
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setFieldTouched: (field: keyof T, isTouched?: boolean) => void;
  setFieldError: (field: keyof T, error: string | null) => void;
  resetForm: () => void;
  setValues: (values: Partial<T>) => void;
  validateForm: () => boolean;
};

export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  validationRules?: { [K in keyof T]?: ValidationRule },
  onSubmit?: (values: T) => Promise<void> | void
): UseFormReturn<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<{ [K in keyof T]?: string | null }>({});
  const [touched, setTouched] = useState<{ [K in keyof T]?: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form state
  useEffect(() => {
    const initialErrors: { [K in keyof T]?: string | null } = {};
    const initialTouched: { [K in keyof T]?: boolean } = {};
    
    (Object.keys(initialValues) as Array<keyof T>).forEach((key) => {
      initialErrors[key] = null;
      initialTouched[key] = false;
    });
    
    setErrors(initialErrors);
    setTouched(initialTouched);
  }, [initialValues]);

  // Validate a single field
  const validateField = useCallback(
    (name: keyof T, value: any): string | null => {
      const rules = validationRules?.[name];
      if (!rules) return null;

      // Required validation
      if (rules.required && !value && value !== 0) {
        return 'This field is required';
      }

      // Email validation
      if (rules.email && value && !isValidEmail(value)) {
        return 'Please enter a valid email address';
      }

      // Phone validation
      if (rules.phone && value && !isValidPhone(value)) {
        return 'Please enter a valid phone number';
      }

      // Min length validation
      if (rules.minLength !== undefined && value && value.length < rules.minLength) {
        return `Must be at least ${rules.minLength} characters`;
      }

      // Max length validation
      if (rules.maxLength !== undefined && value && value.length > rules.maxLength) {
        return `Must be no more than ${rules.maxLength} characters`;
      }

      // Pattern validation
      if (rules.pattern && value && !rules.pattern.test(value)) {
        return 'Invalid format';
      }

      // Custom validation
      if (rules.customValidator) {
        return rules.customValidator(value);
      }

      return null;
    },
    [validationRules]
  );

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    const newErrors: { [K in keyof T]?: string | null } = {};
    let isValid = true;

    (Object.keys(values) as Array<keyof T>).forEach((key) => {
      const error = validateField(key, values[key]);
      newErrors[key] = error;
      if (error) {
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validateField]);

  // Handle field change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const fieldName = name as keyof T;
      
      // Handle different input types
      let processedValue: any = value;
      if (type === 'number') {
        processedValue = value === '' ? '' : Number(value);
      } else if (type === 'checkbox') {
        processedValue = (e.target as HTMLInputElement).checked;
      }

      // Update the field value
      setValues((prev) => ({
        ...prev,
        [fieldName]: processedValue,
      }));

      // Validate the field if it's been touched
      if (touched[fieldName]) {
        const error = validateField(fieldName, processedValue);
        setErrors((prev) => ({
          ...prev,
          [fieldName]: error,
        }));
      }
    },
    [touched, validateField]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target;
      const fieldName = name as keyof T;

      // Mark the field as touched
      if (!touched[fieldName]) {
        setTouched((prev) => ({
          ...prev,
          [fieldName]: true,
        }));
      }

      // Validate the field
      const error = validateField(fieldName, values[fieldName]);
      setErrors((prev) => ({
        ...prev,
        [fieldName]: error,
      }));
    },
    [touched, values, validateField]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Mark all fields as touched
      const newTouched = { ...touched };
      let touchedChanged = false;
      
      (Object.keys(values) as Array<keyof T>).forEach((key) => {
        if (!touched[key]) {
          newTouched[key] = true;
          touchedChanged = true;
        }
      });
      
      if (touchedChanged) {
        setTouched(newTouched as { [K in keyof T]: boolean });
      }

      // Validate the form
      const isValid = validateForm();
      if (!isValid) {
        return;
      }

      // Submit the form
      try {
        setIsSubmitting(true);
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
        // Handle form submission error (e.g., show error message)
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, touched, validateForm, values]
  );

  // Set field value manually
  const setFieldValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Validate the field if it's been touched
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({
        ...prev,
        [field]: error,
      }));
    }
  }, [touched, validateField]);

  // Set field touched manually
  const setFieldTouched = useCallback((field: keyof T, isTouched: boolean = true) => {
    setTouched((prev) => ({
      ...prev,
      [field]: isTouched,
    }));
  }, []);

  // Set field error manually
  const setFieldError = useCallback((field: keyof T, error: string | null) => {
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  // Update multiple values at once
  const setFormValues = useCallback((newValues: Partial<T>) => {
    setValues((prev) => ({
      ...prev,
      ...newValues,
    }));
  }, []);

  // Check if the form is valid
  const isValid = Object.values(errors).every((error) => !error);

  return {
    values,
    errors: errors as { [K in keyof T]: string | null },
    touched: touched as { [K in keyof T]: boolean },
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    resetForm,
    setValues: setFormValues,
    validateForm,
  };
};

// Helper hook for field-level validation
export const useField = <T extends Record<string, any>, K extends keyof T>(
  form: UseFormReturn<T>,
  name: K
) => {
  const { values, errors, touched, handleChange, handleBlur } = form;
  
  return {
    value: values[name],
    error: errors[name],
    touched: touched[name],
    onChange: handleChange,
    onBlur: handleBlur,
    name: name as string,
    id: name as string,
  };
};
