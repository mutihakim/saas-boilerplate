import React, { useState } from 'react';

export default function FullScreenDropdown() {
    const [isFullScreenMode, setIsFullScreenMode] = useState(true);

    const toggleFullscreen = () => {
        const doc = window.document as Document & {
            mozFullScreenElement?: Element | null;
            webkitFullscreenElement?: Element | null;
            webkitIsFullScreen?: boolean;
            mozFullScreen?: boolean;
            msFullscreenElement?: Element | null;
            cancelFullScreen?: () => Promise<void>;
            mozCancelFullScreen?: () => Promise<void>;
            webkitCancelFullScreen?: () => Promise<void>;
        };
        const html = doc.documentElement as HTMLElement & {
            mozRequestFullScreen?: () => Promise<void>;
            webkitRequestFullscreen?: () => Promise<void>;
        };

        document.body.classList.add('fullscreen-enable');

        if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement) {
            setIsFullScreenMode(false);
            if (html.requestFullscreen) {
                void html.requestFullscreen();
            } else if (html.mozRequestFullScreen) {
                void html.mozRequestFullScreen();
            } else if (html.webkitRequestFullscreen) {
                void html.webkitRequestFullscreen();
            }
        } else {
            setIsFullScreenMode(true);
            if (doc.exitFullscreen) {
                void doc.exitFullscreen();
            } else if (doc.cancelFullScreen) {
                void doc.cancelFullScreen();
            } else if (doc.mozCancelFullScreen) {
                void doc.mozCancelFullScreen();
            } else if (doc.webkitCancelFullScreen) {
                void doc.webkitCancelFullScreen();
            }
        }

        const exitHandler = () => {
            if (!doc.webkitIsFullScreen && !doc.mozFullScreen && !doc.msFullscreenElement) {
                document.body.classList.remove('fullscreen-enable');
            }
        };

        document.addEventListener('fullscreenchange', exitHandler, { once: true });
        document.addEventListener('webkitfullscreenchange', exitHandler, { once: true });
        document.addEventListener('mozfullscreenchange', exitHandler, { once: true });
    };

    return (
        <div className="ms-1 header-item d-none d-sm-flex">
            <button
                onClick={toggleFullscreen}
                type="button"
                className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle"
            >
                <i className={isFullScreenMode ? 'bx bx-fullscreen fs-22' : 'bx bx-exit-fullscreen fs-22'}></i>
            </button>
        </div>
    );
}
