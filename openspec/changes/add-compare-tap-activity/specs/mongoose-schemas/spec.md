# mongoose-schemas Specification (delta)

## MODIFIED Requirements

### Requirement: Schema lessons và activities mirror kido-activity-schema.ts
Schema `lessons` SHALL có đủ fields của interface `Lesson`. Schema `activities` SHALL có `payload` dưới dạng `Schema.Types.Mixed` với `actionType` discriminator; enum `actionType` SHALL bao gồm `compare_tap` bên cạnh 5 type hiện có (single_select, multi_select, sort_sequence, match_pair, count_tap) và watch_video. Index: `lessons` trên `{ week, day, subject }`, `activities` trên `{ lessonId }` và `{ 'meta.week', status }`.

#### Scenario: Lesson document chứa đúng 6 activities reference
- **WHEN** một Lesson được query với `populate('activities')`
- **THEN** `lesson.activities` là array 6 Activity documents đúng thứ tự `activityIndex`

#### Scenario: Activity với actionType 'single_select' lưu payload đúng
- **WHEN** một Activity document với `actionType: 'single_select'` được insert
- **THEN** `activity.payload` lưu đầy đủ `questionImage`, `options`, `correctAnswer`, `layout` mà không bị Mongoose cắt bớt

#### Scenario: Activity với actionType 'compare_tap' lưu payload đúng
- **WHEN** một Activity document với `actionType: 'compare_tap'` được insert
- **THEN** insert thành công và `activity.payload` lưu đầy đủ `objectAsset`, `objectName`, `leftCount`, `rightCount`, `correctSide`, `mode` mà không bị Mongoose cắt bớt
