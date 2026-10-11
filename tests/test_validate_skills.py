import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

from scripts.validate_skills import frontmatter, frontmatter_contract


class FrontmatterContractTests(unittest.TestCase):
    def test_frontmatter_parser_ignores_nested_metadata_keys(self):
        content = """---
name: example-skill
description: Build an example skill.
metadata:
  when: internal metadata value
---
Instructions.
"""
        with TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "SKILL.md"
            path.write_text(content, encoding="utf-8")

            keys, values, errors = frontmatter(path)

        self.assertEqual(errors, [])
        self.assertEqual(keys, {"name", "description", "metadata"})
        self.assertEqual(values["name"], "example-skill")
        self.assertEqual(values["description"], "Build an example skill.")

    def test_accepts_standard_required_and_optional_fields(self):
        errors, warnings = frontmatter_contract(
            {"name", "description", "license", "compatibility", "metadata"},
            {
                "name": "example-skill",
                "description": "Build an example skill.",
                "license": "MIT",
                "compatibility": "Requires Xcode.",
                "metadata": "",
            },
        )

        self.assertEqual(errors, [])
        self.assertEqual(warnings, [])

    def test_warns_for_known_legacy_fields_in_compatibility_mode(self):
        errors, warnings = frontmatter_contract(
            {"name", "description", "when", "outputs", "termination"},
            {"name": "legacy-skill", "description": "A legacy skill."},
        )

        self.assertEqual(errors, [])
        self.assertEqual(len(warnings), 1)
        self.assertIn("outputs, termination, when", warnings[0])

    def test_strict_mode_rejects_known_legacy_fields(self):
        errors, warnings = frontmatter_contract(
            {"name", "description", "when"},
            {"name": "legacy-skill", "description": "A legacy skill."},
            strict=True,
        )

        self.assertEqual(warnings, [])
        self.assertEqual(len(errors), 1)
        self.assertIn("non-standard kernel frontmatter fields: when", errors[0])

    def test_rejects_unknown_top_level_fields_in_compatibility_mode(self):
        errors, warnings = frontmatter_contract(
            {"name", "description", "undocumented-field"},
            {"name": "example-skill", "description": "Build an example skill."},
        )

        self.assertEqual(warnings, [])
        self.assertEqual(errors, ["unsupported top-level frontmatter key 'undocumented-field'"])

    def test_requires_standard_fields_and_valid_name_and_description(self):
        errors, _ = frontmatter_contract(
            {"name", "description"},
            {"name": "Bad_Name", "description": ""},
        )

        self.assertIn("'name' must be 1-64 lowercase letters, numbers, or hyphens", errors)
        self.assertIn("'description' must be a non-empty string", errors)

    def test_checks_standard_optional_field_constraints(self):
        errors, _ = frontmatter_contract(
            {"name", "description", "compatibility", "allowed-tools"},
            {
                "name": "example-skill",
                "description": "Build an example skill.",
                "compatibility": "x" * 501,
                "allowed-tools": "",
            },
        )

        self.assertIn("'compatibility' must be at most 500 characters", errors)
        self.assertIn("'allowed-tools' must be a non-empty space-separated string", errors)


if __name__ == "__main__":
    unittest.main()
