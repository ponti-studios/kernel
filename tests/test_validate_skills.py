import unittest
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

from scripts.validate_skills import frontmatter, frontmatter_contract, local_link_errors


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

    def test_description_limit(self):
        self.assertEqual(frontmatter_contract({'name': 'example', 'description': 'x' * 1024}), [])
        self.assertIn("'description' must be at most 1024 characters",
                      frontmatter_contract({'name': 'example', 'description': 'x' * 1025}))

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


class PackageLinkTests(unittest.TestCase):
    def test_link_cannot_rely_on_sibling_package(self):
        with TemporaryDirectory() as temp:
            root = Path(temp)
            package = root / 'skills/example'
            sibling = root / 'skills/other'
            package.mkdir(parents=True)
            sibling.mkdir()
            (sibling / 'reference.md').write_text('Exists only in another install.')
            entry = package / 'SKILL.md'
            entry.write_text('[Dependency](../other/reference.md)')
            with patch('scripts.validate_skills.ROOT', root), patch('scripts.validate_skills.SKILLS_DIR', root / 'skills'):
                errors = local_link_errors(entry)
            self.assertTrue(any('outside its installed package' in e for e in errors))

    def test_internal_reference_resolves(self):
        with TemporaryDirectory() as temp:
            root = Path(temp)
            package = root / 'skills/example'
            (package / 'references').mkdir(parents=True)
            (package / 'references/guide.md').write_text('Bundled expertise.')
            entry = package / 'SKILL.md'
            entry.write_text('[Guide](references/guide.md)')
            with patch('scripts.validate_skills.ROOT', root), patch('scripts.validate_skills.SKILLS_DIR', root / 'skills'):
                self.assertEqual(local_link_errors(entry), [])


if __name__ == "__main__":
    unittest.main()
