(() => {
  "use strict";

  const TAG_NAME = "acsis-clarity-mobile";
  const DEFAULT_APP_URL = "https://mpbconsulting2025.github.io/ACSISLC/?embed=1&autoHeight=1&v=17";
  const ROUTES = ["home", "focus", "breathe", "meditate", "soundscapes"];
  const ICONS = {
    home: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>',
    focus: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
    breathe: '<circle cx="12" cy="12" r="8"/><path d="M12 2v4M12 18v4"/>',
    meditate: '<path d="M17.6 15.8A8 8 0 0 1 8.2 6.4 8 8 0 1 0 17.6 15.8Z"/>',
    soundscapes: '<path d="M4 14v-4M8 18V6M12 21V3M16 17V7M20 14v-4"/>'
  };
  const LABELS = {
    home: "Today",
    focus: "Focus",
    breathe: "Breathe",
    meditate: "Meditate",
    soundscapes: "Sounds"
  };

  class ACSISClarityMobile extends HTMLElement {
    static get observedAttributes() {
      return ["src", "bottom-offset"];
    }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.currentRoute = "home";
      this.boundMessage = (event) => this.handleMessage(event);
      this.boundViewport = () => this.updateNavigationVisibility();
      this.render();
    }

    connectedCallback() {
      window.addEventListener("message", this.boundMessage);
      window.addEventListener("scroll", this.boundViewport, { passive: true });
      window.addEventListener("resize", this.boundViewport, { passive: true });
      this.frame.addEventListener("load", () => {
        this.sendToApp({ type: "acsis-clarity-measure" });
        this.sendToApp({ type: "acsis-clarity-route", route: this.currentRoute });
      });
      this.applySource();
      this.applyBottomOffset();
      this.updateNavigationVisibility();
    }

    disconnectedCallback() {
      window.removeEventListener("message", this.boundMessage);
      window.removeEventListener("scroll", this.boundViewport);
      window.removeEventListener("resize", this.boundViewport);
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue || !this.isConnected) return;
      if (name === "src") this.applySource();
      if (name === "bottom-offset") this.applyBottomOffset();
    }

    render() {
      const navigation = ROUTES.map((route) => `
        <button type="button" data-route="${route}" aria-label="Open ${LABELS[route]}" ${route === "home" ? 'class="is-active" aria-current="page"' : ""}>
          <svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[route]}</svg>
          <span>${LABELS[route]}</span>
        </button>
      `).join("");

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            position: relative;
            width: 100%;
            min-width: 280px;
            min-height: 720px;
            scroll-margin-top: 96px;
            background: #f3f6fa;
          }

          iframe {
            display: block;
            width: 100%;
            height: 720px;
            border: 0;
            background: #f3f6fa;
          }

          .mobile-navigation {
            display: none;
          }

          @media (max-width: 760px) {
            .mobile-navigation.is-visible {
              position: fixed;
              z-index: 2147483000;
              right: 0;
              bottom: calc(var(--acsis-quick-bar-offset, 76px) + env(safe-area-inset-bottom));
              left: 0;
              min-height: 72px;
              display: grid;
              grid-template-columns: repeat(5, minmax(0, 1fr));
              gap: 2px;
              border-top: 1px solid rgba(23, 39, 71, 0.12);
              background: rgba(255, 255, 255, 0.98);
              padding: 7px 6px;
              box-shadow: 0 -8px 30px rgba(23, 39, 71, 0.12);
              font-family: Arial, sans-serif;
            }

            button {
              min-width: 0;
              min-height: 58px;
              display: grid;
              justify-items: center;
              align-content: center;
              gap: 3px;
              border: 0;
              border-radius: 12px;
              background: transparent;
              color: #6a7586;
              padding: 5px 1px;
              font: inherit;
              font-size: 10px;
              font-weight: 800;
              cursor: pointer;
            }

            button.is-active {
              background: #dff6fb;
              color: #172747;
            }

            button:focus-visible {
              outline: 3px solid rgba(90, 200, 223, 0.58);
              outline-offset: 1px;
            }

            svg {
              width: 23px;
              height: 23px;
              fill: none;
              stroke: currentColor;
              stroke-width: 1.8;
              stroke-linecap: round;
              stroke-linejoin: round;
            }

            button:first-child svg {
              fill: currentColor;
              stroke: none;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            * {
              scroll-behavior: auto !important;
            }
          }
        </style>
        <iframe title="ACSIS Clarity wellbeing tools" scrolling="no" allow="autoplay"></iframe>
        <nav class="mobile-navigation" aria-label="ACSIS Clarity tools">${navigation}</nav>
      `;

      this.frame = this.shadowRoot.querySelector("iframe");
      this.navigation = this.shadowRoot.querySelector(".mobile-navigation");
      this.shadowRoot.querySelectorAll("[data-route]").forEach((button) => {
        button.addEventListener("click", () => this.chooseRoute(button.dataset.route));
      });
    }

    applySource() {
      const source = this.getAttribute("src") || DEFAULT_APP_URL;
      try {
        const url = new URL(source, window.location.href);
        url.searchParams.set("embed", "1");
        url.searchParams.set("autoHeight", "1");
        this.appOrigin = url.origin;
        if (this.frame.src !== url.href) this.frame.src = url.href;
      } catch {
        this.appOrigin = "";
      }
    }

    applyBottomOffset() {
      const rawValue = this.getAttribute("bottom-offset");
      const value = rawValue === null ? Number.NaN : Number(rawValue);
      const offset = Number.isFinite(value) && value >= 0 ? Math.min(value, 180) : 76;
      this.style.setProperty("--acsis-quick-bar-offset", `${offset}px`);
    }

    handleMessage(event) {
      if (!this.appOrigin || event.origin !== this.appOrigin || event.source !== this.frame.contentWindow) return;
      const message = event.data;
      if (!message || message.source !== "acsis-clarity") return;

      if (message.type === "acsis-clarity-height") {
        const requestedHeight = Number(message.height);
        if (Number.isFinite(requestedHeight)) this.setHeight(requestedHeight);
      }

      if ((message.type === "acsis-clarity-route" || message.type === "acsis-clarity-ready") && ROUTES.includes(message.route)) {
        this.setActiveRoute(message.route);
      }
    }

    setHeight(requestedHeight) {
      const height = Math.max(520, Math.min(Math.ceil(requestedHeight), 12000));
      this.frame.style.height = `${height}px`;
      this.style.height = `${height}px`;
      this.style.minHeight = `${height}px`;
      this.dataset.contentHeight = String(height);
      this.dispatchEvent(new CustomEvent("acsis-clarity-resize", {
        bubbles: true,
        composed: true,
        detail: { height }
      }));
      this.updateNavigationVisibility();
    }

    chooseRoute(route) {
      if (!ROUTES.includes(route)) return;
      this.setActiveRoute(route);
      this.sendToApp({ type: "acsis-clarity-route", route });
      window.setTimeout(() => this.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start"
      }), 40);
    }

    setActiveRoute(route) {
      this.currentRoute = route;
      this.shadowRoot.querySelectorAll("[data-route]").forEach((button) => {
        const active = button.dataset.route === route;
        button.classList.toggle("is-active", active);
        if (active) button.setAttribute("aria-current", "page");
        else button.removeAttribute("aria-current");
      });
    }

    sendToApp(message) {
      if (!this.appOrigin || !this.frame.contentWindow) return;
      this.frame.contentWindow.postMessage({ source: "acsis-clarity-host", ...message }, this.appOrigin);
    }

    updateNavigationVisibility() {
      const rect = this.getBoundingClientRect();
      const mobile = window.matchMedia("(max-width: 760px)").matches;
      const inView = rect.top < window.innerHeight - 90 && rect.bottom > 120;
      this.navigation.classList.toggle("is-visible", mobile && inView);
    }
  }

  if (!customElements.get(TAG_NAME)) customElements.define(TAG_NAME, ACSISClarityMobile);
})();
