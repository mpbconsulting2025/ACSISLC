# ACSIS Coaches Handbook

Live address after GitHub Pages publishes:

`https://mpbconsulting2025.github.io/ACSISLC/coaches-handbook/`

## Privacy model

- Client and session entries are stored only in local browser storage on the device being used.
- The handbook has no server save, account sync, analytics, form submission or data API.
- A restrictive browser policy blocks the handbook from making data connections.
- Entries do not move to another device or coach automatically.
- The coach chooses when to export a PDF, save it and email it.
- The hosted application files are public. Completed client and session content is not part of those files.

If a device is shared, export the required PDF and then use **Clear** before leaving the device.

## Wix embed

Use a Wix **Custom Element** so the Wix page can grow and shrink with the active handbook tab and any coaching exercises opened by the coach.

- Server URL: `https://mpbconsulting2025.github.io/ACSISLC/coaches-handbook/wix-handbook-embed.js?v=23`
- Tag name: `acsis-coaches-handbook`
- Stretch the element to the full available width on desktop and mobile.
- Do not add a second mobile launcher. The same responsive handbook is used at both Wix breakpoints.

The custom element loads:

`https://mpbconsulting2025.github.io/ACSISLC/coaches-handbook/?embed=1&v=22`
`https://mpbconsulting2025.github.io/ACSISLC/coaches-handbook/?embed=1&v=23`
The handbook sends only its current pixel height to the Wix wrapper. Client and session content is never included in that message and remains in the handbook's local browser storage.

## Shared coaching tools

The handbook links to the worksheet files in `../coaching-tools/`. The standalone toolbox links to the same files, so the worksheets have one working source while the handbook and toolbox remain independent applications.

Rebuild the catalogue after changing `coaching-tools/Toolbox.dc.html`:

```sh
node scripts/build-coaches-handbook.mjs
node scripts/validate-coaches-handbook.mjs
```
