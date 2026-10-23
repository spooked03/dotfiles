import { Action, ActionPanel, Icon, List, Toast, closeMainWindow, showToast } from "@vicinae/api";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { useCallback, useEffect, useState } from "react";
import { parsePages, settingsArgs, type SettingsPage } from "./pages";
import { pageIconName } from "./icons";

const execFileAsync = promisify(execFile);

async function runDms(args: string[]) {
  const { stdout } = await execFileAsync("/usr/bin/dms", args, { timeout: 10000, maxBuffer: 1024 * 1024 });
  return stdout;
}

export default function DmsSettings() {
  const [pages, setPages] = useState<SettingsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setPages(parsePages(await runDms(["ipc", "call", "settings", "tabs"])));
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      setError(message);
      await showToast({ style: Toast.Style.Failure, title: "Could not load DMS settings", message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  async function openPage(page?: string) {
    try {
      const output = await runDms(settingsArgs(page));
      if (/error|failed|invalid|not found/i.test(output)) throw new Error(output.trim());
      await closeMainWindow();
    } catch (cause) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Could not open DMS settings",
        message: cause instanceof Error ? cause.message : String(cause),
      });
    }
  }

  const actions = (page?: string) => (
    <ActionPanel>
      <Action title={page ? "Open Settings Page" : "Open DMS Settings"} onAction={() => openPage(page)} />
      {page && <Action title="Open Main Settings" onAction={() => openPage()} />}
      <Action title="Refresh Pages" shortcut={{ modifiers: ["ctrl"], key: "r" }} onAction={refresh} />
    </ActionPanel>
  );

  return (
    <List isLoading={loading} navigationTitle="DMS Settings" searchBarPlaceholder="Search DMS settings pages…" actions={actions()}>
      <List.EmptyView
        title={error ? "DMS settings unavailable" : loading ? "Loading settings…" : "No matching settings"}
        description={error ?? "Try another search, or use Ctrl+R to refresh."}
        actions={actions()}
      />
      {pages.map((page) => (
        <List.Item key={page.id} id={page.id} title={page.title} keywords={page.keywords} icon={Icon[pageIconName(page.id)]} actions={actions(page.id)} />
      ))}
    </List>
  );
}
