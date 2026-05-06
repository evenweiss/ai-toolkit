#!/bin/bash
# ai-toolkit installer — run without args for usage
# Usage: curl -sSL https://raw.githubusercontent.com/evenweiss/ai-toolkit/main/install.sh | bash

set -e

TARGET="${1:-cursor}"
REPO="https://github.com/evenweiss/ai-toolkit"
BASE="https://raw.githubusercontent.com/evenweiss/ai-toolkit/main"

declare -A DIRS
DIRS[ cursor ]="$HOME/.cursor/commands"
DIRS[ claude ]="$HOME/.claude/commands"
DIRS[ opencode ]="$HOME/.opencode/commands"
DIRS[ trae ]="$HOME/.trae/commands"
DIRS[ all ]="all"

install_skill() {
  local editor=$1
  local skill=$2
  local dir=${DIRS[$editor]}
  local url="${BASE}/packages/${skill}/SKILL.md"

  if [[ "$editor" == "all" ]]; then
    for ed in cursor claude opencode trae; do
      install_skill "$ed" "$skill"
    done
    return
  fi

  mkdir -p "$dir"
  local dest="${dir}/${skill}.md"
  echo "Installing ${skill} → ${dest}"
  curl -sSL "$url" -o "$dest"
}

usage() {
  echo "Usage: curl -sSL https://raw.githubusercontent.com/evenweiss/ai-toolkit/main/install.sh | bash [editor]"
  echo "Editors: cursor, claude, opencode, trae, all (default: cursor)"
  echo ""
  echo "Examples:"
  echo "  curl -sSL ... | bash                # install for Cursor"
  echo "  curl -sSL ... | bash claude         # install for Claude Code"
  echo "  curl -sSL ... | bash all            # install for all editors"
  exit 1
}

if [[ -z "${DIRS[$TARGET]}" ]]; then
  usage
fi

install_skill "$TARGET" "skill-identity"
install_skill "$TARGET" "skill-git-push"
install_skill "$TARGET" "skill-git-commit"

echo "Done."
