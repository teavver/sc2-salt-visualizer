import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const cl = clsx
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))