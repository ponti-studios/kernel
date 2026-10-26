import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

from scripts.validate_skills import frontmatter, frontmatter_contract


class FrontmatterContractTests(unittest.TestCase):
    def test_frontmatter_parser_reads_top_level_values_only(self):
        content = """---
name: example-skill
description: Build an example skill.
metadata:
  version: internal metadata value
---
Instructions.
"""
        with TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "SKILL.md"
            path.write_text(content, encoding="utf-8")

            values, errors = frontmatter(path)

        self.assertEqual(errors, [])
        self.assertEqual(values["name"], "example-skill")
        self.assertEqual(values["description"], "Build an example skill.")

    def test_accepts_any_top_level_fields(self):
        errors = frontmatter_contract(
            {
                "name": "example-skill",
                "description": "Build an example skill.",
                "version": "1.0.0",
                "author": "Example Author",
                "platforms": ["macos"],
                "disable-model-invocation": True,
            }
        )

        self.assertEqual(errors, [])

    def test_rejects_missing_name_and_description(self):
        errors = frontmatter_contract({"license": "MIT"})

        self.assertIn("missing frontmatter key 'name'", errors)
        self.assertIn("'description' must be a non-empty string", errors)

    def test_rejects_bad_name(self):
        errors = frontmatter_contract(
            {"name": "Bad_Name", "description": "Has a description."}
        )

        self.assertIn(
            "'name' must be 1-64 lowercase letters, numbers, or hyphens", errors
        )

    def test_rejects_unclosed_frontmatter(self):
        content = """---
name: example-skill
description: Never closed.
"""
        with TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "SKILL.md"
            path.write_text(content, encoding="utf-8")

            _, errors = frontmatter(path)

        self.assertEqual(errors, ["missing frontmatter closer"])


if __name__ == "__main__":
    unittest.main()
