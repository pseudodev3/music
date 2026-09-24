# UI Design Skill

Use this file as the design-quality bar for UI work in this repository.

## Reference libraries

1. Beautiful UI — https://beautifului.dev
2. BeUI — https://beui.dev
3. Rare UI — https://rareui.com
4. Transitions — https://transitions.dev
5. shadcn/ui — https://ui.shadcn.com

## Full UI Rehaul Prompt

```text
/goal Use Appllama MCP + App Design Skills.

DESIGN THEME: [REFERENCE APP]

You are going to completely rehaul the EXISTING app in this repository so its entire design, motion, navigation, and interaction language matches the DESIGN THEME app.

With MCP, read all available screens and videos of the reference app before building. Study everything closely: typography, spacing, sizing, layouts, colors, imagery, icons, navigation, sheets, gestures, scroll behavior, transitions, animation timing, easing, springs, sequencing, haptics, loading states, and micro-interactions.

Treat videos as motion references. Study them frame-by-frame where necessary. Understand exactly how elements enter, exit, move, scale, fade, transform, overlap, and respond to gestures.

Keep the existing app's PURPOSE, FEATURES, and CONTENT. You are redesigning it as if the DESIGN THEME app's design team created it. Do not copy irrelevant reference content.

Rehaul the ENTIRE app. No old UI should remain. Every route, screen, state, onboarding flow, setting, input, modal, sheet, empty state, loading state, error state, and secondary flow must belong to the new system.

Match the reference's content density too: similar text lengths, hierarchy, whitespace, CTA lengths, typography scale, and amount of information per screen. Do not make it text-heavy or use generic AI copy.

Navigation must follow the reference's philosophy. Do not default to pages stacking on top of pages. Use pushes, sheets, overlays, transformations, gestures, tabs, and contextual UI exactly where that design language calls for them.

Build in React Native + Expo. Use Reanimated, Gesture Handler, native navigation, Blur, Haptics, Skia, etc. where appropriate.

Create all required assets yourself at the highest possible quality. No placeholders.

Launch your OWN dedicated iPhone 17 Pro simulator. Run this app explicitly on your simulator.

Constantly iterate:

reference → implement → run → interact → compare → fix → repeat.

Use simulator screenshots and recordings to inspect spacing, typography, image crops, safe areas, navigation, gestures, animation curves, timing, sequencing, and transitions.

Do not accept close enough.

Do not use generic React Native styling, default navigation motion, basic cards, random animations, or simplistic approximations.

If the app has functionality not shown directly in the reference, infer how the reference app's designers would solve it from the patterns you studied.

Do not stop after the first working build.

Keep iterating until the entire app feels cohesive, highly polished, and genuinely on par with the DESIGN THEME app in visual quality, motion, interaction, and navigation.
```

## Usage note

For ordinary UI work, use the reference libraries above for inspiration and component/motion research. When doing a full redesign against a specific reference app, use the rehaul prompt as the operating brief and replace `[REFERENCE APP]` with the chosen reference.
