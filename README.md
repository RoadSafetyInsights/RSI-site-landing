# RoadSafetyInsights (RSI) | Landing Page

## Overview
A cinematic, high-performance landing page for **RoadSafetyInsights (RSI)**, an early-access application that maps dangerous road segments and provides real-time alerts to drivers, rental fleets, insurance companies, and the public sector based on real accident data.

## Features
*   **Abyssal Dark Theme:** Built strictly on the *Auros Design System*, utilizing a deep-water color palette (`Liquid Abyss`, `Liquid Kelp`) without reliance on drop-shadows or glassmorphism.
*   **WebGL Background Animation:** Features a highly optimized, interactive 3D background (`SlicedWaves`) powered by the OGL library.
*   **Kinetic Typography:** Scroll-triggered `IntersectionObserver` animations that reveal text with aggressive negative tracking and blur-to-focus effects.
*   **Responsive Layout:** Fully fluid CSS grid and flexbox architecture that scales gracefully from ultra-wide desktop monitors down to mobile devices.
*   **Serverless Forms:** Integrated with Netlify Forms for seamless lead generation (Drivers & Businesses).
*   **Cookie Consent:** Custom, GDPR-compliant cookie banner with `localStorage` state management.

## Tech Stack
*   **HTML5** (Semantic structuring)
*   **CSS3** (Custom properties, CSS Grid/Flexbox, Auros Design System tokens)
*   **Vanilla JavaScript (ES6+)** (Intersection Observers, DOM manipulation, Module imports)
*   **OGL (WebGL)** (Lightweight 3D rendering for the background)
*   **Netlify** (Hosting & Form handling)

## Local Development (Important)

Because this project uses ES6 Modules (`<script type="module">`) to import the WebGL library from an external CDN, **you cannot open the `index.html` file directly from your file explorer** (e.g., `file:///C:/...`). Your browser will block the scripts due to strict CORS security policies.

*Managed by [Marios Grivas](https://github.com/mgr1vas) CIO, Lead Developer*
