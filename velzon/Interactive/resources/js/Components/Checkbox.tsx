import React from "react";

export default function Checkbox({ className = '', ...props }: any) {
    return (
        <React.Fragment>
            <input
                {...props}
                type="checkbox"
                className={
                    'rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 ' +
                    className
                }
            />
        </React.Fragment>
    );
}
