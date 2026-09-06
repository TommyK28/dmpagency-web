(() => {
    const header = document.querySelector(".header");
    if (!header) return;

    const toggle = header.querySelector(".header__toggle");
    const toggleLabel = toggle.querySelector(".header__toggle-label");
    const panel = header.querySelector(".header__panel");
    const logo = header.querySelector(".header__logo");
    const siblings = Array.from(document.body.children).filter((el) => el !== header);

    const OPEN_LABEL = "Zavřít menu";
    const CLOSED_LABEL = "Otevřít menu";

    const desktopQuery = window.matchMedia("(min-width: 60em)");
    const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const getFocusableElements = () =>
        [toggle, ...panel.querySelectorAll(focusableSelector)].filter((el) => el.offsetParent !== null);

    const handleKeydown = (event) => {
        if (event.key === "Escape") {
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
    };

    function openNav() {
        toggle.setAttribute("aria-expanded", "true");
        toggleLabel.textContent = OPEN_LABEL;
        panel.classList.add("header__panel--open");
        panel.inert = false;
        logo.inert = true;
        siblings.forEach((el) => (el.inert = true));
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", handleKeydown);
    }

    function closeNav({ restoreFocus = true } = {}) {
        toggle.setAttribute("aria-expanded", "false");
        toggleLabel.textContent = CLOSED_LABEL;
        panel.classList.remove("header__panel--open");
        panel.inert = true;
        logo.inert = false;
        siblings.forEach((el) => (el.inert = false));
        document.body.style.overflow = "";
        document.removeEventListener("keydown", handleKeydown);
        if (restoreFocus) toggle.focus();
    }

    function syncWithViewport(isDesktop) {
        document.removeEventListener("keydown", handleKeydown);
        toggle.setAttribute("aria-expanded", "false");
        toggleLabel.textContent = CLOSED_LABEL;
        panel.classList.remove("header__panel--open");
        logo.inert = false;
        siblings.forEach((el) => (el.inert = false));
        document.body.style.overflow = "";
        panel.inert = !isDesktop;
    }

    toggle.addEventListener("click", () => {
        const isOpen = toggle.getAttribute("aria-expanded") === "true";
        isOpen ? closeNav() : openNav();
    });

    panel.querySelectorAll(".header__nav-link").forEach((link) => {
        link.addEventListener("click", () => {
            if (!desktopQuery.matches) closeNav({ restoreFocus: false });
        });
    });

    desktopQuery.addEventListener("change", (event) => syncWithViewport(event.matches));
    syncWithViewport(desktopQuery.matches);

    if ("ResizeObserver" in window) {
        const headerObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                header.style.setProperty("--header-height", `${entry.contentRect.height}px`);
            }
        });
        headerObserver.observe(header);
    }
})();
