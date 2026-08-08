# weekly-report-screen

## Purpose

Defines the parent-facing Weekly Report screen (Screen 13) — the mobile UI that fetches the weekly report and renders either a locked preview or the unlocked report: subject progress bars, AI-style strengths/growth sections, a comparison chart, next-week suggestions, and share-to-image.

## Requirements

### Requirement: Weekly Report Screen Host
The mobile app SHALL replace the placeholder `ReportScreen` with a full report screen that fetches `GET /parent/:childId/report` for the selected week and renders either the locked preview or the unlocked report. It SHALL show a skeleton/loading state while fetching and an error state with retry on failure.

#### Scenario: Loading
- **WHEN** the report request is in flight
- **THEN** the screen shows a loading/skeleton state

#### Scenario: Fetch error
- **WHEN** the report request fails
- **THEN** the screen shows an error message with a retry action

### Requirement: Locked Report Preview
When the API returns `locked: true`, the screen SHALL render a blurred preview of the report content overlaid with the message "Hoàn thành ngày 5 để mở khóa".

#### Scenario: Week not complete
- **WHEN** the report is locked
- **THEN** the content is blurred and the unlock message is displayed

### Requirement: Unlocked Report Content
When `locked: false`, the screen SHALL render: a header "Báo cáo Tuần {X} — {dateRange}"; three subject progress bars (Toán tư duy, Ngôn ngữ, Tiếng Anh) with percentages; a "⭐ Điểm mạnh nổi bật" section from `strengths`; a "📈 Kỹ năng đang phát triển" section from `growth`; and a numbered "3 gợi ý hoạt động tuần tới" list from `suggestions`.

#### Scenario: Full report rendered
- **WHEN** the report is unlocked
- **THEN** header, three progress bars, strengths, growth, and three numbered suggestions are all visible

### Requirement: Comparison Chart
From week 2 onward the screen SHALL render a `victory-native` line chart of the last 4 weeks' average performance using the `comparison` series. For week 1 the chart SHALL be hidden.

#### Scenario: Chart shown from week 2
- **WHEN** the report week is 2 or later
- **THEN** a line chart of recent weeks is displayed

#### Scenario: Chart hidden in week 1
- **WHEN** the report week is 1
- **THEN** no comparison chart is rendered

### Requirement: Share Report
The screen SHALL provide a share button that captures the report content as an image and opens the native share sheet.

#### Scenario: Share tapped
- **WHEN** the parent taps the share button on an unlocked report
- **THEN** the report is rendered to an image and the native share sheet opens
