// Automatic checks for the video rules in ../../rules/video-rules.json.
//
// Each check names the rule it enforces. A finding is a WARNING (likely wrong, shown
// before any spend) or a NOTE (worth a look, never blocks). Checks are heuristics on
// the prompt text: they catch the common mistakes the rulebook names, and they do
// not judge the picture. Rules without an automatic check stay in the registry as
// "manual" or "process" and are tracked in the run log.
//
// Rules are the rulebook's: keep IDs stable so run ratings can reference them.

const has = (text, re) => re.test(text);
const count = (text, re) => (text.match(re) ?? []).length;
const words = (text) => text.trim().split(/\s+/).filter(Boolean).length;

const ABSTRACT = /\b(beautiful|stunning|gorgeous|amazing|epic|cinematic|dramatic|magical|dreamy|atmospheric)\b/gi;
const HEDGE = /\b(subtle|subtly|gently|gentle|slightly|slowly drifting|drifting|soft movement)\b/gi;
const NEGATION = /\b(no|not|without|never|avoid|don't|do not)\b/i;
const COUNT = /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(people|persons|men|women|figures|characters|dogs|cars|logos|signs|passengers|hands|fingers|objects|birds)\b/i;
const CAMERA_MOVES = {
  locked: /\b(locked-off|locked off|static camera|camera (remains|stays) still|fixed frame)\b/i,
  push: /\b(push-in|push in|dolly in|dolly-in|move in toward)\b/i,
  pull: /\b(pull-back|pull back|dolly out|pull out)\b/i,
  pan: /\bpan(s|ning)?\b/i,
  track: /\b(track(s|ing)?|truck(s|ing)?|lateral)\b/i,
  orbit: /\b(orbit|orbits|360|crane|whip pan|fpv|drone|dolly zoom|dolly-zoom|handheld)\b/i,
};
const SHOT_SIZE = /\b(extreme close-up|close-up|medium close|medium shot|medium|wide shot|wide|establishing|full shot|full-body|full body)\b/i;
const END_POSE = /\b(settles|settle|comes to rest|stops|holds|ends|final pose|end pose|freezes|remains|rests)\b/i;
const TURN = /\b(turns around|spins|180|circles the camera|walks away|walks back|comes back|turns to walk)\b/i;
const THROUGH = /\b(through the door|through a door|through the crowd|through the mirror|narrow gap|through the gap|in the mirror)\b/i;
const FINGERS = /\b(fingers?|fists?|knuckles|typing|tying|buttons?)\b/i;
const LIGHT = /\b(light|lamp|window|sun|neon|sodium|rim|fill|glow|lit|lighting)\b/i;
const LIGHT_MIX = ["golden hour", "neon", "softbox", "daylight", "moonlight", "sodium", "candlelight"];
const STYLE_STACK = /\b(cinematic|premium|dramatic|epic|beautiful|stunning|luxurious)\b/gi;
const COLOUR = /\b(red|blue|green|amber|cream|walnut|black|white|grey|gray|gold|silver|pink|purple|teal|orange|yellow|brown|navy|ochre|charcoal|ivory)\b/gi;
const PHOTOREAL = /\b(dance|dancing|concert|interview|vlog|red carpet|documentary|k-?pop)\b/i;
const BIG_ACTION = /\b(run|runs|running|jump|jumps|fight|fights|flip|spin|sprint)\b/i;
const CONTACT_RISK = /\b(embrace|hug|grapple|wrestle|hand-to-hand|hand to hand)\b/i;
const EXIT = /\b(leaves the frame|exits?|walks out|out of frame|off-frame|steps out)\b/i;
const TRAVEL = /\b(walks|runs|moves|travels|follows|crosses)\b/i;
const CAMERA_FIXED = /\b(camera does not follow|camera stays|fixed frame|camera remains still|locked-off)\b/i;
const OCCLUDED = /\b(behind (his|her|their|the) back|off-screen|hidden hand|hand out of frame)\b/i;
const BEATS = /\b(then|after that|next|finally|afterwards|and then)\b/gi;
const SOUND_WORDS = /\b(sound|music|dialogue|says|whispers|voice|speaks|ambient|sfx)\b/i;
const MUSIC = /\bmusic\b/i;
const MUSIC_SPEC = /\b(genre|piano|strings|synth|drums|orchestral|jazz|hip hop|ambient|no score)\b/i;

// ctx: { aspect, durationSeconds, generateAudio, model, keyframe?: {width,height},
//        castCount?, hasNegative?, negativeSupported?, text }
export function lintPrompt(text, ctx = {}) {
  const findings = [];
  const add = (rule, severity, message) => findings.push({ rule, severity, message });
  const t = text ?? "";

  if (ctx.keyframe && Math.max(ctx.keyframe.width, ctx.keyframe.height) < 1080) {
    add("R04", "warn", `keyframe is ${ctx.keyframe.width}x${ctx.keyframe.height}; the long edge should be at least 1080px`);
  }
  if (count(t, ABSTRACT) > 0) add("R14", "warn", `abstract adjectives: ${[...new Set(t.match(ABSTRACT).map((w) => w.toLowerCase()))].join(", ")}`);
  if (count(t, HEDGE) > 1) add("R16", "warn", "more than one hedge word; pick one real action verb at full strength");
  if (NEGATION.test(t)) add("R17", "note", "negated phrasing; state the outcome positively where you can");
  if (COUNT.test(t)) add("R20", "warn", "exact count in the prompt; models do not count reliably");
  if (ctx.keyframe && words(t) > 60) add("R21", "warn", `${words(t)} words with a keyframe; I2V prompts should stay under about 60`);

  const moves = Object.entries(CAMERA_MOVES).filter(([k, re]) => k !== "orbit" && re.test(t)).map(([k]) => k);
  if (moves.length === 0) add("R23", "warn", "no named camera move; say locked-off or name one move");
  if (moves.length > 1) add("R23", "warn", `several camera moves (${moves.join(", ")}); keep one per shot`);
  if (CAMERA_MOVES.orbit.test(t)) add("R25", "warn", "high-risk camera move; use only when the reveal is the point");
  if (!SHOT_SIZE.test(t)) add("R28", "note", "no shot size named (close-up, medium, wide)");
  if (ctx.aspect === "9:16" && /\b(pan|pans|truck|trucks|track left|track right)\b/i.test(t)) {
    add("R30", "warn", "lateral pan or truck in 9:16; prefer push-in or forward tracking");
  }
  if (!END_POSE.test(t)) add("R36", "warn", "no end state named; an open-ended motion runs to the clip edge");
  if (TURN.test(t)) add("R46", "warn", "turn, circle or walk-away move in one clip; split with a cut");
  if (THROUGH.test(t)) add("R48", "warn", "passage through a door, crowd, mirror or gap; cut to the other side instead");
  if (FINGERS.test(t)) add("R56", "note", "finger-level action; keep hands simple or out of frame");
  if (ctx.castCount !== undefined && ctx.castCount > 2) add("R58", "warn", `${ctx.castCount} characters in one scene; two at most`);
  if (!LIGHT.test(t)) add("R63", "note", "no lighting logic named (source, direction, colour)");
  if (/\b(crowd|crowds|passers-by|people)\b/i.test(t) && !/\b(blurred|deep background)\b/i.test(t)) {
    add("R65", "warn", "crowd without a blurred deep-background qualifier");
  }
  if (/\b(mirror|reflect|reflection|puddle|screen|shopfront|glass)\b/i.test(t)) add("R66", "warn", "reflective surface named; keep it static and out of focus");
  if (/\b(sign|lettering|poster|logo|awning)\b/i.test(t) && !/\b(blank|unmarked|plain)\b/i.test(t)) {
    add("R68", "warn", "signage without blank or unmarked; lettering morphs under motion");
  }
  if (count(t, STYLE_STACK) > 2) add("R76", "warn", "stacked style adjectives; keep two or three cues");
  if (new Set(t.match(COLOUR) ?? []).size < 3) add("R77", "note", "fewer than three named colours to anchor the palette");
  if (LIGHT_MIX.filter((w) => t.toLowerCase().includes(w)).length > 1) add("R79", "warn", "mixed lighting eras in one prompt");
  if (PHOTOREAL.test(t)) add("R80A", "warn", "real-footage prior word (dance, concert, interview); it pulls toward photoreal");
  if (BIG_ACTION.test(t)) add("R80C", "note", "big motion re-renders every frame and drifts toward photoreal; keep style-critical beats small");
  if (CONTACT_RISK.test(t)) add("R80H", "warn", "grappling, embracing or hand-to-hand passing is untested");
  if (EXIT.test(t)) add("R80M", "warn", "a character leaves the frame; they are re-cast on re-entry");
  if (TRAVEL.test(t) && !CAMERA_FIXED.test(t)) add("R80N", "warn", "travelling action with no statement that the camera holds; it will drag");
  if (OCCLUDED.test(t)) add("R80O", "warn", "occluded hand or transfer cannot be staged; use open profile");
  if (count(t, BEATS) >= 2) add("R80P", "warn", "several beats in one take; one beat per take, cut between beats");
  if (!ctx.generateAudio && SOUND_WORDS.test(t)) add("R90", "warn", "sound words on a silent clip; audio prose is read as visual instruction");
  if (MUSIC.test(t) && !MUSIC_SPEC.test(t)) add("R96", "note", "music named without genre, instrumentation or energy");
  if (ctx.hasNegative && !ctx.negativeSupported) add("R18", "warn", "negative prompt set but this model has no negative field; it is dropped");

  return findings;
}
