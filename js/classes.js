function ChessBoard() {
  this.displaying = false;
  this.init();
  this.display();
  this.turn = 'w';
}


// Allows the board to be indexed at any coordinate
ChessBoard.prototype.init = function() {
  let pieces = 'rnbkqbnr';
  for (let row = 1; row <= 8; row++) {
    for (let col = 0; col < 8; col++) {
      let coord = [col, row - 1].toCoordinate();
      let color = row == 1 || row == 2 ? 'w' : 'b';
      let piece = null;
      // Create pawns on rows 2 and 7
      if (row == 2 || row == 7) {
        piece = color + 'p';
      // Create other pieces
      } else if (row == 1 || row == 8) {
        piece = color + pieces[col];
      }
      this[coord] = piece;
    }
  }
}


// Display or update the chessboard on the browser
ChessBoard.prototype.display = function() {
  const board = document.querySelector('.board');
  // Create dom elements
  if (!this.displaying) {
    this.displaying = true;
    // Generate board
    for (let row = 8; row > 0; row--) {
      const rowDiv = document.createElement('div');
      rowDiv.classList = row;
      for (let col = 0; col < 8; col++) {
        let coord = [col, row - 1].toCoordinate();
        const squareDiv = document.createElement('div');
        rowDiv.appendChild(squareDiv);
        squareDiv.classList += ` ${coord}`;

        // Color each tile
        squareDiv.classList += row % 2 == col % 2 ? ' light': ' dark';

        if (row == 1) {
          squareDiv.textContent = coord[0];
        } else if (col == 0) {
          squareDiv.textContent = coord[1];
        }
      }
      board.appendChild(rowDiv);
    }
  }
  let squareDivs = document.querySelectorAll('.board > div > div');
  for (let i = 0; i < squareDivs.length; i++) {
    let pieceType = this[squareDivs[i].classList[0]];
    let pieceClass = /[bw][pnbrkq]/.exec(squareDivs[i].classList);
    squareDivs[i].classList.remove(pieceClass);

    if (pieceType) 
      squareDivs[i].classList += ` ${pieceType}`
  }
}


ChessBoard.prototype.isPiece = function(coord) {
  return this[coord];
}


ChessBoard.prototype.legalMoves = function(coord) {
  let board = this;
  let piece = this[coord];
  if (!piece)
    return;
  let color = piece[0];
  let type = piece[1];
  let row = parseInt(coord[1]);
  
  let moves = [];
  let captures = [];

  let directions = [];
  
  switch (type) {
    case 'p':
      let direction = color == 'w' ? 1 : -1;
      let firstMove = (color == 'w' && row == 2) || (color == 'b' && row == 7)
      let moveDistance = firstMove ? 2 : 1;

      for (let i = 1; i <= moveDistance; i++) {
        let newMove = coord.moveCoord(direction * i, 0);
        if (!newMove || board.isPiece(newMove)) {
          break;
        } else {
          moves.push(newMove);
        }
      }
      let diagonals = [coord.moveCoord(direction, 1), coord.moveCoord(direction, -1)];

      diagonals.forEach(function(diagonal) {
        if (board.isPiece(diagonal) && color != board[diagonal][0]) {
          captures.push(diagonal);
        }
      });
      break;
    case 'k':
    case 'n':
      if (type == 'k') {
        directions = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]]
      } else {
        directions = [[1, 2], [-1, 2], [1, -2], [-1, -2], [2, 1], [-2, 1], [2, -1], [-2, -1]]
      }

      directions.forEach(function(direction) {
        let newMove = coord.moveCoord(direction[0], direction[1]);
        if (board.isPiece(newMove)) {
          if (color != board[newMove][0])
            captures.push(newMove);
        } else if (newMove) {
          moves.push(newMove);
        }
      });
      break;
    case 'b':
    case 'r':
    case 'q':
      directions = type == 'r' || type == 'q' ? [[1, 0], [-1, 0], [0, 1], [0, -1]] : []
      if (type == 'b' || type == 'q')
        directions = directions.concat([[1, 1], [-1, 1], [1, -1], [-1, -1]])
      
      directions.forEach(function(direction) {
        for (let i = 1;; i++) {
          let newMove = coord.moveCoord(direction[0] * i, direction[1] * i);
          if (!newMove) {
            break;
          } else if (board.isPiece(newMove)) {
            if (board[newMove][0] != color) 
              captures.push(newMove);
            break;
          }
          moves.push(newMove);
        }
      });
  }
  return {
    moves: moves,
    captures: captures
  }
}


// ChessBoard.prototype.inCheck = function(color, board) {
//   for (let row = 0; row < 8; row++) {
//     for (let col = 0; col < 8; col++) {
//       let coord = [col, row].toCoordinate();
//       if (board.isPiece(coord)) {

//       }
//     }
//   }
//   return false;
// }

Array.prototype.toCoordinate = function() {
  return String.fromCharCode(97 + this[0]) + (this[1] + 1);
}

// Returns new coordinate based on the given direction
String.prototype.moveCoord = function(u, r) {
  let letter = String.fromCharCode(this.charCodeAt(0) + r);
  let number = (parseInt(this[1]) + u).toString();

  if ('abcdefgh'.includes(letter) && '12345678'.includes(number)) {
    return letter + number;
  }
  return null;
}


ChessBoard.prototype.movePiece = function(pointA, pointB) {
  this[pointB] = this[pointA];
  this[pointA] = null;
}


// Get DOM element at a coordinate
ChessBoard.prototype.elementAt = function(coord) {
  return document.querySelector(`.${coord}`)
}


// Remove all shown moves or captures
ChessBoard.prototype.cleanUp = function() {
  let squareDivs = document.querySelectorAll('.board > div > div');
  for (let i = 0; i < squareDivs.length; i++) {
    squareDivs[i].classList.remove('move');
    squareDivs[i].classList.remove('capture');
    squareDivs[i].classList.remove('selected');
  }
}


ChessBoard.prototype.startGame = function() {
  let board = this;
  document.addEventListener('click', displayEvents);

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
      board.movePiece(board.selected, coord);
      board.display();

    // Visually show all moves and captures
    } else if (board.isPiece(coord) && coord != board.selected) {
      board.selected = coord;
      e.target.classList += ' selected';

      legalMoves = board.legalMoves(coord);

      legalMoves.moves.forEach(function(move) {
        board.elementAt(move).classList += ' move';
      });
      legalMoves.captures.forEach(function(capture) {
        board.elementAt(capture).classList += ' capture';
      });
    } else {
      board.selected = null;
    }
  }
}

let chessBoard = new ChessBoard();
chessBoard.startGame();