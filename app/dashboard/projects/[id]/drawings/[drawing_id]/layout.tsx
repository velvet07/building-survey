import type { ReactNode } from 'react';

/**
 * Minimal layout for the drawing editor.
 * Removes the dashboard header/sidebar so the canvas can use the full screen height.
 */
export default function DrawingEditorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="min-h-screen bg-emerald-50">{children}</div>;
}
