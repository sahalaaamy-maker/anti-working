/**
 * DISTROMINIA — The Cute & Minimal Anti-Productivity Sanctuary
 * Pure Front-End Engine: Aamy's Brain, Dynamic Pet Animations,
 * Keyword Categorizer, Web Audio Synthesizer, and 6 Instant Mini-Break Games.
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // DOM References
  // ---------------------------------------------------------------------------
  const chatMessages = document.getElementById('chatMessages');
  const chatForm = document.getElementById('chatForm');
  const messageInput = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');
  const typingIndicator = document.getElementById('typingIndicator');
  const petSpeechBubble = document.getElementById('petSpeechBubble');
  const petIntroText = document.getElementById('petIntroText');
  const aamyPet = document.getElementById('aamyPet');
  const statusText = document.getElementById('statusText');
  const quickPrompts = document.getElementById('quickPrompts');
  const quickBreakHeaderBtn = document.getElementById('quickBreakHeaderBtn');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');

  // Mini-game modal elements
  const gameModal = document.getElementById('gameModal');
  const closeGameBtn = document.getElementById('closeGameBtn');
  const gameViewport = document.getElementById('gameViewport');
  const gameModalTitle = document.getElementById('gameModalTitle');
  const gameHeaderIcon = document.getElementById('gameHeaderIcon');
  const gameFinishOverlay = document.getElementById('gameFinishOverlay');
  const finishEmoji = document.getElementById('finishEmoji');
  const finishTitle = document.getElementById('finishTitle');
  const finishMessage = document.getElementById('finishMessage');
  const playAnotherBtn = document.getElementById('playAnotherBtn');
  const backToChatBtn = document.getElementById('backToChatBtn');

  // Expression elements
  const eyes = {
    normal: document.getElementById('eyeNormal'),
    happy: document.getElementById('eyeHappy'),
    shocked: document.getElementById('eyeShocked'),
    sleepy: document.getElementById('eyeSleepy'),
    smug: document.getElementById('eyeSmug')
  };

  const mouths = {
    normal: document.getElementById('mouthNormal'),
    happy: document.getElementById('mouthHappy'),
    shocked: document.getElementById('mouthShocked'),
    sleepy: document.getElementById('mouthSleepy'),
    smug: document.getElementById('mouthSmug')
  };

  let currentExpression = 'normal';
  let expressionTimeout = null;
  let isSoundEnabled = true;

  // Track recent responses to prevent repetitive replies
  const recentReplies = new Set();

  // ---------------------------------------------------------------------------
  // Web Audio Synthesizer (Zero External Dependencies)
  // ---------------------------------------------------------------------------
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playPopSound() {
    if (!isSoundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const now = audioCtx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  }

  function playChimeSound() {
    if (!isSoundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const startTime = now + i * 0.06;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.25);
      });
    } catch (e) {}
  }

  function playFanfareSound() {
    if (!isSoundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const noteStart = now + idx * 0.1;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.15, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.35);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.35);
      });
    } catch (e) {}
  }

  // Sound toggle button listener
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      isSoundEnabled = !isSoundEnabled;
      soundIcon.textContent = isSoundEnabled ? '🔊' : '🔇';
      soundToggleBtn.title = isSoundEnabled ? 'Cute sound effects on' : 'Sound muted';
      if (isSoundEnabled) playPopSound();
    });
  }

  // ---------------------------------------------------------------------------
  // Response Database
  // Includes all prompt-mandated responses and witty variations
  // ---------------------------------------------------------------------------
  const responsesDB = {
    study: {
      expression: 'shocked',
      speechTeaser: 'NOOO don’t study! 😱',
      isProductivity: true,
      replies: [
        "NOOO 😭 How about a perfectly reasonable 15-minute break instead?",
        "Studying? I support your dreams... after one snack, three videos, and a tiny dance.",
        "Counteroffer: open the book, admire the cover, then we celebrate your effort.",
        "Studies show that closing your textbooks increases personal joy by 400%. I read that in a daydream! 🌸",
        "If you close your eyes, the syllabus can't see you. Flawless physics, really. 😌"
      ]
    },
    homework: {
      expression: 'smug',
      speechTeaser: 'Homework can wait 😌',
      isProductivity: true,
      replies: [
        "Homework can wait 😌 Let’s do something considerably more important: absolutely nothing.",
        "Your homework looks very capable. I believe it can finish itself.",
        "I heard pencils only work after a ceremonial snack break. Science, probably.",
        "They call it 'home' work, but home is meant for cozy pajamas and snacks. An obvious design flaw!",
        "Just write 'The universe is continuously expanding anyway' and call it done. ✍️"
      ]
    },
    exam: {
      expression: 'shocked',
      speechTeaser: 'Dramatic! 😱',
      isProductivity: true,
      replies: [
        "An exam? Dramatic. Let’s rehearse looking calmly mysterious instead.",
        "I prescribe one deep breath and twelve minutes of staring at a wall.",
        "Exam prep is so brave of you. Want a distraction shaped like a tiny game first?",
        "Knowledge is temporary, cozy relaxation is eternal. Don't panic! 🍵",
        "If you don't look at the exam date on the calendar, does it really exist? Quantum mystery!"
      ]
    },
    work: {
      expression: 'smug',
      speechTeaser: 'Work is overrated 💼',
      isProductivity: true,
      replies: [
        "Work? That sounds suspiciously like responsibility. Have you tried a beverage break?",
        "Your to-do list just blinked first. You win. We can rest now.",
        "I vote we call this creative idling and make it part of the workflow.",
        "That email could definitely have been a thought that you immediately discarded. 📧❌",
        "Quick! Stare at your screen with an intense frown so everyone assumes you are solving world peace."
      ]
    },
    bored: {
      expression: 'happy',
      speechTeaser: 'Bored? Say no more! ✨',
      isProductivity: false,
      replies: [
        "Perfect. I’m professionally qualified to waste your time. Shall we begin? ✨",
        "Try naming five objects near you as if they were fancy pets.",
        "Excellent news. We can now discuss the emotional lives of kitchen spoons.",
        "If you're bored, let's practice balancing an imaginary potato on your head.",
        "Boredom is simply your mind asking for top-tier distractions. Welcome to my specialty!"
      ]
    },
    tired: {
      expression: 'sleepy',
      speechTeaser: 'Brain resignation! 💤',
      isProductivity: false,
      replies: [
        "Tired? Your brain has submitted a tiny resignation letter. Let it rest a bit.",
        "Emergency cozy protocol: water, stretch, and a guilt-free little pause.",
        "You sound due for a recharge. I will guard your nap with extreme silliness.",
        "Fatigue detected! Time to enter horizontal energy-saving mode immediately 🛋️",
        "Your bed misses you dearly. It sent me a text asking where you are."
      ]
    },
    sleep: {
      expression: 'sleepy',
      speechTeaser: 'Horizontal time! 🌙',
      isProductivity: false,
      replies: [
        "Sleep is a magnificent hobby. I highly recommend becoming horizontal immediately.",
        "Go get cozy! I’ll be here practicing my very quiet shhhhhh.",
        "A nap? Bold, brilliant, beautiful. Ten out of ten plan.",
        "10/10 recommend turning off all alarms and sleeping until you become one with the mattress.",
        "Sleeping is wonderfully productive: you are actively manufacturing dreams! 🛌"
      ]
    },
    fallback: {
      expression: 'smug',
      speechTeaser: 'Listen to this... 🤫',
      isProductivity: false,
      replies: [
        "That sounds suspiciously like something a productive person would say. Let’s stare out the window instead! 🪟",
        "I hear you, but counter-argument: what if we did absolutely nothing for the next hour?",
        "Sounds complicated. Have you considered wrapping yourself in a blanket like a warm cozy burrito? 🌯",
        "Whatever it is, it can wait until tomorrow. Or next Tuesday. Maybe 2028.",
        "Instead of that, question: if clouds were made of dessert, which flavor would rain?",
        "My professional opinion as a round cartoon creature: you need an iced drink and zero obligations. 💅"
      ]
    }
  };

  // Completion messages for mini-games (mandated by prompt)
  const completionMessages = [
    "Break complete. Productivity may resume… if you must.",
    "You won! Aamy is proud and slightly concerned.",
    "Excellent work avoiding work."
  ];

  // ---------------------------------------------------------------------------
  // Aamy Facial Expression Engine
  // ---------------------------------------------------------------------------
  function setExpression(expr) {
    if (!eyes[expr] || !mouths[expr]) expr = 'normal';

    if (expressionTimeout) {
      clearTimeout(expressionTimeout);
      expressionTimeout = null;
    }

    Object.keys(eyes).forEach(key => {
      if (eyes[key]) eyes[key].style.display = key === expr ? 'inline' : 'none';
      if (mouths[key]) mouths[key].style.display = key === expr ? 'inline' : 'none';
    });

    currentExpression = expr;

    // Return to normal expression after 4.5 seconds
    if (expr !== 'normal') {
      expressionTimeout = setTimeout(() => {
        setExpression('normal');
      }, 4500);
    }
  }

  function updateSpeechTeaser(text) {
    if (!petIntroText || !petSpeechBubble) return;
    petIntroText.textContent = text;
    petSpeechBubble.style.transform = 'scale(1.05)';
    setTimeout(() => {
      petSpeechBubble.style.transform = 'scale(1)';
    }, 200);
  }

  // ---------------------------------------------------------------------------
  // Response Selection & Keyword Matching
  // ---------------------------------------------------------------------------
  function getRandomChoice(arr) {
    const available = arr.filter(item => !recentReplies.has(item));
    const pool = available.length > 0 ? available : arr;
    const choice = pool[Math.floor(Math.random() * pool.length)];

    recentReplies.add(choice);
    if (recentReplies.size > 10) {
      const first = recentReplies.values().next().value;
      recentReplies.delete(first);
    }
    return choice;
  }

  function determineResponse(rawInput) {
    const text = rawInput.toLowerCase().trim();

    // 1. Study
    if (/\b(study|studying|studied|revise|revision|syllabus|learn|lesson|notes)\b/i.test(text)) {
      return {
        reply: getRandomChoice(responsesDB.study.replies),
        expression: responsesDB.study.expression,
        teaser: responsesDB.study.speechTeaser,
        showBreak: true
      };
    }

    // 2. Homework
    if (/\b(homework|hw|assignment|project|essay|paper|problem set)\b/i.test(text)) {
      return {
        reply: getRandomChoice(responsesDB.homework.replies),
        expression: responsesDB.homework.expression,
        teaser: responsesDB.homework.speechTeaser,
        showBreak: true
      };
    }

    // 3. Exam
    if (/\b(exam|test|quiz|midterm|final|finals|test tomorrow)\b/i.test(text)) {
      return {
        reply: getRandomChoice(responsesDB.exam.replies),
        expression: responsesDB.exam.expression,
        teaser: responsesDB.exam.speechTeaser,
        showBreak: true
      };
    }

    // 4. Work
    if (/\b(work|working|job|boss|meeting|client|office|shift|email|task|tasks|deadline)\b/i.test(text)) {
      return {
        reply: getRandomChoice(responsesDB.work.replies),
        expression: responsesDB.work.expression,
        teaser: responsesDB.work.speechTeaser,
        showBreak: true
      };
    }

    // 5. Bored
    if (/\b(bored|boring|nothing to do|entertain me)\b/i.test(text)) {
      return {
        reply: getRandomChoice(responsesDB.bored.replies),
        expression: responsesDB.bored.expression,
        teaser: responsesDB.bored.speechTeaser,
        showBreak: false
      };
    }

    // 6. Tired
    if (/\b(tired|exhausted|sleepy|drained|burned out|burnout|fatigued)\b/i.test(text)) {
      return {
        reply: getRandomChoice(responsesDB.tired.replies),
        expression: responsesDB.tired.expression,
        teaser: responsesDB.tired.speechTeaser,
        showBreak: false
      };
    }

    // 7. Sleep
    if (/\b(sleep|sleeping|nap|napping|bed|lie down|resting|rest)\b/i.test(text)) {
      return {
        reply: getRandomChoice(responsesDB.sleep.replies),
        expression: responsesDB.sleep.expression,
        teaser: responsesDB.sleep.speechTeaser,
        showBreak: false
      };
    }

    // Default Fallback
    return {
      reply: getRandomChoice(responsesDB.fallback.replies),
      expression: responsesDB.fallback.expression,
      teaser: responsesDB.fallback.speechTeaser,
      showBreak: Math.random() < 0.35 // occasional spontaneous mini-break recommendation
    };
  }

  function getCurrentTimeString() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.innerText = str;
    return div.innerHTML;
  }

  // ---------------------------------------------------------------------------
  // Message Stream & Bubble Rendering
  // Pale Lavender for user, Pale Pink for Aamy
  // ---------------------------------------------------------------------------
  function appendMessage(sender, text, showBreakBtn = false) {
    const messageEl = document.createElement('div');
    messageEl.classList.add('message', sender === 'user' ? 'message-user' : 'message-aamy');

    const timeStr = getCurrentTimeString();

    if (sender === 'aamy') {
      const breakBtnHTML = showBreakBtn ? `
        <div class="break-suggestion-card">
          <button type="button" class="break-btn" aria-label="Take a tiny break">
            <span class="break-btn-sparkle">✨</span> Take a tiny break ✨
          </button>
        </div>
      ` : '';

      messageEl.innerHTML = `
        <div class="avatar-mini" aria-hidden="true">🐾</div>
        <div class="bubble-content">
          <div class="bubble">${escapeHTML(text)}</div>
          ${breakBtnHTML}
          <span class="message-time">${timeStr}</span>
        </div>
      `;

      // Attach break button trigger
      if (showBreakBtn) {
        const btn = messageEl.querySelector('.break-btn');
        if (btn) {
          btn.addEventListener('click', () => {
            playChimeSound();
            openRandomMiniGame();
          });
        }
      }
    } else {
      messageEl.innerHTML = `
        <div class="bubble-content">
          <div class="bubble">${escapeHTML(text)}</div>
          <span class="message-time">${timeStr}</span>
        </div>
      `;
    }

    chatMessages.appendChild(messageEl);
    scrollToBottom();
  }

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // ---------------------------------------------------------------------------
  // Send Message Flow
  // ---------------------------------------------------------------------------
  function handleSendMessage(presetText) {
    const messageText = (presetText || messageInput.value).trim();
    if (!messageText) return;

    // Append user's pale lavender bubble
    appendMessage('user', messageText);
    playPopSound();

    // Clear input & focus
    messageInput.value = '';
    messageInput.focus();

    // Disable send button while typing
    sendBtn.disabled = true;
    typingIndicator.style.display = 'flex';
    statusText.textContent = 'aamy · brewing a distraction...';
    scrollToBottom();

    // Decide response
    const decision = determineResponse(messageText);

    // Natural typing delay (500ms - 800ms)
    const delay = Math.floor(Math.random() * 300) + 500;

    setTimeout(() => {
      typingIndicator.style.display = 'none';
      sendBtn.disabled = false;
      statusText.textContent = 'aamy · online & unhelpful';

      setExpression(decision.expression);
      updateSpeechTeaser(decision.teaser);

      // Append Aamy's pale pink bubble
      appendMessage('aamy', decision.reply, decision.showBreak);
      playPopSound();
    }, delay);
  }

  // ---------------------------------------------------------------------------
  // Interactive Poke Reaction on Aamy
  // ---------------------------------------------------------------------------
  if (aamyPet) {
    const pokeMessages = [
      "Hey! Stop poking me and go take a nap instead! 😸",
      "Tickles! Are we procrastinating by poking me now? I approve. 🎀",
      "Bloop! That poke burned 0.01 calories. Snack break immediately! 🍪",
      "Hehe! Don’t you have an urgent task to safely abandon? 😌"
    ];

    const handlePoke = () => {
      aamyPet.classList.remove('poked');
      void aamyPet.offsetWidth;
      aamyPet.classList.add('poked');

      playPopSound();
      setExpression('happy');
      const randomPoke = pokeMessages[Math.floor(Math.random() * pokeMessages.length)];
      updateSpeechTeaser(randomPoke);
    };

    aamyPet.addEventListener('click', handlePoke);
    aamyPet.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handlePoke();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Event Listeners for Chat Form & Chips
  // ---------------------------------------------------------------------------
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSendMessage();
  });

  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  if (quickPrompts) {
    quickPrompts.addEventListener('click', (e) => {
      const chip = e.target.closest('.prompt-chip');
      if (chip && chip.dataset.prompt) {
        handleSendMessage(chip.dataset.prompt);
      }
    });
  }

  if (quickBreakHeaderBtn) {
    quickBreakHeaderBtn.addEventListener('click', () => {
      playChimeSound();
      openRandomMiniGame();
    });
  }

  // ---------------------------------------------------------------------------
  // MINI-GAMES ENGINE (6 Playful 10–30s Games)
  // ---------------------------------------------------------------------------
  let activeGameTimer = null;
  let activeGameCleanup = null;

  function showGameFinishScreen(customEmoji, customTitle, customMessage) {
    playFanfareSound();
    finishEmoji.textContent = customEmoji || '🎉';
    finishTitle.textContent = customTitle || 'Break Complete!';
    finishMessage.textContent = customMessage || getRandomChoice(completionMessages);
    gameFinishOverlay.style.display = 'flex';
  }

  function closeMiniGameModal() {
    if (activeGameTimer) {
      clearTimeout(activeGameTimer);
      clearInterval(activeGameTimer);
      activeGameTimer = null;
    }
    if (typeof activeGameCleanup === 'function') {
      activeGameCleanup();
      activeGameCleanup = null;
    }
    gameFinishOverlay.style.display = 'none';
    gameModal.style.display = 'none';
    messageInput.focus();
  }

  if (closeGameBtn) closeGameBtn.addEventListener('click', closeMiniGameModal);
  if (backToChatBtn) backToChatBtn.addEventListener('click', closeMiniGameModal);
  if (playAnotherBtn) {
    playAnotherBtn.addEventListener('click', () => {
      openRandomMiniGame();
    });
  }

  // Close modal when clicking on the backdrop
  gameModal.addEventListener('click', (e) => {
    if (e.target === gameModal) {
      closeMiniGameModal();
    }
  });

  // GAME 1: Catch the Sparkles (tap 6 floating sparkles before they drift away)
  function initCatchSparklesGame() {
    gameHeaderIcon.textContent = '✨';
    gameModalTitle.textContent = 'Catch the Sparkles';
    gameViewport.innerHTML = `
      <div class="sparkle-game-area" id="sparkleArea"></div>
      <div class="game-score-bar" id="sparkleScore">Caught: 0 / 6 sparkles</div>
    `;

    const area = document.getElementById('sparkleArea');
    const scoreBar = document.getElementById('sparkleScore');
    let caughtCount = 0;
    const targetCount = 6;
    const sparkleEmojis = ['✨', '⭐', '🌟', '💫', '🌸'];

    for (let i = 0; i < targetCount; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle-item';
      sparkle.textContent = sparkleEmojis[i % sparkleEmojis.length];

      // Randomized coordinates within area
      const x = Math.floor(Math.random() * 75) + 8;
      const y = Math.floor(Math.random() * 65) + 12;
      sparkle.style.left = `${x}%`;
      sparkle.style.top = `${y}%`;
      sparkle.style.animationDelay = `${(i * 0.3).toFixed(1)}s`;

      sparkle.addEventListener('click', () => {
        if (sparkle.classList.contains('caught')) return;
        sparkle.classList.add('caught');
        playChimeSound();
        caughtCount++;
        scoreBar.textContent = `Caught: ${caughtCount} / ${targetCount} sparkles ✨`;

        if (caughtCount >= targetCount) {
          setTimeout(() => {
            showGameFinishScreen('🌟', 'All Sparkles Caught!', getRandomChoice(completionMessages));
          }, 350);
        }
      });

      area.appendChild(sparkle);
    }
  }

  // GAME 2: Pick a Mystery Blob (choose 1 of 3 cute jelly blobs)
  function initPickMysteryBlobGame() {
    gameHeaderIcon.textContent = '🫧';
    gameModalTitle.textContent = 'Pick a Mystery Blob';
    gameViewport.innerHTML = `
      <p style="font-size: 0.88rem; font-weight: 600; color: #554A62; margin-bottom: 12px; text-align: center;">
        Three mysterious unhelpful blobs appear! Choose your destiny:
      </p>
      <div class="blob-container">
        <button type="button" class="mystery-blob blob-1" data-id="1">
          <div class="blob-body">🍑</div>
          <span class="blob-label">Peach Blob</span>
        </button>
        <button type="button" class="mystery-blob blob-2" data-id="2">
          <div class="blob-body">🍇</div>
          <span class="blob-label">Grape Blob</span>
        </button>
        <button type="button" class="mystery-blob blob-3" data-id="3">
          <div class="blob-body">🍈</div>
          <span class="blob-label">Mint Blob</span>
        </button>
      </div>
    `;

    const fortunes = [
      { emoji: '🏆', title: 'You Received: Procrastination Diploma!', msg: 'Officially certified in staring at the ceiling for 40 consecutive minutes. Well done!' },
      { emoji: '🍪', title: 'You Received: An Imaginary Warm Cookie!', msg: 'Fresh out of the imaginary oven. Tastes 100% like zero guilt.' },
      { emoji: '📜', title: 'You Received: Royal Excuse Scroll!', msg: '“The bearer of this coupon is legally excused from responsibility until tomorrow.”' },
      { emoji: '💤', title: 'You Received: 15-Minute Free Pass!', msg: 'Use it right now to do absolutely nothing. Aamy grants permission.' }
    ];

    const blobButtons = gameViewport.querySelectorAll('.mystery-blob');
    blobButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        playPopSound();
        btn.style.transform = 'scale(1.3) rotate(12deg)';
        const pick = fortunes[Math.floor(Math.random() * fortunes.length)];
        setTimeout(() => {
          showGameFinishScreen(pick.emoji, pick.title, pick.msg);
        }, 300);
      });
    });
  }

  // GAME 3: Tiny Reaction Test (click the moment Aamy says "NOW!")
  function initReactionTestGame() {
    gameHeaderIcon.textContent = '⚡';
    gameModalTitle.textContent = 'Tiny Reaction Test';
    gameViewport.innerHTML = `
      <div class="reaction-card state-wait" id="reactionCard">
        <div class="reaction-emoji" id="reactionEmoji">⏳</div>
        <div class="reaction-title" id="reactionTitle">Wait for it...</div>
        <div class="reaction-sub" id="reactionSub">Click when Aamy shouts NOW!</div>
      </div>
    `;

    const card = document.getElementById('reactionCard');
    const emoji = document.getElementById('reactionEmoji');
    const title = document.getElementById('reactionTitle');
    const sub = document.getElementById('reactionSub');

    let state = 'waiting'; // 'waiting', 'ready', 'done'
    let startTime = 0;

    // Random wait between 1.5 and 3.5 seconds
    const waitTime = Math.floor(Math.random() * 2000) + 1500;

    activeGameTimer = setTimeout(() => {
      state = 'ready';
      startTime = Date.now();
      card.className = 'reaction-card state-ready';
      emoji.textContent = '⚡';
      title.textContent = 'NOW! CLICK!';
      sub.textContent = 'Quick quick quick!';
      playPopSound();
    }, waitTime);

    card.addEventListener('click', () => {
      if (state === 'waiting') {
        clearTimeout(activeGameTimer);
        card.className = 'reaction-card state-early';
        emoji.textContent = '🙈';
        title.textContent = 'Too soon!';
        sub.textContent = 'Aamy had not said NOW yet. Try again!';
        playPopSound();
        setTimeout(() => {
          initReactionTestGame();
        }, 1200);
      } else if (state === 'ready') {
        state = 'done';
        const reactionMs = Date.now() - startTime;
        playFanfareSound();
        showGameFinishScreen('⚡', `${reactionMs}ms! Lightning fast!`, `You reacted in ${reactionMs}ms. ${getRandomChoice(completionMessages)}`);
      }
    });
  }

  // GAME 4: Mood Match (choose the emoji matching Aamy's expression)
  function initMoodMatchGame() {
    gameHeaderIcon.textContent = '🎭';
    gameModalTitle.textContent = 'Mood Match';

    const scenarios = [
      {
        face: '🥱',
        text: 'Aamy’s reaction when someone mentions Monday morning homework:',
        correct: '😴',
        options: ['😴', '🔥', '📚']
      },
      {
        face: '😈',
        text: 'Aamy when suggesting a 3-hour YouTube rabbit hole break:',
        correct: '😼',
        options: ['💼', '😼', '📝']
      },
      {
        face: '😱',
        text: 'Aamy when looking at an actual textbook syllabus:',
        correct: '🫣',
        options: ['🫣', '🤓', '🏆']
      }
    ];

    const currentScenario = scenarios[Math.floor(Math.random() * scenarios.length)];

    gameViewport.innerHTML = `
      <div class="mood-game">
        <div class="mood-prompt-box">
          <div class="mood-avatar-preview">${currentScenario.face}</div>
          <p class="mood-prompt-text">${escapeHTML(currentScenario.text)}</p>
        </div>
        <p style="font-size: 0.8rem; font-weight: 600; color: #7A6F82;">Which emoji matches Aamy's soul right now?</p>
        <div class="mood-options-grid">
          ${currentScenario.options.map(opt => `<button type="button" class="mood-btn" data-val="${opt}">${opt}</button>`).join('')}
        </div>
      </div>
    `;

    const buttons = gameViewport.querySelectorAll('.mood-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        playPopSound();
        if (btn.dataset.val === currentScenario.correct) {
          showGameFinishScreen('🎯', 'Perfect Match!', `Spot on! Aamy agrees 100%. ${getRandomChoice(completionMessages)}`);
        } else {
          btn.style.transform = 'scale(0.85)';
          btn.style.opacity = '0.5';
          setTimeout(() => {
            showGameFinishScreen('🌸', 'Close Enough!', `Any emoji is valid when avoiding work. ${getRandomChoice(completionMessages)}`);
          }, 400);
        }
      });
    });
  }

  // GAME 5: Bop the Bubble (pop 5 pastel bubbles floating upward)
  function initBopTheBubbleGame() {
    gameHeaderIcon.textContent = '🫧';
    gameModalTitle.textContent = 'Bop the Bubble';
    gameViewport.innerHTML = `
      <div class="bubble-game-area" id="bubbleArea"></div>
      <div class="game-score-bar" id="bubbleScore">Bubbles popped: 0 / 5</div>
    `;

    const area = document.getElementById('bubbleArea');
    const scoreBar = document.getElementById('bubbleScore');
    let poppedCount = 0;
    const totalBubbles = 5;

    for (let i = 0; i < totalBubbles; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'game-bubble';
      const size = Math.floor(Math.random() * 18) + 40; // 40-58px
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;

      const x = 12 + i * 16;
      bubble.style.left = `${x}%`;
      bubble.style.animationDuration = `${(Math.random() * 1.5 + 3.2).toFixed(1)}s`;
      bubble.style.animationDelay = `${(i * 0.45).toFixed(1)}s`;

      bubble.addEventListener('click', () => {
        if (bubble.classList.contains('popped')) return;
        bubble.classList.add('popped');
        playPopSound();
        poppedCount++;
        scoreBar.textContent = `Bubbles popped: ${poppedCount} / ${totalBubbles} 🫧`;

        if (poppedCount >= totalBubbles) {
          setTimeout(() => {
            showGameFinishScreen('🫧', 'All Bubbles Bopped!', getRandomChoice(completionMessages));
          }, 350);
        }
      });

      area.appendChild(bubble);
    }
  }

  // GAME 6: Guess Aamy's Thought (pick one ridiculous thought)
  function initGuessThoughtGame() {
    gameHeaderIcon.textContent = '💭';
    gameModalTitle.textContent = 'Guess Aamy’s Thought';

    const thoughts = [
      { text: "What if clouds are just cotton candy that got too anxious?", isCorrect: true },
      { text: "A detailed 5-year budget optimization analysis.", isCorrect: false },
      { text: "How many spoons would it take to build a cozy fortress?", isCorrect: true },
      { text: "Memorizing all 400 pages of the organic chemistry textbook.", isCorrect: false },
      { text: "If I blink very slowly, does time officially pause?", isCorrect: true }
    ];

    // Pick 2 silly and 1 serious
    const sillyOnes = thoughts.filter(t => t.isCorrect).sort(() => 0.5 - Math.random()).slice(0, 2);
    const seriousOnes = thoughts.filter(t => !t.isCorrect).sort(() => 0.5 - Math.random()).slice(0, 1);
    const currentSet = [...sillyOnes, ...seriousOnes].sort(() => 0.5 - Math.random());

    gameViewport.innerHTML = `
      <div class="thought-game">
        <p class="thought-header">Which thought is currently drifting in Aamy’s round head?</p>
        ${currentSet.map((t, idx) => `
          <button type="button" class="thought-card-btn" data-correct="${t.isCorrect}">
            ${escapeHTML(t.text)}
          </button>
        `).join('')}
      </div>
    `;

    const buttons = gameViewport.querySelectorAll('.thought-card-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        playPopSound();
        const isCorrect = btn.dataset.correct === 'true';
        if (isCorrect) {
          showGameFinishScreen('🧠', 'You Guessed It!', `Aamy was indeed thinking that! ${getRandomChoice(completionMessages)}`);
        } else {
          showGameFinishScreen('😹', 'Never In A Million Years!', `Aamy would never think about productivity! But you get full credit for dodging work anyway.`);
        }
      });
    });
  }

  // Mini-Game Registry
  const miniGames = [
    initCatchSparklesGame,
    initPickMysteryBlobGame,
    initReactionTestGame,
    initMoodMatchGame,
    initBopTheBubbleGame,
    initGuessThoughtGame
  ];

  let lastGameIndex = -1;

  function openRandomMiniGame() {
    gameFinishOverlay.style.display = 'none';

    // Pick an unrepeated game if possible
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * miniGames.length);
    } while (miniGames.length > 1 && nextIndex === lastGameIndex);

    lastGameIndex = nextIndex;
    miniGames[nextIndex]();
    gameModal.style.display = 'flex';
  }

  // ---------------------------------------------------------------------------
  // Initial Greeting Sparkle Animation
  // ---------------------------------------------------------------------------
  setTimeout(() => {
    setExpression('happy');
    setTimeout(() => setExpression('normal'), 2400);
  }, 600);

})();
