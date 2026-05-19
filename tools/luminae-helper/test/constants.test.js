import { describe, it, expect } from "vitest";
import { join } from "path";
import { tmpdir } from "os";
import { existsSync, readFileSync, rmSync } from "fs";
import { TOOLS, SKILLS, discoverSkills, detectInstalledTools, getSkillSourcePath } from "../src/lib/constants.js";
import { installSkillToTool, uninstallSkillFromTool } from "../src/lib/installer.js";
import { commandExists } from "../src/utils/platform.js";

function withTempTarget(skill, installMode) {
  const tmpDir = join(tmpdir(), "luminae-helper-test-" + Date.now() + "-" + Math.random().toString(16).slice(2));
  return {
    skill: {
      ...skill,
      installTargets: [
        {
          toolId: "test-tool",
          installMode,
          destPath: () => installMode === "dir" ? join(tmpDir, skill.id) : join(tmpDir, `${skill.id}.md`),
        },
      ],
    },
    tool: {
      id: "test-tool",
      name: "Test Tool",
    },
    destPath: installMode === "dir" ? join(tmpDir, skill.id) : join(tmpDir, `${skill.id}.md`),
    tmpDir,
  };
}

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
        expect(tool).toHaveProperty("commandDir");
        expect(tool).toHaveProperty("skillDir");
        expect(tool).toHaveProperty("installHint");
        expect(tool.commandDir || tool.skillDir).toBeTruthy();
      }
    });
  });

  describe("discoverSkills", () => {
    it("should find entries from commands/ and skills/ directories", () => {
      expect(SKILLS.some(s => s.type === "command")).toBe(true);
      expect(SKILLS.some(s => s.type === "skill")).toBe(true);
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
      const identity = SKILLS.find(s => s.id === "identity");
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
      const skill = SKILLS.find(s => s.id === "kongfz-jira");
      const target = skill.installTargets.find(t => t.toolId === "trae");
      const path = target.destPath();
      expect(path.endsWith(".md")).toBe(true);
    });

    it("dir mode destPath ends with skillId", () => {
      const skill = SKILLS.find(s => s.id === "identity");
      const target = skill.installTargets.find(t => t.toolId === "hermes-agent");
      const path = target.destPath();
      expect(path.endsWith(".md")).toBe(false);
      expect(path.endsWith(skill.id)).toBe(true);
    });

    it("routes skills and commands to command-only tools as command files", () => {
      const command = SKILLS.find(s => s.id === "identity");
      const skill = SKILLS.find(s => s.id === "kongfz-jira");

      const commandTarget = command.installTargets.find(t => t.toolId === "trae");
      const skillTarget = skill.installTargets.find(t => t.toolId === "trae");

      expect(commandTarget.installMode).toBe("file");
      expect(commandTarget.destPath()).toMatch(/[\\/]identity\.md$/);
      expect(skillTarget.installMode).toBe("file");
      expect(skillTarget.destPath()).toMatch(/[\\/]kongfz-jira\.md$/);
    });

    it("routes skills and commands to skill-only tools as skill directories", () => {
      const command = SKILLS.find(s => s.id === "identity");
      const skill = SKILLS.find(s => s.id === "kongfz-jira");

      const commandTarget = command.installTargets.find(t => t.toolId === "hermes-agent");
      const skillTarget = skill.installTargets.find(t => t.toolId === "hermes-agent");

      expect(commandTarget.installMode).toBe("dir");
      expect(commandTarget.destPath()).toMatch(/[\\/]identity$/);
      expect(skillTarget.installMode).toBe("dir");
      expect(skillTarget.destPath()).toMatch(/[\\/]kongfz-jira$/);
    });

    it("routes command entries to commandDir and skill entries to skillDir for tools that support both", () => {
      const command = SKILLS.find(s => s.id === "identity");
      const skill = SKILLS.find(s => s.id === "kongfz-jira");

      const commandTarget = command.installTargets.find(t => t.toolId === "claude-code");
      const skillTarget = skill.installTargets.find(t => t.toolId === "claude-code");

      // command 源 → file 模式装到 commandDir
      expect(commandTarget.installMode).toBe("file");
      expect(commandTarget.destPath()).toMatch(/[\\/]commands[\\/]identity\.md$/);
      // skill 源 → dir 模式装到 skillDir
      expect(skillTarget.installMode).toBe("dir");
      expect(skillTarget.destPath()).toMatch(/[\\/]skills[\\/]kongfz-jira$/);
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
    it("returns a path ending with commands/<skillId> for command entries", () => {
      const path = getSkillSourcePath("identity");
      expect(path).toMatch(/commands\/identity$/);
    });

    it("returns a path ending with skills/<skillId> for skill entries", () => {
      const path = getSkillSourcePath("kongfz-jira");
      expect(path).toMatch(/skills\/kongfz-jira$/);
    });
  });
});

// ── installer.js ──
describe("installer.js", () => {
  describe("installSkillToTool", () => {
    it("should install a skill in file mode", () => {
      const { skill, tool, destPath, tmpDir } = withTempTarget(SKILLS.find(s => s.id === "kongfz-jira"), "file");
      const result = installSkillToTool(skill, tool);
      expect(result.success).toBe(true);
      expect(result.message).toContain("Installed to");
      expect(existsSync(destPath)).toBe(true);
      if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true, force: true });
    });

    it("should install a skill in dir mode", () => {
      const { skill, tool, destPath, tmpDir } = withTempTarget(SKILLS.find(s => s.id === "identity"), "dir");
      const result = installSkillToTool(skill, tool);
      expect(result.success).toBe(true);
      if (existsSync(destPath)) rmSync(destPath, { recursive: true, force: true });
      if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true, force: true });
    });

    it("should fail if skill source not found", () => {
      const tmpDir = join(tmpdir(), "luminae-helper-test-" + Date.now());
      const fakeSkill = {
        id: "nonexistent",
        name: "Fake",
        description: "Nope",
        installTargets: TOOLS.map(t => ({
          toolId: t.id,
          installMode: "file",
          destPath: () => join(tmpDir, "fake.md"),
        })),
      };
      const result = installSkillToTool(fakeSkill, { id: TOOLS[0].id, name: TOOLS[0].name });
      expect(result.success).toBe(false);
      expect(result.message).toContain("Unknown skillId");
    });
  });

  describe("uninstallSkillFromTool", () => {
    it("should uninstall a file-mode skill after installing", () => {
      const { skill, tool, tmpDir } = withTempTarget(SKILLS.find(s => s.id === "kongfz-jira"), "file");

      const installResult = installSkillToTool(skill, tool);
      expect(installResult.success).toBe(true);

      const result = uninstallSkillFromTool(skill, tool);
      expect(result.success).toBe(true);
      expect(result.message).toContain("Uninstalled");
      if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true, force: true });
    });

    it("should uninstall a dir-mode skill after installing", () => {
      const { skill, tool, tmpDir } = withTempTarget(SKILLS.find(s => s.id === "identity"), "dir");

      const installResult = installSkillToTool(skill, tool);
      expect(installResult.success).toBe(true);

      const result = uninstallSkillFromTool(skill, tool);
      expect(result.success).toBe(true);
      if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true, force: true });
    });

    it("should return failure if not installed", () => {
      const { skill, tool, tmpDir } = withTempTarget(SKILLS.find(s => s.id === "kongfz-jira"), "file");

      const result = uninstallSkillFromTool(skill, tool);
      expect(result.success).toBe(false);
      expect(result.message).toContain("Not installed");
      if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true, force: true });
    });
  });

  describe("install then verify content", () => {
    it("installed SKILL.md content includes source plus managed-by marker", () => {
      const { skill, tool, destPath, tmpDir } = withTempTarget(SKILLS.find(s => s.id === "kongfz-jira"), "file");

      installSkillToTool(skill, tool);
      const srcPath = join(getSkillSourcePath(skill.id), "SKILL.md");

      const destContent = readFileSync(destPath, "utf-8");
      const srcContent = readFileSync(srcPath, "utf-8");
      // 安装后的文件包含 managed-by 标识
      expect(destContent).toContain("managed-by: luminae-helper");
      // 除标识外内容与源一致（去掉标识行后应等于源内容）
      expect(destContent.replace("managed-by: luminae-helper\n", "")).toBe(srcContent);

      rmSync(tmpDir, { recursive: true, force: true });
    });

    it("dir mode should copy all files from skill directory", () => {
      const { skill, tool, destPath, tmpDir } = withTempTarget(SKILLS.find(s => s.id === "identity"), "dir");

      installSkillToTool(skill, tool);
      expect(existsSync(join(destPath, "SKILL.md"))).toBe(true);

      rmSync(tmpDir, { recursive: true, force: true });
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
