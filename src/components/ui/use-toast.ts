import * as React from "react"
import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type State = {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

export function useToast() {
  const [state, setState] = React.useState<State>({ toasts: [] })

  const toast = React.useCallback((props: Omit<ToasterToast, "id">) => {
    const id = genId()
    setState((state) => ({
      ...state,
      toasts: [{ ...props, id }, ...state.toasts].slice(0, TOAST_LIMIT),
    }))
    return {
      id,
      dismiss: () => setState((state) => ({
        ...state,
        toasts: state.toasts.filter((t) => t.id !== id),
      })),
    }
  }, [])

  return {
    ...state,
    toast,
    dismiss: React.useCallback((toastId?: string) => {
      setState((state) => ({
        ...state,
        toasts: state.toasts.filter((t) => t.id !== toastId),
      }))
    }, []),
  }
} 