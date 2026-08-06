"""Judge model for the kernel-write test harness.

Serves the LLM-as-judge that backs DeepEval GEval metrics. Resolution order:

1. If ``OPENROUTER_API_KEY`` is set, use OpenRouter with ``--judge-model``
   (default ``openai/gpt-4o-mini``). Real API, better signal, costs a fraction
   of a cent per gate.
2. Otherwise fall back to a local Ollama model (default ``gemma4:e4b-mlx``).
   Free, offline, weaker signal.

The Ollama path uses a custom ``DeepEvalBaseLLM`` subclass because small local
models wrap their JSON in markdown code fences, which DeepEval's stock
``OllamaModel`` cannot parse.
"""

import os
import re

from deepeval.models import DeepEvalBaseLLM

DEFAULT_LOCAL_MODEL = os.environ.get("OLLAMA_MODEL", "gemma4:e4b-mlx")
DEFAULT_ROUTER_MODEL = os.environ.get("DEEPEVAL_ROUTER_MODEL", "openai/gpt-4o-mini")
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")


def _strip_fences(text):
    text = text.strip()
    for _ in range(3):
        if text.startswith("```"):
            text = re.sub(r"^```[^\n]*\n?", "", text)
            text = re.sub(r"\n?```\s*$", "", text)
            continue
        if text.startswith("json"):
            text = re.sub(r"^json\b", "", text).strip()
            continue
        break
    return text


class OllamaJudge(DeepEvalBaseLLM):
    """Local Ollama judge that tolerates fenced JSON."""

    def __init__(self, model=None, base_url=None, temperature=0.0):
        self.model_name = model or DEFAULT_LOCAL_MODEL
        self.base_url = (base_url or OLLAMA_URL).rstrip("/")
        self.temperature = float(temperature)
        super().__init__(self.model_name)

    def load_model(self, *args, **kwargs):
        return self

    async def _achat(self, prompt, schema):
        import ollama

        client = ollama.AsyncClient(host=self.base_url)
        kwargs = {
            "model": self.model_name,
            "messages": [{"role": "user", "content": prompt}],
            "options": {"temperature": self.temperature},
        }
        if schema is not None:
            kwargs["format"] = schema.model_json_schema()
        resp = await client.chat(**kwargs)
        content = resp["message"]["content"]
        if schema is not None:
            content = _strip_fences(content)
            return schema.model_validate_json(content)
        return content

    def generate(self, prompt, schema=None):
        return self._chat(prompt, schema)

    async def a_generate(self, prompt, schema=None):
        return await self._achat(prompt, schema)

    def get_model_name(self):
        return f"{self.model_name} (ollama)"


def build_judge():
    """Return a judge model: OpenRouter if keyed, else local Ollama."""
    if os.environ.get("OPENROUTER_API_KEY"):
        from deepeval.models import OpenRouterModel

        return OpenRouterModel(
            model=DEFAULT_ROUTER_MODEL,
            api_key=os.environ["OPENROUTER_API_KEY"],
        )
    return OllamaJudge()
