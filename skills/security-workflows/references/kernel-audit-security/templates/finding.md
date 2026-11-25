# Finding Template

Use this structure for all security findings produced by skills.

```markdown
### [SEVERITY] Title

- **ID**: NDC-YYYY-NNN (auto-incrementing)
- **CWE**: CWE-XXX (if applicable)
- **CVE**: CVE-YYYY-NNNNN (if applicable)
- **OWASP Ref**: Top 10 A01, ASVS V4.1.1, MASVS-STORAGE-1, MASWE-0001, MASTG-TEST-0200, LLM01, etc.
- **Location**: file_path:line_number or component name
- **Impact**: What an attacker can achieve (1-2 sentences)
- **Evidence**: Code snippet, command output, or proof-of-concept
- **Remediation**: Specific fix with code example
- **Confidence**: HIGH | MEDIUM | LOW (how certain is this finding)
```

## Severity

Severity follows the likelihood x impact scale in [audit-methodology/WORKFLOW.md](../audit-methodology/WORKFLOW.md#severity-requires-impact); that scale is the single source. A CVSS score is optional: add a `- **CVSS**:` line for reference if a consumer needs one, but it never sets or overrides the severity. Defense-in-depth gaps and minor misconfigurations without a demonstrated exploit are hardening notes, not findings.

## Confidence Levels

| Level  | Meaning                                                               |
| ------ | --------------------------------------------------------------------- |
| HIGH   | Confirmed via code path analysis, PoC, or tool output                 |
| MEDIUM | Strong indicators but not fully confirmed — needs manual verification |
| LOW    | Heuristic match or pattern-based — may be false positive              |
