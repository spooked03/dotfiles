# DMS Settings for Vicinae

A local Vicinae extension with a single **DMS Settings** command. Open it to search all settings pages reported by the running Dank Material Shell instance. Enter opens the selected page directly. Ctrl+R refreshes the page list; the action menu also offers **Open Main Settings**.

Page lists are fetched on each launch, not hardcoded. Human-readable names and search aliases are added locally. Requires `/usr/bin/dms` and a running DMS session. Uses Vicinae API 0.29.2, matching the installed launcher.

## Development

```sh
npm ci
npm run typecheck
npm test
npm run build
```

`npm run build` installs into `~/.local/share/vicinae/extensions/dms-settings/`. Vicinae detects the extension without restarting. The test suite includes a read-only integration test against the running DMS instance.

Launch directly:

```sh
vicinae cmd launch '@nessie/dms-settings:settings'
```

## Previous desktop shortcuts

The 57 previous desktop entries (main settings plus 56 pages) were moved out of the applications directory to:

`~/.local/share/vicinae/backups/dms-settings-desktop-20261023-153042/`

To restore the old experience, move those `.desktop` files back into `~/.local/share/applications/` and run `update-desktop-database ~/.local/share/applications`. Remove or disable this extension if you no longer want the nested command.
