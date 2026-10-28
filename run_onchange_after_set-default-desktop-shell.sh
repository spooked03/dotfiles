#!/bin/sh
# Keep the legacy unit name compatible with the shell-switching helpers.
set -eu

# Skip hosts without the Noctalia/Niri setup or a running user service manager.
command -v noctalia >/dev/null 2>&1 || exit 0
command -v niri >/dev/null 2>&1 || exit 0
systemctl --user show-environment >/dev/null 2>&1 || exit 0

systemctl --user daemon-reload
if systemctl --user cat dms.service >/dev/null 2>&1; then
    systemctl --user disable dms.service
fi
systemctl --user enable noctalia-trial.service
