# ACSIS Clarity

ACSIS Clarity is a free, installable wellbeing web app from ACSIS Life Coaching. This first beta includes:

- a WOOT-inspired Focus area with one automatic session flow, optional box breathing, custom focus and break lengths, a ready-made Pomodoro setup, an expandable session plan, a distraction pad and completion alarms
- copyable and downloadable session summaries saved as simple text files
- five guided visual breathing patterns, including a customisable 4.5 to 6.5 breaths-per-minute resonance builder
- a no-voice meditation timer with on-screen breath, body scan, body brushing, listening and open-awareness guidance
- optional guidance pings and custom sound controls in Focus, Breathe and Meditate, including separate background and tone volumes and an explicit no-sound choice
- continuous browser-generated soundscapes, visible single-sound choices and one clearly labelled shared mix that carries into Focus, Breathe and Meditate
- commonly used pure-tone names with plain-English guidance that separates popular claims from established evidence
- local-only saving, reduced motion and a low-stimulation display option

## Privacy

Entries and preferences are saved in the current browser using local storage. Nothing is uploaded and there are no accounts.

## Run locally

Serve this directory over HTTP. For example:

```sh
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## GitHub Pages

The app uses relative paths and can be served from a GitHub Pages project subdirectory. A publishing workflow is included in `.github/workflows/pages.yml`.

After pushing the `main` branch to a public GitHub repository, open **Settings > Pages** and select **GitHub Actions** as the publishing source. Future pushes to `main` will publish the site automatically.

## Important limitation

Timer alarms depend on the web app remaining open. Silent mode, battery controls and browser restrictions can prevent sound. This limitation is stated inside the app.
