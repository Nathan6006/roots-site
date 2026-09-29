// Cuts the stock clips the site uses into short, seamlessly looping web videos.
//
//   node scripts/encode-videos.mjs [clip names...]
//
// With no names it encodes every clip. The source clips live in the intro
// video project (see its docs/footage-catalog.md for what each one shows and
// its license); set FOOTAGE_DIR if that folder has moved. Needs ffmpeg.
//
// For every entry below this writes:
//   public/videos/<name>-<width>.mp4 for each size    (H.264, no audio)
//   public/videos/<name>-<width>.av1.mp4               (AV1, hero only)
//   src/assets/images/video/<name>.jpg                 (poster, 1920 wide)
//
// Segments crossfade into each other, and the end crossfades back into the
// start, so a plain `loop` never shows a jump cut. The poster is the exact
// first frame, so the fade from poster to video is invisible.
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const SOURCE =
  process.env.FOOTAGE_DIR ?? join(homedir(), "Documents/Roots_of_Tomorrow/intro_video/public/footage");
const FADE = 1.2; // seconds of every crossfade
const FPS = 24;

// Each clip is encoded at a few widths; BackgroundVideo.astro picks the
// smallest one that covers the box it fills (see `widths` there, which must
// match). Lower crf is sharper and bigger. maxrate caps the busiest frames
// (foliage, smoke) so no file balloons.
// The hero also gets an AV1 copy (`av1` is its crf), which is about half the
// size at the same sharpness. The page only uses it on devices that decode
// AV1 in hardware, so it never costs smoothness.
const HERO = [
  { width: 1280, crf: 26, maxrate: "1600k", av1: 38 },
  { width: 1920, crf: 25, maxrate: "2800k", av1: 36 },
];
const CARD = [
  { width: 720, crf: 25, maxrate: "1400k" },
  { width: 1280, crf: 24, maxrate: "3000k" },
];
const SMALL = [
  { width: 640, crf: 25, maxrate: "1200k" },
  { width: 960, crf: 24, maxrate: "2000k" },
];

const videos = [
  {
    name: "home-hero",
    sizes: HERO,
    segments: [
      // Flipped so the sapling sits on the right, away from the heading.
      { id: "pexels-32746150", start: 0, length: 7.1, flip: true }, // sapling close-up
      { id: "pexels-28498901", start: 0, length: 6.2 }, // mist over broadleaf canopy
      { id: "mixkit-51447", start: 2, length: 7.5 }, // river through forest
      { id: "mixkit-34371", start: 0, length: 7.0 }, // sun through leaves, close-up
      { id: "pexels-8525755", start: 52, length: 8.5 }, // wooded valley at sunset
    ],
  },
  { name: "story-logging", sizes: SMALL, segments: [{ id: "pexels-2711297", start: 0, length: 11 }] },
  { name: "band-emissions", sizes: CARD, segments: [{ id: "mixkit-4362", start: 4, length: 10 }] },
  { name: "band-canopy", sizes: CARD, segments: [{ id: "pexels-31693357", start: 0, length: 9.5 }] },
  { name: "cta-forest", sizes: CARD, segments: [{ id: "pixabay-203449", start: 0, length: 9 }] },
];

// Only (re)encode the clips named on the command line, if any.
const only = process.argv.slice(2);

mkdirSync("public/videos", { recursive: true });
mkdirSync("src/assets/images/video", { recursive: true });

const ffmpeg = (args) => execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...args], { stdio: "inherit" });

for (const video of videos) {
  if (only.length && !only.includes(video.name)) continue;
  const { segments } = video;
  const total = segments.reduce((sum, s) => sum + s.length, 0) - (segments.length - 1) * FADE;

  for (const { width, crf, maxrate, av1 } of video.sizes) {
    const inputs = segments.flatMap((s) => ["-i", join(SOURCE, `${s.id}.mp4`)]);
    const filters = segments.map(
      (s, i) =>
        `[${i}:v]trim=start=${s.start}:duration=${s.length},setpts=PTS-STARTPTS,` +
        `${s.flip ? "hflip," : ""}scale=${width}:-2:flags=lanczos,fps=${FPS},setsar=1,format=yuv420p,settb=AVTB[s${i}]`
    );

    // Chain the segments with crossfades.
    let chain = "s0";
    let offset = 0;
    segments.slice(1).forEach((_, i) => {
      offset += segments[i].length - FADE;
      filters.push(`[${chain}][s${i + 1}]xfade=transition=fade:duration=${FADE}:offset=${offset.toFixed(3)}[x${i + 1}]`);
      chain = `x${i + 1}`;
    });

    // Loop seam: play from FADE to the end, and crossfade the last FADE
    // seconds into the first FADE seconds. The output starts and ends on the
    // same frame.
    filters.push(
      `[${chain}]split[a][b]`,
      `[a]trim=start=${FADE},setpts=PTS-STARTPTS[body]`,
      `[b]trim=end=${FADE},setpts=PTS-STARTPTS[head]`,
      `[body][head]xfade=transition=fade:duration=${FADE}:offset=${(total - 2 * FADE).toFixed(3)},format=yuv420p${av1 ? ",split[out][out2]" : "[out]"}`
    );

    const common = ["-an", "-g", String(FPS * 2), "-movflags", "+faststart"];
    ffmpeg([
      ...inputs,
      "-filter_complex", filters.join(";"),
      "-map", "[out]",
      "-c:v", "libx264", "-preset", "slow", "-profile:v", "high",
      "-crf", String(crf), "-tune", "film", "-maxrate", maxrate, "-bufsize", maxrate.replace("k", "") * 2 + "k",
      ...common,
      `public/videos/${video.name}-${width}.mp4`,
      ...(av1
        ? ["-map", "[out2]", "-c:v", "libsvtav1", "-preset", "5", "-crf", String(av1), ...common,
           `public/videos/${video.name}-${width}.av1.mp4`]
        : []),
    ]);
  }

  // Poster: the output's first frame is the first segment at FADE seconds.
  const first = segments[0];
  ffmpeg([
    "-ss", String(first.start + FADE),
    "-i", join(SOURCE, `${first.id}.mp4`),
    "-frames:v", "1",
    ...(first.flip ? ["-vf", "hflip"] : []),
    "-q:v", "3",
    `src/assets/images/video/${video.name}.jpg`,
  ]);

  console.log(`${video.name}: ${(total - FADE).toFixed(1)} s`);
}
