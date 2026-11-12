/**
 * Base8 // NASA Space Apps Challenge 2026 — Trigonometry Mission Engine
 * DIRECT MANIPULATION & INTERACTIVE THEORY LAB
 */

(function () {
  // Web Audio Context for synthesized sound effects
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

  function playTone(freq, duration, type = 'sine', gainVal = 0.15) {
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
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.28);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } catch (e) {}
  }

  function playSnapSound() {
    playTone(520, 0.08, 'triangle', 0.2);
    setTimeout(() => playTone(680, 0.12, 'sine', 0.2), 40);
  }

  function playPlumbDropSound() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
      setTimeout(() => playTone(140, 0.15, 'sawtooth', 0.25), 320);
    } catch (e) {}
  }

  function playChime() {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      setTimeout(() => playTone(freq, 0.35, 'sine', 0.25), idx * 80);
    });
  }

  function playErrorSound() {
    playTone(180, 0.25, 'sawtooth', 0.18);
  }

  // Global Interactive Geometry State
  let simBaseKm = 24.0;
  let simHeightKm = 18.0;

  // DnD state for Stage 2
  let selectedLabel = null;
  const dndSlots = {
    'drop-base': { expected: 'BASE', placed: false },
    'drop-slant': { expected: 'SLANT SIDE', placed: false },
    'drop-height': { expected: 'HEIGHT', placed: false }
  };

  // Stage Navigation
  let currentTrigStage = 1;
  const totalTrigStages = 5;
  const stageCompleted = { 1: false, 2: false, 3: false, 4: false, 5: false };

  window.openTrigonometryMission = function (stage = 1) {
    const flowContainer = document.querySelector('.flow-container');
    if (flowContainer) flowContainer.style.display = 'none';

    const trigWrapper = document.getElementById('trigModule');
    if (trigWrapper) {
      trigWrapper.classList.add('active');
      trigWrapper.style.display = 'block';
    }

    showTrigStage(stage);
    window.history.pushState({ trigStage: stage }, '', `#trig-stage-${stage}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    getAudioContext();
  };

  window.closeTrigonometryMission = function () {
    const trigWrapper = document.getElementById('trigModule');
    if (trigWrapper) {
      trigWrapper.classList.remove('active');
      trigWrapper.style.display = 'none';
    }

    const flowContainer = document.querySelector('.flow-container');
    if (flowContainer) flowContainer.style.display = 'flex';

    if (typeof goToStep === 'function') {
      goToStep(5, true);
    }
  };

  window.showTrigStage = function (stageNum) {
    currentTrigStage = Math.max(1, Math.min(stageNum, totalTrigStages));

    for (let i = 1; i <= totalTrigStages; i++) {
      const card = document.getElementById(`trig-stage-${i}`);
      if (card) {
        if (i === currentTrigStage) card.classList.add('active');
        else card.classList.remove('active');
      }

      const pill = document.getElementById(`trig-pill-${i}`);
      if (pill) {
        pill.classList.remove('active');
        if (i === currentTrigStage) pill.classList.add('active');
        if (stageCompleted[i]) pill.classList.add('completed');
      }
    }

    if (currentTrigStage === 1) {
      updateStage1InteractiveGeometry();
    } else if (currentTrigStage === 4) {
      updateAngleSlider(36.9);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.nextTrigStage = function () {
    stageCompleted[currentTrigStage] = true;
    const currentPill = document.getElementById(`trig-pill-${currentTrigStage}`);
    if (currentPill) currentPill.classList.add('completed');

    if (currentTrigStage < totalTrigStages) {
      showTrigStage(currentTrigStage + 1);
      window.history.pushState({ trigStage: currentTrigStage }, '', `#trig-stage-${currentTrigStage}`);
    }
  };

  window.prevTrigStage = function () {
    if (currentTrigStage > 1) {
      showTrigStage(currentTrigStage - 1);
      window.history.pushState({ trigStage: currentTrigStage }, '', `#trig-stage-${currentTrigStage}`);
    } else {
      closeTrigonometryMission();
    }
  };

  window.toggleTrigSound = function () {
    soundEnabled = !soundEnabled;
    const btn = document.getElementById('trigSoundToggle');
    if (btn) btn.innerHTML = soundEnabled ? '🔊 SOUND: ON' : '🔇 SOUND: OFF';
    if (soundEnabled) playSnapSound();
  };

  // =========================================================================
  // STAGE 1: DIRECT MANIPULATION DRAG ENGINE (THEORY + MOVING VISUALS)
  // =========================================================================
  // Canvas coordinate constants:
  // Base ground line sits at y = 300px
  // Summit X is fixed at 580px
  // Base distance: 10km to 36km. Rover X is 580 - (baseKm * scaleX)
  // Height: 5km to 32km. Summit Y is 300 - (heightKm * scaleY)
  const GROUND_Y = 300;
  const SUMMIT_X = 580;
  const SCALE_X = 16.5; // px per km
  const SCALE_Y = 7.8;  // px per km

  function getRoverX() {
    return Math.max(80, Math.min(SUMMIT_X - 100, SUMMIT_X - (simBaseKm * SCALE_X)));
  }

  function getSummitY() {
    return Math.max(50, Math.min(260, GROUND_Y - (simHeightKm * SCALE_Y)));
  }

  function updateStage1InteractiveGeometry() {
    const roverX = getRoverX();
    const summitY = getSummitY();

    const rad = Math.atan2(simHeightKm, simBaseKm);
    const deg = (rad * 180) / Math.PI;
    const slantKm = Math.sqrt((simBaseKm * simBaseKm) + (simHeightKm * simHeightKm));
    const tanRatio = Math.tan(rad);

    // 1. Move Summit Point & Draggable Handle
    const summitHandle = document.getElementById('s1SummitHandle');
    if (summitHandle) {
      summitHandle.setAttribute('cx', SUMMIT_X);
      summitHandle.setAttribute('cy', summitY);
    }
    const summitMarker = document.getElementById('s1SummitPoint');
    if (summitMarker) {
      summitMarker.setAttribute('cx', SUMMIT_X);
      summitMarker.setAttribute('cy', summitY);
    }

    // 2. Mountain Silhouette Polygon
    const mountainPoly = document.getElementById('s1MountainPoly');
    if (mountainPoly) {
      mountainPoly.setAttribute('points', `${SUMMIT_X},${summitY} 730,${GROUND_Y} ${Math.max(40, roverX - 60)},${GROUND_Y}`);
    }

    // 3. Laser Beam Line
    const laser = document.getElementById('s1LaserLine');
    if (laser) {
      laser.setAttribute('x1', roverX + 28);
      laser.setAttribute('y1', GROUND_Y - 24);
      laser.setAttribute('x2', SUMMIT_X);
      laser.setAttribute('y2', summitY);
    }

    // 4. Rover Position
    const roverG = document.getElementById('s1RoverGroup');
    if (roverG) {
      roverG.setAttribute('transform', `translate(${roverX}, ${GROUND_Y - 38})`);
    }

    // 5. Ground Measurement Line
    const groundLine = document.getElementById('s1GroundLine');
    if (groundLine) {
      groundLine.setAttribute('x1', roverX + 20);
      groundLine.setAttribute('x2', SUMMIT_X);
    }
    const groundEnd1 = document.getElementById('s1GroundTick1');
    if (groundEnd1) groundEnd1.setAttribute('x1', roverX + 20);
    const groundEnd2 = document.getElementById('s1GroundTick2');
    if (groundEnd2) groundEnd2.setAttribute('x1', SUMMIT_X);
    const groundBadge = document.getElementById('s1GroundBadge');
    if (groundBadge) groundBadge.setAttribute('x', ((roverX + 20) + SUMMIT_X) / 2 - 95);
    const groundText = document.getElementById('s1GroundText');
    if (groundText) {
      groundText.setAttribute('x', ((roverX + 20) + SUMMIT_X) / 2);
      groundText.textContent = `BASE: ${simBaseKm.toFixed(1)} km`;
    }

    // 6. Vertical Height Line & Badge
    const heightLine = document.getElementById('s1HeightLine');
    if (heightLine) {
      heightLine.setAttribute('x1', SUMMIT_X);
      heightLine.setAttribute('y1', summitY);
      heightLine.setAttribute('x2', SUMMIT_X);
      heightLine.setAttribute('y2', GROUND_Y);
    }
    const heightBadge = document.getElementById('s1HeightBadge');
    if (heightBadge) heightBadge.setAttribute('y', ((summitY + GROUND_Y) / 2) - 14);
    const heightText = document.getElementById('s1HeightText');
    if (heightText) {
      heightText.setAttribute('y', ((summitY + GROUND_Y) / 2) + 4);
      heightText.textContent = `HEIGHT: ${simHeightKm.toFixed(1)} km`;
    }

    // 7. Angle Arc & Readout
    const angleText = document.getElementById('s1AngleText');
    if (angleText) {
      angleText.setAttribute('x', roverX + 54);
      angleText.setAttribute('y', GROUND_Y - 8);
      angleText.textContent = `θ = ${deg.toFixed(1)}°`;
    }

    // 8. Live Telemetry HUD Bar
    const hudBase = document.getElementById('hudValBase');
    if (hudBase) hudBase.textContent = `${simBaseKm.toFixed(1)} km`;
    const hudHeight = document.getElementById('hudValHeight');
    if (hudHeight) hudHeight.textContent = `${simHeightKm.toFixed(1)} km`;
    const hudSlant = document.getElementById('hudValSlant');
    if (hudSlant) hudSlant.textContent = `${slantKm.toFixed(1)} km`;
    const hudAngle = document.getElementById('hudValAngle');
    if (hudAngle) hudAngle.textContent = `${deg.toFixed(1)}°`;
    const hudTan = document.getElementById('hudValTan');
    if (hudTan) hudTan.textContent = tanRatio.toFixed(3);

    // 9. Live Step-by-Step Formula Readout
    const formulaMath = document.getElementById('s1FormulaMath');
    if (formulaMath) {
      formulaMath.innerHTML = `tan(${deg.toFixed(1)}°) = <span style="color:#f97316;">${simHeightKm.toFixed(1)} km</span> ÷ <span style="color:#10b981;">${simBaseKm.toFixed(1)} km</span> = <strong>${tanRatio.toFixed(3)}</strong> &nbsp;|&nbsp; Height = ${simBaseKm.toFixed(1)} × ${tanRatio.toFixed(3)} = <strong>${simHeightKm.toFixed(1)} km</strong>`;
    }

    // 10. Check for 45° Golden Ratio Discovery
    const balanceBanner = document.getElementById('s1BalanceBanner');
    if (balanceBanner) {
      if (Math.abs(simHeightKm - simBaseKm) < 0.7) {
        balanceBanner.style.display = 'flex';
        balanceBanner.innerHTML = `<span>✨ <strong>AHA! 45° GOLDEN BALANCE REACHED:</strong> Height (${simHeightKm.toFixed(1)} km) = Base (${simBaseKm.toFixed(1)} km)! Since tan(45°) = 1.0, the mountain height matches ground distance exactly!</span>`;
      } else {
        balanceBanner.style.display = 'none';
      }
    }
  }

  // Rover Chatter helper
  window.setRoverChatter = function(msg) {
    const el = document.getElementById('s1RoverChatterText');
    if (el) el.innerHTML = msg;
  };

  // 1. Fun Drop Plumb Line Demonstration
  window.dropPlumbLine = function() {
    playPlumbDropSound();
    const plumb = document.getElementById('s1PlumbLine');
    const cornerBox = document.getElementById('s1CornerBox');
    
    if (plumb) {
      plumb.style.display = 'block';
      plumb.style.stroke = '#00e5ff';
      plumb.style.strokeWidth = '4';
      setTimeout(() => {
        plumb.style.display = 'none';
      }, 900);
    }

    if (cornerBox) {
      cornerBox.style.stroke = '#00e5ff';
      cornerBox.style.strokeWidth = '3';
      setTimeout(() => {
        cornerBox.style.stroke = '#94a3b8';
        cornerBox.style.strokeWidth = '2';
      }, 900);
    }

    setRoverChatter('🪨 <em>*CLUNK!*</em> Plumb line hit the Martian soil! Mars gravity pulls straight down, creating a flawless <strong>90° right angle</strong>. That square corner is our mathematical anchor!');
  };

  // 2. Meet the 3 Sides Squad
  window.highlightSquadSide = function(side) {
    playSnapSound();
    if (side === 'base') {
      const gLine = document.getElementById('s1GroundLine');
      if (gLine) {
        gLine.style.stroke = '#34d399';
        gLine.style.strokeWidth = '6';
        setTimeout(() => { gLine.style.stroke = '#10b981'; gLine.style.strokeWidth = '3'; }, 700);
      }
      setRoverChatter('🏎️ <strong>ADJACENT (Base = ' + simBaseKm.toFixed(1) + ' km):</strong> That’s my odometer ground track! Flat, safe Martian dirt where my wheels can roll.');
    } else if (side === 'height') {
      const hLine = document.getElementById('s1HeightLine');
      if (hLine) {
        hLine.style.stroke = '#fb923c';
        hLine.style.strokeWidth = '6';
        setTimeout(() => { hLine.style.stroke = '#f97316'; hLine.style.strokeWidth = '3'; }, 700);
      }
      setRoverChatter('🧗 <strong>OPPOSITE (Height = ' + simHeightKm.toFixed(1) + ' km):</strong> Sheer vertical rockface! No rover could ever drive up that, which is why we calculate it with trigonometry.');
    } else if (side === 'slant') {
      playLaserSound();
      const laser = document.getElementById('s1LaserLine');
      if (laser) {
        laser.style.stroke = '#60a5fa';
        laser.style.strokeWidth = '6';
        setTimeout(() => { laser.style.stroke = '#2563eb'; laser.style.strokeWidth = '3'; }, 700);
      }
      setRoverChatter('⚡ <strong>HYPOTENUSE (Laser Slant = ' + Math.sqrt(simBaseKm*simBaseKm + simHeightKm*simHeightKm).toFixed(1) + ' km):</strong> Speed-of-light direct laser beam from my sensor turret straight to the summit!');
    }
  };

  // 3. The Tangent Elevator Angle Presets
  window.setMagicTangentAngle = function(angleDeg) {
    playSnapSound();
    const rad = (angleDeg * Math.PI) / 180;
    simBaseKm = 24.0;
    simHeightKm = parseFloat((24.0 * Math.tan(rad)).toFixed(1));
    updateStage1InteractiveGeometry();

    if (angleDeg < 15) {
      setRoverChatter('🥞 <strong>Flat Pancake Mountain (10°):</strong> Look how squished it is! When the angle is tiny, tan(10°) = 0.176, so Height is only ' + simHeightKm + ' km.');
    } else if (angleDeg >= 44 && angleDeg <= 46) {
      playChime();
      setRoverChatter('⚖️ <strong>THE GOLDEN 45° BALANCE:</strong> Mind blown! At 45°, Height = Base = 24.0 km! tan(45°) = 1.0. A perfect 1:1 proportion!');
    } else {
      setRoverChatter('🗼 <strong>Martian Space Skyscraper (60°):</strong> Whoa! When the angle tilts high, tan(60°) = 1.732. Height shoots up to ' + simHeightKm + ' km, almost double our ground distance!');
    }
  };

  // Direct Mouse / Touch Dragging on SVG
  let isDraggingSummit = false;
  let isDraggingRover = false;

  function initDragHandlers() {
    const svg = document.getElementById('s1InteractiveSvg');
    if (!svg) return;

    function getSvgPoint(evt) {
      const pt = svg.createSVGPoint();
      if (evt.touches && evt.touches.length > 0) {
        pt.x = evt.touches[0].clientX;
        pt.y = evt.touches[0].clientY;
      } else {
        pt.x = evt.clientX;
        pt.y = evt.clientY;
      }
      return pt.matrixTransform(svg.getScreenCTM().inverse());
    }

    function onPointerDown(e) {
      const target = e.target;
      if (target.id === 's1SummitHandle' || target.id === 's1SummitPoint') {
        isDraggingSummit = true;
        e.preventDefault();
      } else if (target.closest && target.closest('#s1RoverGroup')) {
        isDraggingRover = true;
        e.preventDefault();
      }
    }

    function onPointerMove(e) {
      if (!isDraggingSummit && !isDraggingRover) return;
      e.preventDefault();
      const p = getSvgPoint(e);

      if (isDraggingSummit) {
        // Dragging peak changes Height
        const clampedY = Math.max(50, Math.min(260, p.y));
        simHeightKm = (GROUND_Y - clampedY) / SCALE_Y;
        updateStage1InteractiveGeometry();
      } else if (isDraggingRover) {
        // Dragging rover changes Base
        const clampedX = Math.max(80, Math.min(SUMMIT_X - 100, p.x));
        simBaseKm = (SUMMIT_X - clampedX) / SCALE_X;
        updateStage1InteractiveGeometry();
      }
    }

    function onPointerUp() {
      if (isDraggingSummit || isDraggingRover) {
        playSnapSound();
        isDraggingSummit = false;
        isDraggingRover = false;
      }
    }

    svg.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    svg.addEventListener('touchstart', onPointerDown, { passive: false });
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);
  }

  // Pre-set helper buttons for the interactive lab
  window.setStage1Preset = function (base, height) {
    playSnapSound();
    simBaseKm = base;
    simHeightKm = height;
    updateStage1InteractiveGeometry();
  };

  window.fireStage1Laser = function () {
    playLaserSound();
    const laser = document.getElementById('s1LaserLine');
    if (laser) {
      laser.style.stroke = '#00e5ff';
      laser.style.strokeWidth = '5';
      laser.style.filter = 'drop-shadow(0 0 14px #00e5ff)';
      setTimeout(() => {
        laser.style.stroke = '#2563eb';
        laser.style.strokeWidth = '3';
        laser.style.filter = 'none';
      }, 700);
    }
  };

  // =========================================================================
  // STAGE 2: CONCEPT DISCOVERY (Meet the Triangle)
  // =========================================================================
  window.setStage2View = function (mode) {
    playSnapSound();
    const marsLayer = document.getElementById('stage2MarsLayer');
    const geoLayer = document.getElementById('stage2GeoLayer');
    const btnMars = document.getElementById('stage2BtnMars');
    const btnGeo = document.getElementById('stage2BtnGeo');

    if (mode === 'geo') {
      if (marsLayer) marsLayer.style.opacity = '0.08';
      if (geoLayer) geoLayer.style.opacity = '1';
      if (btnGeo) btnGeo.classList.add('active');
      if (btnMars) btnMars.classList.remove('active');
    } else {
      if (marsLayer) marsLayer.style.opacity = '1';
      if (geoLayer) geoLayer.style.opacity = '0.9';
      if (btnMars) btnMars.classList.add('active');
      if (btnGeo) btnGeo.classList.remove('active');
    }
  };

  window.answerStage2Quiz = function (choice, el) {
    const parent = el.parentElement;
    parent.querySelectorAll('.trig-quiz-opt').forEach(opt => opt.classList.remove('correct', 'incorrect'));

    if (choice === 'tangent') {
      el.classList.add('correct');
      playChime();
      const feedback = document.getElementById('stage2QuizFeedback');
      if (feedback) {
        feedback.innerHTML = '✨ <strong>Exact!</strong> In any right triangle, Tangent = Opposite (Height) ÷ Adjacent (Base). With Base = 24 km and θ = 36.87°, we can solve Height without taking a single step!';
        feedback.style.color = '#34d399';
      }
      stageCompleted[2] = true;
    } else {
      el.classList.add('incorrect');
      playErrorSound();
      const feedback = document.getElementById('stage2QuizFeedback');
      if (feedback) {
        feedback.innerHTML = '💡 Hint: The vertical elevation is Opposite the rover angle, and flat ground is Adjacent. Remember: tan(θ) = Opposite ÷ Adjacent!';
        feedback.style.color = '#f87171';
      }
    }
  };

  // =========================================================================
  // STAGE 3: TACTILE DISCOVERY (Build the Triangle)
  // =========================================================================
  window.selectDndBadge = function (labelName, el) {
    if (el.classList.contains('placed')) return;
    playSnapSound();

    document.querySelectorAll('.trig-draggable-badge').forEach(b => b.classList.remove('selected-for-drop'));
    selectedLabel = labelName;
    el.classList.add('selected-for-drop');

    const toast = document.getElementById('stage3Coaching');
    if (toast) {
      toast.style.display = 'block';
      toast.innerText = `[${labelName}] SELECTED — Now click the matching target slot on the triangle diagram!`;
    }
  };

  window.handleSlotClick = function (slotId) {
    if (!selectedLabel) {
      const toast = document.getElementById('stage3Coaching');
      if (toast) {
        toast.style.display = 'block';
        toast.innerText = '👆 Select one of the badges below first (SLANT SIDE, BASE, or HEIGHT), then click this slot.';
      }
      return;
    }
    placeLabelInSlot(selectedLabel, slotId);
  };

  function placeLabelInSlot(label, slotId) {
    const slotData = dndSlots[slotId];
    if (!slotData) return;

    const toast = document.getElementById('stage3Coaching');

    if (slotData.expected === label) {
      playSnapSound();
      slotData.placed = true;

      const slotText = document.getElementById(`${slotId}-text`);
      const slotBox = document.getElementById(`${slotId}-box`);
      if (slotText) {
        slotText.textContent = `✓ ${label}`;
        slotText.setAttribute('fill', '#ffffff');
      }
      if (slotBox) {
        if (label === 'BASE') {
          slotBox.setAttribute('fill', '#064e3b');
          slotBox.setAttribute('stroke', '#10b981');
        } else if (label === 'SLANT SIDE') {
          slotBox.setAttribute('fill', '#1e3a8a');
          slotBox.setAttribute('stroke', '#3b82f6');
        } else if (label === 'HEIGHT') {
          slotBox.setAttribute('fill', '#7c2d12');
          slotBox.setAttribute('stroke', '#f97316');
        }
      }

      const badge = document.getElementById(`badge-${label.replace(/\s+/g, '-').toLowerCase()}`);
      if (badge) {
        badge.classList.remove('selected-for-drop');
        badge.classList.add('placed');
        badge.innerHTML = `✓ ${label}`;
      }

      selectedLabel = null;
      if (toast) toast.style.display = 'none';

      const allDone = Object.values(dndSlots).every(s => s.placed);
      if (allDone) {
        playChime();
        stageCompleted[3] = true;
        const successCard = document.getElementById('stage3Success');
        if (successCard) successCard.style.display = 'block';
      }
    } else {
      playErrorSound();
      if (toast) {
        toast.style.display = 'block';
        if (slotId === 'drop-height') {
          toast.innerText = '⚠️ HEIGHT is the vertical elevation from the flat surface straight up to the peak.';
        } else if (slotId === 'drop-slant') {
          toast.innerText = '⚠️ SLANT SIDE is the hypotenuse laser line directly to the peak.';
        } else {
          toast.innerText = '⚠️ BASE is the flat ground distance (24 km) along the Martian surface.';
        }
      }
    }
  }

  // =========================================================================
  // STAGE 4: ANGLE SLIDER LAB & PRESETS
  // =========================================================================
  window.onAngleSliderChange = function (val) {
    updateAngleSlider(parseFloat(val));
  };

  window.setAnglePreset = function (angle, presetIndex) {
    playSnapSound();
    document.querySelectorAll('.trig-preset-card').forEach(c => c.classList.remove('active'));
    const targetCard = document.getElementById(`presetCard${presetIndex}`);
    if (targetCard) targetCard.classList.add('active');

    const slider = document.getElementById('trigAngleRange');
    if (slider) slider.value = angle;

    updateAngleSlider(angle);
  };

  function updateAngleSlider(angleDeg) {
    const angleRad = (angleDeg * Math.PI) / 180;
    const baseKm = 24.0;
    const heightKm = baseKm * Math.tan(angleRad);
    const tanVal = Math.tan(angleRad);

    const readout = document.getElementById('trigAngleReadout');
    if (readout) readout.textContent = `θ = ${angleDeg.toFixed(1)}°`;

    const formulaReadout = document.getElementById('stage4Formula');
    if (formulaReadout) {
      formulaReadout.innerHTML = `Height = Base × tan(θ) = 24 km × tan(${angleDeg.toFixed(1)}°) = 24 × ${tanVal.toFixed(2)} = <strong>${heightKm.toFixed(1)} km</strong>`;
    }

    const pxPerKm = 8.5;
    const baseY = 300;
    const roverX = 140;
    const summitX = 580;
    const dynamicPeakY = Math.max(50, baseY - (heightKm * pxPerKm));

    const mountainPoly = document.getElementById('stage4MountainPoly');
    if (mountainPoly) {
      mountainPoly.setAttribute('points', `${summitX},${dynamicPeakY} 710,${baseY} 260,${baseY}`);
    }
    const laserLine = document.getElementById('stage4LaserLine');
    if (laserLine) {
      laserLine.setAttribute('x1', roverX + 28);
      laserLine.setAttribute('y1', baseY - 24);
      laserLine.setAttribute('x2', summitX);
      laserLine.setAttribute('y2', dynamicPeakY);
    }
    const heightLine = document.getElementById('stage4HeightLine');
    if (heightLine) {
      heightLine.setAttribute('x1', summitX);
      heightLine.setAttribute('y1', dynamicPeakY);
      heightLine.setAttribute('x2', summitX);
      heightLine.setAttribute('y2', baseY);
    }
    const peakMarker = document.getElementById('stage4PeakMarker');
    if (peakMarker) {
      peakMarker.setAttribute('cx', summitX);
      peakMarker.setAttribute('cy', dynamicPeakY);
    }
    const heightTag = document.getElementById('stage4HeightTag');
    if (heightTag) {
      heightTag.setAttribute('y', (dynamicPeakY + baseY) / 2);
      heightTag.textContent = `H = ${heightKm.toFixed(1)} km`;
    }

    stageCompleted[4] = true;
  }

  // =========================================================================
  // STAGE 5: INDEPENDENT SOLVE
  // =========================================================================
  window.toggleStage5Hint = function () {
    playSnapSound();
    const hintBox = document.getElementById('stage5HintBox');
    if (hintBox) {
      hintBox.style.display = (hintBox.style.display === 'none' || !hintBox.style.display) ? 'block' : 'none';
    }
  };

  window.verifyStage5Height = function () {
    const inputEl = document.getElementById('stage5Input');
    if (!inputEl) return;

    const raw = inputEl.value.trim().toLowerCase();
    const num = parseFloat(raw.replace(/[^\d.]/g, ''));

    const modal = document.getElementById('stage5VictoryModal');
    const toast = document.getElementById('stage5ErrorToast');

    if (num === 18 || num === 18000 || (num >= 17.8 && num <= 18.2)) {
      playChime();
      if (toast) toast.style.display = 'none';
      if (modal) modal.classList.add('active');

      const orbitalBeam = document.getElementById('stage5OrbitalBeam');
      if (orbitalBeam) {
        orbitalBeam.style.display = 'block';
        orbitalBeam.style.opacity = '1';
      }

      stageCompleted[5] = true;
      const pill5 = document.getElementById('trig-pill-5');
      if (pill5) pill5.classList.add('completed');
    } else {
      playErrorSound();
      if (toast) {
        toast.style.display = 'block';
        toast.innerHTML = '⚠️ Precision mismatch: Use formula <strong>Height = 24 × tan(36.87°)</strong>. Since tan(36.87°) ≈ 0.75, calculate 24 × 0.75!';
      }
    }
  };

  window.replayTrigMission = function () {
    const modal = document.getElementById('stage5VictoryModal');
    if (modal) modal.classList.remove('active');
    showTrigStage(1);
  };

  // Intercept the Squircle click for Trigonometry
  const originalSelectSquircle = window.selectSquircle;
  window.selectSquircle = function (boxId, topicName) {
    if (typeof originalSelectSquircle === 'function') {
      originalSelectSquircle(boxId, topicName);
    }
    if (boxId === 'box-trig' || topicName === 'Trigonometry') {
      setTimeout(() => {
        openTrigonometryMission(1);
      }, 350);
    }
  };

  // Popstate & DOM init
  window.addEventListener('popstate', (event) => {
    if (event.state && event.state.trigStage) {
      showTrigStage(event.state.trigStage);
    } else if (window.location.hash && window.location.hash.startsWith('#trig-stage-')) {
      const stage = parseInt(window.location.hash.replace('#trig-stage-', ''), 10);
      if (stage >= 1 && stage <= totalTrigStages) {
        openTrigonometryMission(stage);
      }
    }
  });

  window.addEventListener('DOMContentLoaded', () => {
    initDragHandlers();
    if (window.location.hash && window.location.hash.startsWith('#trig-stage-')) {
      const stage = parseInt(window.location.hash.replace('#trig-stage-', ''), 10);
      if (stage >= 1 && stage <= totalTrigStages) {
        openTrigonometryMission(stage);
      }
    }
  });
})();
