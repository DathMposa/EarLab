# EarLab &mdash; Precision Aural Musicianship Platform

**EarLab** is a high-end, research-backed Progressive Web Application (PWA) designed for functional ear training and musical audiation. Built for both aspiring and professional musicians, EarLab emphasizes functional scale-degree tension, active vocal retrieval, and sample-accurate Web Audio synthesis within a light-mode architectural workstation.

---

## 🌟 Key Features

### 🎯 Independent 4-Track Progression Matrix (40 Levels)
* **Track A &bull; Degree Singing**: Sight-to-sound internal audiation and vocal retrieval.
* **Track B &bull; Degree Recognition**: Sound-to-degree functional recognition against a tonal center.
* **Track C &bull; Melodic Audiation**: Internalizing and vocalizing melodic phrases and contours.
* **Track D &bull; Melodic Dictation**: Transcribing multi-note phrases into scale degree sequences.

### 🧠 Cognitive & Visual Abstraction Layer
* **FlowGlyph**: Visual cognitive translation pipeline diagrams (`[#] ➔ 🧠 ➔ 🎙️`).
* **TonalConstellation**: Pitch vocabulary ribbons and rhythmic span meters.
* **TonalGravityCompass**: Interactive diatonic vector physics resolving tension tones (7➔1, 4➔3).
* **DiatonicMasteryMatrix**: 7-pillar architectural retention meters with direct audition.
* **ConfusionCrossTalk**: Auditory substitution vector graphics with instant A/B contrast comparisons.

### 🎛️ Audio Synthesis & Pitch Detection
* High-fidelity Studio Grand Piano samples with offline-after-first-download playback, plus warm EP fallback and calibrated pure reference tones.
* Continuous tonic drone and harmonic cadence generator (I-IV-V-I scaffolding).
* Live autocorrelation microphone pitch detector and cents intonation meter for singing tracks.

### 📱 Desktop Workstation & Native Mobile PWA
* Designed to fit `100vh` on desktop like a hardware instrument (Elektron / DAW inspired).
* Collapses seamlessly into a native mobile touch app with bottom navigation.
* Full offline support via Service Worker caching and Web App Manifest.
* 100% private local storage with JSON and CSV telemetry export/import.

---

## 🚀 Quick Start

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* `npm` or `yarn`

### Installation
```bash
# Clone the repository
git clone https://github.com/DathMposa/EarLab.git

# Navigate into the project
cd EarLab

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
```bash
npm run build
npm run start
```

---

## 🛠️ Tech Stack
* **Framework**: Next.js 15 (App Router, React 19)
* **Language**: TypeScript
* **Audio**: Web Audio API (Sample-accurate synthesis & continuous drone)
* **Styling**: Vanilla CSS Design System (Light Mode Studio theme)
* **PWA**: Custom Service Worker & Web App Manifest
* **Icons**: Lucide React

---

## 📄 License
MIT

## 🎹 Audio attribution

The bundled Studio Grand Piano is a reduced browser-ready subset of **Salamander Grand
Piano v3** by Alexander Holm, licensed under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/).
See [`public/audio/studio-grand/ATTRIBUTION.md`](public/audio/studio-grand/ATTRIBUTION.md).
