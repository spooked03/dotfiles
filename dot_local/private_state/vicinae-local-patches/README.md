# FFF Search fallback selection workaround

Installed bundle: `~/.local/share/vicinae/extensions/store.vicinae.fff-search/search-files.js`

For Vicinae 0.29.2, change the Search Files List's `throttle:!0` to
`throttle:!e.fallbackText`. Also remove the unsupported `selectedItemId:C` prop
from the previous local patch. No changes to configuration or search ranking.

The native host handles an initial nonempty fallback query as a search edit.
With throttling it may deliver that notification after the first results render.
The same query is already in React state, so its setter bails out while the host's
`m_shouldResetSelection` remains pending. A subsequent preview render after Down
can consume that flag and reset selection. Disabling throttling for fallback
launches makes the initial callback run before asynchronous results arrive.
Normal direct launches retain throttling. Searches within a fallback-launched
session are unthrottled for that session.

Source inspected:
https://github.com/vicinaehq/vicinae/blob/v0.29.2/src/server/src/extension/views/extension-view-host.cpp
https://github.com/vicinaehq/vicinae/blob/v0.29.2/src/server/src/extension/views/extension-list-model.cpp

## Files managed by chezmoi

- The patched installed `search-files.js` bundle (a snapshot, not the entire extension).
- This README, `fff-search-fallback.patch`, and `test-fallback-reset.cjs` in
  `~/.local/state/vicinae-local-patches/`.
- `~/.config/vicinae/settings.json`, rendered from a template.
- The existing `dms-charcoal-lavender.toml` theme and DMS settings extension.

Install FFF Search through Vicinae before restoring its patched bundle on a new
machine: the other extension assets and native daemon dependencies are not
included here. No extension credential stores, search history, or runtime
databases are included.

Backup: `search-files.before-fallback-reset-fix.js.bak` remains local only and is
ignored by chezmoi. The standalone patch was generated against that pre-fix
bundle (which included the unsupported `selectedItemId` override).

Test: `node ~/.local/state/vicinae-local-patches/test-fallback-reset.cjs`
The test reconstructs the old throttling behavior in memory, so it does not need
the local backup.

The test executes the bundle with mocked React hooks/results and a model of the
native selection-reset behavior. It reproduces the original reset and verifies
the patched event sequence. It is NOT an end-to-end GUI test; manually verify by
launching the fallback with a query, waiting for results, and pressing Down once.

## Updates and restoration

An extension update/reinstallation may overwrite the workaround. A targeted
restore is:

```sh
chezmoi apply ~/.local/share/vicinae/extensions/store.vicinae.fff-search/search-files.js
```

This restores the saved bundle wholesale; it does not merge an extension update.
After an upstream update, prefer checking whether the bug is fixed, or reviewing
and adapting the patch to the new bundle before saving a replacement. Do not
blindly overwrite a newer extension with this snapshot.

To review or apply the standalone patch to a copy of the pre-fix bundle:

```sh
patch --dry-run -p1 -d /path/to/bundle-directory < ~/.local/state/vicinae-local-patches/fff-search-fallback.patch
# Remove --dry-run only after inspecting the result.
```

One existing daemon JSON.parse robustness diagnostic was left unchanged; it is
unrelated to selection handling.

## Private Karakeep configuration

The tracked Vicinae template contains only `{{ .karakeepUrl | toJson }}`, not the
server URL or an API key. Set the URL locally on each machine in
`~/.config/chezmoi/chezmoi.toml` before applying the settings:

```toml
[data]
karakeepUrl = "https://your-private-server/"
```

This local file is ignored by chezmoi and should have permissions `0600`. The
rendered URL is still visible locally (including in rendered diffs). Edit the
tracked template with `chezmoi edit ~/.config/vicinae/settings.json`; do not
blindly re-add the live settings, which could copy private data into the source.
