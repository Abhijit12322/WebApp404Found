"use client";

import * as React from "react";
import { ToastActionElement, type ToastProps } from "@/components/ui/toast";

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 5000;

export type ToasterToast = ToastProps & {
    id: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
    action?: ToastActionElement;
    open?: boolean;
};

let count = 0;
function genId() {
    count = (count + 1) % Number.MAX_SAFE_INTEGER;
    return count.toString();
}

interface State {
    toasts: ToasterToast[];
}

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function dispatch(stateUpdate: State) {
    memoryState = stateUpdate;
    listeners.forEach((listener) => listener(memoryState));
}

export function useToast() {
    const [state, setState] = React.useState<State>(memoryState);

    React.useEffect(() => {
        listeners.push(setState);
        return () => {
            const idx = listeners.indexOf(setState);
            if (idx !== -1) listeners.splice(idx, 1);
        };
    }, []);

    const toast = (toast: Omit<ToasterToast, "id" | "open">) => {
        const id = genId();
        const newToast: ToasterToast = { ...toast, id, open: true };
        const updated = [newToast, ...state.toasts].slice(0, TOAST_LIMIT);
        dispatch({ toasts: updated });
        setTimeout(() => dismiss(id), TOAST_REMOVE_DELAY);
        return id;
    };

    const dismiss = (toastId: string) => {
        dispatch({ toasts: state.toasts.filter((t) => t.id !== toastId) });
    };

    return { ...state, toast, dismiss };
}
