import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { parsePages, settingsArgs } from "../src/pages.ts";
import { pageIconName, pageIcons } from "../src/icons.ts";

test("uses relevant icons and a safe fallback for new pages", () => {
  assert.equal(pageIconName("displays"), "Monitor");
  assert.equal(pageIconName("audio"), "SpeakerHigh");
  assert.equal(pageIconName("network_wifi"), "Wifi");
  assert.equal(pageIconName("new_future_page"), "Cog");
  assert.equal(pageIconName("toString"), "Cog");
});

test("parses, labels and deduplicates pages, including Windows line endings", () => {
  const pages = parsePages("audio\r\nnetwork_wifi\r\n\naudio\nnew_future_page\n");
  assert.deepEqual(pages.map((page) => page.title), ["Audio", "Wi-Fi", "New Future Page"]);
  assert.ok(pages[1].keywords.includes("wireless"));
});

test("rejects empty or unexpected output", () => {
  for (const output of ["", "\n", "ERROR: DMS is unavailable", "audio; touch /tmp/test", "../audio"]) {
    assert.throws(() => parsePages(output));
  }
});

test("builds argument arrays for main settings and direct pages", () => {
  assert.deepEqual(settingsArgs(), ["ipc", "call", "settings", "open"]);
  assert.deepEqual(settingsArgs("network_wifi"), ["ipc", "call", "settings", "openWith", "network_wifi"]);
  assert.throws(() => settingsArgs("audio;exit"));
});

test("loads all pages from the running DMS instance", () => {
  const output = execFileSync("/usr/bin/dms", ["ipc", "call", "settings", "tabs"], { encoding: "utf8", timeout: 10000 });
  const pages = parsePages(output);
  assert.ok(pages.length > 0);
  assert.ok(pages.some((page) => page.id === "audio"));
  assert.ok(pages.some((page) => page.id === "network_wifi"));
  for (const page of pages) {
    assert.ok(Object.hasOwn(pageIcons, page.id), `Missing specific icon for ${page.id}`);
  }
});
