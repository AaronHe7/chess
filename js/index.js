var board = new ChessBoard();
board.display();
board.addMarkers('w');

function startGame() {
  document.querySelector('.board').innerHTML = '';
  board = new ChessBoard();
  board.display();
  board.addMarkers('w');
  clearMenu();
  document.addEventListener('click', displayEvents);
}


function declareWinner(message) {
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
  document.querySelector(selector).style.display = 'inline';
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

  clearMenu();
  board.display();
  setTimeout(function() {
    // If a player wins, declare it
    let winner = board.winner();
    if (winner) {
      let colors = {
        w: 'White',
        b: 'Black'
      }
      declareWinner(colors[winner] + ' wins!');
      return;
    } 
    board.flipBoard(); 
  }, 500);
}


function displayEvents(e) {
  if (e.target.classList) {
    var coord = e.target.classList[0];
    var isMove = e.target.classList.contains('move') || e.target.classList.contains('capture');
  } else {
    var coord = null;
    board.selected = null; 
  }

  // Delete all the 'move' or 'capture' classes
  board.cleanUp();

  // Moves piece and updates display
  if (isMove) {
    // Castling
    if (board.castleMove) {
      board.castle(board.turn, board.castleMove[0]);
    } else {
      board.movePiece(board.selected, coord);
    }
    // Promoting
    if (board.pawnPromotion) {
      promoteMenu(board[board.pawnPromotion][0]);
    }
    // En passant
    if (board.enPassantTarget) {
      board[board.enPassantTarget] = null;
    }

    board.turn = board.turn == 'b' ? 'w' : 'b';

    // Make tile red if king is in check
    if (board.inCheck(board.turn)) {
      const king = document.querySelector('.' + board.findKing(board.turn));
      king.classList.add('check');
    } else {
      board.cleanUp(true);
    }

    e.target.classList.add('target');
    setTimeout(function() { 
      board.display();
      e.target.classList.remove('target');

      if (!board.pawnPromotion) {
        setTimeout(function() {
          // If a player wins, declare it
          let winner = board.winner();
          if (winner) {
            let colors = {
              w: 'White',
              b: 'Black'
            }
            declareWinner(colors[winner] + ' wins!');
            return;
          } 
          board.flipBoard(); 
        }, 500);
      }
    }, 500);

  // Visually show all moves and captures
  } else if (board.isPiece(coord) && board[coord][0] == board.turn && coord != board.selected) {
    board.selected = coord;
    e.target.classList.add('selected');

    legalMoves = board.legalMoves(coord);

    board.enPassantTarget = null;
    board.castleMove = null;
    
    legalMoves.moves.forEach(function(move) {
      if (move[1] == 'c') {
        board.elementAt(move.slice(2)).classList.add('move');
        board.castleMove = move.slice(0, 2);
      } else {
        board.elementAt(move).classList.add('move');
      }
    });
    legalMoves.captures.forEach(function(capture) {
      if (capture[1] == 'p') {
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