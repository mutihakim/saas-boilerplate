import React from "react";

export default function InputLabel({ value, className = '', children, ...props }: any) {
    return (
        <React.Fragment>
            <label {...props} className={`block font-medium text-sm text-gray-700 ` + className}>
                {value ? value : children}
            </label>
        </React.Fragment>
    );
}
