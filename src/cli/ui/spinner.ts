import { createSpinner as nanospinner } from 'nanospinner';
import { theme } from './colors.js';

export type SpinnerHandle = ReturnType<typeof nanospinner>;

export function startSpinner(text: string): SpinnerHandle {
  const spinner = nanospinner(theme.spinner.start(text));
  return spinner;
}

export function successSpinner(spinner: SpinnerHandle, text?: string): void {
  spinner.success({ text: text ? theme.spinner.success(text) : undefined });
}

export function errorSpinner(spinner: SpinnerHandle, text?: string): void {
  spinner.error({ text: text ? theme.spinner.error(text) : undefined });
}

export function warnSpinner(spinner: SpinnerHandle, text?: string): void {
  spinner.warn({ text: text ? theme.spinner.error(text) : undefined });
}
