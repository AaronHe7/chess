Chess.prototype.getMove = function(color) {
  return this.minimax(color, 2);
}

Chess.prototype.minimax = function(color, depth, maximizingPlayer = true) {
  var legalMoves = [];
  let boardRating = 0;
  var otherColor = color == 'b' ? 'w' : 'b';
  let pieceRating = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 100
  }

  for (let coord in this) {
    if (this.isPiece(coord)) {
      let piece = {
        color: this[coord][0],
        type: this[coord][1]
      }
      
      // Calculate how well the position of the maximizing player is
      if (depth == 0) {
        if ((maximizingPlayer && piece.color == color) || (!maximizingPlayer && piece.color != color)) {
          boardRating += pieceRating[piece.type];
        } else {
          boardRating -= pieceRating[piece.type];
        }
      }
      // Put each possible legal move in an array
      else {
        if (piece.color == color) {
          let pieceMoves = this.legalMoves(coord);

          pieceMoves.moves.forEach(function(move) {
            legalMoves.push([coord, move]);
          });
          pieceMoves.captures.forEach(function(capture) {
            legalMoves.push([coord, capture]);
          });
        }
      }
    }
  }


  // If the program runs out of depth, return the current score
  if (depth == 0) {
    return { score: boardRating }
  }
  
  // Get score of all moves
  var moves = [];
  var board = this;

  legalMoves.forEach(function(action) {
    let move = {};
    move.move = action;

    let newBoard = board.getCopy('deep');
    newBoard.movePiece(action[0], action[1]);
    move.score = newBoard.minimax(otherColor, depth - 1, !maximizingPlayer).score;
    moves.push(move);
  });
  
  // Get the highest or lowest score of each move
  var optimalMoves = null;
  moves.forEach(function(move) {
    // If it's the maximizing player, find the highest score
    if (maximizingPlayer) {
      if (optimalMoves == null || move.score > optimalMoves[0].score) {
        optimalMoves = [move];
      } else if (move.score == optimalMoves[0].score) {
        optimalMoves.push(move);
      }
    // If it's the minimizing player, find the lowest score
    } else {
      if (optimalMoves == null || move.score < optimalMoves[0].score) {
        optimalMoves = [move];
      } else if (move.score == optimalMoves[0].score) {
        optimalMoves.push(move);
      }
    }
  });

  // If there is no optimal move, assume terminal state
  if (optimalMoves == null) {
    let winner = this.winner();
    if (winner == 'draw') {
      return { score: 0 }
    }
    if ((maximizingPlayer && winner == color) || (!maximizingPlayer && winner != color)) {
      return { score: 100 }
    } else {
      return { score: -100 }
    }
  }

  // Get a random optimal move
  return optimalMoves[Math.floor(Math.random() * optimalMoves.length)];
}