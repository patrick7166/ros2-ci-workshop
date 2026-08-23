# Facilitator run-sheet — "CI/CD for robots: GitHub Actions + ROS 2"

**Audience:** new graduate lab members. Assume they can `git add / commit / push` and
nothing more. Assume they have never opened the Actions tab.
**Length:** 45 minutes of content + 15 minutes Q&A.
**Deliverable they leave with:** the `turtle_guard` repo running CI on their own fork.

---

## The one sentence you are trying to land

> Every push builds and tests the code on a clean machine, so "works on my laptop"
> stops being a thing anybody has to say.

Everything else is detail. If you run out of time, cut the matrix and artifacts
(Section 6) and keep the red-build moment (Section 5) — that is the part people
remember.

---

## Before the room fills up (do this the day before, not at 09:59)

- [ ] Push the demo repo to your lab's GitHub org, public or org-visible.
- [ ] Run every workflow at least once so the Actions tab has **green history to point at**.
- [ ] Trigger one deliberate failure and **leave it in the history** — you want a red X
      visible in the run list when you first open the tab.
- [ ] Fork the repo to your personal account too, as a backup demo if the org repo misbehaves.
- [ ] Check your org's Actions minutes. Public repos are free; private repos burn quota.
      (`Settings → Billing`.) A workshop of 12 people forking and pushing is ~30 runs.
- [ ] Pre-pull nothing locally — the whole point is that it runs on GitHub's machine.
- [ ] Open these tabs in order, so you are not searching mid-talk:
      1. the repo's **Actions** tab
      2. one **successful** run, expanded to the "Test" step
      3. one **failed** run, expanded to the failing assertion
      4. an open **pull request** showing the checks box at the bottom
      5. `.github/workflows/02-ros2-build-test.yml` in the GitHub editor
- [ ] Terminal ready in the repo, font size ≥ 18pt, `PS1` shortened so the prompt is not 80 chars.
- [ ] Have the repo URL on a slide **and** in the chat/whiteboard. People will mistype it.

**Backup plan if the wifi dies or Actions has an incident:** screenshots of runs 2, 3
and 4 above, saved locally. Talk over the screenshots; the story survives.

---

## Timing at a glance

| # | Section | Slides | Min | Cumulative |
|---|---------|--------|-----|-----------|
| 1 | Hook: the Friday-afternoon bug | 1–3 | 4 | 4 |
| 2 | What CI actually is | 4–6 | 5 | 9 |
| 3 | Anatomy of a workflow file (live) | 7–9 | 8 | 17 |
| 4 | Making it a *ROS 2* pipeline (live) | 10–14 | 12 | 29 |
| 5 | **Break it on purpose** (live) | 15–16 | 8 | 37 |
| 6 | What a grown-up pipeline adds | 17–19 | 4 | 41 |
| 7 | Do this to your own repo + wrap | 20–21 | 4 | 45 |
| — | Q&A | — | 15 | 60 |

Write the section end-times on a sticky note: **:04 :09 :17 :29 :37 :41 :45**.
If you are past :29 and have not broken the build yet, skip ahead — cut Section 6, not Section 5.

---

## 1 — Hook (4 min) · slides 1–3

Tell it as a lab story, not a definition. Something close to true:

> Someone pushes a small change to the velocity limiter on a Friday. It builds fine
> on their machine — they'd built it three days ago and their `install/` folder still
> has the old headers in it. Monday, someone else pulls, and the robot won't build.
> Two people lose a morning. Nobody did anything wrong.

Then ask the room, hands up:

- "Who has pulled `main` and found it broken?"
- "Who has said 'but it works on my machine' in the last month?"
- "Who has ever pushed something that didn't compile?" *(put your own hand up first)*

**Land the point:** none of these are discipline problems. They are *missing-feedback*
problems. CI is just automatic feedback.

> ⏱ **:04**

---

## 2 — What CI actually is (5 min) · slides 4–6

Keep it concrete, and keep the jargon count low. The only four words they need:

| Word | Say it like this |
|------|------------------|
| **Event** | Something happened in the repo — usually a push or a pull request. |
| **Workflow** | A YAML file in `.github/workflows/` that says "when X happens, do Y". |
| **Job** | A chunk of work that gets its own brand-new computer. Jobs run in parallel by default. |
| **Step** | One command, or one reusable action, inside a job. |

**The mental model to draw on the whiteboard:**

```
   you push  ──►  GitHub rents a fresh VM  ──►  runs your commands  ──►  green ✅ / red ❌
                        (dies afterwards)
```

Two things worth saying out loud because they surprise people:

1. **The machine is thrown away every time.** Nothing you install persists. That is a
   feature — it's why CI catches "I forgot to commit that dependency."
2. **Exit code 0 is the entire contract.** CI does not understand your tests. It runs a
   command and looks at the exit code. That's it.

**"What about the CD part?"** — say it in one breath, don't dwell: CI is *did it build
and pass*. CD is *and now ship it somewhere* — publish a Docker image, cut a release,
deploy to the robot. Today is 90% CI. We'll point at where CD hooks on at the end.

> ⏱ **:09**

---

## 3 — Anatomy of a workflow (8 min) · slides 7–9 · **LIVE**

Open `.github/workflows/01-hello-ci.yml` **on GitHub**, not in your editor — you want
them to see it is just a file in the repo.

Read it top to bottom, out loud, pointing at each keyword:

```yaml
on:                    # ← the EVENT
  push:
jobs:
  say-hello:           # ← the JOB (you pick the name)
    runs-on: ubuntu-latest      # ← the RUNNER GitHub rents you
    steps:
      - uses: actions/checkout@v7   # ← someone else's reusable action
      - run: echo "Hello from $(hostname)"   # ← your own shell command
```

**Do this live, it takes 90 seconds and it is the best moment of the first half:**

```bash
# make any trivial change
echo "# workshop $(date +%H:%M)" >> README.md
git commit -am "trigger CI"
git push
```

Now switch to the **Actions** tab and refresh. Narrate the wait — don't apologise for it:

> "Right now GitHub is booting a virtual machine somewhere for us. That's the ten seconds."

Click into the run. Expand steps. Point at:

- the **step names** matching the YAML you just read
- `Set up job` at the top — GitHub's own bookkeeping, ignore it
- the `hostname` output — "that's a computer that did not exist 20 seconds ago"
- the total run time in the corner

**Things people ask here, answer briefly and move on:**

- *"Who pays for this?"* — free for public repos; private repos get a monthly minute
  allowance per org. Linux minutes are the cheap ones.
- *"`@v7` — what is that?"* — a version tag on someone else's action. Pin the major
  version. Don't use `@main` on anything you didn't write.
- *"Can I run this on our own machine?"* — yes, self-hosted runners. That's how you'd
  test against real hardware. Park it for Q&A. *(See Q&A prep below.)*

> ⏱ **:17**

---

## 4 — Making it a ROS 2 pipeline (10 min) · slides 10–13 · **LIVE**

Open `.github/workflows/02-ros2-build-test.yml`. Frame it as: *the same four words,
just with our commands in it.*

Walk through the three ideas in order:

### (a) `container:` — where ROS comes from

```yaml
container:
  image: ros:jazzy-ros-base
```

> "The runner is a bare Ubuntu box. It has no ROS on it. We could `apt install` ROS every
> single run and wait four minutes — or we run our steps inside the official ROS image,
> which already has colcon and rosdep in it. Same image you'd use on the robot."

Mention in passing: `ros-tooling/setup-ros` and `action-ros-ci` will do all of this for
you in one line. We're writing it out by hand today so nothing is magic. **Do not demo
them** — no time, and it hides the learning.

### (b) `rosdep` — why `package.xml` has to be honest

> "`rosdep install` reads the `<depend>` tags in `package.xml` and apt-installs them.
> Which means CI is also a test of whether your `package.xml` is telling the truth.
> This catches the classic bug: it builds on your laptop because you installed something
> six months ago and forgot."

### (c) The three commands, and the trap

```yaml
- run: |
    source /opt/ros/jazzy/setup.bash    # ← every step is a NEW shell
    colcon build --packages-select turtle_guard
```

**Say this twice, it is the #1 thing that bites people:** every `run:` block starts a
fresh shell. Sourcing ROS in one step does **not** carry into the next. If you see
`colcon: command not found`, this is why.

**The sibling gotcha, which you will probably hit live:** inside a `container:`, a bare
`run:` step is not guaranteed to be bash. GitHub's default is `bash -e {0}`, but the docs
add: *"If bash is not found in the path, this is treated as sh."* And `source` is a
bashism — `sh` only has `.`. The error looks like this, and it is baffling the first time:

```
/opt/ros/jazzy/setup.bash: 1: source: not found
```

Fix it once, at the top of the workflow file — this is already in `02` and `03`:

```yaml
defaults:
  run:
    shell: bash
```

If an image genuinely ships without bash, go POSIX instead: `. /opt/ros/jazzy/setup.sh`
(ROS ships `setup.sh` alongside `setup.bash` for exactly this reason).

To *show* the room which shell they got, drop this in as a step — it makes an invisible
default visible, which is the whole lesson:

```yaml
- run: 'echo "shell is: $0"; readlink -f /bin/sh'
```

Then the trap that matters most:

```yaml
- run: colcon test-result --verbose
```

> "`colcon test` exits 0 even when your tests fail — it's telling you it finished running
> them, not that they passed. If you forget `colcon test-result`, you get a pipeline that
> is green forever and checks nothing. I have seen this in production. Twice."

### (d) Three things `colcon test` needs to actually work

This is the gotcha that isn't in the ROS 2 docs anywhere obvious, and it will bite
every attendee when they copy the workflow to their own repo.

**First: declare `tests_require=['pytest']` in `setup.py`.**

```python
setup(
    ...
    tests_require=['pytest'],   # ← without this, colcon uses Python's unittest runner
    ...
)
```

Without it, `colcon-python-setup-py` falls back to Python's `unittest` runner, which
only discovers `TestCase` subclasses. Your `def test_*()` functions are invisible to it.
On Python 3.12 (Ubuntu 24.04), this now exits with code 5 and prints "NO TESTS RAN"
instead of silently passing — which at least makes the bug obvious.

**Second: `source install/setup.bash` immediately before `colcon test`.**

```yaml
- name: Test
  run: |
    source /opt/ros/jazzy/setup.bash
    source install/setup.bash          # ← new line
    colcon test --packages-select turtle_guard --event-handlers console_direct+
```

`colcon-pytest` spawns pytest as a subprocess. That subprocess inherits the parent
shell's `PYTHONPATH`. Without sourcing the install space first, the subprocess cannot
import your package and finds zero tests.

**Third: the `colcon test-result` line you already know.**

These three requirements are independent — all three must be present. If attendees hit
"NO TESTS RAN" when they try this on their own package, this is the checklist to go through.

> ⏱ **:29**

### The design point — spend a full minute here

Open `turtle_guard/safety.py` and `velocity_guard_node.py` side by side.

> "Look at what's in each file. All the actual decisions — the clamping, the watchdog —
> are in `safety.py`, which imports nothing from ROS. The node is a thin shell that moves
> messages in and out of it.
>
> That split is the whole reason we can test this on a free runner in 40 seconds. No DDS,
> no Gazebo, no GPU, no robot. Just `pytest`.
>
> If your logic is tangled up inside callbacks, the only way to test it is to launch the
> whole stack — and then you won't test it, because it's too slow and too flaky. Write the
> logic somewhere a test can reach it. That's a *design* lesson that happens to also be a
> CI lesson."

Be honest about the limits: this does **not** replace testing on hardware. It catches the
boring 80% — typos, bad merges, broken dependencies, logic errors — so that your scarce
robot time is spent on the interesting 20%.

---

## 5 — Break it on purpose (8 min) · slides 14–15 · **LIVE — the centrepiece**

**Do not skip this.** A green check is forgettable. A red X that explains itself is what
converts people.

```bash
git checkout -b fix/reverse-limit
./demo/break-it.sh          # drops the lower bound in clamp()
git diff                    # ← SHOW THIS. One character. Looks harmless.
```

Show the diff and ask the room, before pushing:

> "`max(-limit, min(limit, value))` becomes `min(limit, value)`. Is that a bug?
> Would you catch that in code review at 6pm on a Friday?"

Let them look. Someone usually gets it. Then land it:

> "Forward speed is still limited, so it looks fine if you drive it forward once.
> Reverse is now unlimited. The robot backs into the wall at full speed."

Push it and open a PR:

```bash
git commit -am "simplify velocity clamp"
git push -u origin fix/reverse-limit
```

Open the PR in the browser. **Scroll to the checks box at the bottom** and let it run
live. While it runs, this is your window to talk about pull requests:

> "This is the moment CI is actually for. Not after you merge — before. The check runs
> against the merged result, and you can make GitHub refuse the merge until it's green."

When it goes red: click **Details**, scroll to the failing assertion, read it aloud:

```
FAILED test/test_safety.py::test_negative_value_is_saturated_symmetrically
```

> "It didn't just say 'something broke'. It named the behaviour that broke, in English.
> That's what a well-named test buys you."

Then fix it, in front of them:

```bash
./demo/fix-it.sh
git commit -am "restore lower bound"
git push
```

Refresh the PR. Green. Merge it. **Total elapsed: about six minutes.**

> "That's the loop. That's the whole thing. Everything after this is refinement."

**If you have a spare minute**, run `./demo/break-it.sh lint` instead and show the linter
job failing on whitespace — good for the "CI enforces style so humans don't have to argue
about it in review" point.

> ⏱ **:35**

---

## 6 — What a grown-up pipeline adds (6 min) · slides 16–18

Open `03-ros2-ci-full.yml`. **Do not read it line by line** — you'll run out of clock.
Scroll it and name the four habits:

1. **A separate `lint` job.** Runs in parallel with the build. Style feedback in 40
   seconds instead of 6 minutes. Jobs are parallel by default — that's free speed.
2. **A matrix.** One file, several ROS distros. `jazzy` and `kilted` here.
   > "This is how you find out you've broken the distro you're migrating *to*, before
   > migration week."
3. **Artifacts.** `upload-artifact` with `if: always()` — the test XML is downloadable
   from the run page precisely when the run failed.
4. **Concurrency.** Push twice in a minute, the first run gets cancelled instead of
   queueing. Saves minutes and your patience.

Then the **branch protection** point, which is the one with teeth:

> `Settings → Branches → Add rule → Require status checks to pass before merging`
>
> "Until you turn this on, CI is a suggestion. After you turn it on, `main` cannot be
> broken. For a shared lab repo this is the single highest-value checkbox on GitHub."

Note the `ci-passed` job at the bottom and why it exists: point branch protection at that
one job, and you never have to update the required-checks list when the matrix changes.

**And the CD half, in 60 seconds** — this is where they hook it on later:

- build a Docker image of the workspace and push it to GHCR on a tag
- attach a `.deb` or a bagged test result to a GitHub Release
- a self-hosted runner **in the lab, on real hardware**, for the integration tests that
  genuinely need a robot
- ⚠️ **do not** put "deploy to the robot" on `push: main` without a human in the loop.
  Ask them why. (Answer: a robot is not a web server. A bad rollback moves.)

> ⏱ **:41**

---

## 7 — Do this to your own repo (4 min) · slides 19–20

Give them a task small enough to finish this week. Put it on the last slide **and** in chat:

1. Fork `turtle_guard`, or pick your own ROS 2 repo.
2. Copy `02-ros2-build-test.yml` into `.github/workflows/`.
3. Change `--packages-select turtle_guard` to your package name.
4. Push. Watch it fail. **It will fail** — usually a missing `<depend>` in `package.xml`.
5. Fix that. That fix is real, and it was a real bug.
6. Turn on branch protection for `main`.

Close on the honest version of the pitch:

> "This isn't about process for its own sake. It's about not losing a Monday morning to
> something a computer could have told you about on Friday afternoon in 40 seconds."

Repo URL on screen. Offer to pair with anyone who gets stuck on step 4.

> ⏱ **:45**

---

## Q&A prep (15 min) — the questions you will actually get

**"Our tests need Gazebo / a GPU / the actual robot."**
Split them. Pure-logic tests on GitHub's runners on every push. Simulation tests on a
self-hosted runner in the lab, nightly or on-label. Hardware tests stay manual. The
mistake is treating it as all-or-nothing and therefore doing none of it.

**"How do I run this on our lab machine?"**
Self-hosted runner: `Settings → Actions → Runners → New self-hosted runner`, then
`runs-on: [self-hosted, gpu]`. Two warnings: never enable self-hosted runners on a
**public** repo (anyone's PR can run arbitrary code on your machine), and the machine is
not wiped between runs, so state leaks between jobs.

**"Won't this be slow?"**
This package tests in well under a minute. A real workspace is more like 5–15. Mitigations,
in order of payoff: `--packages-up-to` instead of building everything, a parallel lint job
for fast feedback, caching the build directory, and a bigger runner if the lab pays for it.
"Slow CI" is a real problem, but the answer is to make it faster, not to switch it off.

**"What about private repos and minutes?"**
Free tier gives your org a monthly allowance; Linux is 1× and by far the cheapest.
A lab-sized team on Linux rarely hits it. Check `Settings → Billing` before you scale up.

**"Where do secrets go?"** *(they'll ask if you mention GHCR)*
`Settings → Secrets and variables → Actions`. Referenced as `${{ secrets.NAME }}`, masked
in logs. Never in the YAML. Note that PRs from forks don't get your secrets — that's
deliberate, and it's why publish steps are usually gated on `push` to a branch or tag.

**"I got `source: not found` / `colcon: command not found` and I copied your file exactly."**
Two different gotchas wearing similar clothes. `source: not found` means the step ran under
`sh`, not bash — add `defaults: {run: {shell: bash}}` at the top of the workflow. `colcon:
command not found` means you sourced ROS in an earlier step and expected it to persist —
it does not; source it again in this step. Both are covered on the "Write these down" slide,
and both are worth hitting deliberately if someone hands you the opening.

**"`colcon test` printed `NO TESTS RAN` and exited with code 5."**
Three independent requirements, all must be present. First: `setup.py` needs
`tests_require=['pytest']` so `colcon-python-setup-py` delegates to pytest instead of the
default unittest runner (Python 3.12 changed unittest to exit code 5 with "NO TESTS RAN"
when no `TestCase` subclasses are found). Second: `source install/setup.bash` must come
before `colcon test` so the pytest subprocess inherits `PYTHONPATH` and can import your
package. Third: `colcon test-result --verbose` must follow `colcon test`. All three are
in `02-ros2-build-test.yml` and `03-ros2-ci-full.yml`.

**"Do I have to write YAML by hand?"**
No — `ros-tooling/action-ros-ci` collapses the build/test steps into about five lines.
Start there for a real repo. We wrote it out today so you can debug it when it breaks,
which it will.

**"Can it auto-fix formatting?"**
Yes, but be careful what you wish for — a bot pushing to your branch mid-review is
confusing. Prefer failing the check and running `ament_uncrustify --reformat` locally,
or a pre-commit hook.

**"What if CI is red for a reason I can't fix right now?"**
Say the unglamorous truth: a permanently red `main` is worse than no CI, because people
stop reading it. Either fix it, or explicitly mark the test as expected-to-fail with a
linked issue. Never just ignore the red X — that's how a team teaches itself that CI is noise.

---

## Facilitator notes to self

- **The demo will be slower than you rehearsed.** Runs take 40–90 seconds, and you'll feel
  every one. Have the "who pays for this / what's a self-hosted runner" material ready to
  fill the gap, and never fill it with an apology.
- Don't live-*edit* YAML. Indentation errors on a projector are a five-minute detour with
  no payoff. Everything is pre-written; you're reading and pushing, not authoring.
- Resist teaching `if:` conditions, reusable workflows, composite actions, or
  `workflow_call`. They're real, and they're not day-one material.
- If someone in the room already knows all this, recruit them: ask them what CI catches in
  *their* project. Peer testimony beats yours.
- Leave the repo up afterwards. Half the value is people copying `02-*.yml` next Tuesday
  when they finally have a reason to.
