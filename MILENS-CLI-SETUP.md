# Milens Terminal Usage Guide — J2EE Project

## Status

❌ **Milens MCP Server disabled** — Cannot compile `better-sqlite3` native module on Windows without Visual Studio Build Tools

✅ **Milens CLI available** — Use commands in terminal

## Solution Options

### Option 1: Use Milens via Terminal (Recommended for Now)
```bash
cd e:\Project\J2EE

# Analyze codebase (builds index)
npx -y milens analyze -p . --force

# Use Milens tools
npx -y milens search <symbol>
npx -y milens impact <symbol>
npx -y milens context <symbol>
npx -y milens grep "<pattern>"
npx -y milens security scan --scope all
```

### Option 2: Enable Milens MCP (Requires Build Tools)

#### Windows: Install Visual Studio Build Tools
1. Download: https://visualstudio.microsoft.com/downloads/
2. Select: "Desktop development with C++"
3. Install
4. Rebuild `better-sqlite3`:
   ```bash
   npm rebuild better-sqlite3
   ```
5. Enable MCP in `.vscode/mcp.json`: set `"disabled": false`

#### Linux/macOS: Works Out of Box
```bash
# Just enable MCP
# Edit .vscode/mcp.json and set "disabled": false
npm rebuild better-sqlite3
```

### Option 3: Use Docker/WSL
Run Milens in a container:
```bash
docker run -v e:\Project\J2EE:/workspace node:latest \
  sh -c "cd /workspace && npx milens analyze -p . --force"
```

### Option 4: Use Alternative Python Environment
Install Python (3.10+) and use:
```bash
cd Backend/moneymanager
python -m virtualenv venv
venv\Scripts\activate
# Now install Python-based code analysis tools
```

## Workaround: Copilot with Code Style Guidelines

Since Milens MCP is disabled, Copilot will:
- ✅ Read `.github/copilot-instructions.md` for code style
- ✅ Read `.codex/.instructions.md` for Codex guidelines
- ✅ Read `.antigravity/.instructions.md` for agy guidelines
- ❌ NOT have Milens tools for impact analysis

**Recommendation:** Manually run `npx -y milens` commands when needed for:
- Impact analysis before major refactors
- Security scanning before commits
- Finding all references to a symbol

## Milens Terminal Commands Reference

### Search & Navigation
```bash
# Find a symbol by name
npx -y milens search UserService

# Get 360° context (refs + deps)
npx -y milens context createUser

# Show blast radius
npx -y milens impact deleteUser

# Text search across all files
npx -y milens grep "getUserById"
```

### Analysis
```bash
# Analyze/re-index codebase
npx -y milens analyze -p . --force

# Show project status
npx -y milens status

# Detect git changes
npx -y milens detect-changes
```

### Security
```bash
# Security audit (50+ rules)
npx -y milens security scan --scope all --severity HIGH

# Audit dependencies
npx -y milens security deps
```

### Code Quality
```bash
# Find dead code (exported but unused)
npx -y milens find-dead-code

# Get test coverage gaps
npx -y milens test-coverage-gaps

# Code review of PR
npx -y milens review-pr
```

## File Locations

- **Index Database:** `.milens/index.db` (auto-created after analyze)
- **Sessions:** `.milens/sessions.db`
- **Code Style:** `.codex/.instructions.md`
- **Copilot:** `.github/copilot-instructions.md`
- **agy:** `.antigravity/.instructions.md`

## Next Steps

### Short Term (Today)
1. ✅ Use Copilot with code style guidelines from instructions
2. ✅ Run `npx -y milens analyze -p .` once to index codebase
3. ✅ Use Milens CLI for impact analysis when needed

### Medium Term (This Week)
- Install Visual Studio Build Tools if planning to use Milens regularly
- OR set up WSL/Docker for better-sqlite3 support

### Long Term (Next Sprint)
- Evaluate if native Milens MCP is worth the setup cost
- Consider alternatives like Copilot Chat + manual code analysis

## Troubleshooting

### "better-sqlite3 binding not found"
**Cause:** Native module not compiled
**Fix:** See Option 2 above (install Build Tools)

### "Cannot find module 'npx'"
**Cause:** Node.js not in PATH
**Fix:** Verify: `node --version` and `npm --version`

### Milens analyze very slow
**Cause:** Large codebase
**Fix:** Run with timeout or background: `npx -y milens analyze -p . --force &`

## Resources

- **Milens Docs:** https://github.com/fuze210699/milens
- **CLI Reference:** https://github.com/fuze210699/milens/blob/main/docs/cli.md
- **VS Build Tools:** https://visualstudio.microsoft.com/downloads/

---

**Last Updated:** June 2, 2026
**Status:** ⚠️ MCP disabled (use CLI instead)
**Fallback:** Code style guidelines available in instructions
