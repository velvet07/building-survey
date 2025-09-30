/**
 * Toast Notification Utilities
 * Wrapper around react-hot-toast for consistent notifications
 */

import toast from 'react-hot-toast';

/**
 * Show success notification
 */
export function showSuccess(message: string): void {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
  });
}

/**
 * Show error notification
 */
export function showError(message: string): void {
  toast.error(message, {
    duration: 4000,
    position: 'top-right',
  });
}

/**
 * Show info notification
 */
export function showInfo(message: string): void {
  toast(message, {
    duration: 3000,
    position: 'top-right',
  });
}

/**
 * Show loading notification
 */
export function showLoading(message: string): string {
  return toast.loading(message, {
    position: 'top-right',
  });
}

/**
 * Dismiss a specific toast
 */
export function dismissToast(toastId: string): void {
  toast.dismiss(toastId);
}

/**
 * Dismiss all toasts
 */
export function dismissAllToasts(): void {
  toast.dismiss();
}