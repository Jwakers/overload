import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type WeightUnit = "kg" | "lbs";

/**
 * Converts weight from one unit to another
 * @param input - Tuple of [value, unit] to convert from
 * @param outputUnit - Unit to convert to
 * @returns Converted weight value
 * @example
 * convertWeight([10, 'kg'], 'lbs') // returns 22.046
 * convertWeight([50, 'lbs'], 'kg') // returns 22.68
 */
export function convertWeight(
  input: [number, WeightUnit],
  outputUnit: WeightUnit
): number {
  const [value, inputUnit] = input;

  // If units are the same, return the original value
  if (inputUnit === outputUnit) {
    return value;
  }

  // Convert to kg first, then to target unit
  let kgValue: number;

  if (inputUnit === "lbs") {
    kgValue = Number((value * 0.45359237).toFixed(2)); // lbs to kg
  } else {
    kgValue = value; // already in kg
  }

  // Convert from kg to target unit
  if (outputUnit === "lbs") {
    return Number((kgValue * 2.20462262).toFixed(2)); // kg to lbs
  } else {
    return kgValue; // already in kg
  }
}
