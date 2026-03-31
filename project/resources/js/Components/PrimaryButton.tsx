import React from "react";

export default function PrimaryButton({ className = '', disabled, children, ...props }: any) {
    return (
        <button
            {...props}
            className={
                `btn btn-success w-100'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
