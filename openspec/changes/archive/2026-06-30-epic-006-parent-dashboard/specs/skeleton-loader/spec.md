## ADDED Requirements

### Requirement: Shimmer Animation
`SkeletonLoader` SHALL render a rectangle (or circle if `circle={true}`) with a repeating horizontal shimmer gradient animation. The gradient SHALL transition `#E8E8E8 → #F5F5F5 → #E8E8E8` over 1500ms in an infinite loop using `react-native-reanimated` `withRepeat(withSequence(...))`.

#### Scenario: Shimmer plays on mount
- **WHEN** the component mounts
- **THEN** the shimmer animation begins immediately and loops indefinitely without user interaction

#### Scenario: Animation cleanup
- **WHEN** the component unmounts
- **THEN** the Reanimated shared value is cancelled (no memory leak)

### Requirement: Size and Shape Props
The component SHALL accept `width: number | '100%'`, `height: number`, `radius?: number` (default 8), and `circle?: boolean` (default false). When `circle={true}`, the component SHALL use `borderRadius: width / 2` (assumes `width` is numeric).

#### Scenario: Circle skeleton
- **WHEN** `circle={true}` and `width={44}` and `height={44}`
- **THEN** the rendered shape is a 44×44 circle with `borderRadius: 22`

#### Scenario: Full-width bar
- **WHEN** `width='100%'` and `height={16}`
- **THEN** the skeleton stretches to fill its parent container width

### Requirement: Composability
Multiple `SkeletonLoader` instances SHALL be composable in a single screen to approximate the layout of the real content. The component SHALL accept an optional `style?: ViewStyle` prop for positioning and margin overrides.

#### Scenario: Multiple skeletons in a card
- **WHEN** three `SkeletonLoader` components are stacked vertically
- **THEN** each animates independently on its own loop (no shared animation state required)
