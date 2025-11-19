"use client";

import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import {
    Toast,
    ToastTitle,
    ToastDescription,
    ToastClose,
    ToastProvider,
    ToastViewport,
    type ToastActionElement,
} from "@/components/ui/toast";

export const Toaster: React.FC = () => {
    const { toasts } = useToast();

    return (
        <ToastProvider>
            {toasts.map(({ id, title, description, action, ...props }) => (
                <Toast key={id} {...props}>
                    <div className="grid gap-1">
                        {title && <ToastTitle>{title}</ToastTitle>}
                        {description && <ToastDescription>{description}</ToastDescription>}
                    </div>
                    {action && React.isValidElement<ToastActionElement>(action) && action}
                    <ToastClose />
                </Toast>
            ))}
            <ToastViewport />
        </ToastProvider>
    );
};
