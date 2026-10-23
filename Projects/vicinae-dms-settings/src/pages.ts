export interface SettingsPage {
  id: string;
  title: string;
  keywords: string[];
}

const titles: Record<string, string> = {
  time_weather: "Time & Weather",
  compositor_layout: "Compositor Layout",
  dankbar: "DankBar",
  dankbar_appearance: "DankBar Appearance",
  dankbar_settings: "DankBar Settings",
  dankbar_widgets: "DankBar Widgets",
  workspaces_widgets: "Workspace Widgets",
  dank_island: "Dank Island",
  dank_dash: "Dank Dash",
  osd: "On-Screen Display",
  dock_launcher: "Dock & Launcher",
  display_config: "Display Configuration",
  display_gamma: "Display Gamma",
  network_wifi: "Wi-Fi",
  network_ethernet: "Ethernet",
  network_cellular: "Cellular",
  network_vpn: "VPN",
  network_status: "Network Status",
  mouse_touchpad: "Mouse & Touchpad",
  locale: "Language & Region",
  power_security: "Power & Security",
  power_sleep: "Power & Sleep",
  greeter: "Login Screen",
  updater: "System Updates",
};

const aliases: Record<string, string[]> = {
  audio: ["sound", "volume", "microphone", "speaker"],
  network_wifi: ["wifi", "wireless", "internet"],
  network_ethernet: ["wired", "internet"],
  keybinds: ["shortcuts", "hotkeys", "bindings"],
  displays: ["monitor", "screen", "resolution"],
  display_config: ["monitor", "screen", "resolution", "refresh"],
  display_gamma: ["brightness", "color", "night"],
  wallpaper: ["background"],
  locale: ["language", "region", "localization"],
  greeter: ["login", "sddm"],
};

export function parsePages(output: string): SettingsPage[] {
  const ids = [...new Set(output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean))];
  if (!ids.length) throw new Error("DMS returned no settings pages.");
  if (ids.some((id) => !/^[a-z][a-z0-9_]*$/.test(id))) {
    throw new Error("DMS returned an unexpected settings page list.");
  }
  return ids.map((id) => ({
    id,
    title: titles[id] ?? id.split("_").map((word) => word[0].toUpperCase() + word.slice(1)).join(" "),
    keywords: [id, ...id.split("_"), ...(aliases[id] ?? [])],
  }));
}

export function settingsArgs(page?: string): string[] {
  if (page === undefined) return ["ipc", "call", "settings", "open"];
  if (!/^[a-z][a-z0-9_]*$/.test(page)) throw new Error("Invalid settings page ID.");
  return ["ipc", "call", "settings", "openWith", page];
}
