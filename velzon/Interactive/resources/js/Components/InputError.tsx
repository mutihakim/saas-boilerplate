import React from "react";

export default function InputError({ message, className = '', ...props }: any) {
    return message ? (
        <React.Fragment>
            <p {...props} className={'text-sm text-red-600 ' + className}>
                {message}
            </p>
        </React.Fragment>
    ) : null;
}
