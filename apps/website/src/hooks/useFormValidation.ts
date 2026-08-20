import { useState, useCallback } from "react";
import { z } from "zod";
import { toast } from "../lib/toast";

export function useFormValidation<T extends z.ZodTypeAny>(schema?: T) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = useCallback(
    (
      formOrData: HTMLFormElement | Record<string, any>,
      validationSchema?: T,
    ): boolean => {
      const activeSchema = validationSchema || schema;
      if (!activeSchema) return true;

      const rawData =
        formOrData instanceof HTMLFormElement
          ? Object.fromEntries(new FormData(formOrData).entries())
          : formOrData;

      const result = activeSchema.safeParse(rawData);

      if (!result.success) {
        const fieldErrors: Record<string, string> = {};

        result.error.issues.forEach((issue) => {
          const fieldName = issue.path[0];
          if (fieldName && !fieldErrors[String(fieldName)]) {
            fieldErrors[String(fieldName)] = issue.message;
          }
        });

        setErrors(fieldErrors);
        toast.error("Please correct the errors in the form.");
        return false;
      }

      setErrors({});
      return true;
    },
    [schema],
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    setErrors,
    validateForm,
    clearErrors,
  };
}
