(() => {
    const header = document.querySelector(".header");
    if (!header) return;

    const toggle = header.querySelector(".header__toggle");
    const toggleLabel = header.querySelector(".header__toggle-label");
    const panel = header.querySelector(".header__panel");
    const logo = header.querySelector(".header__logo");
    if (!toggle || !toggleLabel || !panel || !logo) return;

    const OPEN_LABEL = "Zavřít menu";
    const CLOSED_LABEL = "Otevřít menu";
    // Keep this breakpoint in sync with header.css.
    const desktopQuery = window.matchMedia("(width >= 60rem)");
    const focusableSelector =
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const inertStates = new Map();
    let isOpen = false;
    let previousOverflow = "";

    const getFocusableElements = () =>
        [toggle, ...panel.querySelectorAll(focusableSelector)].filter(
            (element) => !element.inert && element.getClientRects().length > 0,
        );

    function handleKeydown(event) {
        if (event.key === "Escape") {
            event.preventDefault();
            closeNav();
            return;
        }

        if (event.key !== "Tab") return;

        const focusable = getFocusableElements();
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    function setPanelState(open) {
        toggle.setAttribute("aria-expanded", String(open));
        toggleLabel.textContent = open ? OPEN_LABEL : CLOSED_LABEL;
        panel.classList.toggle("header__panel--open", open);
    }

    function openNav() {
        if (isOpen || desktopQuery.matches) return;
        isOpen = true;
        previousOverflow = document.body.style.overflow;

        const backgroundElements = [
            logo,
            ...Array.from(document.body.children).filter(
                (element) => element !== header,
            ),
        ];
        backgroundElements.forEach((element) => {
            inertStates.set(element, element.inert);
            element.inert = true;
        });

        setPanelState(true);
        panel.inert = false;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", handleKeydown);
        toggle.focus();
    }

    function closeNav({ restoreFocus = true } = {}) {
        const wasOpen = isOpen;
        isOpen = false;
        setPanelState(false);
        panel.inert = !desktopQuery.matches;
        document.removeEventListener("keydown", handleKeydown);

        if (wasOpen) {
            inertStates.forEach((inert, element) => {
                element.inert = inert;
            });
            inertStates.clear();
            document.body.style.overflow = previousOverflow;
            if (restoreFocus && !desktopQuery.matches) toggle.focus();
        }
    }

    function syncWithViewport() {
        const focusedElement = document.activeElement;
        const focusWasInPanel = panel.contains(focusedElement);
        closeNav({ restoreFocus: false });

        if (desktopQuery.matches && focusedElement === toggle) {
            panel.querySelector(focusableSelector)?.focus();
        } else if (!desktopQuery.matches && focusWasInPanel) {
            toggle.focus();
        }
    }

    toggle.addEventListener("click", () => {
        if (isOpen) closeNav();
        else openNav();
    });

    panel.addEventListener("click", (event) => {
        if (event.target.closest("a[href]") && !desktopQuery.matches) {
            closeNav();
        }
    });

    desktopQuery.addEventListener("change", syncWithViewport);
    syncWithViewport();

    if ("ResizeObserver" in window) {
        const headerObserver = new ResizeObserver(() => {
            header.style.setProperty(
                "--header-height",
                `${header.getBoundingClientRect().height}px`,
            );
        });
        headerObserver.observe(header);
    }
})();
