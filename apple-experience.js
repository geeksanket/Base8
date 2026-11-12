/**
 * Base8 // NASA Space Apps Challenge 2026
 * Apple-Level Interactive Science Experience — Scroll Engine & Geometry Sandbox
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // Web Audio Synthesizer (Zero Dependencies)
  // --------------------------------------------------------------------------
  let audioCtx = null;
  let soundEnabled = true;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, duration, type = 'sine', gainVal = 0.12) {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }

  function playLaserSound() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.24);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.24);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.24);
    } catch (e) {}
  }

  function playSnapSound() {
    playTone(587.33, 0.08, 'sine', 0.15); // D5
    setTimeout(() => playTone(880, 0.12, 'sine', 0.15), 50); // A5
  }

  function playVictoryFanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => playTone(freq, 0.35, 'sine', 0.22), idx * 90);
    });
  }

  window.toggleAudio = function () {
    soundEnabled = !soundEnabled;
    const btn = document.getElementById('navAudioToggle');
    if (btn) btn.textContent = soundEnabled ? 'Audio: ON' : 'Audio: OFF';
    if (soundEnabled) playSnapSound();
  };

  // --------------------------------------------------------------------------
  // Atmospheric Particle Canvas (Mars Dust & Distant Stars)
  // --------------------------------------------------------------------------
  function initParticleCanvas() {
    const canvas = document.getElementById('mars-particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = Math.min(80, Math.floor(window.innerWidth / 16));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.4 + 0.4,
        alpha: Math.random() * 0.4 + 0.1,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: -Math.random() * 0.25 - 0.05,
        color: Math.random() > 0.4 ? 'rgba(224, 90, 54,' : 'rgba(245, 245, 247,'
      });
    }

    let lastScrollY = window.scrollY;

    function render() {
      ctx.clearRect(0, 0, width, height);
      const scrollDiff = (window.scrollY - lastScrollY) * 0.15;
      lastScrollY = window.scrollY;

      for (let p of particles) {
        p.x += p.speedX;
        p.y += p.speedY - scrollDiff;

        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ')';
        ctx.fill();
      }
      requestAnimationFrame(render);
    }
    render();
  }

  // --------------------------------------------------------------------------
  // Sticky Storytelling Geometry Canvas (Driven by Scroll)
  // --------------------------------------------------------------------------
  const stickyState = {
    mode: 'dilemma', // 'dilemma', 'abstraction', 'three-sides', 'tangent'
    baseKm: 24.0,
    heightKm: 18.0
  };

  function updateStickyVisualizer() {
    const rad = Math.atan2(stickyState.heightKm, stickyState.baseKm);
    const deg = (rad * 180) / Math.PI;
    const slantKm = Math.sqrt((stickyState.baseKm * stickyState.baseKm) + (stickyState.heightKm * stickyState.heightKm));
    const tanRatio = Math.tan(rad);

    // Coordinate mapping (viewBox="0 0 640 440")
    const groundY = 350;
    const summitX = 490;
    const pxPerKmX = 13.5;
    const pxPerKmY = 8.5;

    const roverX = Math.max(60, summitX - (stickyState.baseKm * pxPerKmX));
    const summitY = Math.max(60, groundY - (stickyState.heightKm * pxPerKmY));

    // Mountain Polygon
    const mountainPoly = document.getElementById('stickyMountainPoly');
    if (mountainPoly) {
      mountainPoly.setAttribute('points', `${summitX},${summitY} 610,${groundY} ${Math.max(20, roverX - 40)},${groundY}`);
    }

    // Laser Line
    const laser = document.getElementById('stickyLaserLine');
    if (laser) {
      laser.setAttribute('x1', roverX + 24);
      laser.setAttribute('y1', groundY - 20);
      laser.setAttribute('x2', summitX);
      laser.setAttribute('y2', summitY);
    }

    // Summit Marker
    const summitMarker = document.getElementById('stickySummitMarker');
    if (summitMarker) {
      summitMarker.setAttribute('cx', summitX);
      summitMarker.setAttribute('cy', summitY);
    }

    // Rover Group
    const roverGroup = document.getElementById('stickyRoverGroup');
    if (roverGroup) {
      roverGroup.setAttribute('transform', `translate(${roverX}, ${groundY - 32})`);
    }

    // Ground Line
    const groundLine = document.getElementById('stickyGroundLine');
    if (groundLine) {
      groundLine.setAttribute('x1', roverX + 20);
      groundLine.setAttribute('x2', summitX);
    }

    // Vertical Height Line
    const heightLine = document.getElementById('stickyHeightLine');
    if (heightLine) {
      heightLine.setAttribute('x1', summitX);
      heightLine.setAttribute('y1', summitY);
      heightLine.setAttribute('x2', summitX);
      heightLine.setAttribute('y2', groundY);
    }

    // Angle text
    const angleText = document.getElementById('stickyAngleText');
    if (angleText) {
      angleText.setAttribute('x', roverX + 50);
      angleText.setAttribute('y', groundY - 8);
      angleText.textContent = `θ = ${deg.toFixed(1)}°`;
    }

    // HUD overlays
    const hudAngle = document.getElementById('stickyHudAngle');
    if (hudAngle) hudAngle.textContent = `${deg.toFixed(1)}°`;

    const hudHeight = document.getElementById('stickyHudHeight');
    if (hudHeight) {
      hudHeight.textContent = stickyState.mode === 'dilemma' ? 'Unknown (?)' : `${stickyState.heightKm.toFixed(1)} km`;
    }

    const hudBase = document.getElementById('stickyHudBase');
    if (hudBase) hudBase.textContent = `${stickyState.baseKm.toFixed(1)} km`;

    // Dynamic View Modes based on scroll chapter
    const geoMesh = document.getElementById('stickyGeoMesh');
    const rightCorner = document.getElementById('stickyRightCorner');
    const threeSidesCallouts = document.getElementById('stickyThreeSidesCallouts');

    if (stickyState.mode === 'dilemma') {
      if (geoMesh) geoMesh.style.opacity = '0';
      if (rightCorner) rightCorner.style.opacity = '0.3';
      if (threeSidesCallouts) threeSidesCallouts.style.opacity = '0';
    } else if (stickyState.mode === 'abstraction') {
      if (geoMesh) geoMesh.style.opacity = '1';
      if (rightCorner) rightCorner.style.opacity = '1';
      if (threeSidesCallouts) threeSidesCallouts.style.opacity = '0';
    } else if (stickyState.mode === 'three-sides' || stickyState.mode === 'tangent') {
      if (geoMesh) geoMesh.style.opacity = '1';
      if (rightCorner) rightCorner.style.opacity = '1';
      if (threeSidesCallouts) threeSidesCallouts.style.opacity = '1';
    }
  }

  // --------------------------------------------------------------------------
  // Scroll-Driven Narrative Controller
  // --------------------------------------------------------------------------
  function initScrollStory() {
    const chapters = document.querySelectorAll('.story-chapter');
    if (!chapters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            chapters.forEach((c) => c.classList.remove('active'));
            entry.target.classList.add('active');

            const step = entry.target.getAttribute('data-chapter');
            if (step === 'dilemma') {
              stickyState.mode = 'dilemma';
              stickyState.baseKm = 24.0;
              stickyState.heightKm = 18.0;
            } else if (step === 'abstraction') {
              stickyState.mode = 'abstraction';
              stickyState.baseKm = 24.0;
              stickyState.heightKm = 18.0;
              playSnapSound();
            } else if (step === 'three-sides') {
              stickyState.mode = 'three-sides';
              stickyState.baseKm = 24.0;
              stickyState.heightKm = 18.0;
            } else if (step === 'tangent') {
              stickyState.mode = 'tangent';
              stickyState.baseKm = 24.0;
              stickyState.heightKm = 18.0;
            }
            updateStickyVisualizer();
          }
        });
      },
      { threshold: 0.55 }
    );

    chapters.forEach((c) => observer.observe(c));
  }

  // Interactive Chapter 1 Laser Fire
  window.triggerChapterLaser = function () {
    playLaserSound();
    const laser = document.getElementById('stickyLaserLine');
    if (laser) {
      laser.style.stroke = '#64d2ff';
      laser.style.strokeWidth = '5';
      laser.style.filter = 'drop-shadow(0 0 12px #2997ff)';
      setTimeout(() => {
        laser.style.stroke = '#2997ff';
        laser.style.strokeWidth = '3';
        laser.style.filter = 'none';
      }, 700);
    }
  };

  // Interactive Chapter 2 Plumb Line Test
  window.triggerPlumbTest = function () {
    playSnapSound();
    const plumb = document.getElementById('stickyPlumbLine');
    if (plumb) {
      plumb.style.opacity = '1';
      setTimeout(() => { plumb.style.opacity = '0'; }, 900);
    }
  };

  // --------------------------------------------------------------------------
  // Full-Width Interactive Sandbox (Direct User Manipulation)
  // --------------------------------------------------------------------------
  let sandboxBaseKm = 24.0;
  let sandboxHeightKm = 18.0;

  function updateSandboxGeometry() {
    const rad = Math.atan2(sandboxHeightKm, sandboxBaseKm);
    const deg = (rad * 180) / Math.PI;
    const tanRatio = Math.tan(rad);

    // Range slider sync
    const slider = document.getElementById('sandboxAngleSlider');
    if (slider) slider.value = deg.toFixed(1);

    const readout = document.getElementById('sandboxAngleReadout');
    if (readout) readout.textContent = `θ = ${deg.toFixed(1)}°`;

    // Coordinates (viewBox="0 0 760 420")
    const groundY = 340;
    const summitX = 570;
    const scaleX = 15.5;
    const scaleY = 8.5;

    const roverX = Math.max(60, Math.min(summitX - 90, summitX - (sandboxBaseKm * scaleX)));
    const summitY = Math.max(50, Math.min(280, groundY - (sandboxHeightKm * scaleY)));

    // Update Mountain
    const mountain = document.getElementById('sbMountainPoly');
    if (mountain) {
      mountain.setAttribute('points', `${summitX},${summitY} 720,${groundY} ${Math.max(30, roverX - 50)},${groundY}`);
    }

    // Laser Line
    const laser = document.getElementById('sbLaserLine');
    if (laser) {
      laser.setAttribute('x1', roverX + 28);
      laser.setAttribute('y1', groundY - 22);
      laser.setAttribute('x2', summitX);
      laser.setAttribute('y2', summitY);
    }

    // Summit Handles
    const summitPoint = document.getElementById('sbSummitPoint');
    if (summitPoint) {
      summitPoint.setAttribute('cx', summitX);
      summitPoint.setAttribute('cy', summitY);
    }
    const summitHandle = document.getElementById('sbSummitHandle');
    if (summitHandle) {
      summitHandle.setAttribute('cx', summitX);
      summitHandle.setAttribute('cy', summitY);
    }

    // Rover Group
    const roverGroup = document.getElementById('sbRoverGroup');
    if (roverGroup) {
      roverGroup.setAttribute('transform', `translate(${roverX}, ${groundY - 36})`);
    }

    // Measurement lines
    const groundLine = document.getElementById('sbGroundLine');
    if (groundLine) {
      groundLine.setAttribute('x1', roverX + 20);
      groundLine.setAttribute('x2', summitX);
    }
    const groundText = document.getElementById('sbGroundText');
    if (groundText) {
      groundText.setAttribute('x', (roverX + 20 + summitX) / 2);
      groundText.textContent = `Distance = ${sandboxBaseKm.toFixed(1)} km`;
    }

    const heightLine = document.getElementById('sbHeightLine');
    if (heightLine) {
      heightLine.setAttribute('x1', summitX);
      heightLine.setAttribute('y1', summitY);
      heightLine.setAttribute('x2', summitX);
      heightLine.setAttribute('y2', groundY);
    }
    const heightText = document.getElementById('sbHeightText');
    if (heightText) {
      heightText.setAttribute('y', (summitY + groundY) / 2);
      heightText.textContent = `Height = ${sandboxHeightKm.toFixed(1)} km`;
    }

    // Formula equation box
    const formulaEquation = document.getElementById('sbFormulaEquation');
    if (formulaEquation) {
      formulaEquation.innerHTML = `Height = Distance × tan(θ) = ${sandboxBaseKm.toFixed(1)} km × tan(${deg.toFixed(1)}°) = ${sandboxBaseKm.toFixed(1)} × ${tanRatio.toFixed(3)} = <strong>${sandboxHeightKm.toFixed(1)} km</strong>`;
    }
  }

  // Dragging event listeners for Sandbox Canvas
  function initSandboxDrag() {
    const svg = document.getElementById('sbInteractiveSvg');
    if (!svg) return;

    let draggingSummit = false;
    let draggingRover = false;

    function getPoint(e) {
      const pt = svg.createSVGPoint();
      if (e.touches && e.touches.length > 0) {
        pt.x = e.touches[0].clientX;
        pt.y = e.touches[0].clientY;
      } else {
        pt.x = e.clientX;
        pt.y = e.clientY;
      }
      return pt.matrixTransform(svg.getScreenCTM().inverse());
    }

    function onStart(e) {
      const target = e.target;
      if (target.id === 'sbSummitHandle' || target.id === 'sbSummitPoint') {
        draggingSummit = true;
        e.preventDefault();
      } else if (target.closest && target.closest('#sbRoverGroup')) {
        draggingRover = true;
        e.preventDefault();
      }
    }

    function onMove(e) {
      if (!draggingSummit && !draggingRover) return;
      e.preventDefault();
      const pt = getPoint(e);

      if (draggingSummit) {
        const clampedY = Math.max(50, Math.min(280, pt.y));
        sandboxHeightKm = (340 - clampedY) / 8.5;
        updateSandboxGeometry();
      } else if (draggingRover) {
        const clampedX = Math.max(60, Math.min(480, pt.x));
        sandboxBaseKm = (570 - clampedX) / 15.5;
        updateSandboxGeometry();
      }
    }

    function onEnd() {
      if (draggingSummit || draggingRover) {
        playSnapSound();
        draggingSummit = false;
        draggingRover = false;
      }
    }

    svg.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    svg.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  }

  // Slider change
  window.onSandboxSliderInput = function (val) {
    const deg = parseFloat(val);
    const rad = (deg * Math.PI) / 180;
    sandboxHeightKm = parseFloat((sandboxBaseKm * Math.tan(rad)).toFixed(1));
    updateSandboxGeometry();
  };

  // Preset buttons
  window.setSandboxPreset = function (deg, el) {
    playSnapSound();
    document.querySelectorAll('.sandbox-preset-btn').forEach((b) => b.classList.remove('active'));
    if (el) el.classList.add('active');

    const rad = (deg * Math.PI) / 180;
    sandboxBaseKm = 24.0;
    sandboxHeightKm = parseFloat((24.0 * Math.tan(rad)).toFixed(1));
    updateSandboxGeometry();
  };

  // --------------------------------------------------------------------------
  // Tactile Model Builder (Stage 3)
  // --------------------------------------------------------------------------
  let selectedTactile = null;
  const tactileSlots = {
    'slot-base': { expected: 'BASE', placed: false },
    'slot-slant': { expected: 'SLANT SIDE', placed: false },
    'slot-height': { expected: 'HEIGHT', placed: false }
  };

  window.selectTactileBadge = function (label, el) {
    if (el.classList.contains('placed')) return;
    playSnapSound();
    document.querySelectorAll('.tactile-badge').forEach((b) => b.classList.remove('active-selected'));
    selectedTactile = label;
    el.classList.add('active-selected');
  };

  window.handleTactileSlotClick = function (slotId) {
    if (!selectedTactile) return;
    const slot = tactileSlots[slotId];
    if (!slot) return;

    if (slot.expected === selectedTactile) {
      playSnapSound();
      slot.placed = true;

      const slotText = document.getElementById(`${slotId}-text`);
      const slotBox = document.getElementById(`${slotId}-box`);
      if (slotText) {
        slotText.textContent = `✓ ${selectedTactile}`;
        slotText.setAttribute('fill', '#ffffff');
      }
      if (slotBox) {
        slotBox.setAttribute('stroke', '#30d158');
        slotBox.setAttribute('fill', 'rgba(48, 209, 88, 0.25)');
      }

      const badge = document.getElementById(`badge-${selectedTactile.replace(/\s+/g, '-').toLowerCase()}`);
      if (badge) {
        badge.classList.remove('active-selected');
        badge.classList.add('placed');
        badge.textContent = `✓ ${selectedTactile}`;
      }

      selectedTactile = null;

      const allPlaced = Object.values(tactileSlots).every((s) => s.placed);
      if (allPlaced) {
        playVictoryFanfare();
        const toast = document.getElementById('tactileSuccessBanner');
        if (toast) toast.style.display = 'block';
      }
    } else {
      playTone(180, 0.2, 'sawtooth', 0.15);
    }
  };

  // --------------------------------------------------------------------------
  // Final Challenge Verification (Stage 5)
  // --------------------------------------------------------------------------
  window.toggleFinalHint = function () {
    playSnapSound();
    const hint = document.getElementById('finalMissionHint');
    if (hint) {
      hint.style.display = (hint.style.display === 'none' || !hint.style.display) ? 'block' : 'none';
    }
  };

  window.verifyFinalMission = function () {
    const input = document.getElementById('finalMissionInput');
    if (!input) return;

    const val = parseFloat(input.value.trim().replace(/[^\d.]/g, ''));
    const banner = document.getElementById('missionSuccessBanner');
    const errorMsg = document.getElementById('missionErrorMsg');

    if (val === 18 || (val >= 17.8 && val <= 18.2) || val === 18000) {
      playVictoryFanfare();
      if (errorMsg) errorMsg.style.display = 'none';
      if (banner) banner.classList.add('active');

      // Trigger orbital transmission beam in sticky viewer
      const beam = document.getElementById('stickyOrbitalBeam');
      if (beam) {
        beam.style.display = 'block';
        beam.style.opacity = '1';
      }
    } else {
      playTone(180, 0.25, 'sawtooth', 0.18);
      if (errorMsg) {
        errorMsg.style.display = 'block';
        errorMsg.innerHTML = 'Precision mismatch: Use the formula <strong>Height = 24 km × tan(36.87°)</strong>. Since tan(36.87°) ≈ 0.75, calculate 24 × 0.75.';
      }
    }
  };

  // --------------------------------------------------------------------------
  // Experience Gateway: Launch & Exit Controls
  // --------------------------------------------------------------------------
  window.launchAppleExperience = function () {
    const flowContainer = document.querySelector('.flow-container');
    if (flowContainer) flowContainer.style.display = 'none';

    const wrapper = document.getElementById('appleExperienceWrapper');
    if (wrapper) {
      wrapper.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Refresh geometric calculations once visible
    updateStickyVisualizer();
    updateSandboxGeometry();
    window.history.pushState({ view: 'apple-experience' }, '', '#geometry');
  };

  window.exitAppleExperience = function () {
    const wrapper = document.getElementById('appleExperienceWrapper');
    if (wrapper) {
      wrapper.style.display = 'none';
    }

    const flowContainer = document.querySelector('.flow-container');
    if (flowContainer) {
      flowContainer.style.display = 'flex';
    }

    if (typeof goToStep === 'function') {
      goToStep(5, true);
    }
  };

  // --------------------------------------------------------------------------
  // Initialization
  // --------------------------------------------------------------------------
  window.addEventListener('DOMContentLoaded', () => {
    initParticleCanvas();
    updateStickyVisualizer();
    initScrollStory();
    updateSandboxGeometry();
    initSandboxDrag();

    // Check if directly landing on geometry experience via hash
    if (
      window.location.hash === '#geometry' ||
      window.location.hash.startsWith('#dilemma') ||
      window.location.hash === '#sandbox' ||
      window.location.hash.startsWith('#trig')
    ) {
      window.launchAppleExperience();
    }
  });
})();
