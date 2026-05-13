import { spawnSync } from "child_process";
import { platform } from "os";

export interface CommandResult {
  status: number | null;
  stdout: string;
  stderr: string;
}

export function commandExists(commandName: string): boolean {
  const lookup = getCommandLookup(platform(), commandName);
  const result = spawnSync(lookup.command, lookup.args, {
    encoding: "utf-8",
    shell: false,
    stdio: ["ignore", "pipe", "ignore"],
  });
  return result.status === 0;
}

export function runCommandCapture(command: string, args: string[] = []): CommandResult {
  const result = spawnSync(command, args, {
    encoding: "utf-8",
    shell: platform() === "win32",
    stdio: ["pipe", "pipe", "pipe"],
  });
  return {
    status: result.status,
    stdout: result.stdout?.toString() ?? "",
    stderr: result.stderr?.toString() ?? "",
  };
}

export function runCommand(command: string, args: string[] = [], inherit = false): CommandResult {
  const result = spawnSync(command, args, {
    encoding: "utf-8",
    shell: platform() === "win32",
    stdio: inherit ? "inherit" : ["pipe", "pipe", "pipe"],
  });
  return {
    status: result.status,
    stdout: result.stdout?.toString() ?? "",
    stderr: result.stderr?.toString() ?? "",
  };
}

function getCommandLookup(platform: NodeJS.Platform, commandName: string) {
  if (platform === "win32") {
    return { command: "where", args: [commandName] };
  }
  return { command: "which", args: [commandName] };
}
