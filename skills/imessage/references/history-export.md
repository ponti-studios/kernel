# Reading chat.db for a full history export

`imsg` has no export command and only sees chats that still exist. The database is the
source of truth. Open read-only so Messages.app keeps running:

```python
con = sqlite3.connect(f"file:{os.path.expanduser('~/Library/Messages/chat.db')}?mode=ro", uri=True)
```

Full Disk Access for the terminal is mandatory, otherwise the open succeeds and returns
nothing, or every query raises `authorization denied`.

## Tables that matter

| table                     | use                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| `message`                 | one row per message, reaction, group event. 100+ columns, ignore most                            |
| `chat`                    | ROWID, guid, chat_identifier, display_name, service_name                                         |
| `chat_message_join`       | chat_id → message_id. **Deleting a conversation deletes these rows and leaves the message rows** |
| `chat_handle_join`        | chat_id → handle_id, the participants                                                            |
| `handle`                  | ROWID → `id` (phone/email)                                                                       |
| `attachment`              | ROWID, filename, transfer_name, mime_type, total_bytes, hide_attachment                          |
| `message_attachment_join` | message_id → attachment_id                                                                       |

Also present but rarely useful: `chat_recoverable_message_join` (recently deleted),
`sync_deleted_*` (CloudKit tombstones), `message_summary_info` blob (edits).

## Row accounting

A complete export reconciles like this (measured on a 23,674-row database):

- 20,535 `kind=message`, 2,873 reactions, 265 group actions, 1 with other `item_type`
- 6,068 have a chat row; 17,606 do not (74%) — deleted conversations
- of the orphans: 10,857 received (sender still known), 6,749 sent (recipient gone)

If your totals are far below `select count(*) from message`, you joined through
`chat_message_join` and dropped the deleted threads.

## Apple epoch

Timestamps are seconds since 2001-01-01, usually stored as nanoseconds. Sniff the
magnitude instead of assuming:

```python
def apple_ts(v):
    if not v:
        return None
    v = int(v)
    secs = v / 1e9 if v > 10**15 else (v / 1e6 if v > 10**12 else v)
    return datetime.fromtimestamp(secs + 978307200, timezone.utc)
```

## attributedBody: about half of all message text

Rows with `text` NULL still have content in `attributedBody`, a typedstream (not plist)
blob. Decode it directly:

```python
MARKER, TERM = b"\x84\x01+", b"\x86\x84"

def read_payload(blob, start):
    """Decode the length-prefixed string at `start`; None if the length overruns."""
    p = start + len(MARKER)
    if p >= len(blob):
        return None
    b0 = blob[p]
    if b0 == 0x81:                    # length as uint16 LE
        n = int.from_bytes(blob[p+1:p+3], "little"); p += 3
    elif b0 == 0x82:                  # length as uint32 LE
        n = int.from_bytes(blob[p+1:p+5], "little"); p += 5
    else:                             # length as a single byte
        n = b0; p += 1
    end = p + n
    return (blob[p:end], end) if end <= len(blob) else None

def body_text(blob):
    """First candidate that fits AND is followed by the terminator wins."""
    if not blob:
        return ""
    fallback = None
    pos = blob.find(MARKER)
    while pos >= 0:
        parsed = read_payload(blob, pos)
        if parsed:
            payload, end = parsed
            if blob[end:end+len(TERM)] == TERM:
                return payload.decode("utf-8", "ignore")
            fallback = fallback or payload
        pos = blob.find(MARKER, pos + 1)
    return fallback.decode("utf-8", "ignore") if fallback else ""
```

Do not take the _first_ marker and trust the length that follows. A blob holds several
marker-like sequences — attribute dictionaries embed their own strings — and leading bytes
can look like one, so the naive version decodes to garbage or to nothing when a prefix,
not the payload, matched first. Validate the candidate instead: the length must fit and
the payload must be followed by `\x86\x84`.

Validate any decoder change against rows where both columns are populated: compare
`body_text(attributedBody)` to `text`. Expect near-total agreement; the only differences
are a leading U+FFFC attachment placeholder and the occasional broken surrogate, so strip
a leading `\ufffc`, and decode with `errors="ignore"` rather than `"replace"`. Then run
the comparison across the whole database and require zero diffs, not a sample.

## Reactions

`associated_message_type` 2000–2006 = tapback added, 3000–3006 = removed:
2000 Loved ❤️, 2001 Liked 👍, 2002 Disliked 👎, 2003 Laughed 😆, 2004 Emphasised ‼️,
2005 Questioned ❓, 2006 custom. `associated_message_emoji` carries sticker/custom emoji.

`associated_message_guid` is prefixed `p:0/` or `p:1/` (part index / GUID). Normalise with
`.split("/")[-1]`, then `.split(":")[-1]` — splitting on `:` first yields the literal `p`.
Fold the reaction onto its target in transcripts, keep the row in JSONL.

## Replies vs thread links

Use `thread_originator_guid` for a real quoted reply. `reply_to_guid` is populated on most
messages by modern macOS and is noise — rendering everything as a reply makes a transcript
unreadable.

## Attachments

`attachment.filename` frequently points at a file macOS has already purged. Resolve in this
order, recording a status for every reference:

1. `os.path.exists(filename)` (expand a leading `~`) → `copied`
2. basename present in a **prebuilt** index of `~/Library/Messages/Attachments` → `copied`
3. otherwise → `purged`, keep the message row and filename in the manifest

Build that index with a single `os.walk` before the loop. Walking the store inside the
per-attachment loop is O(n·m): it turned a 4-second export into one that blew past a
7-minute timeout.

## Deleted conversations: what is recoverable

Chat structure is not. `chat_message_join` rows are gone, `other_handle` is empty, and the
`handle_id` on messages you sent is 0. Bucket received orphans by `handle.id` and sent ones
as unattributed — that is honest.

Do not reconstruct threads by time proximity. Nearest-neighbour matching looks plausible
(93% of sent orphans land within 30 minutes of some received orphan) but bursts of
unrelated texts within the same minute pair the wrong people, and a plausible-looking wrong
reconstruction is worse than an honest gap.

## Verifying an export

Set arithmetic, not counts:

```sql
select count(*) from message;                                     -- 23,674
select count(*) from message_attachment_join;                     -- 1,022
select count(*) from message where not exists
  (select 1 from chat_message_join j where j.message_id = message.ROWID);  -- 17,606
```

Then in Python: `set(db_rowids) - set(export_ids)` and the reverse must both be empty, and
a normalised text comparison over every row with a non-null `text` must produce zero
differences. Reconcile transcript line counts against non-reaction rows plus inline
reactions as a sanity check on rendering, not as proof of completeness.

## Pitfalls that survive a working exporter

- **One record must be one physical line.** Message text can contain U+0085, U+2028 and
  U+2029. They are valid inside a JSON string, so `json.dumps` leaves them raw — but
  `str.splitlines()`, `wc -l` and most line readers split on them, so a naive JSONL file
  silently becomes several "records". Escape those three (`.replace("\u2028", "\\u2028")`,
  same for the others) whenever writing line-delimited output. Iterating the file object
  splits on `\n` only and will not reveal the problem.
- **Per-chat totals must be one pass, not a scan per chat.** `sum(1 for m in messages if
  m["chat_id"] == chat["id"])` inside a loop over chats is O(chats x messages): 1.1 s of a
  3 s export for 322 chats and 23.7k messages. One `Counter` over `chat_id` is 3 ms.
- **Do not thread the attachment-store walk.** It looks like free parallelism but the walk
  is Python-level `os.scandir` under the GIL; measured 1.41 s threaded vs 1.41 s serial.
  Keep the index lazy (built on the first stale path) so an export with nothing to resolve
  never walks the store at all.
- **A decoder rewrite is only safe if output is identical on real data.** Compare the new
  decode against the old across every `attributedBody` row in the database (23,394 blobs
  here) and report the diff count; "the property tests pass" is not that evidence.
- **`imsg --json` masks handles** (`+151****1686`). Use it for contact names only. Take
  identities, chat ids and counts from `chat.db` directly, or transcripts and attachment
  folders end up named after redacted strings.
- **A copied `chat.db` is not the database.** Messages runs in WAL mode, so recent rows live
  in `chat.db-wal`. Copying only `chat.db` silently loses the newest messages — use
  `sqlite3 chat.db ".backup out.db"`, or copy the `.db`, `-wal` and `-shm` together.

## Property tests worth having

The decoder is the code most likely to corrupt history silently, so drive it with
generated input rather than hand-picked examples: arbitrary bytes never raise; every
truncation of a valid blob never raises; `decode(encode(text)) == text` for all three
length prefixes; junk before and after a valid blob still decodes to the text; a payload
that itself contains `\x84\x01+` round-trips unchanged. The last two are what caught the
first-marker bug above.
