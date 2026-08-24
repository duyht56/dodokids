## ADDED Requirements

### Requirement: The machine visibly adds and takes away

The `arithmetic` renderer (`ArithmeticRenderer` and its `VisualMathScene` /
`MathMachine` primitives) SHALL show a "máy cộng trừ" (add/subtract machine) that
visibly does the operation instead of a still picture: the operand groups feed
into the machine and the `?` result emerges from the funnel. The motion SHALL be
built on the Đợt 2 semantic-animation primitives (`SemanticAnimationView`,
`addGroup`, `removeGroup`) rather than a new animation engine, and SHALL be
presentation only — no change to the `arithmeticGame.ts` generator, validator,
params, options, answer or run policy, and no new seeded field, so
`generatorVersion` / `validatorVersion` are unchanged and replay by seed stays
byte-identical.

For addition the second operand group SHALL slide in to merge with the first
inside the machine; for subtraction the taken-away tiles SHALL leave the group
(the existing `removeGroup` drop). As the operands feed through, the `?` result
SHALL emerge from the funnel and settle at full size. Every animation SHALL run
on the native driver and SHALL create its animated values with a `useState`
initialiser (React Compiler). The machine SHALL never print the result number —
the child still reads it off the answer cards — and the existing `supportLevel`
visuals (level-1 count chips, level-2 semantic step and narrowed cards) SHALL be
preserved unchanged.

#### Scenario: Addition feeds two groups in and the result comes out

- **WHEN** an addition exercise plays its semantic step
- **THEN** the second operand group slides in to merge with the first inside the
  machine and the `?` result emerges from the funnel, while the answer cards and
  the derived result are unchanged by the animation

#### Scenario: Subtraction takes some tiles away

- **WHEN** a subtraction exercise plays its semantic step
- **THEN** the subtracted tiles leave the group and the `?` result emerges from
  the machine, with no wrong/lose state shown

#### Scenario: Reduced motion

- **WHEN** the system reports reduced motion (or the exercise is at support level
  0/1, where the feed does not run)
- **THEN** the renderer skips the feed and result-emerge motion and rests in the
  static end state identical to today's (result at full size, `translateY 0`),
  with play unchanged

### Requirement: The add/subtract number line is a ticked ruler

For the add/subtract number-line representation, the renderer (`NumberLine`)
SHALL draw an evenly spaced ruler: one horizontal axis with a vertical tick mark
and a number label at every landmark (the start value, each hop landing, and the
`?` target), and a hop arc over each step. The count-on/count-back hop SHALL be
animated by the existing `NumberLine.hopProgress` value on the native driver.
This SHALL be presentation only: no change to the generator, validator, params or
versions, so replay by seed stays byte-identical.

The ticks SHALL stay evenly spaced across any range (fixed-width tick columns,
stretching hop columns), the target landmark SHALL show `?` rather than the
answer number, and the hop SHALL rest in a static, clamped end state when it is
not animating.

#### Scenario: The line is drawn as a labelled ruler

- **WHEN** an add or subtract exercise uses the number-line representation
- **THEN** the line shows an axis with an evenly spaced, labelled tick at the
  start, each landing and the `?` target, with a hop arc over each step

#### Scenario: The hop animates the count-on

- **WHEN** the exercise plays its number-line step (support level 2)
- **THEN** the value hops from tick to tick along the ruler driven by
  `hopProgress` on the native driver, landing on the target tick

#### Scenario: Reduced motion

- **WHEN** the system reports reduced motion (or the exercise is at support level
  0/1, where the hop does not run)
- **THEN** the ticked ruler is drawn in its static end state with every hop
  interpolation clamped back to rest, identical to today's picture
