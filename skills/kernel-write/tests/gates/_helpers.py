import re

EMOJI_RE = re.compile(
    "[\U0001F000-\U0001FAFF\U00002600-\U000027BF\U0001F1E6-\U0001F1FF\U00002B00-\U00002BFF\U0000FE00-\U0000FE0F]"
)


def word_count(text):
    return len(re.findall(r"\S+", text))


def paragraphs(text):
    blocks = re.split(r"\n\s*\n", text)
    return [b.strip() for b in blocks if b.strip()]


def sentences(text):
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+", text.strip()) if s.strip()]


def count_sentences(text):
    return len(sentences(text))


def is_single_sentence_paragraph(text):
    stripped = text.strip()
    if not stripped:
        return False
    if stripped.startswith(("-", "*", "#", ">")):
        return False
    return count_sentences(stripped) == 1


def split_title(text):
    title = None
    body_lines = []
    for ln in text.splitlines():
        if ln.strip().startswith("# ") and title is None:
            title = ln.strip()
        else:
            body_lines.append(ln)
    return title, "\n".join(body_lines)
