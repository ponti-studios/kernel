# Testing the real app, not just its pipeline

A menu-bar app with a microphone is easy to verify in a way that proves nothing: a headless flag that replays audio
through the same model, a log that prints the same numbers the HUD would show. That path shares the pipeline and
skips the product. The window never opens, the input device is never opened, and the rendering is never asked to
keep up — so a session can "verify end to end" while the person at the keyboard hears audio and sees nothing.

Do both, and know which question each answers.

## The headless path: pipeline and timing

Worth having, and cheap to build: a flag that takes a file and feeds it to the live path **at the pace it was
spoken**, by appending to a growing copy (a WAV is just a header and a payload; for 16 kHz mono 16-bit that is
32 000 bytes per second). Then a bad take can be replayed without a microphone, and the timings are the timings a
person would have experienced.

- It proves the pipeline, the model, and the pace of the loop.
- It proves nothing about the UI, the capture device, or the thread that draws.
- Say which of the two you are claiming. "The whole chain" is a lie when the window was never opened.

## The real app: drive it, then read its own log

You cannot press a hotkey. You can synthesize the keystroke, and the app already logs what it did, so the
confirmation is a line of its own output rather than a guess:

```bash
# global hotkey ⌥⌘Space — key code 49 is space; run it, then look for the app's own acknowledgement
osascript -e 'tell application "System Events" to key code 49 using {command down, option down}'
tail -n 20 "$HOME/Library/Application Support/<App>/<app>.log" | grep -E 'record start|key down'
```

`record start` appearing is proof the real app is capturing and its surface is on screen. Absence means the
keystroke never reached the registered hotkey — retry once, then say so rather than narrating a test that did not
happen.

Tell the person what to watch for _before_ the take, since the surface is in front of them and not in front of you:
the capture is a few seconds and the window will be gone by the time you report.

## Feeding audio to the microphone

Playing a fixture through the speakers and letting the microphone hear it exercises capture, resampling and the
device path with no human speaking. Two things decide whether the result means anything:

- **Level.** Laptop speakers are close to the built-in microphone; playback that is comfortable to listen to can
  arrive at the microphone clipped. Check the take rather than the volume estimate:

  ```bash
  ffmpeg -hide_banner -i take.wav -af volumedetect -f null /dev/null 2>&1 | grep -E 'mean_volume|max_volume'
  ```

  `max_volume: 0.0 dB` means clipping — the engine sees flattened peaks and gets slower and less accurate. A mean
  around −19 dB with peaks below 0 takes roughly half system volume (`afplay -v 0.5`).

- **Lead-in.** Start the recorder, then the audio. The silence before the first word is part of the take and will
  show up in every timing as "the app was slow" if you forget it.

## Isolating capture from the rest

The strongest comparison is the same audio through both entry points: record the room once, then replay that
recording through the file path and compare. A difference of a few tenths of a second between them means capture
is innocent, and the remaining number belongs to the model or the surface. This is how "sounds slow when I speak"
stops being an opinion.

## Speech fixtures without a voice actor

Public-domain, phonetically varied, and intentionally dull — the Harvard sentences are the standard material, and
macOS will read them:

```bash
say -v Daniel -r 170 -f sentences.txt -o long.aiff          # 170 wpm is ordinary dictation pace
afconvert -f WAVE -d LEI16@16000 -c 1 long.aiff long.wav     # match what the app records
ffmpeg -v error -i long.wav -t 90 -ar 16000 -ac 1 -c:a pcm_s16le take-90s.wav
```

- Cut the lengths you need from **one** read, so the files differ only in length.
- A fixture that begins speaking at t=0 separates two things a real take confuses: the model warming up, and the
  person not having started yet. The fixture's first-word figure is the model's; the real take's is mostly silence.
- Keep the generator in the repo (`scripts/`), not in a shell history. Fixtures are the thing you will want again
  the moment the numbers move.

## What to report

Two rows, labelled by entry point — microphone and file — with first-word, model time, and how far behind the
input the surface ran. Then say plainly which half was not tested. The person using the app can see the surface;
saying "it works" about something you never rendered is the one claim that costs trust.
