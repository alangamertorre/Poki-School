// Local Ads Fallback Provider Module
// This module provides local image fallbacks for ads
//
// To enable clickable banners, set URLs in LOCAL_BANNER_LINKS:
// - Set to a URL string to make the banner clickable
// - Set to null to disable click functionality
// - Example: 0: 'https://example.com', 1: null, 2: 'https://another-site.com'

(function () {
    console.log("[local-ads.js] Module loading...");

    // Ensure global providers exist
    window.videoAdProviders = window.videoAdProviders || {};
    window.bannerAdProviders = window.bannerAdProviders || {};

    // Local banner image paths (adblock-safe names)
    const LOCAL_BANNER_IMAGES = {
        0: 'ads/local-ads-assets/a.png', // 300x250
        1: 'ads/local-ads-assets/b.png', // 728x90
        2: 'ads/local-ads-assets/c.png'  // 300x600
    };

    // Optional banner links (set to null to disable click functionality)
    const LOCAL_BANNER_LINKS = {
        0: 'https://bloxity.io/?utm_source=veck&utm_medium=banner&utm_campaign=crosspromo', // 300x250
        1: 'https://growden.io/?utm_source=veck&utm_medium=banner&utm_campaign=crosspromo', // 728x90 
        2: 'https://1v1s.lol/?utm_source=veck&utm_medium=banner&utm_campaign=crosspromo'  // 300x600
    };

    // ---------------------------------------------------------------------
    // External-link helper with sandboxed-iframe fallback modal
    //
    // Portals like minijuegos.com embed the game in a sandboxed iframe that
    // can silently block window.open(). When that happens we show an in-game
    // modal with the URL and a one-click copy button so the player can still
    // reach the destination.
    // ---------------------------------------------------------------------

    const MODAL_ID = 'veck-link-fallback-modal';
    const STYLE_ID = 'veck-link-fallback-style';

    function injectModalStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            #${MODAL_ID} {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.8);
                z-index: 2147483647;
                display: none;
                align-items: center;
                justify-content: center;
                font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
                animation: veck-lf-fade 0.15s ease-out;
            }
            #${MODAL_ID}.veck-lf-open { display: flex; }
            @keyframes veck-lf-fade {
                from { opacity: 0; }
                to   { opacity: 1; }
            }
            #${MODAL_ID} .veck-lf-box {
                background: #1a1d24;
                color: #fff;
                padding: 24px;
                border-radius: 12px;
                max-width: 440px;
                width: calc(100% - 32px);
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
                border: 1px solid #2a2d34;
                text-align: center;
            }
            #${MODAL_ID} .veck-lf-title {
                margin: 0 0 8px 0;
                font-size: 18px;
                font-weight: 800;
                color: #ffd600;
                letter-spacing: 0.2px;
            }
            #${MODAL_ID} .veck-lf-text {
                margin: 0 0 16px 0;
                font-size: 13px;
                line-height: 1.5;
                color: #c9ced6;
            }
            #${MODAL_ID} .veck-lf-input {
                width: 100%;
                box-sizing: border-box;
                padding: 10px 12px;
                background: #0f1218;
                border: 1px solid #2a2d34;
                color: #fff;
                border-radius: 8px;
                font-size: 13px;
                font-family: ui-monospace, "SF Mono", Consolas, monospace;
                text-align: center;
                margin-bottom: 16px;
                outline: none;
            }
            #${MODAL_ID} .veck-lf-input:focus { border-color: #ffd600; }
            #${MODAL_ID} .veck-lf-actions {
                display: flex;
                gap: 8px;
                justify-content: center;
            }
            #${MODAL_ID} .veck-lf-btn {
                padding: 10px 18px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 700;
                cursor: pointer;
                transition: transform 0.05s ease, filter 0.15s ease;
            }
            #${MODAL_ID} .veck-lf-btn:active { transform: translateY(1px); }
            #${MODAL_ID} .veck-lf-btn-primary {
                background: linear-gradient(226deg, #ffd600, #ff9400);
                color: #1a1d24;
                box-shadow: 0 0 18px rgba(255, 200, 0, 0.35);
            }
            #${MODAL_ID} .veck-lf-btn-primary:hover { filter: brightness(1.05); }
            #${MODAL_ID} .veck-lf-btn-secondary {
                background: #2a2d34;
                color: #fff;
            }
            #${MODAL_ID} .veck-lf-btn-secondary:hover { background: #353942; }
        `;
        document.head.appendChild(style);
    }

    function ensureModal() {
        let modal = document.getElementById(MODAL_ID);
        if (modal) return modal;

        injectModalStyles();

        modal = document.createElement('div');
        modal.id = MODAL_ID;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.innerHTML = `
            <div class="veck-lf-box">
                <h3 class="veck-lf-title">Link blocked by site</h3>
                <p class="veck-lf-text">This site blocked opening the link in a new tab. Copy it and paste in a new tab:</p>
                <input type="text" class="veck-lf-input" readonly>
                <div class="veck-lf-actions">
                    <button type="button" class="veck-lf-btn veck-lf-btn-primary" data-action="copy">Copy Link</button>
                    <button type="button" class="veck-lf-btn veck-lf-btn-secondary" data-action="close">Close</button>
                </div>
            </div>
        `;

        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeLinkFallback();
        });
        modal.querySelector('[data-action="close"]').addEventListener('click', closeLinkFallback);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.classList.contains('veck-lf-open')) {
                closeLinkFallback();
            }
        });

        document.body.appendChild(modal);
        return modal;
    }

    function closeLinkFallback() {
        const modal = document.getElementById(MODAL_ID);
        if (modal) modal.classList.remove('veck-lf-open');
    }

    function showLinkFallback(url) {
        const modal = ensureModal();
        const input = modal.querySelector('.veck-lf-input');
        const copyBtn = modal.querySelector('[data-action="copy"]');

        input.value = url;
        copyBtn.textContent = 'Copy Link';
        copyBtn.disabled = false;

        modal.classList.add('veck-lf-open');

        // Pre-select so mobile users can long-press → copy if buttons fail
        setTimeout(() => {
            try {
                input.focus();
                input.setSelectionRange(0, input.value.length);
            } catch (e) { /* noop */ }
        }, 50);

        copyBtn.onclick = async function () {
            let ok = false;
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(url);
                    ok = true;
                }
            } catch (e) {
                console.warn('[local-ads.js] clipboard.writeText failed, trying execCommand', e);
            }
            if (!ok) {
                try {
                    input.focus();
                    input.setSelectionRange(0, input.value.length);
                    ok = !!(document.execCommand && document.execCommand('copy'));
                } catch (e) { ok = false; }
            }
            if (ok) {
                copyBtn.textContent = 'Copied!';
                setTimeout(closeLinkFallback, 900);
            } else {
                copyBtn.textContent = 'Press Ctrl+C';
                try {
                    input.focus();
                    input.setSelectionRange(0, input.value.length);
                } catch (e) { /* noop */ }
            }
        };
    }

    // Attempt to open url in a new tab; show fallback modal if the browser /
    // sandboxed iframe blocked the popup.
    //
    // IMPORTANT: must be called synchronously from a user-gesture handler
    // (e.g. a click event) — no awaits or timeouts before the window.open call,
    // or the browser will block the popup regardless of sandbox.
    function openExternalLink(url) {
        if (!url) return false;

        let newWindow = null;
        try {
            // Note: we do NOT pass 'noopener' in the features string because
            // browsers return null in that case, which would falsely trigger
            // the fallback modal on every click. We null out .opener manually
            // below to get the same security.
            newWindow = window.open(url, '_blank');
        } catch (e) {
            console.warn('[local-ads.js] window.open threw, treating as blocked', e);
            newWindow = null;
        }

        if (newWindow && !newWindow.closed) {
            try { newWindow.opener = null; } catch (e) { /* noop */ }
            return true;
        }

        console.log('[local-ads.js] window.open blocked, showing fallback modal for', url);
        showLinkFallback(url);
        return false;
    }

    // Expose globally so other UI code (in-game buttons, Unity callbacks, etc.)
    // can reuse the same safe-open + modal-fallback path.
    window.openExternalLink = openExternalLink;
    window.showLinkFallback = showLinkFallback;

    // Video ad provider implementation (simulated)
    window.videoAdProviders.local = {
        showMidroll: function (onSuccess, onFailure) {
            console.log(`[local-ads.js] showMidroll called - failing immediately`);
            onFailure();
        },

        showRewarded: function (onSuccess, onFailure) {
            console.log(`[local-ads.js] showRewarded called - failing immediately`);
            onFailure();
        }
    };

    // Banner ad provider implementation
    window.bannerAdProviders.local = {
        displayBanner: async function (bannerType, container) {
            console.log(`[local-ads.js] displayBanner for type: ${bannerType}`);

            const imagePath = LOCAL_BANNER_IMAGES[bannerType];
            if (!imagePath) {
                console.log(`[local-ads.js] No local image for banner type ${bannerType}`);
                return false;
            }

            // Get dimensions from global bannerDimensions
            const dims = window.bannerDimensions[bannerType];
            if (!dims) {
                console.log(`[local-ads.js] No dimensions for banner type ${bannerType}`);
                return false;
            }

            // Preload image and resolve true on success, false on failure
            return await new Promise((resolve) => {
                const testImg = new Image();
                testImg.onload = function () {
                    const img = document.createElement('img');
                    img.src = imagePath;
                    img.style.width = dims.width;
                    img.style.height = dims.height;
                    img.style.display = 'block';
                    img.style.cursor = 'pointer';
                    img.alt = `Local Banner ${dims.width}x${dims.height}`;

                    // Add click handler if link is configured
                    const bannerLink = LOCAL_BANNER_LINKS[bannerType];
                    if (bannerLink) {
                        img.addEventListener('click', function () {
                            console.log(`[local-ads.js] Banner clicked, opening: ${bannerLink}`);
                            openExternalLink(bannerLink);
                        });
                    } else {
                        // Still show pointer cursor but no click action
                        img.style.cursor = 'default';
                    }

                    container.innerHTML = '';
                    container.appendChild(img);
                    console.log(`[local-ads.js] Local banner displayed: ${imagePath}${bannerLink ? ` (clickable: ${bannerLink})` : ' (no link)'}`);
                    resolve(true);
                };
                testImg.onerror = function () {
                    console.log('[local-ads.js] Local image blocked/missing');
                    resolve(false);
                };
                testImg.src = imagePath;
            });
        }
    };

    console.log("[local-ads.js] Module loaded successfully");
})();
