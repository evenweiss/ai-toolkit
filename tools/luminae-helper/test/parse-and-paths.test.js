import { describe, it, expect } from "vitest";
import { TOOLS, SKILLS } from "../src/lib/constants.js";

describe("parseSkillMeta (via discoverSkills)", () => {
  it("parses YAML frontmatter name field", () => {
    const identity = SKILLS.find(s => s.id === "skill-identity");
    expect(identity.name).toBe("Identity");
  });

  it("each skill has a name (from frontmatter or derived)", () => {
    for (const skill of SKILLS) {
      expect(skill.name).toBeTruthy();
      expect(skill.name.length).toBeGreaterThan(0);
    }
  });

  it("derives name from skillId: skill-git-commit → Git Commit", () => {
    const gc = SKILLS.find(s => s.id === "skill-git-commit");
    expect(gc.name).toBe("Git Commit");
  });

  it("derives name from skillId: skill-git-push → Git Push", () => {
    const gp = SKILLS.find(s => s.id === "skill-git-push");
    expect(gp.name).toBe("Git Push");
  });

  it("each skill has a description (from frontmatter or blockquote)", () => {
    for (const skill of SKILLS) {
      expect(skill.description).toBeTruthy();
    }
  });
});

describe("generateDestPath (via installTargets)", () => {
  it("file mode: claude-code destPath ends with <shortName>.md", () => {
    const skill = SKILLS.find(s => s.id === "skill-identity");
    const target = skill.installTargets.find(t => t.toolId === "claude-code");
    const path = target.destPath();
    expect(path.endsWith("/identity.md") || path.endsWith("\\identity.md")).toBe(true);
  });

  it("dir mode: hermes-agent destPath ends with <skillId>", () => {
    const skill = SKILLS.find(s => s.id === "skill-identity");
    const target = skill.installTargets.find(t => t.toolId === "hermes-agent");
    const path = target.destPath();
    expect(path.endsWith("/skill-identity") || path.endsWith("\\skill-identity")).toBe(true);
  });

  it("destPath for each tool is consistent with tool.installMode", () => {
    const skill = SKILLS[0];
    for (const target of skill.installTargets) {
      const tool = TOOLS.find(t => t.id === target.toolId);
      const path = target.destPath();
      if (tool.installMode === "file") {
        expect(path.endsWith(".md")).toBe(true);
      } else {
        expect(path.endsWith(skill.id)).toBe(true);
      }
    }
  });
});
