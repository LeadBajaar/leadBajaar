import { ReactNode } from "react";

export interface PageHeaderProps {
  /** The main title of the page */
  title: ReactNode;
  
  /** Optional subtitle or description text below the title */
  description?: ReactNode;
  
  /** Optional icon to display to the left of the title */
  icon?: ReactNode;
  
  /** Optional badge or status indicator to display to the right of the title */
  badge?: ReactNode;

  /** Optional breadcrumbs or back button to display above the title */
  breadcrumbs?: ReactNode;

  /** Primary actions area (typically right-aligned buttons) */
  actions?: ReactNode;

  /** Secondary actions area (e.g., search bars, segment controls) */
  secondaryActions?: ReactNode;

  /**
   * Optional custom class name for the outermost container.
   * NOTE: This is intended for rare layout exceptions only.
   * Do NOT use this as a substitute for `actions` or `secondaryActions`.
   */
  className?: string;
}
