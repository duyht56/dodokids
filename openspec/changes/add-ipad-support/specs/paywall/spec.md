## ADDED Requirements

### Requirement: Paywall is reachable at every supported width
Every purchase-critical element — the plan cards, the purchase call to action, the restore control and the App Store billing disclosure — SHALL be visible and reachable at every window width the app supports, in every orientation. The paywall SHALL choose its arrangement from the size class: a stacked hero above a capped, centred content column at `compact` and `regular` widths, and the hero beside that column at `large` widths. The hero SHALL derive its size from the available space rather than a fixed height, so it can neither overflow its column nor push the content column off screen.

#### Scenario: Wide window
- **WHEN** the paywall is shown at a `large` width
- **THEN** the hero fills its own column and the plans, CTA, restore control and disclosure are all visible beside it

#### Scenario: Mid-width window
- **WHEN** the paywall is shown between 700pt and 1023pt
- **THEN** the hero is stacked above a capped, centred content column and all purchase elements remain reachable by scrolling

#### Scenario: Short window
- **WHEN** the paywall is shown on a window that is wider than it is tall
- **THEN** no purchase element is clipped, and the content column scrolls if it does not fit
