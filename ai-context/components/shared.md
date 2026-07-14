---
type: component-group
group: shared
directory: src/components/shared
usedByFeatures: [account_settings, team_management, dashboard]
---

# Components: shared

Only two files exist in `src/components/shared/` — both are dialog-based confirmation modals with slightly different intents. Neither is currently imported by the pages in this cluster (`settings`, `team`, `dashboard` build their own inline `Dialog`s), so treat these as general-purpose utilities available to any feature, not tied to a specific one yet.

## ConfirmationModal (`src/components/shared/ConfirmationModal.tsx`)
Generic confirm/cancel dialog with 4 visual variants (`destructive`, `primary`, `success`, `info`), each with its own icon/color scheme.

**Props**: `isOpen`, `onOpenChange`, `onConfirm`, `title?`, `description?`, `confirmText?`, `cancelText?`, `isLoading?` (shows spinner, disables buttons), `variant?` (default `'primary'`).

Built on `Dialog`/`DialogContent` (`@/components/ui/dialog`) + `Button`.

## DeleteConfirmationModal (`src/components/shared/DeleteConfirmationModal.tsx`)
Narrower, destructive-only variant of the above — always red/`AlertCircle` styled, no variant prop. Functionally a simplified duplicate of `ConfirmationModal` with `variant="destructive"` hard-coded.

**Props**: `isOpen`, `onOpenChange`, `onConfirm`, `title?`, `description?`, `confirmText?`, `cancelText?`, `isLoading?`.

## Notes
- These two components largely overlap — `ConfirmationModal` with `variant="destructive"` is functionally equivalent to `DeleteConfirmationModal`. If asked to consolidate/simplify, `DeleteConfirmationModal` is the one to consider deprecating in favor of `ConfirmationModal`.
