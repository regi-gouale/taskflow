---
name: TaskFlow
description: Tableau de bord de gestion de tâches clair, efficace et orienté action.
colors:
  background: "oklch(1 0 0)"
  foreground: "oklch(0.16 0.015 265)"
  surface: "oklch(1 0 0)"
  surface-muted: "oklch(0.968 0.006 265)"
  border-subtle: "oklch(0.915 0.008 265)"
  primary-action: "oklch(0.57 0.209 262.7)"
  primary-action-foreground: "oklch(0.985 0.01 265)"
  text-muted: "oklch(0.55 0.018 265)"
  danger: "oklch(0.577 0.245 27.325)"
  sidebar-surface: "oklch(0.985 0.004 265)"
typography:
  display:
    fontFamily: "Roboto Slab, Georgia, serif"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Roboto Slab, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
  title:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.01em"
rounded:
  sm: "0.525rem"
  md: "0.7rem"
  lg: "0.875rem"
  xl: "1.225rem"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.primary-action}"
    textColor: "{colors.primary-action-foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    height: "2.25rem"
    padding: "0 0.625rem"
  button-primary-hover:
    backgroundColor: "{colors.primary-action}"
    textColor: "{colors.primary-action-foreground}"
    rounded: "{rounded.md}"
  card-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: "1.5rem"
  input-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    height: "2.25rem"
    padding: "0 0.625rem"
  nav-sidebar-item-active:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.625rem"
---

# Design System: TaskFlow

## Overview

**Creative North Star: "Focused Control Room"**

TaskFlow is a product UI for daily execution, not a marketing canvas. The interface must feel simple, efficient, and clear: dense enough to answer operational questions quickly, but restrained enough to keep attention on ownership and status instead of decoration.

The visual language prioritizes predictable interaction patterns, low cognitive load, and immediate state legibility. Panels, tables, badges, and status markers are functional instruments. Accent color is reserved for action and selection, never ornamental emphasis.

This system explicitly rejects overloaded interfaces with too much information at once. Information is grouped, progressive, and scannable; pages should read like a control surface, not a report dump.

**Key Characteristics:**
- Restrained chroma with one operational accent.
- Familiar app-shell patterns (sidebar + sticky top bar + content work area).
- State-forward UI (active, overdue, selected, invalid) with visible feedback.
- Tight, consistent spacing cadence tuned for dashboard workflows.

## Colors

The palette is neutral-first with a single indigo accent carrying primary action and active-state focus.

### Primary
- **Operational Indigo** (`oklch(0.57 0.209 262.7)`): primary actions, key links, focus/ring emphasis, and active indicators.

### Neutral
- **Workspace White** (`oklch(1 0 0)`): page and card base surfaces for maximum readability.
- **Panel Mist** (`oklch(0.968 0.006 265)`): secondary surfaces, muted fills, and selected neutral states.
- **Graphite Ink** (`oklch(0.16 0.015 265)`): primary text and high-contrast icons.
- **Muted Ink** (`oklch(0.55 0.018 265)`): helper text, secondary copy, placeholders.
- **Hairline Border** (`oklch(0.915 0.008 265)`): dividers and control outlines.

### Named Rules
**The Accent Scarcity Rule.** Primary accent is reserved for action and focus states; neutral surfaces carry the rest of the UI.

**The Readability-First Rule.** Body and utility text must preserve WCAG AA contrast; muted text can be subtle, never faint.

## Typography

**Display Font:** Roboto Slab, Georgia, serif  
**Body Font:** Figtree, system-ui, sans-serif  
**Label/Mono Font:** Figtree for labels; Geist Mono for code-like/tabular contexts.

**Character:** Slab-serif headings add structure and confidence; sans body text preserves speed and legibility across dense operational content.

### Hierarchy
- **Display** (600, 2rem, 1.2): page-level headings such as dashboard section titles.
- **Headline** (600, 1.5rem, 1.3): major block titles and prominent card metrics.
- **Title** (600, 1rem, 1.4): card titles, row-level semantic labels.
- **Body** (400, 0.875rem, 1.5): default content and table copy.
- **Label** (500, 0.75rem, 1.3, +0.01em): compact metadata, chips, and supporting UI labels.

### Named Rules
**The Task-Flow Rule.** Typography hierarchy must support scan speed first; decorative contrast is prohibited in workflow-critical surfaces.

## Elevation

TaskFlow uses a flat-by-default elevation model with subtle structural depth. Most surfaces rely on tonal separation and hairline rings; shadows appear as lightweight feedback or container framing, not as expressive decoration.

### Shadow Vocabulary
- **Surface Lift** (`0 1px 2px hsl(0 0% 0% / 0.05)` equivalent to `shadow-xs`): default cards and controls.
- **Interactive Ring** (`ring: 3px` on focus with accent tint): primary accessibility and interaction depth cue.

### Named Rules
**The Flat-by-Default Rule.** Surfaces stay visually stable at rest; depth increases only to communicate interaction or grouping.

## Components

### Buttons
- **Shape:** softly rounded controls (`rounded-md`, ~0.7rem effective radius for core sizes).
- **Primary:** indigo fill with high-contrast light text, compact horizontal padding, and 2.25rem default height.
- **Hover / Focus:** hover darkens/mixes toward ink; focus uses visible ring + border treatment with AA-compliant contrast.
- **Secondary / Ghost / Outline:** neutral-first alternatives preserve hierarchy and avoid competing with the primary accent.

### Cards / Containers
- **Corner Style:** rounded-xl (~1.225rem) for main cards; rounded tops/bottoms preserved in nested media blocks.
- **Background:** white surface on neutral canvas with ink text.
- **Shadow Strategy:** subtle shadow + ring for structure, not spectacle.
- **Internal Padding:** tokenized card spacing, generally 1.5rem for default cards.

### Inputs / Fields
- **Style:** bordered neutral input (`border-input`) with transparent/light fill and compact horizontal padding.
- **Focus:** accent ring and border transition provide explicit keyboard-visible focus.
- **Error / Disabled:** destructive border/ring variants for invalid state; lowered opacity and disabled pointer behavior when inactive.

### Navigation
- **Sidebar:** neutral-toned panel with compact icon/text rows and active state tint.
- **Top Bar:** sticky, translucent background with subtle blur to preserve context during scroll.
- **State:** active route highlighting remains understated but unmistakable.

## Do's and Don'ts

### Do:
- **Do** keep screen structure scannable: heading, key metrics, recent activity, then detail tables.
- **Do** reserve the primary accent for actions, active routes, and focus indicators.
- **Do** keep component vocabulary consistent across all dashboard pages.
- **Do** maintain WCAG AA contrast for body text, placeholders, and status labels.
- **Do** use empty states to reduce ambiguity (never leave blocks visually unresolved).

### Don't:
- **Don't** build overloaded interfaces with a lot of infos.
- **Don't** apply decorative gradients, glassmorphism, or ornamental motion on task surfaces.
- **Don't** introduce multiple competing accent colors in the same workflow view.
- **Don't** weaken text contrast to achieve a “minimal” look.
- **Don't** create divergent button/input/nav styles between pages.
