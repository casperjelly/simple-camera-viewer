# Simple Camera Viewer (Web Camera Accessibility Tool)

## Overview

Simple Camera Viewer is a lightweight web-based accessibility tool designed to assist users with reduced vision by enhancing the live camera image from a smartphone.

The viewer runs entirely in the web browser and can be installed to the device Home Screen, allowing it to behave like a simple standalone app.

It provides magnification, colour filtering, contrast enhancement, and an optional freeze/share workflow.

---

# Core Features

## Camera Viewer

Uses the device rear camera to display a full-screen live view.

Features:

- Automatic rear camera selection
- 24fps capture for improved battery life
- Full screen display
- No recording of video
- Frozen images are temporary unless the user explicitly shares them
- Optional torch (flashlight) support on compatible devices

---

## Freeze and Share

The viewer can freeze the current enhanced view so it can be inspected without holding the camera steady.

The frozen image is designed to match the live on-screen view, including:

- current zoom level
- display mode
- contrast setting
- adaptive brightness

While frozen, the live camera is paused and a **Share** button appears.

Sharing uses the browser/device share sheet when supported. Images are not automatically uploaded or saved by the app.

---

## Zoom Control

The viewer provides 11 zoom levels:

0–10

Zoom buttons appear as a horizontal bar of square buttons.

Selecting a level enlarges the camera view proportionally.

Audio confirmation is provided, for example:

"Zoom 4"

---

## Display Modes

Three viewing modes are available via dropdown.

| Mode | Description |
|-----|-------------|
| Default | Normal camera view |
| Invert | Colour inversion |
| Mono | Grayscale view |

Each mode provides spoken feedback when selected.

---

## Contrast Enhancement

A **Contrast** toggle boosts contrast dramatically to improve visibility of:

- text
- signage
- edges
- high contrast objects

This enhancement works with all display modes.

---

## Adaptive Brightness

The viewer automatically boosts brightness in low light conditions.

A small sampled region of the video frame is analysed periodically to adjust brightness dynamically.

This improves visibility while minimising CPU load.

---

## Torch

A **Torch** toggle enables the device flashlight when supported.

This can improve visibility in low-light environments and works alongside zoom and contrast features.

---

## Voice Feedback

The viewer uses the device speech synthesis engine to provide audio confirmation for key actions.

Examples include:

- Camera ready
- Zoom level changes
- Mode changes
- Contrast toggle
- Torch toggle
- Image frozen
- Image unfrozen
- Share pressed
- Reload countdown
- Camera stopped

Audio feedback can be enabled or disabled using the **Audio** toggle.

---

## Hidden Interface

To maximise screen space, the interface remains hidden until the screen is tapped.

A tap reveals:

- OPTIONS button
- INFO button
- FREEZE button

The SHARE button appears only after the view has been frozen.

---

## Options Panel

The Options panel provides:

- Audio toggle
- Torch toggle
- Zoom controls
- Contrast toggle
- Mode selector
- Reload button

---

## Info Panel

The Info panel provides a description of the viewer and an important safety notice.

The panel is vertically centred for easy reading and scrollable on smaller screens.

---

## Safety Disclaimer

The viewer is intended only as a visual enhancement aid.

It is **not designed or certified as a mobility aid** and must not be relied upon for:

- crossing roads
- navigation
- obstacle avoidance
- any safety-critical activity

Users should continue to rely on appropriate mobility aids and assistance where required.

---

## Performance Considerations

Continuous camera usage increases power consumption.

The viewer includes optimisations to reduce heat and battery usage:

- reduced camera frame rate (24fps)
- GPU-accelerated visual filters
- low-resolution brightness sampling
- reduced brightness analysis frequency
- camera paused while menus, information, or a frozen image are open

---

## Accessibility Design

The interface is designed with visually impaired users in mind.

Design principles include:

- no black text on white backgrounds
- large touch targets
- high colour contrast
- minimal interface clutter
- audible feedback
- simplified toggle-based controls (no fine sliders)
- bright controls in both on and off states
- strong white ring to indicate enabled toggle states
- heavy button shadows to improve visibility over the camera image

---

## Installation

The viewer can be added to the device Home Screen using the browser **Add to Home Screen** feature.

This allows it to launch like a simple standalone application.
