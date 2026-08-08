// ============================================================
// KIDO APP — ACTIVITY SCHEMA (TypeScript)
// Version: 2026-06-23-schema-v2
// Changes: + Asset Library, + AssetReference, payload refactored
// Status: MVP Lock
// ============================================================

// ─────────────────────────────────────────
// SECTION 1 — ENUMS & LITERALS
// ─────────────────────────────────────────

export type Subject = 'toan' | 'tieng_viet' | 'tieng_anh'

export type Quarter = 1 | 2 | 3 | 4

export type DayIndex = 1 | 2 | 3 | 4 | 5

export type DifficultyLevel = 1 | 2 | 3

export type DifficultyInLesson = 'warmup' | 'core' | 'challenge'

export type ActivityIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export type ActivityStatus =
  | 'draft'           // AI vừa generate, chưa review
  | 'pending_review'  // Đã gửi lên Telegram, chờ review
  | 'approved'        // Human đã duyệt
  | 'rejected'        // Human reject — cần gen lại
  | 'imported'        // Đã import vào MongoDB production

export type ActionType =
  | 'single_select'   // Nghe audio + chọn 1 đáp án đúng
  | 'multi_select'    // Chọn nhiều đáp án đúng
  | 'sort_sequence'   // Kéo thả sắp xếp theo thứ tự
  | 'match_pair'      // Nối cặp logic 2 cột
  | 'count_tap'       // Tap đếm vật thể → chọn số đúng
  | 'compare_tap'     // So sánh số lượng 2 bên — tap đếm mỗi bên → chọn bên đúng
  | 'audio_select'    // Nghe đề → chọn 1 trong 2–3 clip ÂM THANH (ngôn ngữ)
  | 'watch_video'     // Xem video hoạt hình ngắn

export type AssetStatus =
  | 'pending'         // Vừa được tạo mới, chưa gen ảnh
  | 'generating'      // Đang trong hàng chờ image generation
  | 'pending_review'  // Ảnh đã gen xong, chờ human review trên Telegram
  | 'approved'        // Ảnh đã được duyệt, sẵn sàng dùng
  | 'rejected'        // Ảnh bị reject — cần gen lại với prompt khác

// ─────────────────────────────────────────
// SECTION 2 — ASSET LIBRARY
// MongoDB collection: assets_library
// Dùng chung toàn hệ thống — objects xuất hiện nhiều lần
// ─────────────────────────────────────────

export type AssetCategory =
  | 'animal'        // Động vật: mèo, chó, thỏ, voi, gấu...
  | 'fruit'         // Trái cây: táo, chuối, cam, dâu...
  | 'vegetable'     // Rau củ: cà rốt, bắp cải...
  | 'shape'         // Hình học: tròn, vuông, tam giác...
  | 'number_card'   // Thẻ số: 1, 2, 3...10
  | 'vehicle'       // Phương tiện: xe ô tô, xe đạp, thuyền...
  | 'food'          // Thức ăn: bánh mì, sữa, cơm...
  | 'household'     // Đồ gia dụng: bàn, ghế, cốc, bát...
  | 'nature'        // Thiên nhiên: cây, hoa, lá, mặt trời, mây...
  | 'clothing'      // Quần áo: áo, giày, mũ...
  | 'character'     // Nhân vật: Đô Đô, các mascot phụ

export type AssetSize = 'xs' | 'sm' | 'md' | 'lg'

export type AssetBackground = 'white' | 'transparent' | 'scene'
export type DisplayVariant = 'normal' | 'small' | 'large' | 'short' | 'long' | 'low' | 'tall'
export type PastelToken = 'rose' | 'peach' | 'butter' | 'mint' | 'sky' | 'lavender'

export interface ObjectSpriteIdentity {
  themeCode: string
  objectCode: string
  colorCode: string | null
  variantCode: string
  viewCode: string
  styleVersion: string
}

/**
 * LibraryAsset — object dùng chung nhiều activity
 * assetId format: "LIB-{category}-{object}-{color}-{pose}"
 * vd: "LIB-animal-cat-orange-sitting"
 *     "LIB-fruit-apple-red-whole"
 *     "LIB-shape-circle-teal-md"
 */
export interface LibraryAsset {
  // ── Identity ──
  assetId: string

  // ── Structured attributes — dùng để query tìm asset có sẵn ──
  attributes: {
    category: AssetCategory
    object: string            // "cat" | "apple" | "circle" | "1" ...
    color: string | null      // "orange" | "red" | "teal" | null
    size: AssetSize | null    // null nếu size không quan trọng
    pose: string | null       // "sitting"|"running"|"whole"|"half"|"front" ...
    background: AssetBackground
    style: 'flat-2d-vector'   // Cố định toàn app — không thay đổi

    /**
     * Tên tiếng Việt canonical của vật — "mèo" | "táo" | "bàn".
     * AUTHORING-ONLY: dùng ở kido-pipeline để chọn asset + sinh TTS cho môn `tieng_viet`.
     * KHÔNG đi qua publish (payload không mang `attributes`) → kido-server không cần field này.
     *
     * OPTIONAL có chủ ý: đặt required sẽ phá MỌI nơi tạo attributes (kể cả
     * FindOrCreateAssetInput dùng chung của môn Toán). Ràng buộc "phải có viLabel DUY NHẤT"
     * chỉ enforce cho asset dùng trong bài `tieng_viet`, ở tầng pipeline — không ở tầng type.
     *
     * DUY NHẤT: mỗi asset đúng MỘT tên đọc. Ảnh con gà không được lúc "gà" lúc "con gà trống"
     * — bài vần/âm đầu sẽ vô nghĩa. Không kèm lượng từ ("mèo", không phải "con mèo"), trừ khi
     * chính lượng từ là nội dung bài (lang_classifier).
     * Xem docs/KIDO_LANG_SKILL_CATALOG.md §9.1.
     */
    viLabel?: string
  }

  // ── Image files ──
  promptImage: string         // Prompt tiếng Anh gốc dùng để gen ảnh
  imageUrl: string | null     // CDN URL — null khi chưa gen xong
  thumbnailUrl: string | null // 100×100px — dùng cho Telegram preview

  // ── Usage tracking ──
  usageCount: number          // Tăng mỗi lần activity reference asset này
  usedInActivities: string[]  // ["ACT-w01-d1-toan-02", "ACT-w05-d3-tieng_anh-01"]

  // ── Search ──
  tags: string[]              // ["animal", "cat", "orange", "cute", "sitting"]
                              // Dùng để full-text search khi human tìm asset

  // ── Pipeline ──
  status: AssetStatus
  createdAt: string           // ISO 8601
  approvedAt: string | null
  rejectedReason: string | null
}

// ─────────────────────────────────────────
// SECTION 3 — ACTIVITY ASSETS
// MongoDB collection: activity_assets
// Gắn chặt với 1 activity — không tái sử dụng
// ─────────────────────────────────────────

export type ActivityAssetRole =
  | 'question_image'  // Hình câu hỏi chính (matrix, scene tổng hợp...)
  | 'scene_image'     // Nền scene TRỐNG cho count_tap (backgroundAsset)
  | 'sequence_item'   // 1 item trong chuỗi sort_sequence
  | 'video_thumbnail' // Thumbnail cho watch_video

/**
 * ActivityAsset — ảnh đặc thù của 1 activity cụ thể
 * assetId format: "ACT-{activityId}-{role}-{index}"
 * vd: "ACT-w03-d2-toan-01-question_image"
 *     "ACT-w03-d2-toan-01-sequence_item-2"
 */
export interface ActivityAsset {
  assetId: string
  activityId: string          // Gắn với activity nào
  role: ActivityAssetRole     // Vai trò trong activity

  promptImage: string         // Prompt tiếng Anh để gen ảnh
  imageUrl: string | null     // null = chưa gen
  thumbnailUrl: string | null

  status: AssetStatus
  createdAt: string
  approvedAt: string | null
  rejectedReason: string | null
}

// ─────────────────────────────────────────
// SECTION 4 — ASSET REFERENCE
// Dùng trong payload để trỏ tới asset
// Không embed imageUrl trực tiếp vào payload
// ─────────────────────────────────────────

/**
 * AssetReference — con trỏ tới asset, không embed data
 *
 * type = 'library'  → tra trong collection assets_library
 *                     → tái sử dụng được, usageCount++
 *
 * type = 'activity' → tra trong collection activity_assets
 *                     → đặc thù cho activity này
 *
 * altText luôn có — dùng cho Telegram preview và accessibility
 */
export interface AssetReference {
  type: 'library' | 'activity'
  assetId: string
  altText: string             // Mô tả ngắn tiếng Việt
                              // vd: "Con mèo cam đang ngồi"
                              //     "Ma trận 2x2 hình vuông và hình tròn"
  imageDesc?: string          // EN — đặc điểm nhận dạng vật, phần "biến" của
                              // prompt ảnh (code lo phần style cố định).
                              // Role-aware: vật đơn lẻ tả riêng vật (không nền);
                              // backgroundAsset count_tap tả scene TRỐNG.
                              // Chỉ sống Generate→Assets, strip trước publish.
  includesMascot?: boolean    // Ảnh có nhân vật Đô Đô → gen kèm ảnh reference
                              // (subject customization) để mascot đồng nhất.
                              // Pipeline-only, strip trước publish.
}

/**
 * AudioReference — con trỏ tới 1 clip audio (audio_select), mirror AssetReference.
 * type = 'library'  → tra audio_library theo word-key ASCII bỏ dấu (con-ca, cat),
 *                     tái dùng, usageCount++ (mặc định cho TỪ THẬT)
 * type = 'activity' → clip đặc thù (âm vị /b/, câu hội thoại "Yes, I do."), không tái dùng
 */
export interface AudioReference {
  type: 'library' | 'activity'
  audioId: string             // library: word-key; activity: "ACT-...-opt_2"
  altTextVi: string           // Mô tả ngắn tiếng Việt — preview + accessibility
  transcript?: string         // Text sinh clip (VI/EN), strip trước publish
}

// ─────────────────────────────────────────
// SECTION 5 — AUDIO SCRIPT
// ─────────────────────────────────────────

/**
 * AudioScript — toàn bộ text Đô Đô đọc trong 1 activity
 * VI  → Web Speech API (SpeechSynthesis, lang: vi-VN, rate: 0.85)
 * EN  → ElevenLabs (friendly, childappropriate, rate: 0.75)
 */
export interface AudioScript {
  question: string    // Câu hỏi chính — đọc khi activity bắt đầu
  correct: string     // Lời khen khi đúng lần 1 — tối đa 8 từ (enforced: activity-mechanics WORD_LIMITS)
  hint1: string       // Gợi ý sau sai lần 1 — tối đa 10 từ
  hint2: string       // Gợi ý sau sai lần 2 — tối đa 15 từ
  explain: string     // Giải thích đáp án đúng — tối đa 20 từ
}

// ─────────────────────────────────────────
// SECTION 6 — PAYLOAD TYPES (1 per actionType)
// ─────────────────────────────────────────

// ── 6A. single_select ─────────────────────────────────────
// Trẻ nghe câu hỏi → nhìn questionImage (nếu có) → tap 1 option đúng
// Dùng nhiều nhất — ~50% tổng activities
//
// questionImage TÙY CHỌN: các môn AUDIO-prompt (skill tiếng Anh `en_*` và tiếng Việt
// `lang_*`) — bé NGHE đề rồi chọn ảnh — KHÔNG có "ảnh câu hỏi", options mới là thứ bé
// nhìn → bỏ questionImage. Toán chọn-1-vật vẫn nên có. (Enforce: R12 ở activity-mechanics.ts)

export type OptionLayout =
  | 'grid_2x2'    // 4 options — dùng nhiều nhất
  | 'grid_2x1'    // 2 options — warmup đơn giản
  | 'row_3'       // 3 options — hàng ngang

export interface OptionCard {
  optionId: string            // "opt_A" | "opt_B" | "opt_C" | "opt_D"
  assetRef: AssetReference    // Trỏ về library hoặc activity asset
  isCorrect: boolean
  displayVariant?: DisplayVariant
}

export interface SingleSelectPayload {
  questionImage?: AssetReference  // Hình câu hỏi chính — BỎ với môn audio-prompt (en_*/lang_*)
  options: OptionCard[]           // 2–4 options
  correctAnswer: string           // optionId của đáp án đúng — "opt_A"
  layout: OptionLayout
}

// ── 6B. multi_select ──────────────────────────────────────
// Trẻ chọn nhiều option đúng (2–3 đáp án đúng)
// Dùng cho: Tìm tất cả hình tròn, Chọn tất cả con vật sống dưới nước

export interface MultiSelectPayload {
  questionImage?: AssetReference  // BỎ với môn audio-prompt (en_*/lang_*) — xem note single_select
  options: OptionCard[]           // 3–6 options, 2+ có isCorrect: true
  correctAnswers: string[]        // ["opt_A", "opt_C"] — tất cả optionId đúng
  minCorrect: number              // Số đáp án đúng tối thiểu phải chọn đủ
  layout: OptionLayout
}

// ── 6C. sort_sequence ─────────────────────────────────────
// Trẻ sắp xếp 3–5 hình theo đúng thứ tự logic
// Dùng cho: Trình tự câu chuyện, các bước nề nếp, lớn→nhỏ

export interface SequenceItem {
  itemId: string
  assetRef: AssetReference
  correctPosition: number         // 1-based — 1 = đứng đầu tiên
}

export interface SortSequencePayload {
  items: SequenceItem[]           // 3–5 items, app tự xáo trộn khi hiển thị
  direction: 'horizontal' | 'vertical'
  // Validate: so sánh correctPosition của từng item với vị trí trẻ sắp xếp
}

// ── 6D. match_pair ────────────────────────────────────────
// Trẻ nối item cột trái với item cột phải theo cặp logic
// Dùng cho: Con vật–thức ăn, Từ EN–hình ảnh, Hình–bóng đổ

export interface PairItem {
  itemId: string
  assetRef: AssetReference
}

export interface CorrectPair {
  leftId: string    // itemId cột trái
  rightId: string   // itemId cột phải
}

export interface MatchPairPayload {
  leftItems: PairItem[]           // 2–4 items cột trái
  rightItems: PairItem[]          // 2–4 items cột phải — cùng số lượng với left
  correctPairs: CorrectPair[]     // Mapping đáp án đúng
}

// ── 6E. count_tap ─────────────────────────────────────────
// Flow: Trẻ tap đếm từng vật trong scene → chọn con số đúng
// Bước 1: App vẽ backgroundAsset (nền tĩnh, KHÔNG chứa vật đếm) rồi
//         nhân bản targetAsset thành đúng targetCount sprite rời rạc,
//         thả vào các vị trí không đè nhau (app tự tính, seed theo activityId).
//         Trẻ tap từng sprite (highlight + đọc số "Một", "Hai"...).
// Bước 2: Chọn đáp án số từ answerOptions.
// Lưu ý: KHÔNG dùng 1 ảnh scene nguyên khối — ảnh phẳng không tách được
//        vùng tap theo từng vật và không đảm bảo đúng số lượng.

export interface CountTapPayload {
  surface?:
    | { mode: 'scene' }
    | { mode: 'pastel'; token?: PastelToken; algorithmVersion?: 'pastel-v1'; surfaceGroup?: string }
  backgroundAsset?: AssetReference // required for legacy/scene; omitted for pastel
                                  // vd: bể cá trống, khu vườn trống
  targetAsset: AssetReference     // 1 vật đơn lẻ, nền trong suốt — app nhân bản
                                  // vd: "con bướm" → 1 sprite bướm .png transparent
  targetObject: string            // Tên tiếng Việt — "con bướm", "quả táo"
                                  // Đô Đô đọc: "Bé đếm xem có mấy {targetObject}?"
  targetCount: number             // Số lượng đúng — app nhân bản targetAsset ngần này
  answerOptions: number[]         // Luôn đúng 4 số gồm targetCount + 3 số gần
                                  // vd: targetCount=5 → [3, 4, 5, 6]
}

// ── 6F. compare_tap ───────────────────────────────────────
// Flow: So sánh SỐ LƯỢNG 2 bên (trái/phải) — CÙNG 1 vật, khác số lượng.
// App nhân bản objectAsset thành leftCount sprite bên trái + rightCount bên phải,
// mỗi bên thả không đè nhau (seed theo activityId + suffix bên). Trẻ tap đếm từng
// bên (counter riêng, giàn giáo — KHÔNG bắt buộc) rồi chọn bên thỏa câu hỏi.
// Lưu ý: KHÔNG có questionImage, KHÔNG options — 2 khung sprite CHÍNH LÀ đề bài.
//        1 vật chung 2 bên (chỉ khác số lượng) để bé so số, không so "vật nào đẹp".

export interface CompareTapPayload {
  objectAsset: AssetReference     // 1 vật đơn lẻ, nền trong suốt — dùng chung CẢ 2 bên
  objectName: string              // Tên tiếng Việt — "quả táo", "con cá"
  leftCount: number               // 1..6
  rightCount: number              // 1..6, KHÁC leftCount
  correctSide: 'left' | 'right'   // Bên thỏa câu hỏi (khớp mode)
  mode: 'more' | 'less'           // Hỏi bên NHIỀU hơn / ÍT hơn
}

// ── 6G. audio_select ──────────────────────────────────────
// Trẻ nghe đề (audioScript.question) → chọn 1 trong 2–3 thẻ, mỗi thẻ là clip
// AUDIO (nút play riêng, phát lại không giới hạn). Đáp án là ÂM THANH, không ảnh.
// Guardrail bộ nhớ làm việc: ≤3 options, mỗi clip ≤4 từ. Chỉ tieng_viet/tieng_anh.
// KHÔNG dùng questionImage bắt buộc; promptImage chỉ là scaffold TÙY CHỌN.

export interface AudioOptionCard {
  optionId: string                // "opt_1" | "opt_2" | "opt_3"
  audioRef: AudioReference
  altTextVi: string               // Mô tả ngắn ≤4 từ — preview + accessibility
}

export interface AudioSelectPayload {
  promptImage?: AssetReference    // Scaffold thị giác TÙY CHỌN (thường bỏ trống)
  options: AudioOptionCard[]      // 2..3 clip
  correctAnswer: string           // optionId của đáp án đúng
}

// audio_library — collection tái dùng clip (mirror assets_library cho âm thanh).
// Key = word-key ASCII bỏ dấu + lang. TTS/ElevenLabs sinh 1 lần/word, mọi
// activity trỏ tới bằng AudioReference { type: 'library', audioId }.
export interface AudioLibrary {
  audioId: string                 // word-key ASCII: "con-ca", "cat"
  lang: 'vi' | 'en'
  transcript: string              // text sinh clip
  audioUrl: string | null
  usageCount: number
  usedInActivities: string[]
  status: AssetStatus
  createdAt: string
  approvedAt: string | null
}

// ── 6H. watch_video ───────────────────────────────────────
// Trẻ xem video hoạt hình ngắn — không có đáp án
// Auto proceed sau khi xem xong hoặc sau skipAllowedAfter giây

export interface WatchVideoPayload {
  videoUrl: string                // CDN URL video đã upload
  durationSeconds: number         // Thời lượng video (giây)
  thumbnailUrl: string            // Thumbnail hiển thị trước khi play
  skipAllowedAfter: number        // Giây — 0 = không cho skip
}

// ─────────────────────────────────────────
// SECTION 7 — DISCRIMINATED UNION ACTIVITY
// TypeScript dùng actionType để narrow đúng payload
// ─────────────────────────────────────────

export type Activity =
  | ActivityBase & { actionType: 'single_select'; payload: SingleSelectPayload }
  | ActivityBase & { actionType: 'multi_select';  payload: MultiSelectPayload }
  | ActivityBase & { actionType: 'sort_sequence'; payload: SortSequencePayload }
  | ActivityBase & { actionType: 'match_pair';    payload: MatchPairPayload }
  | ActivityBase & { actionType: 'count_tap';     payload: CountTapPayload }
  | ActivityBase & { actionType: 'compare_tap';   payload: CompareTapPayload }
  | ActivityBase & { actionType: 'audio_select';  payload: AudioSelectPayload }
  | ActivityBase & { actionType: 'watch_video';   payload: WatchVideoPayload }

// ─────────────────────────────────────────
// SECTION 8 — ACTIVITY BASE
// ─────────────────────────────────────────

export interface ActivityBase {
  // ── Identity ──
  activityId: string
  // Format: "ACT-w{week}-d{day}-{subject}-{index}"
  // vd:     "ACT-w03-d2-toan-01"

  lessonId: string
  // Format: "w{week}-d{day}-{subject}"
  // vd:     "w03-d2-toan"

  // ── Curriculum ──
  meta: ActivityMeta
  skillCode: string
  // vd: "math_logic_matrix_2x2" — từ danh sách canonical skill_code

  // ── Interaction ──
  actionType: ActionType

  // ── Audio ──
  audioScript: AudioScript

  // ── Payload — overridden bởi discriminated union ──
  payload: unknown

  // ── Pipeline ──
  status: ActivityStatus
  generatedAt: string           // ISO 8601
  reviewedAt: string | null
  reviewNote: string | null     // Ghi chú của reviewer khi reject/request edit
}

export interface ActivityMeta {
  week: number                          // 1–48
  day: DayIndex                         // 1–5
  subject: Subject
  quarter: Quarter                      // Tự tính: 1-12=Q1, 13-24=Q2, 25-36=Q3, 37-48=Q4
  difficulty: DifficultyLevel           // 1=dễ, 2=trung bình, 3=khó
  difficultyInLesson: DifficultyInLesson
  activityIndex: ActivityIndex          // 1–8 trong bài học
}

// ─────────────────────────────────────────
// SECTION 9 — LESSON
// MongoDB collection: lessons
// Nhóm activities của 1 ngày học (curriculum hiện tại: 8 bài/buổi)
// ─────────────────────────────────────────

export interface Lesson {
  // ── Identity ──
  lessonId: string    // "w03-d2-toan"
  week: number        // 1–48
  day: DayIndex
  subject: Subject
  quarter: Quarter
  difficulty: DifficultyLevel

  // ── Display ──
  lessonTitle: string // Tên bài học hiển thị trong app

  // ── Activities ──
  // Curriculum hiện tại: 8 items/buổi, thứ tự theo activityIndex
  // (warmup → core → challenge; xem docs/KIDO_MATH_CURRICULUM.md)
  activities: Activity[]

  // ── Parent module ──
  offlineTaskTitle: string    // ≤ 8 từ
  offlineTaskBody: string     // Hướng dẫn chi tiết + lời thoại gợi ý
  offlineTaskSafety: string   // 1 dòng lưu ý an toàn — KHÔNG để trống

  // ── Special day flags ──
  // Presentation/content hint only (normally day 5). Durable sticker awards
  // require completion of every lesson in the child's frozen canonical week plan.
  isStickerDay: boolean
  isWeeklyReport: boolean     // true khi day === 5
  isPaywallTrigger: boolean   // true khi day === 5 && week === 2

  // ── Pipeline ──
  lessonStatus: 'draft' | 'pending_review' | 'approved' | 'imported'
  generatedAt: string
  importedAt: string | null
}

// CANONICAL REWARD SYNC (runtime server/mobile contract)
// Only imported lessons with exactly 8 activities and a server-issued content
// version are eligible. Mock/demo/Explore/Practice content never writes rewards.

export type RewardStar = 1 | 2 | 3
export type StickerId = `sticker-w${string}`

export interface RewardContext {
  eligible: true
  contentVersion: string
  weekPlanVersion: string
  requiredLessonIds: string[]
  stickerId: StickerId
}

export interface RewardCompletionEvent {
  schemaVersion: 1
  eventId: string
  childId: string
  lessonId: string
  contentVersion: string
  weekPlanVersion: string
  completedAt: string
  activityResults: Array<{
    activityId: string
    attemptCount: 1 | 2 | 3
    outcome: 'correct' | 'revealed'
  }>
}

export interface RewardProgressSnapshot {
  currentWeek: number
  currentDay: number
  completedLessonIds: string[]
  streakCount: number
  xpTotal: number // internal compatibility field; not child-facing in V1
  lessonStars: Record<string, RewardStar>
  stickerIdsEarned: StickerId[]
  legacyStickerWeeks: number[]
  lastCompletionDate: string | null
  rewardRevision: number
}

// ─────────────────────────────────────────
// SECTION 10 — TYPE GUARDS
// Dùng trong app render và pipeline validation
// ─────────────────────────────────────────

export const isSingleSelect = (
  a: Activity
): a is ActivityBase & { actionType: 'single_select'; payload: SingleSelectPayload } =>
  a.actionType === 'single_select'

export const isMultiSelect = (
  a: Activity
): a is ActivityBase & { actionType: 'multi_select'; payload: MultiSelectPayload } =>
  a.actionType === 'multi_select'

export const isSortSequence = (
  a: Activity
): a is ActivityBase & { actionType: 'sort_sequence'; payload: SortSequencePayload } =>
  a.actionType === 'sort_sequence'

export const isMatchPair = (
  a: Activity
): a is ActivityBase & { actionType: 'match_pair'; payload: MatchPairPayload } =>
  a.actionType === 'match_pair'

export const isCountTap = (
  a: Activity
): a is ActivityBase & { actionType: 'count_tap'; payload: CountTapPayload } =>
  a.actionType === 'count_tap'

export const isAudioSelect = (
  a: Activity
): a is ActivityBase & { actionType: 'audio_select'; payload: AudioSelectPayload } =>
  a.actionType === 'audio_select'

export const isWatchVideo = (
  a: Activity
): a is ActivityBase & { actionType: 'watch_video'; payload: WatchVideoPayload } =>
  a.actionType === 'watch_video'

// ─────────────────────────────────────────
// SECTION 11 — HELPER: findOrCreateAsset
// Pipeline gọi hàm này thay vì tạo asset trực tiếp
// Logic: query library trước → nếu có thì reuse, không có thì tạo mới
// ─────────────────────────────────────────

export interface FindOrCreateAssetInput {
  // Nếu cung cấp attributes → tìm trong library (reuse)
  attributes?: LibraryAsset['attributes']

  // Nếu không có attributes → tạo activity asset (không reuse)
  activityId?: string
  role?: ActivityAssetRole

  // Luôn cần
  promptImage: string
  altText: string
}

export interface FindOrCreateAssetResult {
  assetRef: AssetReference    // Dùng ngay trong payload
  isNew: boolean              // true = vừa tạo mới, false = reuse từ library
  asset: LibraryAsset | ActivityAsset
}

// ─────────────────────────────────────────
// SECTION 12 — USAGE EXAMPLES
// ─────────────────────────────────────────

/*
──────────────────────────────────────────
Example 1: single_select với library assets
──────────────────────────────────────────
const activity: Activity = {
  activityId: 'ACT-w03-d2-toan-01',
  lessonId: 'w03-d2-toan',
  meta: {
    week: 3, day: 2, subject: 'toan', quarter: 1,
    difficulty: 1, difficultyInLesson: 'warmup', activityIndex: 1,
  },
  skillCode: 'math_logic_matrix_2x2',
  actionType: 'single_select',
  audioScript: {
    question: 'Chiếc thảm của Đô Đô bị thiếu một mảnh. Bé chọn hình phù hợp nhé!',
    correct: 'Ôi bé giỏi quá!',
    hint1: 'Nhìn màu hàng trên xem!',
    hint2: 'Hàng trên đỏ, hàng dưới thì sao?',
    explain: 'Vì hàng dưới toàn xanh nên ô trống cũng xanh!',
  },
  payload: {
    questionImage: {
      // Ảnh câu hỏi phức tạp → activity asset (không reuse)
      type: 'activity',
      assetId: 'ACT-w03-d2-toan-01-question_image',
      altText: 'Ma trận 2x2: hàng trên đỏ, hàng dưới xanh, ô trống góc phải dưới',
    },
    options: [
      {
        optionId: 'opt_A',
        assetRef: {
          // Hình vuông xanh → library asset (reuse được)
          type: 'library',
          assetId: 'LIB-shape-square-teal-md',
          altText: 'Hình vuông màu xanh ngọc',
        },
        isCorrect: true,
      },
      {
        optionId: 'opt_B',
        assetRef: {
          type: 'library',
          assetId: 'LIB-shape-square-red-md',
          altText: 'Hình vuông màu đỏ',
        },
        isCorrect: false,
      },
      {
        optionId: 'opt_C',
        assetRef: {
          type: 'library',
          assetId: 'LIB-shape-circle-teal-md',
          altText: 'Hình tròn màu xanh ngọc',
        },
        isCorrect: false,
      },
      {
        optionId: 'opt_D',
        assetRef: {
          type: 'library',
          assetId: 'LIB-shape-square-yellow-md',
          altText: 'Hình vuông màu vàng',
        },
        isCorrect: false,
      },
    ],
    correctAnswer: 'opt_A',
    layout: 'grid_2x2',
  },
  status: 'draft',
  generatedAt: '2026-06-24T10:00:00Z',
  reviewedAt: null,
  reviewNote: null,
}

──────────────────────────────────────────
Example 2: match_pair con vật với thức ăn
──────────────────────────────────────────
const matchActivity: Activity = {
  activityId: 'ACT-w05-d2-toan-03',
  lessonId: 'w05-d2-toan',
  meta: {
    week: 5, day: 2, subject: 'toan', quarter: 1,
    difficulty: 1, difficultyInLesson: 'core', activityIndex: 3,
  },
  skillCode: 'math_sorting_classification',
  actionType: 'match_pair',
  audioScript: {
    question: 'Nối mỗi con vật với thức ăn yêu thích của nó nhé!',
    correct: 'Bé nối đúng hết rồi, giỏi quá!',
    hint1: 'Con mèo thích ăn gì nhỉ?',
    hint2: 'Mèo thích cá lắm đó bé ơi!',
    explain: 'Mèo ăn cá, chó ăn xương, thỏ ăn cà rốt!',
  },
  payload: {
    leftItems: [
      { itemId: 'L1', assetRef: { type: 'library', assetId: 'LIB-animal-cat-orange-sitting', altText: 'Con mèo cam' } },
      { itemId: 'L2', assetRef: { type: 'library', assetId: 'LIB-animal-dog-brown-sitting', altText: 'Con chó nâu' } },
      { itemId: 'L3', assetRef: { type: 'library', assetId: 'LIB-animal-rabbit-white-sitting', altText: 'Con thỏ trắng' } },
    ],
    rightItems: [
      { itemId: 'R1', assetRef: { type: 'library', assetId: 'LIB-food-fish-blue-whole', altText: 'Con cá xanh' } },
      { itemId: 'R2', assetRef: { type: 'library', assetId: 'LIB-food-bone-white-whole', altText: 'Cái xương' } },
      { itemId: 'R3', assetRef: { type: 'library', assetId: 'LIB-vegetable-carrot-orange-whole', altText: 'Củ cà rốt' } },
    ],
    correctPairs: [
      { leftId: 'L1', rightId: 'R1' },
      { leftId: 'L2', rightId: 'R2' },
      { leftId: 'L3', rightId: 'R3' },
    ],
  },
  status: 'draft',
  generatedAt: '2026-06-24T10:00:00Z',
  reviewedAt: null,
  reviewNote: null,
}

──────────────────────────────────────────
Example 3: Type guard usage trong app render
──────────────────────────────────────────
function renderActivity(activity: Activity) {
  if (isSingleSelect(activity)) {
    // TypeScript biết chắc payload là SingleSelectPayload
    const { options, correctAnswer, layout } = activity.payload
    return <SingleSelectScreen options={options} layout={layout} />
  }

  if (isMatchPair(activity)) {
    const { leftItems, rightItems, correctPairs } = activity.payload
    return <MatchPairScreen left={leftItems} right={rightItems} />
  }

  if (isCountTap(activity)) {
    const { backgroundAsset, targetAsset, targetCount, answerOptions } = activity.payload
    return <CountTapScreen background={backgroundAsset} object={targetAsset} count={targetCount} />
  }
  // ...
}
*/
