import { describe, it, expect } from "vitest";

function padChoice(text, targetWidth = 20) {
  const stripped = text.replace(/\x1b\[[0-9;]*m/g, "");
  const w = stripped.length;
  const pad = Math.max(0, targetWidth - w);
  return text + " ".repeat(pad);
}

function parseCheckboxResult(ans) {
  if (ans === "exit" || ans === "__exit__") return "exit";
  if (ans === "back" || ans === "__back__") return "back";
  if (Array.isArray(ans)) {
    if (ans.includes("__exit__")) return "exit";
    if (ans.includes("__back__")) return "back";
    return ans;
  }
  return ans;
}

describe("padChoice", () => {
  it("pads short text to target width", () => {
    const result = padChoice("hello", 10);
    expect(result).toBe("hello     ");
  });

  it("does not pad text at or beyond target width", () => {
    const result = padChoice("hello world!!", 10);
    expect(result).toBe("hello world!!");
  });

  it("strips ANSI codes before measuring width", () => {
    const result = padChoice("\x1b[31mhello\x1b[0m", 10);
    expect(result).toBe("\x1b[31mhello\x1b[0m     ");
  });

  it("handles empty string", () => {
    const result = padChoice("", 5);
    expect(result).toBe("     ");
  });
});

describe("parseCheckboxResult", () => {
  it('returns "back" for "back" string', () => {
    expect(parseCheckboxResult("back")).toBe("back");
  });

  it('returns "back" for "__back__" string', () => {
    expect(parseCheckboxResult("__back__")).toBe("back");
  });

  it('returns "exit" for "exit" string', () => {
    expect(parseCheckboxResult("exit")).toBe("exit");
  });

  it('returns "exit" for "__exit__" string', () => {
    expect(parseCheckboxResult("__exit__")).toBe("exit");
  });

  it('returns "exit" when array contains "__exit__"', () => {
    expect(parseCheckboxResult(["skill-identity", "__exit__"])).toBe("exit");
  });

  it('returns "back" when array contains "__back__"', () => {
    expect(parseCheckboxResult(["skill-identity", "__back__"])).toBe("back");
  });

  it("returns the array when it contains only skill ids", () => {
    const arr = ["skill-identity", "skill-git-commit"];
    expect(parseCheckboxResult(arr)).toEqual(arr);
  });

  it("returns non-special values as-is", () => {
    expect(parseCheckboxResult("other")).toBe("other");
  });
});
