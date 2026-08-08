# Object sprite alpha-removal evaluation

`add-object-sprite-library` ships `edge-connected-v1` behind the replaceable
`BackgroundRemover` interface. It removes only solid-background pixels connected
to an image edge, feathers the color-distance boundary, standardizes padding,
and runs deterministic alpha QA before review.

## Recorded v1 result

| Case | v1 result | Routing |
|---|---|---|
| Solid contrasting object | Pass | Human Gate |
| Thin detail separated from border | Pass; retained as the same connected foreground | Human Gate, inspect at 52 px |
| White object with visible colored outline | Conditional pass | Human Gate on four pastel surfaces |
| White object on white background without separable edge | Deterministic `ALPHA_EMPTY_FOREGROUND` | Reject; segmentation fallback required |
| Reflective/translucent object | Conditional; halo risk | Human Gate or segmentation fallback |
| Detached contact shadow / two objects | `ALPHA_MULTIPLE_REGIONS` | Reject or regenerate without shadow |

Decision: keep edge-connected v1 for controlled Imagen prompts. Add a
segmentation-backed implementation before expanding to white, reflective, or
translucent catalogs; no failed result may claim verified alpha.
