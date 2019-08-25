var board = new Chess();
var capturedPiece;
var againstComp;
var playerColor;

board.display();
board.addMarkers('w');

setInterval(function() {
  
}, 100);

function startGame(choice) {
  againstComp = choice == 'computer' ? true : false;
  document.querySelector('.board').innerHTML = '';
  board = new Chess();
  board.display();
  board.addMarkers('w');
  clearMenu();
  clearTray();
  if (againstComp)
    displayMenu('.color-choices');
  document.addEventListener('click', displayEvents);
}

function playAs(color) {
  clearMenu();
  playerColor = color;
  if (color == 'b') {
    board.flipBoard('b');
    computerMove();
  }
}

function computerMove() {
  let move = board.getMove(board.turn);
  setTimeout(function() {
    animateMove(move[0], move[1], false);
  }, 700);
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
    images[i].src = `images/${color}${imageOrder[i]}.png`
  };
}

function promotePawn(piece) {
  board.changePiece(board.pawnPromotion, piece);
  if (!againstComp)
    board.flipBoard();
  clearMenu();
  board.display();

  board.turn = board.turn == 'w' ? 'b' : 'w';
  if (playerColor != board.turn)
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
  captureTray.innerHTML += `<img src="images/${piece}.png" alt="${piece}">`;
  capturedPiece = null;
}


function animateMove(pointA, pointB, flip = true) {
  if (pointA && pointB) {
    board.cleanUp('target');
    capturedPiece = null;

    // En passant
    if (board.enPassantTarget) {
      capturedPiece = board[board.enPassantTarget];
      board[board.enPassantTarget] = null;
    } else if (pointB.slice(0, 2) == 'ep') {
      let direction = board.turn == 'w' ? 1 : -1;
      pointB = pointB.slice(2);
      
      let enPassantTarget = pointB.moveCoord(-direction, 0);
      capturedPiece = board[enPassantTarget];
      board[enPassantTarget] = null;
    }

    // Castling
    if (pointB[1] == 'c') {
      board.castle(board.turn, pointB[0]);
      pointB = pointB.slice(2);
    } else {
      capturedPiece = board.movePiece(pointA, pointB);
    }
    
    // Promoting
    if (board.pawnPromotion) {
      if (!playerColor || board[board.pawnPromotion][0] == playerColor) {
        promoteMenu(board[board.pawnPromotion][0]);
      } else {
        promotePawn('q');
      }
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
    if (board.inCheck(board.turn)) {
      const king = document.querySelector('.' + board.findKing(board.turn));
      king.classList.add('check');
    } else {
      board.cleanUp('check');
    }

    setTimeout(function() {
      // If a player wins, declare it
      let winner = board.winner();
      if (winner) {
        if (winner.slice(1) == 'draw' && winner[0] == board.turn) {
          declareWinner('Draw');
          return;
        }
        else if (winner == 'w' || winner == 'b') {
          let colors = {
            w: 'White',
            b: 'Black'
          }
          declareWinner(colors[winner] + ' wins!');
          return;
        } 
      }
      if (flip && !board.pawnPromotion)
        board.flipBoard(); 
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
    if (againstComp && !board.pawnPromotion) {
      computerMove();
    }
    

  // Visually show all moves and captures
  } else if (board.isPiece(coord) && board[coord][0] == board.turn && coord != board.selected) {
    if (againstComp && playerColor != board[coord][0]) {
      return;
    }

    board.selected = coord;
    target.classList.add('selected');

    legalMoves = board.legalMoves(coord);

    board.enPassantTarget = null
    
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