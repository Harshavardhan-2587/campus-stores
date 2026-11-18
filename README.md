# Campus Stores

Campus Stores is a Product Engineer work sample set at a fictional campus media equipment desk. Work through a club’s screening, from equipment pickup to a partial return and the next morning’s handover. Open **Candidate brief** in the app for the assignment.

## My submission: check-in slips for the next shift

**Would I keep this product?** Yes, with one change to how slips are checked in and handed over. The change is prototyped in `app.js` and `styles.css`. Open `index.html` and play the shift to try it.

### One moment it handles well

Friday 7:30 pm, the partial return. Because the register keeps **one slip per physical unit**, I closed the projector and speaker slips while Kabir was at the counter, and the adapter’s slip simply stayed open. Nothing had to be split, edited or explained. The issue form also refused units outside RQ-214 and a second unit of the same type, and never offered PR-06, which is in repair.

### One moment I would change

Saturday 9:00 am, when Leela walks in with an adapter.

- The Outstanding list read `L-404 · AD-12` / `RQ-214 · Kabir Sen · Due Fri 8 pm`, next to the mic slip `L-401 · MI-09`. Nothing said AD-12 is an adapter, that it was overdue, or that Leela had it.
- That Leela had it lived only in the desk book, as free text, and only if the evening shift wrote it.
- **Record return** closed a slip in one tap with no check against the unit on the counter, and two identical adapters (AD-12 and AD-15) share bin C4. Closing the wrong slip was one tap away, with no undo.

### The change: Check in

- **Slips explain themselves.** Each slip shows the unit type, model and bin, the club and event, who collected it, and a due flag that follows desk time (Due soon, Overdue). Outstanding slips sort overdue first, and the Loan register tab shows how many are open.
- **Check in replaces one-tap Record return** with the two things that actually happen at a counter:
  - *Unit is on the counter*: scan or type the tag on the unit and choose who handed it back. A wrong tag is stopped with a reason, for example “AD-15 isn’t on loan; it belongs in bin C4.”
  - *Unit is still out*: record who has it and when it’s expected. The slip stays open and reads “Still out with Leela Das · expected Sat 9 am”, and the same line is added to the desk book automatically.
- **Faster pickup.** *Issue units for this request* opens the slip form with the request and return time filled in, offers only approved, available units, and stays open until the whole kit is out. The request shows each item’s status.

### The same job with the change

1. **Fri 3:45 pm.** Requests → RQ-214 → *Issue units for this request*. Issue PR-04, SP-02 and AD-12 to Kabir Sen without re-entering the request or due time. RQ-214 shows 3 of 3 out.
2. **Fri 7:30 pm.** Loan register → *Check in* PR-04 and SP-02 (tag, returned by Kabir). For AD-12, choose *Unit is still out*: Leela Das, Sat 9 am.
3. **Sat 9:00 am.** The Loan register tab shows 2 open, flagged overdue. The top slip reads *AD-12 · USB-C → HDMI adapter · Overdue · Still out with Leela Das*. *Check in*, scan the tag on her adapter; Returned by is already Leela. If she had brought AD-15, the check stops it.

### What I’d keep

Per-unit slips, the approved-request checks, the repair block, the desk book and the time control.

### One observation at a real counter

On a Saturday morning, when someone hands back an item, does the staff member close the slip straight from the Loan register, or do they first open the desk book or ask a colleague? If the change helps, they go straight to the right slip.

### Also improved

- Issue form errors now appear next to the form. Before, they went to the status bar at the bottom and were erased by the next tap, and some invalid saves failed silently.
- Empty lists and filters say what to do next.
- *Restart sample shift* needs a second tap, so a stray tap can’t wipe a shift.
- Saved shifts are validated more strictly on load; shifts saved by the original version still open.
- Visual polish: shift timeline, status colours, larger touch targets, a scrollable tab bar on phones, light and dark mode.

## Run the app

Open `index.html` in a modern browser. The app includes its scripts, styles, and icons and can run offline.

To serve it over local HTTP, run this from the repository folder and visit `http://localhost:8000`.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Each browser stores its own sample shift locally when browser storage is available. **Restart sample shift** restores the fictional starting records.

## Source

- `index.html` contains the desk layout, candidate brief, and bundled icons.
- `app.js` contains the sample records and interactions, including the check-in prototype.
- `styles.css` defines the desktop and mobile layouts.

Icon license notices are in [third-party/lucide-LICENSE.txt](third-party/lucide-LICENSE.txt).


## Submit your work

1. [Fork Campus Stores](https://github.com/virinchi-healthcare/campus-stores/fork) into your GitHub account. Complete the candidate brief and push your changes to your public fork. In your README, point reviewers to your work and explain the decision you made.
2. In your fork, open **Commits**, select the final commit you want reviewed, and copy the page URL. It should look like `https://github.com/YOUR-USERNAME/campus-stores/commit/COMMIT-SHA`.
3. [Submit your work through the Google Form](https://docs.google.com/forms/d/e/1FAIpQLScvzoh1R4WS-SkiwAVBQbMvniieJYSoOEfLMyVo5CyjOvYUgQ/viewform). Your **roll number**, **email ID**, and **final commit link from your public fork** are required. Enter your roll number and email ID in the form only.
