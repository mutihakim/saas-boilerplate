import { Turnstile } from '@marsidev/react-turnstile';
import React from 'react';

type Props = {
    enabled?: boolean;
    siteKey?: string | null;
    onVerify: (token: string) => void;
};

export default function TurnstileField({ enabled, siteKey, onVerify }: Props) {
    if (!enabled || !siteKey) {
        return null;
    }

    return (
        <div className="my-3">
            <Turnstile
                siteKey={siteKey}
                onSuccess={onVerify}
                options={{
                    theme: 'light',
                }}
            />
        </div>
    );
}
