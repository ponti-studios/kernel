import os
import socket
from pathlib import Path
from urllib.parse import urlparse

import pytest

FIXTURES_DIR = Path(__file__).parent / "fixtures"
SKILL_DIR = Path(__file__).parent.parent


def load_fixture(name):
    return (FIXTURES_DIR / name).read_text()


def _ollama_reachable():
    url = urlparse(os.environ.get("OLLAMA_URL", "http://localhost:11434"))
    try:
        with socket.create_connection((url.hostname, url.port or 11434), timeout=1):
            return True
    except OSError:
        return False


def _judge_available():
    return bool(os.environ.get("OPENROUTER_API_KEY")) or _ollama_reachable()


def pytest_configure(config):
    config.addinivalue_line("markers", "judge: qualitative test using the LLM-as-judge (needs Ollama or OPENROUTER_API_KEY)")
    config.addinivalue_line("markers", "e2e: drives the real kernel-write skill via `claude -p` (slow, costs tokens, opt-in via RUN_E2E=1)")


def pytest_collection_modifyitems(config, items):
    skip_judge = pytest.mark.skip(reason="no judge backend reachable (start Ollama or set OPENROUTER_API_KEY)")
    skip_e2e = pytest.mark.skip(reason="set RUN_E2E=1 to run live `claude -p` pipeline tests")
    judge_ok = _judge_available()
    e2e_ok = os.environ.get("RUN_E2E") == "1"
    for item in items:
        if "judge" in item.keywords and not judge_ok:
            item.add_marker(skip_judge)
        if "e2e" in item.keywords and not e2e_ok:
            item.add_marker(skip_e2e)


@pytest.fixture(scope="session")
def judge_model():
    from judge import build_judge

    return build_judge()
