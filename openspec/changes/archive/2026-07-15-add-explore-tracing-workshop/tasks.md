## 1. Path Schema and Reviewed Pilot Pack

- [x] 1.1 Define versioned normalized path/stroke/start/direction/tolerance schema and static validator
- [x] 1.2 Author and review a pilot pack for basic strokes, routes and shapes
- [x] 1.3 Add digits 0–9 paths with reviewed stroke order and metadata
- [x] 1.4 Add Latin A–Z/a–z and Vietnamese Ă/Â/Đ/Ê/Ô/Ơ/Ư upper/lowercase paths with base-before-diacritic order
- [x] 1.5 Add pack-level schema, bounds, finite-coordinate, ordering and representative geometry tests

## 2. Mobile Tracing Engine

- [x] 2.1 Implement SVG/path rendering, gesture capture resampling and bounded point buffers
- [x] 2.2 Implement monotonic progress, direction and corridor evaluator with versioned thresholds
- [x] 2.3 Implement L1–L5 assistance profiles, start/direction cues, local recovery, snap/magnetism and tolerance escalation
- [x] 2.4 Preserve completed strokes on local deviation and prevent jump-to-end acceptance
- [x] 2.5 Add performance profiling and representative phone/tablet gesture tests

## 3. Explore Integration and Privacy

- [x] 3.1 Register tracing categories/levels/path-pack versions with Explore config and fixed audio templates
- [x] 3.2 Implement a memory-only renderer adapter that never sends or persists outcome, progress, error summary or raw coordinates
- [x] 3.3 Add tests proving exit/unmount discards stroke arrays and no Explore storage/network write occurs
- [x] 3.4 Add wording guards that classify letter tracing as fine-motor/form familiarity, never reading/phonics assessment

## 4. Verification and Rollout

- [x] 4.1 Run geometric evaluator boundary tests and manual representative-device calibration for every enabled category
- [x] 4.2 Run local evaluator/offline tests and mobile lint; rollout strokes/shapes/digits before reviewed letters
