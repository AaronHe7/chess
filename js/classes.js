// This chess game is made using object-oriented programming, using many methods

function Chess() {
  this.displaying = false;
  this.turn = 'w';
  // Storing wheter certain pieces have moved is necessary for castling
  this.moveState = {};
  this.pawnPromotion = null;
  this.enPassantCandidate = null;
  this.init();
}


// Allows the board to be indexed at any coordinate
Chess.prototype.init = function() {
  let pieces = 'rnbqkbnr';
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
        this.moveState[coord] = false;
      }
      this[coord] = piece;
    }
  }
}

Chess.prototype.getCopy = function(option = 'shallow') {
  let copy = new Chess();
  Object.assign(copy, this);
  if (option == 'deep') {
    copy.moveState = JSON.parse(JSON.stringify(this.moveState));
  }
  return copy;
}


Chess.prototype.addMarkers = function(side) {
  let row1 = document.querySelectorAll('.board > div[class="1"] > div');
  let row8 = document.querySelectorAll('.board > div[class="8"] > div');
  let numberCol = document.querySelectorAll('.board > div > div[class^="a"]');

  let clearRow = side == 'w' ? row8 : row1;
  let letterRow = side == 'w' ? row1 : row8;

  for (let i = 0; i < 8; i++) {
    clearRow[i].innerHTML = '';
    if (!numberCol[i].innerHTML) {
      numberCol[i].innerHTML = `<strong class=number-marker>${numberCol[i].classList[0][1]}</strong>`;
    }
  }
  for (let i = 0; i < 8; i++) {
    letterRow[i].innerHTML += `<strong class=letter-marker>${String.fromCharCode(97 + i)}</strong>`;
  }
}

// Display or update the chessboard on the browser
Chess.prototype.display = function() {
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
        squareDiv.classList.add(`${coord}`);

        // Color each tile
        squareDiv.classList.add(row % 2 == col % 2 ? 'light': 'dark');
      }
      board.appendChild(rowDiv);
    }
  }
  let squareDivs = document.querySelectorAll('.board > div > div');
  for (let i = 0; i < squareDivs.length; i++) {
    let pieceType = this[squareDivs[i].classList[0]];
    let pieceClass = /[bw][pnbrkq]/.exec(squareDivs[i].classList);
    squareDivs[i].classList.remove(pieceClass);

    if (pieceType) {
      squareDivs[i].classList.add(`${pieceType}`);
    }
  }
}


// Puts each row in reverse order
Chess.prototype.flipBoard = function(color = this.turn) {
  const board = document.querySelector('.board');
  const columns = document.querySelectorAll('.board > div');
  for (let i = 0; i < 8; i++) {
    board.appendChild(columns[7 - i]);
  }
  this.addMarkers(color);
}


Chess.prototype.isPiece = function(coord) {
  return this[coord] && /[a-h][1-8]/.test(coord);
}


Array.prototype.removeAt = function(index) {
  return this.slice(0, index).concat(this.slice(index + 1));
}


Chess.prototype.castleInfo = function(color, direction) {
  let piecePositions = {
    wrl: 'a1',
    wrr: 'h1',
    wk: 'e1',
    brl: 'a8',
    brr: 'h8',
    bk: 'e8'
  }
  let kingPos = piecePositions[color + 'k'];
  let rookPos = piecePositions[color + 'r' + direction];
  let kingMoved = this.moveState[kingPos];
  let rookMoved = this.moveState[rookPos];
  let numericDirection = direction == 'r' ? 1 : -1;
  let kingEndPos = kingPos.moveCoord(0, numericDirection * 2);
  let rookEndPos = kingPos.moveCoord(0, numericDirection);
  let tilesBetween = direction == 'r' ? 2 : 3;
  return {
    kingPos: kingPos,
    rookPos: rookPos,
    kingMoved: kingMoved,
    rookMoved: rookMoved,
    numericDirection: numericDirection,
    tilesBetween: tilesBetween,
    kingEndPos: kingEndPos,
    rookEndPos: rookEndPos
  }
}

Chess.prototype.legalCastle = function(color, direction) {
  let info = this.castleInfo(color, direction);
  if (this.inCheck(color) || info.kingMoved || info.rookMoved) {
    return false;
  }
  // Check if there are pieces between king and rook
  for (let i = 1; i <= info.tilesBetween; i++) {
    let coordTest = info.kingPos.moveCoord(0, info.numericDirection * i);
    if (this.isPiece(coordTest)) {
      return false;
    }
  }

  // Check if the king will move through or into check
  for (let i = 1; i <= 2; i++) {
    let coordTest = info.kingPos.moveCoord(0, info.numericDirection * i);
    let newBoard = board.getCopy();
    newBoard.movePiece(info.kingPos, coordTest, false);
    if (newBoard.inCheck(color)) {
      return false;
    }
  }
  return info.kingPos.moveCoord(0, info.numericDirection * 2);
}


Chess.prototype.castle = function(color, direction) {
  let info = this.castleInfo(color, direction);
  this.movePiece(info.kingPos, info.kingEndPos);
  this.movePiece(info.rookPos, info.rookEndPos);
}


Chess.prototype.legalMoves = function(coord, testForCheck = true) {
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
        } else if (board.enPassantCandidate && board.enPassantCandidate.moveCoord(direction, 0) == diagonal) {
          captures.push('ep' + diagonal);
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

  let validMoves = {
    moves: moves,
    captures: captures
  }

  // Remove any moves that would make the king end up in check
  if (testForCheck) {
    for (let key in validMoves) {
      for (let i = 0; i < validMoves[key].length; i++) {
        let move = validMoves[key][i];
        let newBoard = this.getCopy();
        newBoard.movePiece(coord, move, false);
        let inCheck = newBoard.inCheck(color);
        if (newBoard.inCheck(color)) {
          validMoves[key].splice(i, 1);
          i--;
        }
      }
    }
  }
  // Add castle moves
  if (type == 'k' && testForCheck) {
    let castleMoves = [this.legalCastle(color, 'l'), this.legalCastle(color, 'r')]
    castleMoves.forEach(function(move, i) {
      let direction = i == 0 ? 'l' : 'r';
      if (move) {
        validMoves.moves.push(direction + 'c' + move);
      }
    })
  }
  
  return validMoves;
}


Chess.prototype.findKing = function(color) {
  let kingPos = Object.keys(this).find(key => this[key] == color + 'k');
  if (kingPos)
    return kingPos
  return false;
}


// If a player is in check and has no possible moves
Chess.prototype.winner = function() {
  var colors = ['b', 'w'];
  for (let i = 0; i < colors.length; i++) {
    let color = colors[i];
    let win = true;
    let draw = true;
    let kingExists = false;
    let otherColor = color == 'b' ? 'w' : 'b';
    if (!this.inCheck(otherColor)) {
      win = false;
    }
    for (let coord in this) {
      if (this.isPiece(coord) && this[coord][0] == otherColor) {
        let moves = this.legalMoves(coord);
        // If a piece has a valid move, break because the game is not lost
        if (moves.moves.length > 0 || moves.captures.length > 0) {
          win = false;
          draw = false;
        }
        if (this[coord][1] == 'k')
          kingExists = true;
      }
    }
    if (win || !kingExists)
      return color;
    if (draw)
      return otherColor + 'draw';
  }
  return null;
}


// Iterate through each piece and check if it can capture the king
Chess.prototype.inCheck = function(color) {
  for (let coord in this) {
    if (this.isPiece(coord) && this[coord][0] != color) {
      let legalMoves = this.legalMoves(coord, false);
      let kingPos = this.findKing(color)
      if (!kingPos || legalMoves.captures.includes(kingPos)) {
        return true;
      }
    }
  }
  return false;
}


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


Chess.prototype.movePiece = function(pointA, pointB, recordMoves = true) {
  let board = this;
  let color = this[pointA][0];
  let piece = this[pointA][1];
  let capturedPiece = this[pointB];

  // Check for castling or en passant
  switch (pointB.slice(0, 2)) {
    case 'lc':
    case 'rc':
      board.castle(color, pointB[0]);
      capturedPiece = null;
      break;
    case 'ep':
      let direction = board.turn == 'w' ? 1 : -1;
      
      let enPassantTarget = pointB.moveCoord(-direction, 0);
      capturedPiece = board[enPassantTarget];
      board[enPassantTarget] = null;
      break;
  }

  // Record certain moves
  if (recordMoves) {
    this.pawnPromotion = null;
    this.enPassantCandidate = null;

    // Important for recording for king/rook moves
    if (pointA in this.moveState) {
      this.moveState[pointA] = true;
    }
    if (piece == 'p') {
      // Check if pawn can be promoted
      let promotionRank = color == 'w' ? 8 : 1;
      if (pointB[1] == promotionRank) {
        this.pawnPromotion = pointB;
      }
      // Check if pawn is an 'en passant' target
      let pawnRank = color == 'w' ? 2 : 7;
      let enPassantRank =  color == 'w' ? 4 : 5;
      if (pointA[1] == pawnRank && pointB[1] == enPassantRank) {
        this.enPassantCandidate = pointB;
      }
    }
  }

  this[pointB] = this[pointA];
  this[pointA] = null;

  return capturedPiece;
}

Chess.prototype.changePiece = function(coord, newPiece) {
  this[coord] = this[coord][0] + newPiece;
}


// Get DOM element at a coordinate
Chess.prototype.elementAt = function(coord) {
  return document.querySelector(`.${coord}`)
}


// Remove all classes from board
Chess.prototype.cleanUp = function(...classes) {
  let squareDivs = document.querySelectorAll('.board > div > div');
  for (let i = 0; i < squareDivs.length; i++) {
    squareDivs[i].classList.remove(...classes);
  }
}

Chess.prototype.countPieces = function() {
  let result = {}
  for (coord in this) {
    if (this.isPiece(coord)) {
      let piece = this[coord];
      result[piece] = result[piece] == undefined ? 1 : result[piece] + 1;
    }
  }
  return result;
}
