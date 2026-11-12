# AstroLearn // NASA Exploration Deck 🚀
**Interactive Mathematics & Physics Learning Web Application**

An advanced, NASA Mission-Control themed educational web platform built for space-science hackathons. AstroLearn transforms classroom mathematics and physics into an interactive deep space mission using real-world orbital mechanics, differential calculus, and Einstein's relativity.

---

## 🌟 Key Features

### 1. NASA Mission Control Visual Identity
- **Cosmic Deep Space Palette**: Dark midnight obsidian (`#030712`), deep space navy (`#080D1A`), electric cyan (`#00F0FF`), quantum purple (`#8B5CF6`), orbital emerald (`#10B981`), and NASA red (`#FC3D21`).
- **Glassmorphic HUD Panels**: High-tech telemetry borders, glowing corner indicators, coordinate grids, and live UTC flight clock.
- **Dynamic Particle Starfield**: Twinkling background starfield with interactive mouse parallax and orbital dust drift.
- **Synthesized Web Audio SFX**: Authentic sci-fi mission audio (HUD clicks, telemetry chirps, celebration chimes) generated purely via the browser's native **Web Audio API** (zero external sound files needed).

---

### 2. High-Performance Interactive Simulations

#### 🛰️ Module 01: Trigonometry & Orbital Mechanics (`TrigonometrySim`)
* **Real-time Vector Decompositions**: Visualizes polar coordinates $(r, \theta)$ decomposing dynamically into Cartesian coordinates $x = r \cos(\theta)$ (cyan) and $y = r \sin(\theta)$ (magenta).
* **Live Oscillogram Chart**: Synchronous real-time rolling sine and cosine wave graphs mapping the spacecraft's orbital anomaly.
* **Interactive Parameters**:
  - Orbital Radius ($r$: 70 to 250 km)
  - Orbital Angular Velocity ($\omega$: 0.005 to 0.050 rad/s)
  - Celestial Body Mass (Mars $0.5 M_\oplus$, Earth $1.0 M_\oplus$, Supermassive Black Hole)
  - Interactive canvas drag: Click or drag on the viewport to place the spacecraft into orbit!
* **Mission Challenge**: Inject the spacecraft into the glowing target geosynchronous orbit corridor ($r \approx 210\text{ km}$).

#### 🚀 Module 02: Differential & Integral Calculus (`CalculusSim`)
* **Dual-View Calculus Deck**:
  - **Rocket Ascent View**: Visual rocket launching through atmospheric strata with engine exhaust plume and staging.
  - **Calculus Curves**: Plots altitude $h(t)$, velocity derivative $v(t) = \frac{dh}{dt}$, and acceleration $a(t) = \frac{dv}{dt}$.
* **Interactive Tangent Scrubber**:
  - Scrub time $t \in [0, 60]s$ to reveal the instantaneous derivative tangent slope line on the altitude curve.
  - Visualizes the definite Riemann integral as the shaded area under the velocity curve: $h(t) = \int_0^t v(u) du$.
* **Interactive Parameters**:
  - Engine Thrust ($F$: 600 to 2200 kN)
  - Propellant Burn Rate ($\dot{m}$: 400 to 1200 kg/s)
  - Booster Staging (demonstrates mathematical discontinuities in derivatives!)
* **Mission Challenge**: Achieve escape velocity threshold ($v \ge 7.8\text{ km/s}$) before burnout.

#### 🌌 Module 03: Theory of Relativity (`RelativitySim`)
* **Dual-Mode Visualizer**:
  - **Mode A: Relativistic Light Clock & Time Dilation**: Compares an Earth stationary observatory clock with a moving starship photon clock. As speed $v \to c$, light travels a diagonal zigzag hypotenuse, visually proving $\Delta t' = \gamma \Delta t$.
  - **Mode B: Spacetime Curvature & Gravitational Lensing**: 2.5D interactive spacetime rubber sheet warped by massive black holes and neutron stars, deflecting light rays via Einstein's lensing formula $\alpha = \frac{4GM}{c^2 b}$.
* **Interactive Parameters**:
  - Starship Velocity $\beta = v/c$ ($0.00c$ to $0.999c$) with quick presets ($0.5c$, $0.866c$ [$\gamma = 2.0$], $0.99c$).
  - Spacetime Warp Mass ($0.5$ to $6.0 M_\odot$).
* **Mission Challenge**: Set velocity such that a 4.37 light-year journey to Alpha Centauri takes $\le 2$ ship-years.

---

### 3. Faithful Mission Progress Kanban Board
* Faithfully replicates the provided reference screenshot:
  - **Status Columns**: `In progress`, `Not started`, and `Done` with counters and status pills.
  - **Initial Team Cards**:
    - *Theory of Relativity Research* (Gauri Choudhary · High Priority)
    - *Trigonometry Research* (Neel · High Priority)
    - *Interactive Website* (Sanket · High Priority)
    - *Debugging* (Neel · Low Priority)
    - *Calculus Research* (Viral Bobde 9e · High Priority)
    - *Brainstorming* (Neel, Viral, Gauri, tdarshana2005, Sanket · Done · 100%)
  - **Full Interactivity**:
    - HTML5 Drag-and-Drop between columns.
    - Card modal editor to tweak progress %, priority, and title.
    - `+ New Project` button to add custom tasks.
    - Automatic bidirectional sync: Completing simulations and quizzes automatically increments research card progress!
    - LocalStorage persistence across browser reloads.

---

### 4. NASA Open-Source Data Integration
* Direct integration with public NASA Open Data APIs (Astronomy Picture of the Day).
* Educational bridge connecting observational astronomy with trigonometric parallax and spectroscopy derivatives.
* Automatic offline SVG fallback in case of rate limits or lack of internet connectivity.

---

## 📁 File Structure

```
Base8/
├── index.html        # NASA HUD Exploration Deck Interface
├── style.css         # Glassmorphic UI, responsive grid, animations, HUD telemetry
├── simulations.js    # Canvas physics engines (Trig, Calculus, Relativity, Starfield)
├── kanban.js         # Progress board engine, drag-and-drop, LocalStorage manager
├── script.js         # App controller, Web Audio SFX synth, NASA API, Quiz engine
└── README.md         # Documentation & guide
```

---

## 🚀 How to Run

Double-click [`index.html`](file:///e:/base8/Base8/index.html) in any browser (Chrome, Edge, Firefox).
