## ADDED Requirements

### Requirement: Adventure Map displays 4 island groups with 48 week nodes
The HomeScreen SHALL render a vertically scrollable Adventure Map containing 4 island sections (Quần đảo), each with 12 week nodes, displayed in order Q1 (weeks 1–12), Q2 (weeks 13–24), Q3 (weeks 25–36), Q4 (weeks 37–48). The map SHALL use a SectionList so all 48 nodes share a single scroll container.

#### Scenario: Map renders all 4 islands on load
- **WHEN** the child navigates to HomeScreen
- **THEN** 4 island sections are visible in the scroll view, each with its title and themed background color (Q1: green, Q2: purple, Q3: orange, Q4: yellow)

#### Scenario: Auto-scroll to current week on mount
- **WHEN** HomeScreen mounts and `progress.currentWeek` is known
- **THEN** the SectionList automatically scrolls to bring the current week node into view

### Requirement: HomeScreen displays a personalized greeting header
The HomeScreen header SHALL display "Xin chào {childName}! 👋" using the child's name from authStore, and a parent gate icon (👨‍👩‍👧) in the top-right corner.

#### Scenario: Header shows child's name
- **WHEN** HomeScreen renders and `authStore.child.name` is "An"
- **THEN** the header text reads "Xin chào An! 👋"

#### Scenario: Parent gate icon is tappable
- **WHEN** the parent taps the 👨‍👩‍👧 icon in the header
- **THEN** the ParentGateModal opens
