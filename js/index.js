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
  document.querySelector('.game-pause').style.display = 'flex';
  document.querySelector('.declare-winner').style.display = 'inline';
  document.querySelector('.winner-message').textContent = message;
}


function clearMenu() {
  document.querySelector('.game-pause').style.display = 'none';
  const menuDisplays = document.querySelectorAll('.game-menu > div');
  for (let i = 0; i < menuDisplays.length; i++) {
    menuDisplays[i].style.display = 'none';
  }
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
    if (board.castleMove) {
      board.castle(board.turn, board.castleMove[0]);
    } else {
      board.movePiece(board.selected, coord);
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
    }, 500);
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
    }, 1000);
    
  // Visually show all moves and captures
  } else if (board.isPiece(coord) && board[coord][0] == board.turn && coord != board.selected) {
    board.selected = coord;
    e.target.classList.add('selected');

    legalMoves = board.legalMoves(coord);

    legalMoves.moves.forEach(function(move) {
      if (move[1] == 'c') {
        board.elementAt(move.slice(2)).classList.add('move');
        board.castleMove = move.slice(0, 2);
      } else {
        board.castleMove = null;
        board.elementAt(move).classList.add('move');
      }
    });
    legalMoves.captures.forEach(function(capture) {
      board.elementAt(capture).classList.add('capture');
    });
  } else {
    board.selected = null;
  }
}