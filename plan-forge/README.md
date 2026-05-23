# Plan Forge

An opinionated planning workspace for breaking down projects with traceable structure:

```
Project
  ├─ Business Requirements   (source-doc decisions)
  ├─ Requirements            (granular rules, traced up to a BR)
  ├─ Workstreams             (engineering domains / teams)
  ├─ Epics                   (capabilities inside a workstream)
  ├─ Stories                 (units of work, inside an epic, linked to ≥1 requirement)
  │    └─ Acceptance Criteria (Given / When / Then per AC)
  └─ Decision Log            (open questions blocking stories)
```

Plus a **Coverage** view (requirements × stories grid) and a **Definition of Ready** indicator on every story.

The model and cadence are described in `../FRAMEWORK.md`.

## What it gives you

- **Multi-project** — separate workspaces for separate initiatives (loyalty, SOX, anything)
- **In-place editing** in tables, no save buttons
- **AC editor** that enforces Given/When/Then structure
- **Decision Log** with owner, due date, link to affected stories
- **DoR indicator** (`●` / `◐`) on every story so you can see at a glance what's ready to enter a sprint
- **Coverage matrix** so no requirement gets orphaned
- **Import from Excel** — bring in your existing loyalty workbook (or any compatible sheet)
- **Export to Excel / JSON** — clean handoff to other tools
- **Local-first** — all data in a single JSON file in your user data dir; back it up to Dropbox/iCloud if you want sync

## Setup

```bash
cd plan-forge
npm install
npm start
```

That's it. The app launches and creates an empty workspace on first run.

The workspace file lives at:

- **macOS**:  `~/Library/Application Support/plan-forge/plan-forge-workspace.json`
- **Linux**:  `~/.config/plan-forge/plan-forge-workspace.json`
- **Windows**: `%APPDATA%\plan-forge\plan-forge-workspace.json`

Use **File → Reveal Workspace File** from the menu to open it directly.

## Importing the loyalty workbook

`File → Import from Excel…` and pick `loyalty_use_cases.xlsx`. Plan Forge will create a new project from the workbook, mapping:

| Excel sheet | Plan Forge entity |
|---|---|
| `Workstreams` | Workstreams |
| `Business Requirements` | Business Requirements |
| `Requirements` / `Requirements Map` | Requirements |
| `Epics` | Epics |
| `Use Cases`, `Gap & Edge Cases`, `Stories` | Stories |
| `Decision Log` | Decision Log |
| `Acceptance Criteria` column on stories | parsed into Given/When/Then ACs |

You'll get all your existing data inside Plan Forge for live editing.

## Keyboard

| Shortcut | Action |
|---|---|
| `⌘N` / `Ctrl+N` | New project |
| `⌘I` / `Ctrl+I` | Import from Excel |
| `⌘K` / `Ctrl+K` | Focus the search box |
| `Esc` | Close detail view / modal |

## Definition of Ready

A story shows `●` (green) when it meets all four criteria:

1. ≥ 2 Acceptance Criteria written
2. ≥ 1 Requirement linked
3. 0 open Decision Log entries blocking it
4. An Epic assigned

Otherwise it shows `◐` (amber). Hover for the specific reasons.

The Dashboard surfaces every story currently failing DoR so they're impossible to lose track of.

## File structure

```
plan-forge/
├── package.json
├── main.js          # Electron main process (window, menu, IPC)
├── preload.js       # contextBridge API surface
└── renderer/
    ├── index.html   # App shell
    ├── styles.css   # All styling
    └── app.js       # Renderer logic (views, persistence, import/export)
```

No build step. Plain JS / HTML / CSS. Edit, then reload (`⌘R`).

## Tech

- **Electron** for the desktop shell
- **xlsx** (SheetJS) for Excel import/export
- **JSON file** at `app.getPath('userData')` for storage
- No native bindings — `npm install` works on any platform without build tools

## Backing up / syncing

The workspace is a single JSON file. To version-control or sync:

```bash
# Symlink the workspace into a Dropbox/iCloud folder:
mv ~/Library/Application\ Support/plan-forge/plan-forge-workspace.json \
   ~/Dropbox/plan-forge-workspace.json
ln -s ~/Dropbox/plan-forge-workspace.json \
      ~/Library/Application\ Support/plan-forge/plan-forge-workspace.json
```

Then run on any machine and your data follows you.

## Extending

The app intentionally has no build step so you can tweak it freely:

- Add a column? Edit the table render in `app.js` (the views are all in one file).
- Change the DoR rule? Edit `storyMeetsDoR()` and `dorReasons()` near the bottom of the stories section.
- New view? Add a `case` to the `render()` switch and a sidebar entry in `index.html`.
- New IPC? Add a handler in `main.js` and expose it in `preload.js`.

## License

Personal use.
