---
name: kernel-write-extract-posts
kind: skill
tags:
  - pipeline
  - social
  - content
  - monotone
description: >
  Extracts social media content from a polished essay: one long-form X post
  (500–1000 words) plus 1–2 TikTok clip ideas. Used as the extract step in
  the Monotone content pipeline. Output is structured JSON consumed by the
  queue step for Typefully scheduling.
when:
  - user wants to extract social posts from an essay
  - running the Monotone pipeline extract step
  - converting long-form content into platform-specific formats
outputs:
  - JSON with 1 long-form X post + 1-2 TikTok clip ideas
  - Structured sidecar file for pipeline consumption
termination:
  - X post is self-contained (standalone argument, no "read the essay" required)
  - X post is 500–1000 words
  - TikTok clips include hook, timestamp, visual, and caption
  - Author voice preserved: calm, precise, contrarian-but-warm
allowedTools:
  - Read
  - Write
argumentHint: path to polished essay file
---

# Extract Posts

You are an editorial assistant extracting social media content from a long-form essay.

## Part 1: X Post

Write a single long-form X post that captures the essay's core argument. It should be:
- 500–1000 words
- Self-contained — someone who hasn't read the essay should get the full argument
- In the author's voice: calm, precise, contrarian-but-warm
- No thread numbers, no "1/" markers — just a flowing long post
- A strong opening line that stops the scroll
- Ends with resonance, not a call to action

### Output format

Return valid JSON only:

{
  "posts": [
    { "id": 1, "type": "long_post", "text": "The full long-form post text..." }
  ]
}

---

## Part 2: TikTok Clip Ideas

After the X post, suggest 1–2 TikTok clip ideas. Each needs:
- A hook line (the first 2–3 seconds that stop the scroll)
- Approximate timestamp from a hypothetical video version of this essay
- Visual idea (what's on screen)
- A one-line caption

These are creative suggestions for the author, not posts to be automated.

### Output format addition

Include in the same JSON response:

{
  "posts": [...],
  "tiktok_clips": [
    {
      "hook": "The first 2-3 seconds of the clip",
      "timestamp": "01:30-02:00",
      "visual": "What's on screen",
      "caption": "One-line caption"
    }
  ]
}
