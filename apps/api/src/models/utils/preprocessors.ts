import { z } from "zod";

/**
 * Preprocessor for optional nullable string arrays.
 * - Filters out empty strings from arrays.
 * - Returns null when the resulting array is empty or when the value is an empty string.
 */
export const zStringArray = () =>
  z.preprocess((val) => {
    if (Array.isArray(val)) {
      const filtered = val.filter((v) => v !== "");
      return filtered.length === 0 ? null : filtered;
    }
    return val === "" ? null : val;
  }, z.array(z.string()).nullable().optional());

/**
 * Preprocessor for optional nullable typed enum arrays.
 * - Filters out empty strings from arrays.
 * - Returns null when the resulting array is empty or when the value is an empty string.
 */
export const zEnumArray = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((val) => {
    if (Array.isArray(val)) {
      const filtered = val.filter((v) => v !== "");
      return filtered.length === 0 ? null : filtered;
    }
    return val === "" ? null : val;
  }, z.array(schema).nullable().optional());

/**
 * Preprocessor for an optional nullable string that treats empty string as null.
 */
export const zNullableString = () =>
  z.preprocess(
    (val) => (val === "" ? null : val),
    z.string().nullable().optional(),
  );

/**
 * Preprocessor for optional nullable UUID.
 */
export const zNullableUUID = () =>
  z.preprocess(
    (val) => (val === "" ? null : val),
    z.string().uuid().nullable().optional(),
  );
