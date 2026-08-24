import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "INR") {
  if (currency === "INR") {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount.toLocaleString("en-IN")}`;
  }
  return amount.toLocaleString();
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

export function getAgentStatusColor(status: string) {
  switch (status) {
    case "WORKING":
    case "RESEARCHING":
      return "#10B981";
    case "THINKING":
    case "WAITING":
      return "#F59E0B";
    case "NEEDS_INPUT":
      return "#EF4444";
    case "COMPLETED":
      return "#6366F1";
    case "FAILED":
      return "#EF4444";
    default:
      return "#9CA3AF";
  }
}

export function getAgentStatusIcon(status: string) {
  switch (status) {
    case "WORKING":
    case "RESEARCHING":
      return "●";
    case "THINKING":
    case "WAITING":
      return "◐";
    case "NEEDS_INPUT":
      return "!";
    case "COMPLETED":
      return "✓";
    case "FAILED":
      return "✗";
    default:
      return "○";
  }
}

export function getAgentStatusLabel(status: string) {
  switch (status) {
    case "WORKING": return "Working";
    case "RESEARCHING": return "Researching";
    case "THINKING": return "Thinking";
    case "WAITING": return "Waiting";
    case "NEEDS_INPUT": return "Needs you";
    case "COMPLETED": return "Completed";
    case "FAILED": return "Failed";
    default: return "Idle";
  }
}
