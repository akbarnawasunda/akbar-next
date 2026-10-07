# Cursor companion pose assets

The cursor companion (`client/src/components/signature/CursorSignal.tsx`)
expects exactly these eight files in this folder — the same filenames and
sizes as the mascot pose set already prepared for cursor states:

```
01_idle_normal_128px.png
02_curious_looking_128px.png
03_pointing_128px.png
04_click_pressing_128px.png
05_dragging_pulling_128px.png
06_thinking_128px.png
07_music_vibing_128px.png
08_stop_notavailable_128px.png
```

Use the 128px export of each pose — it stays crisp up to ~3x DPR at the
companion's on-screen size (34–40px) without shipping the larger 256px
variants nobody will see at that scale.

Nothing else needs to change when these land: `CursorSignal.css` already
points at these exact paths. Until the files exist here, the pose layer's
`background-image` simply fails to paint (no broken-image icon, since it's
a CSS background, not an `<img>`) and the site falls back to the plain
precision dot — safe either way.
