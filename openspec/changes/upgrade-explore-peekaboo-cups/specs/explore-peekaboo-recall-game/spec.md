## MODIFIED Requirements

### Requirement: Deterministic local peekaboo-recall board
The game SHALL generate every board locally from a versioned generator and a random seed, with no network request and only bundled dependencies (the memory object pool and the Đô Đô mascot). A board SHALL declare its level, its mode (`missing` or `cups`), its set size, the original object arrangement (`slots`) and its cards (`options`); a `missing` board SHALL also declare the removed slot index and the missing object, and a `cups` board SHALL declare the asked cups (`askedSlots`, in the order they are asked). The answer SHALL be `assetIds`, one object per question in order. Every seeded draw SHALL be namespaced by the level so two levels of the same set size never produce the same board. Replaying the same level and seed SHALL produce a byte-identical envelope once `variantKey`/`bucketKey` are stripped, and the validator SHALL reject any envelope that does not replay. The versions SHALL be `peekaboo-recall-v2`, `peekaboo-recall-validator-v2`, `peekaboo-recall-config-v2` and manifest `peekaboo-recall-manifest-v2`, mirrored by the kido-server registry.

#### Scenario: Board starts in airplane mode
- **WHEN** the child opens `peekaboo_recall` with no connectivity
- **THEN** a fresh board is generated, validated and shown without an API request

#### Scenario: Same seed is replayed
- **WHEN** the generator receives the same level and seed twice
- **THEN** both envelopes are byte-identical after `variantKey` and `bucketKey` are removed

#### Scenario: A v1 board is rejected
- **WHEN** an envelope carries `peekaboo-recall-v1`, or an answer in the v1 shape (`assetId`)
- **THEN** the validator rejects it

### Requirement: An original set with exactly one object removed
On a `missing` board the original set SHALL be `slots`: `setSize` distinct, real objects from the bundled memory pool (each single, recognisable and background-free). EXACTLY ONE object SHALL be taken away: the missing object SHALL equal `slots[removedSlotIndex]`, the board after the reveal SHALL be the original minus that object (its size SHALL be `setSize − 1`) and the missing object SHALL NOT be on it. The validator SHALL re-derive the board after the reveal from the slots, independently of the generator, and SHALL reject a board whose set is not distinct real objects, whose removed slot is out of range, whose recorded missing object is not the removed slot's object, or whose remaining board still contains the missing object.

#### Scenario: Generated board is validated
- **WHEN** any generated `missing` board is checked
- **THEN** the set is distinct real objects, exactly one object is removed and the board after the reveal is the original minus the missing object

#### Scenario: A duplicated object in the set
- **WHEN** two slots hold the same object so the set is no longer distinct
- **THEN** the validator rejects the board

#### Scenario: The removed slot is moved
- **WHEN** the removed slot index is changed without updating the missing object
- **THEN** the validator rejects the board

### Requirement: Options include the missing object among foreign distractors
The cards of a `missing` board SHALL be `optionCount` distinct real objects: the missing object, EXACTLY ONE object that is still on the board, and new objects never shown on this board for the rest. "Was in the set" (it rules out the new objects) and "is not on the board now" (it rules out the one still there) SHALL each leave at least two cards, and only both together SHALL leave exactly one card, the missing object, which is the recorded answer. The card order SHALL be a seeded shuffle so the answer is never at a fixed position, reproduced by the byte-identical replay. The validator SHALL reject cards that are not distinct, that omit the missing object, that hold no object still on the board or more than one, or whose recorded answer is not the missing object.

#### Scenario: No card is still on the board
- **WHEN** the card showing an object still on the board is replaced by a new object
- **THEN** the validator rejects the board, because "was in the set" alone would then pick the answer

#### Scenario: Two cards are still on the board
- **WHEN** a new-object card is replaced by a second object still on the board
- **THEN** the validator rejects the board

#### Scenario: The answer position is not fixed
- **WHEN** a deterministic corpus of at least 200 seeds per level is generated
- **THEN** the answer appears at more than one card position across the corpus

### Requirement: Five levels scaling set size and options
The game SHALL define five levels, each taking away exactly ONE support from the level below: L1 `missing` with 3 objects and 4 cards; L2 `missing` with 4 objects and 4 cards (one more object to hold); L3 `cups` with 3 cups and 3 cards (nothing stays in view while answering and no card is new); L4 `cups` with 4 cups and 4 cards (one more cup); L5 `cups` with 4 cups and 4 cards, two cups asked in a row (two places to hold at once). The round-variety bucket of a board SHALL be its kind and size (`missing_3`, `missing_4`, `cups_3`, `cups_4`, `cups_4x2`), one per level, and the declared capacity per level SHALL be reachable. A run SHALL play leveled rounds — 6 boards at one level, moving up a level when at least 4 were right on the first try, with at most one extra round — without streaks, an answer time limit or a lose state. The look window SHALL start only once the board is playable. Moving up to a level SHALL say its intro: L2 `peekaboo_intro_3` («Bây giờ có bốn món đồ, bé nhìn thật kỹ nhé!»), L3–L5 `peekaboo_cups_intro_3..5`.

#### Scenario: The ladder takes away one support per level
- **WHEN** the levels are inspected
- **THEN** they are missing 3/4, missing 4/4, cups 3/3, cups 4/4 and cups 4/4 with two questions, in that order

#### Scenario: A board is moved to another level
- **WHEN** a board's level is changed to one whose seed replays to a different envelope
- **THEN** the validator rejects the board

#### Scenario: The served bucket is always declared
- **WHEN** chained one-exercise rounds are requested at a level
- **THEN** every served board's bucket is the level's declared bucket and more than one variant reaches the child

### Requirement: A sand-timed look, then a peekaboo cover
The renderer SHALL play a look window on the full set lasting one second per object and never under three seconds, beside the shared sand timer (an hourglass glyph beside a bar that drains linearly), with NO numeral ticking down. Then, on a `missing` board, Đô Đô (`ExploreMascot`) SHALL cover the slots, playing peekaboo, and the cover SHALL lift to reveal the remaining objects plus one empty slot; on a `cups` board a cup SHALL come down over every object and an arrow SHALL point at the asked cup. The sand timer SHALL only measure how long the set stays visible: it SHALL NOT limit the time to answer, and running out SHALL NOT fail, lock or end anything. All motion SHALL use the native animation driver; under reduced motion the cover, the cups and the pop SHALL appear and go without animation and the arrow SHALL stand still, while the sand timer SHALL still drain. Objects SHALL be drawn from the memory-asset glyph data and NO emoji SHALL be used as a UI icon or as the mascot.

#### Scenario: The look window is timed without numerals
- **WHEN** a board with four objects starts
- **THEN** the full set stays visible for four seconds beside a draining sand timer, no numeral is shown, and then the set is covered

#### Scenario: Running out of sand fails nothing
- **WHEN** the sand timer runs out
- **THEN** the set is covered (and on a missing board revealed with one empty slot), and the cards can be tapped with no time limit

#### Scenario: Reduced motion is enabled
- **WHEN** the system reports reduced motion
- **THEN** the look window, sand timer, cover or cups and arrow still happen, but nothing animates except the sand

### Requirement: Tap-an-option feedback that never ends the run
The renderer SHALL let the child tap a card once the question is asked. A wrong card SHALL play a gentle shake, make Đô Đô think, emit the `onTryAgainSound` cue and report `onAnswer(false)` at once WITHOUT ending the run, filling in the answer, lifting a cup or locking the card. On L5 a right first cup SHALL lift that cup (it stays lifted), move the arrow to the second cup and ask it, and SHALL report nothing yet. The last right answer SHALL show why — the missing object pops back into its gap, or every cup lifts left to right with the asked places highlighted — while Đô Đô says one short line, and SHALL report `onAnswer(true)` exactly once, only after that line has ended (or at most six seconds) and the board has shown why for at least 1.4 seconds. A second tap on the right card before the next render SHALL NOT start the why a second time. The renderer SHALL NOT carry its own prompt-replay control and SHALL NOT persist or report anything beyond `onAnswer`.

#### Scenario: The correct card is tapped
- **WHEN** the child taps the right card on the last question
- **THEN** the board shows why, Đô Đô says the why-line, and `onAnswer(true)` is called once, after the line

#### Scenario: A wrong card is tapped
- **WHEN** the child taps a card that is not the answer
- **THEN** a gentle shake plays, `onAnswer(false)` is called at once, nothing locks and no cup lifts

#### Scenario: Bậc 5 asks two cups
- **WHEN** the child answers the first asked cup right on an L5 board
- **THEN** that cup lifts and stays lifted, the arrow moves to the second cup with «Còn dưới cốc này là gì nhỉ?», and no answer is reported until the second cup is right

### Requirement: Support dims distractors without revealing the answer
At support level 1 or higher the renderer SHALL dim one or more distractor cards for the current question, and it SHALL never dim the answer and SHALL always leave at least one distractor live beside the answer. At support level 2 the renderer SHALL also show the full set once more for one sand-timed look (a `cups` board lifts every cup that is down, then puts them back), with the cards disabled meanwhile. At support level 0 no card SHALL be dimmed. The play screen's support line SHALL be `peekaboo_hint_recall` at level 1 on a `missing` board, `peekaboo_hint_place` («Bé nhớ lại xem món nào nằm ở chỗ này nhé.») at level 1 on a `cups` board, and `peekaboo_hint_peek` at level 2.

#### Scenario: Raised support dims a distractor
- **WHEN** the play screen passes `supportLevel` 1 or 2
- **THEN** one or more distractor cards are dimmed, the answer is never dimmed and at least one distractor stays live

#### Scenario: The support line fits the board
- **WHEN** support rises to 1 on a cups board
- **THEN** the play screen shows and says «Bé nhớ lại xem món nào nằm ở chỗ này nhé.»

### Requirement: Best-effort audio and authoritative board
The bubble and the board SHALL be authoritative and every line SHALL be best-effort audio: a missing clip SHALL never block play. The play screen SHALL NOT read the prompt on mount; the renderer SHALL cue the look line when the look window opens (`peekaboo_look` on a missing board, the mantra `peekaboo_mantra` «Bé nhìn kỹ chỗ của từng món nhé!» on a cups board), the question once it can be answered (`peekaboo_recall_which` after the reveal, `peekaboo_cups_which` once the cups are down, `peekaboo_cups_which_next` for L5's second cup), and the why-line after the last right answer (`peekaboo_missing_done`, `peekaboo_cups_done`). The 🔊 button SHALL repeat the last cued line. The variant identity of a board SHALL be its kind, set size, slot arrangement and removed slot or asked cups — never its cards — and its bucket SHALL be the level's kind and size.

#### Scenario: Clips are not bundled yet
- **WHEN** the new cups lines are absent from the bundled pack
- **THEN** the bubble still shows every line and the board is fully playable in silence

#### Scenario: Two boards differ only in their cards
- **WHEN** two boards share kind, arrangement and removed slot or asked cups but have different distractors or card order
- **THEN** they have the same variant key, so a round never serves both

### Requirement: Conformance checks
The contract SHALL be enforced by `mobile/scripts/verify-explore-peekaboo-contracts.cjs` (`npm run test:explore-peekaboo`): the ladder and its one-support-per-level steps; at least 200 seeds per level with replay equality and an independent proof per board kind; tamper rejection for both kinds; support rules; chained one-exercise rounds; naive solvers on real planner rounds (see "Shortcuts stay near guessing"); the layout on five devices; the renderer's source rules; and the renderer mounted through `explore-render-harness.cjs` (look line and mantra, cups and arrow, L5's second cup, a miss reported at once, the why before the report, a pause holding the report, a double tap, a silent shell, reduced motion). kido-server `explore.peekaboo-recall.spec.ts` SHALL re-check the ladder, the per-kind proof, tampering, the v2 versions and the catalog mirror.

#### Scenario: Contract script runs
- **WHEN** `npm run test:explore-peekaboo` runs in `mobile/`
- **THEN** it exits successfully only if every rule above holds for the current generator, validator, layout and renderer

#### Scenario: Server spec runs
- **WHEN** `npx jest src/modules/explore/explore.peekaboo-recall.spec.ts` runs in `kido-server/`
- **THEN** the mobile modules pass the same rules and the server catalog entry mirrors the bundled game at version 2

### Requirement: The look never runs out unseen
When the run is paused (`paused`: the exit card is open or the app left the foreground) DURING the look window, the look SHALL stop, and when play goes on the whole set SHALL show again for a full look window with its look line (the mantra on a cups board). Once the set is covered (Đô Đô's cover, or the cups) or revealed, a pause SHALL NOT show the set again — that would put the taken object back where the child has seen, or is about to see, the gap (review C04): the board SHALL stay as it is behind the exit card (covered, cups down, or the gap showing) and SHALL pick up from that step when play goes on, without a second look or look line. A level-2 peek cut short by a pause SHALL be shown again in full. A pause while the child is answering SHALL change nothing on the board. A right answer whose why is still showing SHALL NOT be reported while paused; it SHALL be reported once play goes on. Once the set is covered the renderer SHALL leave no look line on record for the play screen to repeat (an empty `onPromptCue`), and from the last right answer until it is reported it SHALL report the board busy (`onBoardBusy`), so the way back from a pause never reads a stale look line or the question just answered.

#### Scenario: Paused during the look window
- **WHEN** the child opens the exit card two seconds into the look window and comes back after any length of time
- **THEN** the set was never covered behind the card, and a new full look window starts with its look line

#### Scenario: Paused under the cover
- **WHEN** the run is paused while Đô Đô covers the set of a `missing` board, after a full look
- **THEN** the cover stays behind the exit card and after it, no second look or look line starts, and the gap is revealed and the question asked as usual

#### Scenario: Paused during the reveal
- **WHEN** the run is paused while Đô Đô's cover is lifting and the gap is already drawn, and play goes on later
- **THEN** the taken object never shows in its slot again, no second look starts, and the reveal ends in the question

#### Scenario: Paused under the cups
- **WHEN** the run is paused while the cups are down before the question
- **THEN** every cup stays down behind the exit card and after it, the mantra is not read again over the cups, and the question follows the cover step

#### Scenario: Paused during the why
- **WHEN** the run is paused after the last right answer, while the board shows why
- **THEN** `onAnswer(true)` is not called behind the exit card, it is called once when play goes on, and the question just answered is not read again before the praise

## ADDED Requirements

### Requirement: What is under this cup
From L3 a board SHALL be a `cups` board: every object of the set is covered by a cup, an arrow points at one cup, and the child taps the object under it. Its cards SHALL be exactly the objects under the cups (no new object), in a seeded order. Its asked cups SHALL be distinct slots drawn by a seeded permutation, so every cup is equally likely to be asked at every turn. Each asked cup SHALL have exactly one matching card, which is that question's answer. The validator SHALL reject a cups board with a card that is under no cup, an asked cup out of range or asked twice, the wrong number of questions, or an answer that is not what is under each asked cup.

#### Scenario: A card under no cup
- **WHEN** a card of a cups board is replaced by an object that is under no cup
- **THEN** the validator rejects the board, because that card could be ruled out as never seen

#### Scenario: Every cup is asked as often
- **WHEN** many cups boards are served at a level
- **THEN** each cup position is the asked one about 1/n of the time

### Requirement: Shortcuts stay near guessing
Over at least 1,000 real round pairs per level from the round planner (`createExploreRunBatch`, six boards, each round avoiding the one before), a solver that remembers nothing — the first, middle or last card, the card at the asked cup's place, the object shown most on the board or in the round, ruling out the last answer, and on cups boards also "seen before", "not on the board" and the first/middle cup's object — SHALL be right per board at most the best memory-free guess (one over the cards, divided over the questions, ruling out only the last answer) plus 0.03, and SHALL pass a round (4 of 6 right on the first try) at most the guessing pass rate plus 0.04. On a missing board "seen before" alone and "not on the board" alone SHALL each be right at most 0.5 + 0.03 per board. Remembering one object (and its place) and guessing the rest SHALL stay within its analytic rate (missing: 1/n + (n−1)/n · 1/(k−1); cups with one question: 2/n) and SHALL fall by more than 0.1 per board from L3 to L4 and from L4 to L5, passing an L5 round at most 10% of the time. The answer card position and the asked slot SHALL each be within 0.03 of uniform. No memory situation SHALL repeat inside a round or against the round before.

#### Scenario: Remembering nothing
- **WHEN** a solver always taps the first card, or the object shown most, at any level
- **THEN** it passes a round about as often as guessing

#### Scenario: v1's shortcut is closed
- **WHEN** a solver taps the only card it has seen before on a bậc 1 board
- **THEN** it is right at most about half the time (v1: every time)

### Requirement: The board fits one row on every phone
The objects SHALL sit in one row and the cards in one row at every level and on every phone width from the 375pt iPhone SE up, sized by a pure layout (`renderers/peekabooLayout.ts`) from the play column's width and the renderer's measured height, with cards never under 56pt (above the 44pt touch floor). The whole board SHALL fit the play area left on an iPhone SE 375×667 with a support line and a break reminder showing.

#### Scenario: iPhone SE at bậc 5
- **WHEN** a four-cup board is laid out on a 375×667 screen
- **THEN** four 76pt cups and four 74pt cards each fit one row and the board fits the play area

### Requirement: The bubble follows the phase
Đô Đô's bubble SHALL say what fits the phase and nothing else: the look line while the set is shown, «Ú… òa!» while it is covered or revealed, the question while the child answers (the second cup's question on L5), and the why-line once right. The board SHALL NOT show a second or third line of text about the task (v1's «Cùng nhớ nhé…» and the helper line under the cards); before the question the card row SHALL show empty card outlines.

#### Scenario: Looking
- **WHEN** the look window is open on a missing board
- **THEN** the bubble says «Bé nhìn kỹ các món đồ nhé!» and nothing on the board asks what is missing
