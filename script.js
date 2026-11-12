/**
 * AstroLearn // Guided Onboarding & Squircle Landing Flow
 * NVIDIA Solid Dark Edition with Full Browser History & Google Sheets Backend Integration
 */

// Global Google Sheet Webhook URL (optional direct frontend fallback)
window.GOOGLE_SHEET_WEBHOOK_URL = '';

let currentStep = 0;
const totalSteps = 4;

// Initialise history for intro step (step‑0)
window.history.replaceState({ step: 0 }, '', '#step-0');

// User Responses Storage
const userResponses = {
  interest: 'Orbital Mechanics & Satellites',
  ageGroup: '14 – 18 years',
  learningGoal: 'Interactive visual experiments & sliders',
  selectedTopic: 'None',
  userId: 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4)
};

function updateProgress() {
  const progressBar = document.getElementById('stepProgressBar');
  const progressFill = document.getElementById('stepProgressFill');
  if (currentStep <= totalSteps) {
    if (progressBar) progressBar.style.display = 'flex';
    if (progressFill) progressFill.style.width = `${(currentStep / totalSteps) * 100}%`;
  } else {
    if (progressBar) progressBar.style.display = 'none';
  }
}

function selectChoice(element) {
  const parent = element.parentElement;
  parent.querySelectorAll('.choice-option').forEach(opt => opt.classList.remove('selected'));
  element.classList.add('selected');

  // Capture user response based on current step
  const labelEl = element.querySelector('.choice-label');
  if (labelEl) {
    const text = labelEl.innerText.trim();
    if (currentStep === 2) userResponses.interest = text;
    if (currentStep === 3) userResponses.ageGroup = text;
    if (currentStep === 4) userResponses.learningGoal = text;
  }
}

/**
 * Navigate to a specific step.
 * @param {number} stepNumber - Step to activate (1..5)
 * @param {boolean} pushHistory - Whether to push a new entry to browser history
 */
function goToStep(stepNumber, pushHistory = true) {
  currentStep = Math.max(1, Math.min(stepNumber, totalSteps + 1));

  // Hide all step cards
  document.querySelectorAll('.step-card').forEach(card => card.classList.remove('active'));
  const finalContainer = document.getElementById('finalLanding');

  if (currentStep <= totalSteps) {
    if (finalContainer) finalContainer.classList.remove('active');
    const nextCard = document.getElementById(`step-${currentStep}`);
    if (nextCard) nextCard.classList.add('active');
  } else {
    // Land on the main page with the 3 squircle boxes and pause there!
    if (finalContainer) finalContainer.classList.add('active');
    // Save onboarding responses to backend & Google Sheet
    sendResponsesToBackend();
  }

  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Sync with browser history
  if (pushHistory) {
    window.history.pushState({ step: currentStep }, '', `#step-${currentStep}`);
  }
}

function nextStep() {
  goToStep(currentStep + 1, true);
}

function prevStep() {
  // Use native history back if available so browser history stays synced
  if (window.history.state && window.history.state.step > 1) {
    window.history.back();
  } else if (currentStep > 1) {
    goToStep(currentStep - 1, false);
  }
}

function skipIntro() {
  const vid = document.getElementById('introVideo');
  if (vid) vid.pause();
  nextStep();
}

// Listen to browser Back / Forward navigation events
window.addEventListener('popstate', (event) => {
  let targetStep = 1;

  if (event.state && typeof event.state.step === 'number') {
    targetStep = event.state.step;
  } else if (window.location.hash) {
    const match = window.location.hash.match(/#step-(\d+)/);
    if (match) targetStep = parseInt(match[1], 10);
  }

  goToStep(targetStep, false);
});

function selectSquircle(boxId, topicName) {
  document.querySelectorAll('.squircle-box').forEach(box => box.classList.remove('active-selected'));
  const target = document.getElementById(boxId);
  if (target) target.classList.add('active-selected');

  userResponses.selectedTopic = topicName;
  showToast(`✦ Selected: "${topicName}" — Preferences saved!`);

  // Update submission with the selected topic
  sendResponsesToBackend(topicName);

  // Launch Apple-level experience when Trigonometry is chosen
  if (boxId === 'box-trig' || topicName === 'Trigonometry') {
    setTimeout(() => {
      if (typeof window.launchAppleExperience === 'function') {
        window.launchAppleExperience();
      }
    }, 400);
  }
}

/**
 * Send user responses to Node backend (/api/submit) & Google Sheet
 */
function sendResponsesToBackend(topicName) {
  if (topicName) userResponses.selectedTopic = topicName;

  const payload = {
    interest: userResponses.interest,
    ageGroup: userResponses.ageGroup,
    learningGoal: userResponses.learningGoal,
    selectedTopic: userResponses.selectedTopic,
    userId: userResponses.userId,
    timestamp: new Date().toLocaleString()
  };

  // Directly send to Google Sheet via Apps Script webhook
if (window.GOOGLE_SHEET_WEBHOOK_URL) {
  fetch(window.GOOGLE_SHEET_WEBHOOK_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(() => console.log('[AstroLearn] Sent to Google Sheet'))
  .catch(e => console.warn('Google Sheet webhook error:', e));
} else {
  console.warn('No Google Sheet webhook URL configured.');
}
}

function showToast(msg) {
  const toast = document.getElementById('toastMsg');
  if (!toast) return;
  toast.innerText = msg;
  toast.style.display = 'flex';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3500);
}

// Background Starfield (Subtle, Crisp, Tiny Star Dots)
function initStarfield() {
  const canvas = document.getElementById('space-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const stars = [];
  for (let i = 0; i < 60; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.1 + 0.3,
      alpha: Math.random() * 0.45 + 0.15,
      speed: Math.random() * 0.08 + 0.02
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    for (let s of stars) {
      s.y -= s.speed;
      if (s.y < 0) s.y = height;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(render);
  }
  render();
}

window.addEventListener('DOMContentLoaded', () => {
  // Check if direct trigonometry stage is requested via hash
  if (window.location.hash && window.location.hash.startsWith('#trig-stage-')) {
    const stage = parseInt(window.location.hash.replace('#trig-stage-', ''), 10) || 1;
    if (typeof openTrigonometryMission === 'function') {
      openTrigonometryMission(stage);
      initStarfield();
      return;
    }
  }

  // Initialize history state on load (starts at step 0 for the intro video)
  let initialStep = 0;
  if (window.location.hash) {
    const match = window.location.hash.match(/#step-(\d+)/);
    if (match) {
      const parsed = parseInt(match[1], 10);
      if (parsed >= 0 && parsed <= totalSteps + 1) {
        initialStep = parsed;
      }
    }
  }

  window.history.replaceState({ step: initialStep }, '', `#step-${initialStep}`);
  goToStep(initialStep, false);

  initStarfield();

  // Show "Continue" button after 5 seconds on the intro video
  setTimeout(() => {
    const btn = document.getElementById('continueIntro');
    if (btn) btn.style.display = 'inline-flex';
  }, 5000);
});
