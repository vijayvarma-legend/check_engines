# Engine audio

The "Engine Performance" chapter plays `engine-loop.mp3` **in full** when the
visitor scrolls into it. Sound is **on by default** — but browsers keep audio
suspended until the first interaction (a click/tap/keypress anywhere), so it
actually starts once the visitor has touched the page at least once.
`src/lib/engineAudio.ts` registers listeners that resume it on that first input.

The "Sound" control (bottom-left) mutes / unmutes; the choice is remembered in
`localStorage` (`ce-sound`). A 2 s cooldown stops it restarting if you scroll
in and out quickly; it only stops early if the whole cinema is scrolled past.

## The file

- `engine-loop.mp3` — plays start to finish (~23 s), not looped.
- Fallback: if the file is missing, `engineAudio.ts` uses a synthesised tone.

## Format / size

`.mp3`, 44.1/48 kHz. This file is ~735 KB stereo; a mono ~128 kbps re-export
would be about a third of that and worth doing before launch (no `ffmpeg` on the
box that set this up).

## Licensing

Use a clip you can embed on a public site (royalty-free / purchased / permissive
licence). Record the source + licence and add a credit line to the site footer
before launch — same as the placeholder car model. Don't use a recording of a
specific branded car in a way its licence doesn't permit.
