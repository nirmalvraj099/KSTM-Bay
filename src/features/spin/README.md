# 360° spin viewer

`SpinViewer` turns an ordered set of frames into a drag/swipe 360° spin. Demo at `/spin`.

```tsx
<SpinViewer set={{ id, title, alt, source: "ai", frames: [...8 urls] }} />
```

- **Sparse sets** (under 16 frames, e.g. 8 AI views): neighbouring frames cross-fade while dragging, then it settles on a real view. View chips (Front, Side, Rear...) jump to an angle.
- **Dense sets** (24 to 36+ shop photos or video frames): frames flip directly.
- **Loading**: starts when the viewer is within 400px of the screen. The start frame loads first, then outward from it. Dense sets fetch every 4th frame first so a rough spin works almost at once. A frame that hasn't loaded is never shown.
- **Input**: pointer drag with inertia (mouse, touch, pen), arrow keys, Home. `touch-action: pan-y` keeps vertical page scroll working on phones.
- **Frame order**: frame 0 is the front, then the front swings to the viewer's right, evenly spaced. See `types.ts`.
- Respects `prefers-reduced-motion` (no load-time spin hint).

The frames in `public/spin/demo/` are placeholder 3D renders (1200×750 WebP, ~15 KB each), not real cars.

## Next steps
- Store sets in Supabase (`spin_sets` table + Storage bucket), link them to jobs and builds.
- Phase 1: generate 8 consistent views per job from the AI render pipeline.
- Phase 2: shop upload flow that accepts 24-36 photos or a turntable video and extracts frames.
- Pinch/scroll zoom and hotspots on frames.
