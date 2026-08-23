const pptxgen = require('pptxgenjs');

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';           // 13.333 x 7.5
pres.author = 'Robotics Lab';
pres.title = 'CI/CD for Robots — GitHub Actions + ROS 2';

const W = 13.333, H = 7.5, M = 0.7;

// ---- palette: "console" — deep slate with pass/fail signal colours ----
const INK      = '0E2233';   // dark background
const PANEL    = '17364C';   // raised panel on dark
const SOFT     = 'EDF2F6';   // card tint on light
const GREEN    = '1FA971';
const GREEN_HI = '3BD68C';
const RED      = 'D9434B';
const RED_HI   = 'FF6B71';
const AMBER    = 'D98B2B';
const TXT      = '0E2233';
const MUTED    = '5E7789';
const LTXT     = 'E9F1F6';
const LMUTED   = '92AEC1';

const FH = 'Arial';          // headings
const FB = 'Calibri';        // body
const FM = 'Courier New';    // code

const notes = [];

function slide(dark) {
  const s = pres.addSlide();
  s.background = { color: dark ? INK : 'FFFFFF' };
  return s;
}

// slide title
function title(s, text, dark, opts = {}) {
  s.addText(text, {
    x: M, y: opts.y ?? 0.45, w: W - 2 * M, h: 0.85,
    fontFace: FH, fontSize: opts.size ?? 34, bold: true,
    color: dark ? LTXT : TXT, align: 'left', margin: 0, valign: 'middle',
  });
}

function kicker(s, text, dark) {
  s.addText(text.toUpperCase(), {
    x: M, y: 0.16, w: W - 2 * M, h: 0.3,
    fontFace: FB, fontSize: 11, bold: true, charSpacing: 2,
    color: dark ? LMUTED : MUTED, margin: 0, valign: 'middle',
  });
}

// rounded "terminal" panel with monospace lines.
// lines: array of {t, c?, b?}
function terminal(s, x, y, w, lines, opts = {}) {
  const fs = opts.fontSize ?? 13;
  const lh = fs * 1.62 / 72;
  const padY = 0.26;
  const h = opts.h ?? (lines.length * lh + padY * 2);
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.08,
    fill: { color: opts.fill ?? INK },
    line: { color: opts.border ?? (opts.fill ? 'D3DEE6' : '2A4C66'), width: 1 },
    shadow: opts.shadow === false ? undefined
      : { type: 'outer', color: '0E2233', opacity: 0.18, blur: 10, offset: 3, angle: 90 },
  });
  s.addText(
    lines.map((l, i) => ({
      text: l.t,
      options: {
        color: l.c ?? LTXT, bold: !!l.b, fontFace: FM, fontSize: fs,
        breakLine: i !== lines.length - 1,
      },
    })),
    { x: x + 0.28, y: y + padY, w: w - 0.56, h: h - padY * 2, margin: 0, valign: 'top', lineSpacing: fs * 1.62 }
  );
  return h;
}

// status chip: ✓ PASS / ✗ FAIL
function chip(s, x, y, ok, label, opts = {}) {
  const w = opts.w ?? 1.55, h = opts.h ?? 0.42;
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.5,
    fill: { color: ok ? GREEN : RED }, line: { type: 'none' },
  });
  s.addText(label, {
    x, y, w, h, fontFace: FH, fontSize: opts.size ?? 12, bold: true,
    color: 'FFFFFF', align: 'center', valign: 'middle', margin: 0,
  });
}

// numbered circle
function numDot(s, x, y, n, color, dark, d = 0.46) {
  s.addShape(pres.ShapeType.ellipse, {
    x, y, w: d, h: d, fill: { color }, line: { type: 'none' },
  });
  s.addText(String(n), {
    x, y, w: d, h: d, fontFace: FH, fontSize: 15, bold: true,
    color: 'FFFFFF', align: 'center', valign: 'middle', margin: 0,
  });
}

// light card
function card(s, x, y, w, h, fill) {
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.05,
    fill: { color: fill ?? SOFT }, line: { type: 'none' },
  });
}

function body(s, text, o) {
  s.addText(text, Object.assign({
    fontFace: FB, fontSize: 15, color: TXT, margin: 0, valign: 'top', align: 'left',
  }, o));
}

// =====================================================================
// 1 — TITLE
// =====================================================================
{
  const s = slide(true);
  s.addText('CI/CD for robots', {
    x: M, y: 2.0, w: 9.6, h: 1.0, fontFace: FH, fontSize: 52, bold: true,
    color: LTXT, margin: 0, valign: 'middle',
  });
  s.addText([
    { text: 'GitHub Actions', options: { color: GREEN_HI, bold: true } },
    { text: '  +  ', options: { color: LMUTED } },
    { text: 'ROS 2', options: { color: GREEN_HI, bold: true } },
  ], {
    x: M, y: 3.05, w: 9.6, h: 0.55, fontFace: FH, fontSize: 26, margin: 0, valign: 'middle',
  });
  s.addText('Every push builds and tests the code on a clean machine,\nso "works on my laptop" stops being a thing anybody has to say.', {
    x: M, y: 3.85, w: 8.6, h: 1.0, fontFace: FB, fontSize: 17, italic: true,
    color: LMUTED, margin: 0, valign: 'top', lineSpacing: 26,
  });
  terminal(s, M, 5.35, 6.2, [
    { t: '$ git push', c: LTXT },
    { t: '  ✓ build   ✓ test   ✓ lint', c: GREEN_HI },
  ], { fontSize: 14, shadow: false });
  chip(s, 8.05, 5.62, true, 'ALL CHECKS PASSED', { w: 2.6, size: 11 });
  s.addText('45 minutes  ·  new lab members  ·  bring a laptop', {
    x: M, y: 6.75, w: 8, h: 0.35, fontFace: FB, fontSize: 12,
    color: LMUTED, margin: 0, valign: 'middle',
  });
  notes.push('Open cold. Do NOT define CI yet — tell the Friday story first (next slide). Repo URL should already be in chat.');
}

// =====================================================================
// 2 — THE FRIDAY BUG
// =====================================================================
{
  const s = slide(false);
  kicker(s, 'why we are here', false);
  title(s, 'Nobody did anything wrong', false);

  const steps = [
    ['FRI 17:40', 'Someone pushes a small change to the velocity limiter.', MUTED],
    ['FRI 17:41', 'It builds fine on their machine — the stale install/ folder still has the old headers.', MUTED],
    ['MON 09:15', 'Someone else pulls main. The robot will not build.', RED],
    ['MON 12:30', 'Two people have lost a morning.', RED],
  ];
  let y = 1.75;
  steps.forEach(([when, what, col], i) => {
    card(s, M, y, W - 2 * M, 0.92, i >= 2 ? 'FBECED' : SOFT);
    s.addText(when, {
      x: M + 0.32, y: y + 0.06, w: 1.7, h: 0.8, fontFace: FM, fontSize: 12, bold: true,
      color: col, margin: 0, valign: 'middle',
    });
    s.addText(what, {
      x: M + 2.1, y: y + 0.06, w: W - 2 * M - 2.5, h: 0.8, fontFace: FB, fontSize: 16,
      color: TXT, margin: 0, valign: 'middle',
    });
    y += 1.06;
  });

  s.addText('This is not a discipline problem. It is a missing-feedback problem.', {
    x: M, y: 6.28, w: W - 2 * M, h: 0.5, fontFace: FH, fontSize: 19, bold: true,
    color: TXT, margin: 0, valign: 'middle',
  });
  notes.push('Tell it as a lab story, not a definition. Keep it under 90 seconds, then go straight to the hands-up slide.');
}

// =====================================================================
// 3 — HANDS UP
// =====================================================================
{
  const s = slide(false);
  kicker(s, 'hands up', false);
  title(s, 'Be honest', false);

  const qs = [
    'Who has pulled main\nand found it broken?',
    'Who has said\n"but it works on\nmy machine"?',
    'Who has pushed\nsomething that\ndid not compile?',
  ];
  qs.forEach((q, i) => {
    const x = M + i * 4.08;
    card(s, x, 1.9, 3.75, 3.0, SOFT);
    numDot(s, x + 0.35, 2.25, i + 1, INK, false, 0.5);
    s.addText(q, {
      x: x + 0.35, y: 3.0, w: 3.05, h: 1.6, fontFace: FH, fontSize: 19, bold: true,
      color: TXT, margin: 0, valign: 'top', lineSpacing: 26,
    });
  });

  s.addText('Put your own hand up first, on all three.', {
    x: M, y: 5.15, w: W - 2 * M, h: 0.4, fontFace: FB, fontSize: 14, italic: true,
    color: MUTED, margin: 0, valign: 'middle',
  });
  card(s, M, 5.75, W - 2 * M, 1.05, INK);
  s.addText('CI is just automatic feedback. That is the entire idea.', {
    x: M + 0.4, y: 5.75, w: W - 2 * M - 0.8, h: 1.05, fontFace: FH, fontSize: 21, bold: true,
    color: LTXT, margin: 0, valign: 'middle',
  });
  notes.push('Wait for actual hands. Silence here is fine — it makes the point. :04 by the end of this slide.');
}

// =====================================================================
// 4 — WHAT CI IS (the loop)
// =====================================================================
{
  const s = slide(false);
  kicker(s, 'what ci actually is', false);
  title(s, 'You push. A stranger\'s computer checks your work.', false);

  const boxes = [
    ['You push', 'a commit lands on\nGitHub', INK],
    ['GitHub rents a VM', 'a brand-new machine,\nfrom scratch', INK],
    ['It runs your commands', 'build, test, lint —\nthe same ones you type', INK],
  ];
  boxes.forEach(([h, sub], i) => {
    const x = M + i * 3.55;
    card(s, x, 2.05, 3.2, 1.95, SOFT);
    s.addText(h, {
      x: x + 0.28, y: 2.28, w: 2.7, h: 0.45, fontFace: FH, fontSize: 16, bold: true,
      color: TXT, margin: 0, valign: 'middle',
    });
    s.addText(sub, {
      x: x + 0.28, y: 2.78, w: 2.7, h: 1.0, fontFace: FB, fontSize: 13,
      color: MUTED, margin: 0, valign: 'top', lineSpacing: 18,
    });
    if (i < 2) {
      s.addText('\u2192', {
        x: x + 3.22, y: 2.05, w: 0.36, h: 1.95, fontFace: FH, fontSize: 22, bold: true,
        color: '9FB4C3', align: 'center', valign: 'middle', margin: 0,
      });
    }
  });
  s.addText('\u2192', { x: M + 10.33, y: 2.05, w: 0.36, h: 1.95, fontFace: FH, fontSize: 22, bold: true, color: '9FB4C3', align: 'center', valign: 'middle', margin: 0 });
  chip(s, M + 10.75, 2.45, true, '✓  green', { w: 1.15, h: 0.5, size: 12 });
  chip(s, M + 10.75, 3.1, false, '✗  red', { w: 1.15, h: 0.5, size: 12 });

  s.addText('...and then the machine is destroyed.', {
    x: M, y: 4.2, w: 8, h: 0.4, fontFace: FB, fontSize: 14, italic: true, color: MUTED, margin: 0,
  });

  card(s, M, 4.85, 5.85, 1.95, SOFT);
  s.addText('The machine is thrown away', {
    x: M + 0.32, y: 5.05, w: 5.2, h: 0.4, fontFace: FH, fontSize: 17, bold: true, color: TXT, margin: 0, valign: 'middle',
  });
  s.addText('Nothing you install persists. That is the feature —\nit is why CI catches "I forgot to commit that file".', {
    x: M + 0.32, y: 5.5, w: 5.2, h: 1.1, fontFace: FB, fontSize: 14, color: MUTED, margin: 0, valign: 'top', lineSpacing: 20,
  });

  card(s, M + 6.1, 4.85, 5.85, 1.95, SOFT);
  s.addText('Exit code 0 is the whole contract', {
    x: M + 6.42, y: 5.05, w: 5.2, h: 0.4, fontFace: FH, fontSize: 17, bold: true, color: TXT, margin: 0, valign: 'middle',
  });
  s.addText('CI does not understand your tests. It runs a command\nand looks at the exit code. 0 is green. Anything else is red.', {
    x: M + 6.42, y: 5.5, w: 5.2, h: 1.1, fontFace: FB, fontSize: 14, color: MUTED, margin: 0, valign: 'top', lineSpacing: 20,
  });
  notes.push('Draw the arrow chain on the whiteboard as you say it. The two bottom cards are the surprising bits — say both out loud.');
}

// =====================================================================
// 5 — THE FOUR WORDS
// =====================================================================
{
  const s = slide(false);
  kicker(s, 'vocabulary', false);
  title(s, 'Four words. That is the whole vocabulary.', false);

  const rows = [
    ['Event', 'Something happened in the repo — usually a push or a pull request.'],
    ['Workflow', 'A YAML file in .github/workflows/ that says "when X happens, do Y".'],
    ['Job', 'A chunk of work that gets its own brand-new computer. Jobs run in parallel.'],
    ['Step', 'One command, or one reusable action, inside a job.'],
  ];
  let y = 1.85;
  rows.forEach(([k, v], i) => {
    card(s, M, y, W - 2 * M, 1.02, SOFT);
    numDot(s, M + 0.3, y + 0.28, i + 1, INK, false);
    s.addText(k, {
      x: M + 1.0, y: y + 0.1, w: 1.9, h: 0.82, fontFace: FH, fontSize: 19, bold: true,
      color: GREEN, margin: 0, valign: 'middle',
    });
    s.addText(v, {
      x: M + 2.95, y: y + 0.1, w: W - 2 * M - 3.35, h: 0.82, fontFace: FB, fontSize: 15,
      color: TXT, margin: 0, valign: 'middle',
    });
    y += 1.17;
  });
  s.addText('Everything else you will ever read about GitHub Actions is a variation on these four.', {
    x: M, y: 6.55, w: W - 2 * M, h: 0.45, fontFace: FB, fontSize: 14, italic: true,
    color: MUTED, margin: 0, valign: 'middle',
  });
  notes.push('Say each word once, plainly. Do not add jargon. These four map 1:1 onto the YAML on the next slides.');
}

// =====================================================================
// 6 — CI vs CD
// =====================================================================
{
  const s = slide(false);
  kicker(s, 'the other letter', false);
  title(s, 'What about the "CD" part?', false);

  card(s, M, 1.9, 5.85, 2.5, SOFT);
  s.addText('CI  ·  Continuous Integration', {
    x: M + 0.35, y: 2.15, w: 5.15, h: 0.45, fontFace: FH, fontSize: 18, bold: true, color: GREEN, margin: 0, valign: 'middle',
  });
  s.addText('Did it build? Did the tests pass?\nRuns on every push and every pull request.', {
    x: M + 0.35, y: 2.65, w: 5.15, h: 1.0, fontFace: FB, fontSize: 15, color: TXT, margin: 0, valign: 'top', lineSpacing: 22,
  });
  s.addText('≈ 90% of today', {
    x: M + 0.35, y: 3.72, w: 5.15, h: 0.4, fontFace: FB, fontSize: 13, bold: true, color: MUTED, margin: 0, valign: 'middle',
  });

  card(s, M + 6.1, 1.9, 5.85, 2.5, SOFT);
  s.addText('CD  ·  Continuous Delivery', {
    x: M + 6.45, y: 2.15, w: 5.15, h: 0.45, fontFace: FH, fontSize: 18, bold: true, color: AMBER, margin: 0, valign: 'middle',
  });
  s.addText('...and now ship it somewhere.\nPublish a Docker image, cut a release, deploy.', {
    x: M + 6.45, y: 2.65, w: 5.15, h: 1.0, fontFace: FB, fontSize: 15, color: TXT, margin: 0, valign: 'top', lineSpacing: 22,
  });
  s.addText('the last 5 minutes', {
    x: M + 6.45, y: 3.72, w: 5.15, h: 0.4, fontFace: FB, fontSize: 13, bold: true, color: MUTED, margin: 0, valign: 'middle',
  });

  card(s, M, 4.75, W - 2 * M, 1.85, INK);
  s.addShape(pres.ShapeType.ellipse, {
    x: M + 0.42, y: 5.42, w: 0.5, h: 0.5, fill: { color: AMBER }, line: { type: 'none' },
  });
  s.addText('!', {
    x: M + 0.42, y: 5.42, w: 0.5, h: 0.5, fontFace: FH, fontSize: 20, bold: true,
    color: 'FFFFFF', align: 'center', valign: 'middle', margin: 0,
  });
  s.addText('A robot is not a web server.', {
    x: M + 1.2, y: 5.0, w: 10.2, h: 0.45, fontFace: FH, fontSize: 19, bold: true, color: LTXT, margin: 0, valign: 'middle',
  });
  s.addText('You can auto-deploy a website at 3am and roll it back at 3:01. A bad rollback on a robot moves.\nKeep a human in the loop between "tests passed" and "it is on the hardware".', {
    x: M + 1.2, y: 5.5, w: 10.2, h: 0.95, fontFace: FB, fontSize: 14, color: LMUTED, margin: 0, valign: 'top', lineSpacing: 21,
  });
  notes.push('60 seconds, no more. Ask the room WHY a robot is different before you give the answer — someone will say it.');
}

// =====================================================================
// 7 — ANATOMY OF A WORKFLOW
// =====================================================================
{
  const s = slide(true);
  kicker(s, 'live  ·  01-hello-ci.yml', true);
  title(s, 'The same four words, in a file', true);

  terminal(s, M, 1.75, 7.35, [
    { t: 'on:', c: GREEN_HI, b: true },
    { t: '  push:', c: LTXT },
    { t: '', c: LTXT },
    { t: 'jobs:', c: GREEN_HI, b: true },
    { t: '  say-hello:', c: LTXT },
    { t: '    runs-on: ubuntu-latest', c: LTXT },
    { t: '    steps:', c: LTXT },
    { t: '      - uses: actions/checkout@v7', c: LTXT },
    { t: '      - run: echo "Hello from $(hostname)"', c: LTXT },
  ], { fontSize: 15 });

  const legend = [
    ['on:', 'the EVENT that wakes it up', GREEN_HI],
    ['jobs:', 'named by you; own fresh VM', GREEN_HI],
    ['runs-on:', 'the machine GitHub rents you', GREEN_HI],
    ['uses:', "someone else's reusable action", GREEN_HI],
    ['run:', 'your own shell command', GREEN_HI],
  ];
  let ly = 1.9;
  legend.forEach(([k, v, c]) => {
    s.addText(k, {
      x: 8.5, y: ly, w: 1.5, h: 0.4, fontFace: FM, fontSize: 13, bold: true, color: c, margin: 0, valign: 'middle',
    });
    s.addText(v, {
      x: 9.95, y: ly, w: 2.75, h: 0.4, fontFace: FB, fontSize: 13, color: LMUTED, margin: 0, valign: 'middle',
    });
    ly += 0.62;
  });

  card(s, M, 5.4, W - 2 * M, 1.35, PANEL);
  s.addText('It is just a file in the repo.', {
    x: M + 0.4, y: 5.58, w: 11.1, h: 0.42, fontFace: FH, fontSize: 18, bold: true, color: LTXT, margin: 0, valign: 'middle',
  });
  s.addText('No dashboard, no console, no separate CI server to log into. You review it, diff it and revert it like any other code.', {
    x: M + 0.4, y: 6.0, w: 11.1, h: 0.5, fontFace: FB, fontSize: 14, color: LMUTED, margin: 0, valign: 'middle',
  });
  notes.push('Open the file ON GITHUB, not in your editor. Read it top to bottom out loud, pointing at each keyword.');
}

// =====================================================================
// 8 — LIVE: PUSH IT
// =====================================================================
{
  const s = slide(true);
  kicker(s, 'live  ·  do this now', true);
  title(s, 'Push anything. Watch it run.', true);

  terminal(s, M, 1.8, 7.35, [
    { t: '$ echo "# workshop $(date +%H:%M)" >> README.md', c: LTXT },
    { t: '$ git commit -am "trigger CI"', c: LTXT },
    { t: '$ git push', c: LTXT },
    { t: '', c: LTXT },
    { t: '# now open the Actions tab and refresh', c: LMUTED },
  ], { fontSize: 15 });

  s.addText('While it runs, say this:', {
    x: 8.5, y: 1.9, w: 4.2, h: 0.4, fontFace: FB, fontSize: 13, bold: true, color: LMUTED, margin: 0, valign: 'middle',
  });
  s.addText('"Right now GitHub is booting a virtual machine somewhere for us. That is the ten seconds."', {
    x: 8.5, y: 2.35, w: 4.2, h: 1.6, fontFace: FH, fontSize: 16, italic: true, color: LTXT, margin: 0, valign: 'top', lineSpacing: 24,
  });

  card(s, M, 4.4, W - 2 * M, 2.35, PANEL);
  s.addText('In the run page, point at:', {
    x: M + 0.4, y: 4.58, w: 11.1, h: 0.4, fontFace: FH, fontSize: 16, bold: true, color: LTXT, margin: 0, valign: 'middle',
  });
  const pts = [
    'the step names — they match the YAML you just read, line for line',
    '"Set up job" at the top — GitHub\'s own bookkeeping, ignore it',
    'the hostname output — that computer did not exist twenty seconds ago',
    'the total run time in the corner',
  ];
  s.addText(pts.map((p, i) => ({
    text: p,
    options: { bullet: true, breakLine: i !== pts.length - 1, color: LMUTED, fontSize: 14, fontFace: FB },
  })), { x: M + 0.45, y: 5.05, w: 11.0, h: 1.55, margin: 0, valign: 'top', paraSpaceAfter: 6 });
  notes.push('Never apologise for the wait. Fill it with the "who pays for this" material on the next slide if you need to.');
}

// =====================================================================
// 9 — READING A RUN / RED vs GREEN
// =====================================================================
{
  const s = slide(false);
  kicker(s, 'reading the actions tab', false);
  title(s, 'Two outcomes. That is the whole interface.', false);

  card(s, M, 1.85, 5.85, 2.35, 'E9F6EF');
  chip(s, M + 0.35, 2.15, true, '✓  SUCCESS', { w: 1.85 });
  s.addText('Green', {
    x: M + 2.4, y: 2.15, w: 3.2, h: 0.42, fontFace: FH, fontSize: 20, bold: true, color: GREEN, margin: 0, valign: 'middle',
  });
  s.addText('Every command exited 0. Merge with a clear head.', {
    x: M + 0.35, y: 2.8, w: 5.15, h: 1.1, fontFace: FB, fontSize: 15, color: TXT, margin: 0, valign: 'top', lineSpacing: 22,
  });

  card(s, M + 6.1, 1.85, 5.85, 2.35, 'FBECED');
  chip(s, M + 6.45, 2.15, false, '✗  FAILURE', { w: 1.85 });
  s.addText('Red', {
    x: M + 8.5, y: 2.15, w: 3.2, h: 0.42, fontFace: FH, fontSize: 20, bold: true, color: RED, margin: 0, valign: 'middle',
  });
  s.addText('Something exited non-zero. Click through to the step, read the last 20 lines.', {
    x: M + 6.45, y: 2.8, w: 5.15, h: 1.1, fontFace: FB, fontSize: 15, color: TXT, margin: 0, valign: 'top', lineSpacing: 22,
  });

  const faqs = [
    ['Who pays for this?', 'Free for public repos. Private repos get a monthly minute allowance per org — Linux minutes are the cheap ones.'],
    ['What is @v7?', "A version tag on someone else's action. Pin the major version. Never use @main on code you did not write."],
    ['Can it run on our machine?', 'Yes — a self-hosted runner. That is how you would test against real hardware. More in Q&A.'],
  ];
  faqs.forEach(([q, a], i) => {
    const x = M + i * 4.08;
    card(s, x, 4.5, 3.75, 2.25, SOFT);
    s.addText(q, {
      x: x + 0.3, y: 4.72, w: 3.15, h: 0.7, fontFace: FH, fontSize: 15, bold: true, color: TXT, margin: 0, valign: 'top', lineSpacing: 20,
    });
    s.addText(a, {
      x: x + 0.3, y: 5.42, w: 3.15, h: 1.2, fontFace: FB, fontSize: 12.5, color: MUTED, margin: 0, valign: 'top', lineSpacing: 17,
    });
  });
  notes.push('These three questions always come. Answer in one line each and move on — do not let self-hosted runners eat five minutes here.');
}

// =====================================================================
// 10 — NOW MAKE IT ROS 2
// =====================================================================
{
  const s = slide(true);
  kicker(s, 'section 2', true);
  s.addText('Now make it a\nROS 2 pipeline', {
    x: M, y: 2.1, w: 8.0, h: 2.0, fontFace: FH, fontSize: 44, bold: true,
    color: LTXT, margin: 0, valign: 'middle', lineSpacing: 52,
  });
  s.addText('Same four words. Your commands instead of echo.', {
    x: M, y: 4.25, w: 8.0, h: 0.5, fontFace: FB, fontSize: 18, italic: true,
    color: LMUTED, margin: 0, valign: 'middle',
  });
  terminal(s, M, 5.15, 7.6, [
    { t: 'rosdep install   →   colcon build   →   colcon test', c: GREEN_HI, b: true },
  ], { fontSize: 15 });
  s.addText('02-ros2-build-test.yml', {
    x: 8.6, y: 5.15, w: 4.0, h: 0.5, fontFace: FM, fontSize: 14, color: LMUTED, margin: 0, valign: 'middle', align: 'right',
  });
  notes.push('Frame it as: exactly the same thing you type on your own machine. Nothing new except where it runs.');
}

// =====================================================================
// 11 — container: + rosdep
// =====================================================================
{
  const s = slide(false);
  kicker(s, 'two new ideas', false);
  title(s, 'Where ROS comes from', false);

  card(s, M, 1.85, 5.85, 4.9, SOFT);
  s.addText('container:', {
    x: M + 0.35, y: 2.05, w: 5.15, h: 0.45, fontFace: FM, fontSize: 18, bold: true, color: GREEN, margin: 0, valign: 'middle',
  });
  terminal(s, M + 0.35, 2.6, 5.15, [
    { t: 'container:', c: LTXT },
    { t: '  image: ros:jazzy-ros-base', c: GREEN_HI },
  ], { fontSize: 12.5, shadow: false });
  s.addText('The runner is a bare Ubuntu box with no ROS on it.\n\nWe could apt-install ROS every run and wait four minutes — or run our steps inside the official ROS image, which already has colcon and rosdep. Same image you would use on the robot.', {
    x: M + 0.35, y: 3.85, w: 5.15, h: 2.7, fontFace: FB, fontSize: 14, color: TXT, margin: 0, valign: 'top', lineSpacing: 21,
  });

  card(s, M + 6.1, 1.85, 5.85, 4.9, SOFT);
  s.addText('rosdep', {
    x: M + 6.45, y: 2.05, w: 5.15, h: 0.45, fontFace: FM, fontSize: 18, bold: true, color: GREEN, margin: 0, valign: 'middle',
  });
  terminal(s, M + 6.45, 2.6, 5.15, [
    { t: 'rosdep install --from-paths .', c: LTXT },
    { t: '  --ignore-src -y', c: LTXT },
  ], { fontSize: 12.5, shadow: false });
  s.addText('rosdep reads the <depend> tags in package.xml and apt-installs them.\n\nSo CI is also a test of whether your package.xml is telling the truth — which catches the classic bug: "it builds on my laptop because I installed something six months ago and forgot."', {
    x: M + 6.45, y: 3.85, w: 5.15, h: 2.7, fontFace: FB, fontSize: 14, color: TXT, margin: 0, valign: 'top', lineSpacing: 21,
  });
  notes.push('Mention ros-tooling/setup-ros and action-ros-ci exist and collapse this to one line — but do NOT demo them. Writing it by hand is the point today.');
}

// =====================================================================
// 12 — THE TWO GOTCHAS
// =====================================================================
{
  const s = slide(true);
  kicker(s, 'the two things that bite everyone', true);
  title(s, 'Write these down', true);

  s.addText('1', {
    x: M, y: 1.70, w: 0.5, h: 0.45, fontFace: FH, fontSize: 24, bold: true, color: AMBER, margin: 0, valign: 'middle',
  });
  s.addText('Every run: block is a new shell \u2014 and it may not be bash', {
    x: M + 0.55, y: 1.70, w: 11.0, h: 0.45, fontFace: FH, fontSize: 21, bold: true, color: LTXT, margin: 0, valign: 'middle',
  });
  terminal(s, M + 0.55, 2.18, 11.0, [
    { t: 'defaults:', c: GREEN_HI },
    { t: '  run:', c: GREEN_HI },
    { t: '    shell: bash        # \u2190 once, at the top of the file', c: GREEN_HI },
    { t: '', c: LTXT },
    { t: '- run: |', c: LTXT },
    { t: '    source /opt/ros/jazzy/setup.bash   # \u2190 in EVERY step', c: LTXT },
  ], { fontSize: 12.5 });
  s.addText('Sourcing ROS in one step never carries into the next. And a bare run: can fall back to sh, where source does not exist.', {
    x: M + 0.55, y: 4.44, w: 11.0, h: 0.4, fontFace: FB, fontSize: 14, color: LMUTED, margin: 0, valign: 'middle',
  });

  s.addText('2', {
    x: M, y: 5.02, w: 0.5, h: 0.45, fontFace: FH, fontSize: 24, bold: true, color: RED_HI, margin: 0, valign: 'middle',
  });
  s.addText('colcon test exits 0 even when tests fail', {
    x: M + 0.55, y: 5.02, w: 11.0, h: 0.45, fontFace: FH, fontSize: 21, bold: true, color: LTXT, margin: 0, valign: 'middle',
  });
  terminal(s, M + 0.55, 5.50, 11.0, [
    { t: '- run: colcon test-result --verbose   # \u2190 without this line,', c: RED_HI },
    { t: '                                      #   CI is green forever', c: RED_HI },
  ], { fontSize: 12.5 });
  s.addText('It reports that it finished running them, not that they passed. Forget this and you get a pipeline that checks nothing.', {
    x: M + 0.55, y: 6.63, w: 11.0, h: 0.4, fontFace: FB, fontSize: 14, color: LMUTED, margin: 0, valign: 'middle',
  });
  notes.push('Gotcha 1 has two halves: new shell every step, AND the container may hand you sh instead of bash. The tell is "source: not found". Gotcha 2 is the one that produces a permanently-green pipeline.');
}

// =====================================================================
// 13 — THE DESIGN POINT
// =====================================================================
{
  const s = slide(false);
  kicker(s, 'the part that outlives this workshop', false);
  title(s, 'Put the logic where a test can reach it', false);

  card(s, M, 1.8, 5.85, 3.4, 'E9F6EF');
  s.addText('safety.py', {
    x: M + 0.35, y: 2.0, w: 5.15, h: 0.4, fontFace: FM, fontSize: 16, bold: true, color: GREEN, margin: 0, valign: 'middle',
  });
  s.addText('All the decisions: clamping, the watchdog.\nImports nothing from ROS.', {
    x: M + 0.35, y: 2.45, w: 5.15, h: 0.85, fontFace: FB, fontSize: 15, color: TXT, margin: 0, valign: 'top', lineSpacing: 22,
  });
  s.addText('Tests in 40 seconds on a free runner.\nNo DDS. No Gazebo. No GPU. No robot.', {
    x: M + 0.35, y: 3.4, w: 5.15, h: 0.9, fontFace: FB, fontSize: 15, bold: true, color: GREEN, margin: 0, valign: 'top', lineSpacing: 22,
  });
  chip(s, M + 0.35, 4.45, true, '9 unit tests', { w: 1.75, size: 11 });

  card(s, M + 6.1, 1.8, 5.85, 3.4, SOFT);
  s.addText('velocity_guard_node.py', {
    x: M + 6.45, y: 2.0, w: 5.15, h: 0.4, fontFace: FM, fontSize: 16, bold: true, color: MUTED, margin: 0, valign: 'middle',
  });
  s.addText('A thin shell that moves messages in and\nout of safety.py. Nearly no logic of its own.', {
    x: M + 6.45, y: 2.45, w: 5.15, h: 0.85, fontFace: FB, fontSize: 15, color: TXT, margin: 0, valign: 'top', lineSpacing: 22,
  });
  s.addText('If your logic lives inside callbacks, the only\nway to test it is to launch the whole stack —\nand then you will not test it at all.', {
    x: M + 6.45, y: 3.4, w: 5.15, h: 1.0, fontFace: FB, fontSize: 15, color: MUTED, margin: 0, valign: 'top', lineSpacing: 22,
  });

  card(s, M, 5.5, W - 2 * M, 1.3, INK);
  s.addText('This does not replace testing on hardware.', {
    x: M + 0.4, y: 5.66, w: 11.1, h: 0.4, fontFace: FH, fontSize: 17, bold: true, color: LTXT, margin: 0, valign: 'middle',
  });
  s.addText('It catches the boring 80% — typos, bad merges, broken dependencies, logic errors — so your scarce robot time goes on the interesting 20%.', {
    x: M + 0.4, y: 6.08, w: 11.1, h: 0.5, fontFace: FB, fontSize: 14, color: LMUTED, margin: 0, valign: 'middle',
  });
  notes.push('Spend a full minute here. Open both files side by side. This is a DESIGN lesson that happens to also be a CI lesson.');
}

// =====================================================================
// 14 — BREAK IT ON PURPOSE
// =====================================================================
{
  const s = slide(true);
  kicker(s, 'live  ·  the centrepiece', true);
  title(s, 'Is this a bug?', true);

  terminal(s, M, 1.75, 11.93, [
    { t: '- return max(-limit, min(limit, value))', c: RED_HI },
    { t: '+ return min(limit, value)', c: GREEN_HI },
  ], { fontSize: 17 });

  s.addText('Would you catch that in code review at 6pm on a Friday?', {
    x: M, y: 3.3, w: 11.93, h: 0.5, fontFace: FH, fontSize: 22, bold: true, color: LTXT, margin: 0, valign: 'middle',
  });

  card(s, M, 4.05, 5.85, 1.5, PANEL);
  s.addText('Forward speed is still limited.', {
    x: M + 0.35, y: 4.2, w: 5.15, h: 0.42, fontFace: FH, fontSize: 16, bold: true, color: GREEN_HI, margin: 0, valign: 'middle',
  });
  s.addText('It looks fine if you drive it forward once.', {
    x: M + 0.35, y: 4.65, w: 5.15, h: 0.75, fontFace: FB, fontSize: 14, color: LMUTED, margin: 0, valign: 'top', lineSpacing: 20,
  });

  card(s, M + 6.1, 4.05, 5.85, 1.5, PANEL);
  s.addText('Reverse is now unlimited.', {
    x: M + 6.45, y: 4.2, w: 5.15, h: 0.42, fontFace: FH, fontSize: 16, bold: true, color: RED_HI, margin: 0, valign: 'middle',
  });
  s.addText('The robot backs into the wall at full speed.', {
    x: M + 6.45, y: 4.65, w: 5.15, h: 0.75, fontFace: FB, fontSize: 14, color: LMUTED, margin: 0, valign: 'top', lineSpacing: 20,
  });

  terminal(s, M, 5.85, 11.93, [
    { t: '$ ./demo/break-it.sh   &&   git commit -am "simplify clamp"   &&   git push', c: LTXT },
  ], { fontSize: 14, shadow: false });
  notes.push('SHOW THE DIFF BEFORE PUSHING. Ask the room. Let the silence sit. Someone usually gets it — then land the reverse point.');
}

// =====================================================================
// 15 — THE RED X
// =====================================================================
{
  const s = slide(false);
  kicker(s, 'live  ·  open the pull request', false);
  title(s, 'A good failure tells you what broke, in English', false);

  terminal(s, M, 1.8, 11.93, [
    { t: 'FAILED test/test_safety.py::test_negative_value_is_saturated_symmetrically', c: RED_HI },
    { t: 'FAILED test/test_safety.py::test_clamp_twist_limits_both_axes_independently', c: RED_HI },
    { t: '', c: LTXT },
    { t: '2 failed, 7 passed in 0.04s', c: LMUTED },
  ], { fontSize: 14 });

  chip(s, M, 4.05, false, '✗  2 checks failed', { w: 2.5 });

  s.addText('It did not say "something broke". It named the behaviour that broke.\nThat is what a well-named test buys you.', {
    x: M + 2.8, y: 4.0, w: 9.1, h: 0.85, fontFace: FB, fontSize: 15, italic: true, color: TXT, margin: 0, valign: 'middle', lineSpacing: 22,
  });

  card(s, M, 5.1, W - 2 * M, 1.7, SOFT);
  s.addText('This is the moment CI is actually for.', {
    x: M + 0.4, y: 5.3, w: 11.1, h: 0.42, fontFace: FH, fontSize: 18, bold: true, color: TXT, margin: 0, valign: 'middle',
  });
  s.addText('Not after you merge — before. The check runs against the merged result, and you can make GitHub refuse the merge until it is green.', {
    x: M + 0.4, y: 5.75, w: 11.1, h: 0.85, fontFace: FB, fontSize: 15, color: MUTED, margin: 0, valign: 'top', lineSpacing: 22,
  });
  notes.push('Click Details, scroll to the assertion, read it aloud. Then ./demo/fix-it.sh, push, refresh, green, merge. Six minutes total.');
}

// =====================================================================
// 16 — FOUR HABITS
// =====================================================================
{
  const s = slide(false);
  kicker(s, '03-ros2-ci-full.yml', false);
  title(s, 'What a pipeline looks like after a year', false);

  const habits = [
    ['A separate lint job', 'Runs in parallel with the build. Style feedback in 40 seconds instead of 6 minutes. Jobs are parallel by default — free speed.'],
    ['A matrix', 'One file, several ROS distros. This is how you find out you have broken the distro you are migrating to, before migration week.'],
    ['Artifacts', 'upload-artifact with if: always() — the test XML is downloadable from the run page precisely when the run failed.'],
    ['Concurrency', 'Push twice in a minute and the first run is cancelled instead of queueing. Saves minutes and patience.'],
  ];
  habits.forEach(([h, d], i) => {
    const x = M + (i % 2) * 6.1;
    const y = 1.85 + Math.floor(i / 2) * 2.42;
    card(s, x, y, 5.85, 2.2, SOFT);
    numDot(s, x + 0.35, y + 0.28, i + 1, GREEN, false);
    s.addText(h, {
      x: x + 1.0, y: y + 0.26, w: 4.5, h: 0.5, fontFace: FH, fontSize: 18, bold: true, color: TXT, margin: 0, valign: 'middle',
    });
    s.addText(d, {
      x: x + 0.35, y: y + 0.9, w: 5.15, h: 1.2, fontFace: FB, fontSize: 13.5, color: MUTED, margin: 0, valign: 'top', lineSpacing: 19,
    });
  });
  s.addText('Scroll the file, name the four. Do not read it line by line — you will run out of clock.', {
    x: M, y: 6.72, w: W - 2 * M, h: 0.4, fontFace: FB, fontSize: 12.5, italic: true, color: MUTED, margin: 0, valign: 'middle',
  });
  notes.push('Six minutes for this whole section. If you are behind, cut this slide entirely and go straight to branch protection.');
}

// =====================================================================
// 17 — BRANCH PROTECTION
// =====================================================================
{
  const s = slide(true);
  kicker(s, 'the checkbox with teeth', true);
  title(s, 'Until you turn this on, CI is a suggestion', true);

  terminal(s, M, 1.85, 11.93, [
    { t: 'Settings → Branches → Add rule', c: LTXT },
    { t: '  [x] Require status checks to pass before merging', c: GREEN_HI, b: true },
    { t: '      [x] CI passed', c: GREEN_HI },
  ], { fontSize: 16 });

  card(s, M, 3.85, 5.85, 1.85, PANEL);
  s.addText('Before', {
    x: M + 0.35, y: 4.02, w: 5.15, h: 0.4, fontFace: FH, fontSize: 17, bold: true, color: RED_HI, margin: 0, valign: 'middle',
  });
  s.addText('Anyone can merge a red PR at 6pm because they are in a hurry. Everybody has done it.', {
    x: M + 0.35, y: 4.45, w: 5.15, h: 1.1, fontFace: FB, fontSize: 14, color: LMUTED, margin: 0, valign: 'top', lineSpacing: 20,
  });

  card(s, M + 6.1, 3.85, 5.85, 1.85, PANEL);
  s.addText('After', {
    x: M + 6.45, y: 4.02, w: 5.15, h: 0.4, fontFace: FH, fontSize: 17, bold: true, color: GREEN_HI, margin: 0, valign: 'middle',
  });
  s.addText('main cannot be broken. For a shared lab repo this is the single highest-value checkbox on GitHub.', {
    x: M + 6.45, y: 4.45, w: 5.15, h: 1.1, fontFace: FB, fontSize: 14, color: LMUTED, margin: 0, valign: 'top', lineSpacing: 20,
  });

  s.addText('Point the rule at the one "CI passed" job, not at every matrix leg — then you never have to update the required-checks list when the matrix changes.', {
    x: M, y: 6.0, w: 11.93, h: 0.85, fontFace: FB, fontSize: 14, italic: true, color: LMUTED, margin: 0, valign: 'top', lineSpacing: 21,
  });
  notes.push('This is the slide with real organisational consequences. Say plainly: a permanently red main is worse than no CI, because people stop reading it.');
}

// =====================================================================
// 18 — WHERE CD HOOKS ON
// =====================================================================
{
  const s = slide(false);
  kicker(s, 'the last 5 minutes', false);
  title(s, 'Where the "CD" hooks on later', false);

  const items = [
    ['Publish a container', 'Build a Docker image of the workspace and push it to GHCR when you tag a release. Now everyone runs the same environment.'],
    ['Cut a release', 'Attach a .deb, a bag file, or the test report to a GitHub Release so results are citable in six months.'],
    ['A runner in the lab', 'Self-hosted runner on real hardware, for the integration tests that genuinely need a robot. Nightly, or on a label.'],
  ];
  items.forEach(([h, d], i) => {
    const y = 1.85 + i * 1.62;
    card(s, M, y, W - 2 * M, 1.45, SOFT);
    numDot(s, M + 0.32, y + 0.48, i + 1, AMBER, false);
    s.addText(h, {
      x: M + 1.0, y: y + 0.2, w: 3.6, h: 0.45, fontFace: FH, fontSize: 17, bold: true, color: TXT, margin: 0, valign: 'middle',
    });
    s.addText(d, {
      x: M + 1.0, y: y + 0.66, w: 10.2, h: 0.65, fontFace: FB, fontSize: 14, color: MUTED, margin: 0, valign: 'top', lineSpacing: 20,
    });
  });

  s.addText('Never put "deploy to the robot" on push: main without a human in the loop.', {
    x: M, y: 6.75, w: W - 2 * M, h: 0.5, fontFace: FH, fontSize: 16, bold: true, color: RED, margin: 0, valign: 'middle',
  });
  notes.push('60 seconds. Do not demo any of this. It is a map of where they go next, not today\'s material.');
}

// =====================================================================
// 19 — YOUR TURN
// =====================================================================
{
  const s = slide(false);
  kicker(s, 'do this before next week', false);
  title(s, 'Your turn', false);

  const steps = [
    'Fork turtle_guard, or pick one of your own ROS 2 repos.',
    'Copy 02-ros2-build-test.yml into .github/workflows/',
    'Change --packages-select turtle_guard to your package name.',
    'Push. Watch it fail.',
    'Fix that. The fix is real, and it was a real bug.',
    'Turn on branch protection for main.',
  ];
  let y = 1.8;
  steps.forEach((t, i) => {
    const hl = i === 3;
    card(s, M, y, W - 2 * M, 0.74, hl ? 'FBECED' : SOFT);
    numDot(s, M + 0.28, y + 0.14, i + 1, hl ? RED : INK, false, 0.44);
    s.addText(t, {
      x: M + 0.95, y: y, w: 8.2, h: 0.74, fontFace: FB, fontSize: 15.5,
      bold: hl, color: TXT, margin: 0, valign: 'middle',
    });
    if (hl) {
      s.addText('it will fail — usually a missing <depend>', {
        x: M + 9.2, y: y, w: 2.7, h: 0.74, fontFace: FB, fontSize: 12, italic: true,
        color: RED, margin: 0, valign: 'middle', align: 'right',
      });
    }
    y += 0.83;
  });

  s.addText('Come and pair with me if you get stuck on step 4. That step is the whole workshop.', {
    x: M, y: 6.8, w: W - 2 * M, h: 0.45, fontFace: FB, fontSize: 14, italic: true, color: MUTED, margin: 0, valign: 'middle',
  });
  notes.push('Put the repo URL in chat again here. Offer to pair — say it like you mean it, and put a time on the calendar.');
}

// =====================================================================
// 20 — CLOSE
// =====================================================================
{
  const s = slide(true);
  s.addText('Not losing a Monday morning\nto something a computer could have\ntold you about on Friday afternoon.', {
    x: M, y: 1.8, w: 11.4, h: 2.6, fontFace: FH, fontSize: 32, bold: true,
    color: LTXT, margin: 0, valign: 'middle', lineSpacing: 46,
  });
  s.addText('In forty seconds.', {
    x: M, y: 4.4, w: 11.4, h: 0.6, fontFace: FH, fontSize: 32, bold: true,
    color: GREEN_HI, margin: 0, valign: 'middle',
  });

  terminal(s, M, 5.4, 7.6, [
    { t: 'github.com/<your-lab>/ros2-ci-workshop', c: GREEN_HI, b: true },
    { t: 'workflows · demo scripts · these slides', c: LMUTED },
  ], { fontSize: 15 });

  chip(s, 9.4, 5.72, true, 'QUESTIONS?', { w: 2.55, h: 0.62, size: 15 });
  notes.push('Leave this up for the whole 15 minutes of Q&A. Repo URL stays on screen.');
}

// attach speaker notes
pres.slides.forEach((s, i) => { if (notes[i]) s.addNotes(notes[i]); });

pres.writeFile({ fileName: '/home/claude/ros2-ci-workshop/slides/ros2-github-actions-workshop.pptx' })
  .then(f => console.log('wrote', f, '—', pres.slides.length, 'slides'));
