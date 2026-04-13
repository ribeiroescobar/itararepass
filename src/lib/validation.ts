import { z } from "zod";

const emptyToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }
  return value;
};

const emptyToNull = (value: unknown) => {
  if (value === null) return null;
  if (typeof value === "string" && value.trim() === "") {
    return null;
  }
  return value;
};

export const isSafeHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const safeUrlBase = z
  .string()
  .url()
  .refine(isSafeHttpUrl, { message: "URL inválida." });

export const safeUrlOptional = z.preprocess(emptyToUndefined, safeUrlBase).optional();

export const safeUrlNullable = z.preprocess(emptyToNull, safeUrlBase.nullable()).optional();
