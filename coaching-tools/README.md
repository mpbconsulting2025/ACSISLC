# ACSIS Life Coaching Toolbox V10

This folder is ready to deploy as one Netlify site. Upload the whole folder so the toolbox, worksheets, shared styles, fonts and images remain together.

## What changed in V10

- Corrected the ACSIS logo distortion in narrow desktop and embedded layouts.
- Locked every worksheet header logo to the original 6935 by 2019 aspect ratio.
- Prevented the logo from shrinking independently when a heading is long.
- Added a balanced intermediate layout from 721 to 900 pixels, with a slightly smaller heading and a fixed-proportion logo.
- Retained the stacked phone layout with a correctly proportioned logo.
- Applied the logo correction through the shared stylesheet so it covers Johari and every other tool, including older worksheets with inline logo sizing.

## Changes carried forward from V9

- Rebuilt the Johari Window around the sequence and language in the supplied workbook:
  - a separate SELF questionnaire;
  - a separate FIRST OBSERVER questionnaire;
  - a separate SECOND OBSERVER questionnaire;
  - OPEN, BLIND, HIDDEN and UNKNOWN areas calculated only after the relevant lists are confirmed complete.
- Added three clear routes: SELF only, SELF plus one observer, or SELF plus two observers.
- Added a private observer link and response-code workflow. Observers can complete their list in another browser without seeing the person's SELF answers, then return a code that can be imported into Observer 1 or Observer 2.
- Added a Different observer views holding area when two observers select a word differently. Mixed observer selections are not forced into an incorrect Johari area.
- Kept results blank while a response is unfinished, so an unticked word is not mistaken for a completed choice.

## Changes carried forward from V8

- Added eight original ACSIS reflection and planning tools:
  - After Action Review (AAR)
  - Life Navigation Compass
  - Mission Planning Worksheet
  - Nature Connection Audit
  - Operational Readiness Review
  - Resilience Condition State Assessment
  - Values and Purpose Alignment Check
  - Weekly Situation Report (SITREP)
- Added a short expandable **Why this may help** panel, marked by a question icon, to every worksheet.
- Kept the original continuous toolbox grid and placed all 31 tools in alphabetical order.
- Retained browser-only saving, client-to-coach notes and Save as PDF across the worksheets.

## Design and safety decisions

- Military language is optional where it appears. The worksheets also offer everyday alternatives such as weekly check-in, goal, project or next chapter.
- The AAR is framed as learning without blame.
- The resilience tool is a non-clinical capacity check and includes current NHS urgent-support signposting.
- The nature tool supports varied mobility, energy, sensory, access and cultural needs. Nature can include a view, weather, a houseplant or other realistic forms of contact.
- Johari feedback is voluntary. Clients are encouraged to use trusted observers, ask for examples and keep their own disclosure boundaries. Unticked words count only after that participant confirms their list is complete.

## Changes carried forward

- Original alphabetical single-grid layout with no Coach Resources section.
- OSCAR only, not OSKAR.
- T-GROW shown as Topic, Goal, Reality, Options and Way Forward.
- ACHIEVE, FUEL, WOOP, Scripts and the existing coaching worksheets.
- Strength, Weakness, Opportunity and Threat wording in Personal SWOT.
- Clearer purpose, instructions, scoring and boundaries in PERMA Wellbeing.
- Wheel of Life with Satisfaction and Importance sliders, numbered chart markers, editable headings and a custom wheel builder.
- Notes you want to share with your coach for the next session on the downloadable worksheets.
- Responsive layouts, local fonts, British English metadata and browser-only saving.

## Deploying to Netlify

1. Keep a copy of the current live deployment in case you want to roll back.
2. In Netlify, open the existing toolbox site and deploy this entire folder.
3. Wait for the deploy to finish, then open the Netlify preview before promoting it to production.
4. Check the toolbox directly and inside the ACSIS website embed at phone, tablet and desktop widths.
5. Open the Johari Window and test all three routes: SELF only, one observer and two observers.
6. Copy the private observer link into another browser, complete a response, return the response code and import it into the main workbook.
7. Confirm that no areas appear until the relevant SELF and observer lists are marked complete.
8. Test entering an answer, reloading the page, clearing it and using Save as PDF.
9. Confirm that the downloaded PDF can be opened and sent to the coach.

`index.html` opens `Toolbox.dc.html`, so the existing Netlify root address can remain the same.

## Files to edit

- `Toolbox.dc.html` is the alphabetical main menu.
- `tools/` contains the working source page for each tool.
- `assets/acsis-tools.css` contains shared responsive, font, accessibility and expandable-help styling.
- `assets/acsis-reflection-tools.css` contains the shared layout for the new ACSIS worksheets.
- `scripts/build-share.mjs` rebuilds the matching pages in `share/` and removes obsolete share pages.
- `scripts/validate.mjs` checks structure, local references, form labels, tool links, alphabetical order, unique saved-answer keys, Johari descriptors and the help panel on every tool.
- `FEEDBACK REVIEW.md` retains the wider feedback and development ideas internally. It is not displayed in the client toolbox.

Run these from the V10 folder after editing a source page:

```sh
node scripts/build-share.mjs
node scripts/validate.mjs
```

The `share/` pages use the same deployed assets as the main toolbox. They are not intended to be sent as isolated single HTML files.

## Privacy and saved answers

Answers use browser storage only. They are not sent to ACSIS or saved to a server by this toolbox. Saved answers belong to that browser and device, so people using a shared device should save a PDF first if they need a copy, then clear the worksheet when they have finished.
