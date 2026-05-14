import { describe, it, expect } from "vitest";
import { join } from "path";
import { tmpdir } from "os";
import { existsSync, readFileSync, rmSync } from "fs";
import { TOOLS, SKILLS, discoverSkills, detectInstalledTools, getSkillSourcePath } from "../src/lib/constants.js";
import { installSkillToTool, uninstallSkillFromTool } from "../src/lib/installer.js";
import { commandExists } from "../src/utils/platform.js";

describe("constants.js", () => {
  describe("TOOLS", () => {
    it("should have at least 1 tool", () => {
      expect(TOOLS.length).toBeGreaterThan(0);
    });

    it("each tool has required fields", () => {
      for (const tool of TOOLS) {
        expect(tool).toHaveProperty("id");
        expect(tool).toHaveProperty("name");
        expect(tool).toHaveProperty("command");
        expect(tool).toHaveProperty("installMode");
        expect(tool).toHaveProperty("skillsDir");
        expect(tool).toHaveProperty("installHint");
        expect(["file", "dir"]).toContain(tool.installMode);
      }
    });
  });

  describe("discoverSkills", () => {
    it("should find skills from skills/ directory", () => {
      expect(SKILLS.length).toBeGreaterThanOrEqual(3);
    });

    it("each skill has id, name, description, installTargets", () => {
      for (const skill of SKILLS) {
        expect(skill).toHaveProperty("id");
        expect(skill).toHaveProperty("name");
        expect(skill).toHaveProperty("description");
        expect(skill).toHaveProperty("installTargets");
        expect(skill.installTargets.length).toBe(TOOLS.length);
      }
    });

    it("skill with YAML frontmatter should parse name and description", () => {
      const identity = SKILLS.find(s => s.id === "skill-identity");
      expect(identity).toBeDefined();
      expect(identity.name).toBe("Identity");
    });

    it("installTargets destPath should be a function returning a string", () => {
      for (const skill of SKILLS) {
        for (const target of skill.installTargets) {
          expect(typeof target.destPath).toBe("function");
          expect(typeof target.destPath()).toBe("string");
        }
      }
    });

    it("file mode destPath ends with .md", () => {
      const skill = SKILLS[0];
      const target = skill.installTargets.find(t => t.toolId === "claude-code");
      const path = target.destPath();
      expect(path.endsWith(".md")).toBe(true);
    });

    it("dir mode destPath ends with skillId", () => {
      const skill = SKILLS[0];
      const target = skill.installTargets.find(t => t.toolId === "hermes-agent");
      const path = target.destPath();
      expect(path.endsWith(".md")).toBe(false);
      expect(path.endsWith(skill.id)).toBe(true);
    });
  });

  describe("detectInstalledTools", () => {
    it("returns all tools with installed boolean", () => {
      const result = detectInstalledTools();
      expect(result.length).toBe(TOOLS.length);
      for (const tool of result) {
        expect(typeof tool.installed).toBe("boolean");
      }
    });
  });

  describe("getSkillSourcePath", () => {
    it("returns a path ending with skills/<skillId>", () => {
      const path = getSkillSourcePath("skill-identity");
      expect(path).toMatch(/skills\/skill-identity$/);
    });
  });
});

// ── installer.js ──
describe("installer.js", () => {
  describe("installSkillToTool", () => {
    it("should install a skill in file mode", () => {
      const claude = TOOLS.find(t => t.id === "claude-code");
      const skill = SKILLS.find(s => s.id === "skill-identity");
      const result = installSkillToTool(skill, claude);
      expect(result.success).toBe(true);
      expect(result.message).toContain("Installed to");
      const destPath = skill.installTargets.find(t => t.toolId === "claude-code").destPath();
      if (existsSync(destPath)) rmSync(destPath);
    });

    it("should install a skill in dir mode", () => {
      const hermes = TOOLS.find(t => t.id === "hermes-agent");
      const skill = SKILLS.find(s => s.id === "skill-identity");
      const result = installSkillToTool(skill, hermes);
      expect(result.success).toBe(true);
      const destPath = skill.installTargets.find(t => t.toolId === "hermes-agent").destPath();
      if (existsSync(destPath)) rmSync(destPath, { recursive: true, force: true });
    });

    it("should fail if skill source not found", () => {
      const tmpDir = join(tmpdir(), "luminae-helper-test-" + Date.now());
      const fakeSkill = {
        id: "skill-nonexistent",
        name: "Fake",
        description: "Nope",
        installTargets: TOOLS.map(t => ({
          toolId: t.id,
          destPath: () => join(tmpDir, "fake.md"),
        })),
      };
      const claude = TOOLS.find(t => t.id === "claude-code");
      const result = installSkillToTool(fakeSkill, claude);
      expect(result.success).toBe(false);
      expect(result.message).toContain("not found");
    });
  });

  describe("uninstallSkillFromTool", () => {
    it("should uninstall a file-mode skill after installing", () => {
      const claude = TOOLS.find(t => t.id === "claude-code");
      const skill = SKILLS.find(s => s.id === "skill-identity");

      const installResult = installSkillToTool(skill, claude);
      expect(installResult.success).toBe(true);

      const result = uninstallSkillFromTool(skill, claude);
      expect(result.success).toBe(true);
      expect(result.message).toContain("Uninstalled");
    });

    it("should uninstall a dir-mode skill after installing", () => {
      const hermes = TOOLS.find(t => t.id === "hermes-agent");
      const skill = SKILLS.find(s => s.id === "skill-identity");

      const installResult = installSkillToTool(skill, hermes);
      expect(installResult.success).toBe(true);

      const result = uninstallSkillFromTool(skill, hermes);
      expect(result.success).toBe(true);
    });

    it("should return failure if not installed", () => {
      const claude = TOOLS.find(t => t.id === "claude-code");
      const skill = SKILLS.find(s => s.id === "skill-identity");
      const destPath = skill.installTargets.find(t => t.toolId === "claude-code").destPath();
      if (existsSync(destPath)) rmSync(destPath);

      const result = uninstallSkillFromTool(skill, claude);
      expect(result.success).toBe(false);
      expect(result.message).toContain("Not installed");
    });
  });

  describe("install then verify content", () => {
    it("installed SKILL.md content should match source", () => {
      const claude = TOOLS.find(t => t.id === "claude-code");
      const skill = SKILLS.find(s => s.id === "skill-identity");

      installSkillToTool(skill, claude);
      const destPath = skill.installTargets.find(t => t.toolId === "claude-code").destPath();
      const srcPath = join(getSkillSourcePath(skill.id), "SKILL.md");

      const destContent = readFileSync(destPath, "utf-8");
      const srcContent = readFileSync(srcPath, "utf-8");
      expect(destContent).toBe(srcContent);

      rmSync(destPath);
    });

    it("dir mode should copy all files from skill directory", () => {
      const hermes = TOOLS.find(t => t.id === "hermes-agent");
      const skill = SKILLS.find(s => s.id === "skill-identity");

      installSkillToTool(skill, hermes);
      const destDir = skill.installTargets.find(t => t.toolId === "hermes-agent").destPath();

      expect(existsSync(join(destDir, "SKILL.md"))).toBe(true);

      rmSync(destDir, { recursive: true, force: true });
    });
  });
});

// ── platform.js ──
describe("platform.js", () => {
  describe("commandExists", () => {
    it("returns true for existing command (node)", () => {
      expect(commandExists("node")).toBe(true);
    });

    it("returns false for non-existent command", () => {
      expect(commandExists("definitely-not-a-real-command-xyz123")).toBe(false);
    });
  });
});
