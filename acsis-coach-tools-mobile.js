(() => {
  "use strict";

  const TAG_NAME = "acsis-coach-tools-mobile";
  const TOOLBOX_URL = "https://acsis-life-coaching-toolbox.netlify.app/toolbox.dc?v=10";

  class ACSISCoachToolsMobile extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.render();
    }

    render() {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            width: 100%;
            min-width: 280px;
            height: 100%;
            min-height: 0;
            background: #f3f6fa;
          }

          *,
          *::before,
          *::after {
            box-sizing: border-box;
          }

          .launcher {
            min-height: 100%;
            display: grid;
            align-content: center;
            gap: 15px;
            padding: 24px 20px;
            border: 1px solid rgba(23, 39, 71, 0.12);
            border-radius: 24px;
            background: #ffffff;
            color: #172747;
            font-family: Arial, sans-serif;
            text-align: left;
            box-shadow: 0 14px 34px rgba(23, 39, 71, 0.1);
          }

          .launcher-kicker {
            color: #ef1743;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.12em;
            text-transform: uppercase;
          }

          .launcher h2 {
            margin: 0;
            font-size: clamp(25px, 8vw, 34px);
            line-height: 1.04;
          }

          .launcher p {
            margin: 0;
            color: #4d5d76;
            font-size: 15px;
            line-height: 1.5;
          }

          .launcher-link {
            min-height: 54px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 999px;
            background: #172747;
            color: #ffffff;
            padding: 12px 18px;
            font-size: 16px;
            font-weight: 800;
            text-decoration: none;
          }

          .launcher-link:focus-visible {
            outline: 3px solid rgba(90, 200, 223, 0.68);
            outline-offset: 3px;
          }

          .launcher-note {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #647188;
            font-size: 12px;
            line-height: 1.35;
          }

          .launcher-note::before {
            width: 10px;
            height: 10px;
            flex: 0 0 10px;
            border-radius: 50%;
            background: #5ac8df;
            content: "";
          }
        </style>

        <section class="launcher" aria-labelledby="acsis-coach-tools-launcher-title">
          <span class="launcher-kicker">ACSIS Coaching Toolbox</span>
          <h2 id="acsis-coach-tools-launcher-title">Open your coaching tools</h2>
          <p>For the best mobile experience, open the toolbox full screen. You will have one smooth scroll and every worksheet will stay easy to read and use.</p>
          <a class="launcher-link" href="${TOOLBOX_URL}" target="_top">Open Coach Tools</a>
          <span class="launcher-note">Free to use. Your entries stay in this browser.</span>
        </section>
      `;
    }
  }

  if (!customElements.get(TAG_NAME)) customElements.define(TAG_NAME, ACSISCoachToolsMobile);
})();
