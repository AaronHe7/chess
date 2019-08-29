var board = new Chess();
var capturedPiece, againstComp, playerColor, matchStarted, drawOffer;
var animationFinished;

var colors = {
  w: 'White',
  b: 'Black'
}

board.display();
board.addMarkers('w');

function clearBoard() {
  document.querySelector('.board').innerHTML = '';
  board = new Chess();
  board.display();
  board.addMarkers('w');
  clearMenu();
  clearTray();
}

function startGame(choice) {
  if (choice == 'player')
    matchStarted = true;
  againstComp = choice == 'computer' ? true : false;
  clearBoard();

  if (againstComp)
    displayMenu('.color-choices');
  document.addEventListener('click', displayEvents);
}

function compVsComp() {
  clearBoard();
  animationFinished = true;
  let interval = setInterval(function() {
    if (animationFinished) {
      computerMove();
      if (board.pawnPromotion) {
        promotePawn('q');
      }
      if (board.winner() || board.threeFold()) {
        clearInterval(interval)
      }
    }
  }, 50);
}

function playAs(color) {
  matchStarted = true;
  clearMenu();
  playerColor = color;
  if (color == 'b') {
    board.flipBoard('b');
    computerMove();
  }
}

function computerMove() {
  let move = board.getMove(board.turn).move;
  animateMove(move[0], move[1], false);
}

function declareWinner(message) {
  document.removeEventListener('click', displayEvents);
  displayMenu('.declare-winner');
  document.querySelector('.winner-message').textContent = message;
}


function clearMenu() {
  document.querySelector('.game-pause').style.display = 'none';
  const menuDisplays = document.querySelectorAll('.game-menu > div');
  for (let i = 0; i < menuDisplays.length; i++) {
    menuDisplays[i].style.display = 'none';
  }
}

function displayMenu(selector) {
  document.querySelector('.game-pause').style.display = 'flex';
  document.querySelector('.game-menu').style.display = 'inline';
  document.querySelector(selector).style.display = 'inline';
  document.querySelector('.back').style.display = 'none';
}


function promoteMenu(color) {
  displayMenu('.pawn-promotion');
  const images = document.querySelectorAll('.promotion-images > img');
  let imageOrder = ['q', 'r', 'b', 'n'];
  for (let i = 0; i < images.length; i++) {
    // Adjust source images to match the color of the promoting pawn
    images[i].src = `images/pieces/${color}${imageOrder[i]}.png`
  };
}

function promotePawn(piece) {
  board.changePiece(board.pawnPromotion, piece);
  clearMenu();
  board.turn = board.turn == 'w' ? 'b' : 'w';
  console.log(board.turn);
  board.display();
  if (againstComp && playerColor != board.turn)
    computerMove();
}

function clearTray() {
  const tray = document.querySelectorAll('.tray');
  for (let i = 0; i < tray.length; i++) {
    tray[i].innerHTML = '';
  }
}

function addCapturedPiece(piece) {
  if (!piece)
    return;
  let side = piece[0] == 'w' ? 'left' : 'right';
  const captureTray = document.querySelector(`.${side}-sidebar > .tray`);
  captureTray.innerHTML += `<img src="images/pieces/${piece}.png" alt="${piece}">`;
  capturedPiece = null;
}


function animateMove(pointA, pointB, flip = true) {
  animationFinished = false;
  if (pointA && pointB) {
    board.cleanUp('target');
    capturedPiece = board.movePiece(pointA, pointB);

    // En passant
    if (board.enPassantTarget) {
      capturedPiece = board[board.enPassantTarget];
      board[board.enPassantTarget] = null;
    }

    // Promoting
    if (board.pawnPromotion) {
      if (!playerColor || board[board.pawnPromotion][0] == playerColor) {
        promoteMenu(board[board.pawnPromotion][0]);
      } else {
        promotePawn('q');
      }
    }

    if (pointB.slice(0, 2) == 'ep' || pointB[1] == 'c') {
      pointB = pointB.slice(2);
    }

    board.elementAt(pointA).classList.add('target');
    board.elementAt(pointB).classList.add('target');
  }
  if (!board.pawnPromotion)
    board.turn = board.turn == 'b' ? 'w' : 'b';

  setTimeout(function() {
    board.display();
    if (capturedPiece)
      addCapturedPiece(capturedPiece);
    // Make tile red if king is in check
    if (!board.inCheck(board.turn)) {
      board.cleanUp('check');
    }

    setTimeout(function() {
      // If a player wins or draws, declare it
      let winner = board.winner();
      if (board.threeFold()) {
    		declareWinner('Draw - Threefold repitition');
        return;
    	}
      if (winner) {
        if (winner == 'draw') {
          declareWinner('Draw - Stalemate');
        } else if (winner == 'w' || winner == 'b') {
          if (againstComp) {
            if (winner == playerColor) {
              declareWinner('You win!');
            } else {
              declareWinner('Computer wins!');
            }
          } else {
            declareWinner(colors[winner] + ' wins!');
          }
        }
        matchStarted = false;
        return;
      }
      animationFinished = true;
      let otherColor = board.turn == 'w' ? 'b' : 'w';
      if (board.turn == drawOffer && confirm(colors[otherColor] + ' offers a draw. Accept?')) {
        declareWinner('Draw');
      }
      drawOffer = false;
    }, 300);
  }, 300);
}


function displayEvents(e) {
  let target = e.target;
  if (target.classList) {
    var coord = target.classList[0];
    var isMove = target.classList.contains('move') || target.classList.contains('capture');
  } else {
    var coord = null;
    board.selected = null;
  }

  // Delete all the 'move' or 'capture' classes
  board.cleanUp('move', 'capture', 'selected');

  // Moves piece and updates display
  if (isMove) {
    // Check if the move is a castle
    let castleMove = /[lr]c/.exec(target.classList);
    let move = castleMove ? castleMove + target.classList[0] : target.classList[0];

    animateMove(board.selected, move, !againstComp);
    setTimeout(function() {
      if (againstComp && !board.pawnPromotion && !board.winner()) {
        computerMove();
      }
    }, 650);

  // Visually show all moves and captures
} else if (board.isPiece(coord) && board[coord][0] == board.turn && coord != board.selected) {
    if (againstComp && playerColor != board[coord][0]) {
      return;
    }

    board.selected = coord;
    target.classList.add('selected');
    legalMoves = board.legalMoves(coord);
    board.enPassantTarget = null;

    legalMoves.moves.forEach(function(move) {
      if (move[1] == 'c') {
        board.elementAt(move.slice(2)).classList.add('move');
        board.elementAt(move.slice(2)).classList.add(move.slice(0, 2));
      } else {
        board.elementAt(move).classList.add('move');
      }
    });
    legalMoves.captures.forEach(function(capture) {
      if (capture.slice(0, 2) == 'ep') {
        board.elementAt(capture.slice(2)).classList.add('capture');
        board.enPassantTarget = board.enPassantCandidate;
      } else {
        board.elementAt(capture).classList.add('capture');
      }
    });
  } else {
    board.selected = null;
  }
}

function viewBoard() {
  document.querySelector('.game-menu').style.display = 'none';
  document.querySelector('.back').style.display = 'inline';
}

function resign() {
  if (!matchStarted) {
    alert('Start a match first');
  } else if (confirm('Are you sure you want to resign?')) {
    if (againstComp) {
      declareWinner('Computer wins!');
    } else {
      let otherColor = board.turn == 'b' ? 'w' : 'b';
      declareWinner(colors[otherColor] + ' wins!');
    }
  }
}

function draw() {
  if (!matchStarted) {
    alert('Start a match first');
  } else if (confirm('Offer a draw?')) {
    let otherColor = board.turn == 'b' ? 'w' : 'b';
    if (againstComp) {
      if (board.getBoardScore(otherColor, true) < 100) {
        alert('The computer accepts your draw');
        declareWinner('Draw');
      } else {
        alert('The computer declines your draw');
      }
    } else {
      drawOffer = otherColor;
    }
  }
}
