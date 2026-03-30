import { createElement, isValidElement, type ReactNode } from 'react';
import { toast, ToastOptions } from 'react-toastify';

let audioContext: AudioContext | null = null;
const GLOBAL_TOAST_ID = "appsah-global-toast";

function getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    if (!audioContext) {
        audioContext = new Ctx();
    }
    return audioContext;
}

function playTone(frequency: number, durationSec: number, type: OscillatorType) {
    const ctx = getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + durationSec);
}

function playSuccessSound() {
    playTone(920, 0.09, 'sine');
}

function playErrorSound() {
    playTone(240, 0.16, 'square');
}

function withDefaults(options?: ToastOptions): ToastOptions {
    return {
        position: 'top-right',
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        ...options,
    };
}

type NotifyType = 'success' | 'error' | 'warning' | 'info';
type ErrorInput = ReactNode | { title: string; detail?: string };

function buildTwoLineErrorMessage(input: ErrorInput): ReactNode {
    if (isValidElement(input)) {
        return input;
    }

    if (typeof input === 'object' && input !== null && 'title' in input) {
        const title = String(input.title || 'Terjadi kesalahan');
        const detail = String(input.detail || 'Silakan coba lagi beberapa saat lagi.');
        return createElement(
            'div',
            null,
            createElement('div', { className: 'fw-semibold' }, title),
            createElement('div', { className: 'small text-muted mt-1' }, detail)
        );
    }

    const text = typeof input === 'string' ? input.trim() : String(input ?? '').trim();
    const [titleRaw, ...rest] = text.split('\n').map((line) => line.trim()).filter(Boolean);
    const title = titleRaw || 'Terjadi kesalahan';
    const detail = rest.join(' ') || 'Silakan coba lagi beberapa saat lagi.';

    return createElement(
        'div',
        null,
        createElement('div', { className: 'fw-semibold' }, title),
        createElement('div', { className: 'small text-muted mt-1' }, detail)
    );
}

function emit(type: NotifyType, message: ReactNode, options?: ToastOptions) {
    const baseOptions = withDefaults({ ...options, toastId: GLOBAL_TOAST_ID });

    if (toast.isActive(GLOBAL_TOAST_ID)) {
        return toast.update(GLOBAL_TOAST_ID, {
            ...baseOptions,
            render: message,
            type,
            autoClose: baseOptions.autoClose ?? 3000,
        });
    }

    return toast(message, {
        ...baseOptions,
        type,
    });
}

export const notify = {
    success(message: ReactNode, options?: ToastOptions) {
        playSuccessSound();
        return emit('success', message, options);
    },
    error(message: ErrorInput, options?: ToastOptions) {
        playErrorSound();
        return emit('error', buildTwoLineErrorMessage(message), options);
    },
    warning(message: ReactNode, options?: ToastOptions) {
        playErrorSound();
        return emit('warning', message, options);
    },
    info(message: ReactNode, options?: ToastOptions) {
        return emit('info', message, options);
    },
};
