# activity-container Specification (delta)

## MODIFIED Requirements

### Requirement: Container routes actionType tới component đúng
`ActivityContainer` SHALL map mỗi `actionType` tới component render tương ứng. Container SHALL hỗ trợ `audio_select` → `AudioSelectActivity` bên cạnh các mapping hiện có (single_select, multi_select, sort_sequence, match_pair, count_tap, compare_tap). Với `audio_select`, container SHALL truyền activity id làm seed cho layout/animation ổn định như các loại khác.

#### Scenario: audio_select route tới AudioSelectActivity
- **WHEN** ActivityContainer nhận activity có `actionType: 'audio_select'`
- **THEN** container render `AudioSelectActivity` với payload đã normalize (audioRef đã resolve sang audioUrl)

#### Scenario: actionType không nhận diện
- **WHEN** container nhận actionType ngoài tập đã hỗ trợ
- **THEN** container render fallback an toàn (không crash) như hành vi hiện tại
