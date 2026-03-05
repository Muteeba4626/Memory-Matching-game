const emojis = ['🐶', '🐱', '🐸', '🦊', '🐼', '🦁', '🐯', '🐺'];

let flipped  = [];
let matched  = 0;
let moves    = 0;
let timer    = 0;
let timerInterval = null;
let lock     = false;
let bestScore = null;

// ── Helpers ──────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Timer ─────────────────────────────────────
function startTimer() {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    timer++;
    $('#timer').text(timer);
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

// ── Init ──────────────────────────────────────
function initGame() {
  flipped = [];
  matched = 0;
  moves   = 0;
  lock    = false;
  timer   = 0;
  stopTimer();

  $('#moves').text(0);
  $('#timer').text(0);
  $('#winMessage').removeClass('show');
  $('#gameBoard').empty();

  const cards = shuffle([...emojis, ...emojis]);

  cards.forEach((emoji, i) => {
    const card = $('<div class="card"></div>');
    card.attr('data-emoji', emoji);

    // staggered appear
    card.css({ opacity: 0, transition: 'none' });
    setTimeout(() => {
      card.css({ opacity: 1, transition: '' });
    }, i * 50);

    // back face: shows "?"
    const back  = $('<div class="card-back">?</div>');
    // front face: shows emoji
    const front = $('<div class="card-front"></div>');
    front.text(emoji); // .text() avoids any HTML injection issues

    card.append(back).append(front);
    $('#gameBoard').append(card);
  });

  updateBest();
}

function updateBest() {
  $('#bestScore').text(bestScore !== null ? bestScore : '—');
}

// ── Card click ────────────────────────────────
$(document).on('click', '.card', function () {
  const card = $(this);
  if (lock) return;
  if (card.hasClass('flipped') || card.hasClass('matched')) return;
  if (flipped.length >= 2) return;

  startTimer();
  card.addClass('flipped');
  flipped.push(card);

  if (flipped.length === 2) {
    moves++;
    $('#moves').text(moves);
    lock = true;

    const [a, b] = flipped;
    const isMatch = a.attr('data-emoji') === b.attr('data-emoji');

    if (isMatch) {
      setTimeout(() => {
        a.addClass('matched');
        b.addClass('matched');
        matched++;
        flipped = [];
        lock    = false;

        if (matched === emojis.length) {
          stopTimer();
          const newBest = bestScore === null || moves < bestScore;
          if (newBest) bestScore = moves;

          setTimeout(() => {
            $('#winMoves').text(moves);
            $('#winTime').text(timer);
            $('#newBestMsg').toggle(newBest);
            updateBest();
            $('#winMessage').addClass('show');
          }, 450);
        }
      }, 200);

    } else {
      a.addClass('wrong');
      b.addClass('wrong');
      setTimeout(() => {
        a.removeClass('flipped wrong');
        b.removeClass('flipped wrong');
        flipped = [];
        lock    = false;
      }, 950);
    }
  }
});

// ── Buttons ───────────────────────────────────
$('#playAgainBtn, #restartBtn').on('click', () => initGame());

// ── Boot ──────────────────────────────────────
$(document).ready(() => initGame());