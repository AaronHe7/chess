var timeTaken = 0;
var depth = 3;
Chess.prototype.getMove = function(color) {
  var start = new Date().getTime();
  let move = this.minimax(color, depth);
  var end = new Date().getTime();
  timeTaken = end - start;
  
  // Adjust layer search based on how much time it took
  if (timeTaken > 1500) {
    depth--;
  } else if (timeTaken < 100) {
    depth++;
  }
  return move;
}

Chess.prototype.minimax = function(color, depth, alpha = -Infinity, beta = Infinity, maximizingPlayer = true) {
  // If the program runs out of depth, return the current score
  if (depth == 0) {
    return { score: this.boardScore(color, maximizingPlayer) }
  }

  var legalMoves = [];
  var otherColor = color == 'b' ? 'w' : 'b';
  maximizingColor = null;

  if (maximizingPlayer) {
    maximizingColor = color;
  } else {
    maximizingColor = color == 'b' ? 'w' : 'b';
  }

  for (let coord in this) {
    if (this.isPiece(coord)) {
      let piece = {
        color: this[coord][0],
        type: this[coord][1]
      }
      
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


  // Recursively find the score of every legal move
  var board = this;
  var optimalMoves = null;

  for (let i = 0; i < legalMoves.length; i++) {
    let action = legalMoves[i];
    let newBoard = board.getCopy('deep');
    newBoard.movePiece(action[0], action[1]);

    let move = {};
    move.move = action;
    move.score = newBoard.minimax(otherColor, depth - 1, alpha, beta, !maximizingPlayer).score;

    if (maximizingPlayer) {
      // Find max move score
      let bestScore = -Infinity;
      if (move.score > bestScore) {
        optimalMoves = [move];
      } else if (move.score == bestScore) {
        optimalMoves.push(move);
      }
      bestScore = Math.max(bestScore, move.score);
      alpha = Math.max(alpha, bestScore);
      if (alpha >= beta) {
        break;
      }
    // Find min move score
    } else { 
      let bestScore = Infinity;
      
      if (move.score < bestScore) {
        optimalMoves = [move];
      } else if (move.score == bestScore) {
        optimalMoves.push(move);
      }
      bestScore = Math.min(bestScore, move.score);
      beta = Math.min(bestScore, beta);
      if (alpha >= beta) {
        break;
      }
    }
  }

  // If there is no optimal move, assume terminal state
  if (optimalMoves == null) {
    console.log('a');
    let winner = this.winner();
    if (winner == 'draw') {
      return { score: 0 }
    }
    if (maximizingColor == color) {
      return { score: 20000 }
    } else {
      return { score: -20000 }
    }
  }

  // Get a random optimal move
  let optimalMove = optimalMoves[Math.floor(Math.random() * optimalMoves.length)]
  return optimalMove;
}


/*** 
Board Evaluation Functions
Credit: https://www.chessprogramming.org/Simplified_Evaluation_Function
 ***/

// Gets score of maximizing player based on pieces and positions
Chess.prototype.boardScore = function(color, maximizingPlayer) {
  let score = 0;
  let pieceRating = {
    p: 100,
    n: 320,
    b: 330,
    r: 500,
    q: 900,
    k: 20000
  }
  for (let coord in this) {
    if (this.isPiece(coord)) {
      let piece = {
        color: this[coord][0],
        type: this[coord][1]
      }
      let positionScore = this.positionalEvaluation(coord);
      if ((maximizingPlayer && piece.color == color) || (!maximizingPlayer && piece.color != color)) {
        score += (pieceRating[piece.type] + positionScore);
      } else {
        score -= (pieceRating[piece.type] + positionScore);
      }
    }
  }
  return score;
}

// By evaluating positions, the program is encouraged to move pieces into favorable positions
// Data is found in json/position-evaluation.json
Chess.prototype.positionalEvaluation = function(coord) {
  let piece = {
    color: this[coord][0],
    type: this[coord][1]
  }
  let data = evaluationData;
  
  let evaluationArray = data[piece.type];
  if ((piece.type == 'k' || piece.type == 'p') && this.isEndGame(piece.color)) 
    evaluationArray = data['k endgame'];
  
  if (piece.color == 'b')
    evaluationArray = evaluationArray.reverse();
 
  let numericCoord = [8 - parseInt(coord[1]), coord.charCodeAt(0) - 97];
  let positionScore = evaluationArray[numericCoord[0]][numericCoord[1]];

  if (piece.color == 'b')
    evaluationArray = evaluationArray.reverse();
  
  return positionScore;
}

// Endgame happens if both sides have no queens or if both sides have zero or one minor pieces
Chess.prototype.isEndGame = function(color) {
  let other = color = 'w' ? 'b' : 'w';
  let count = this.countPieces();
  if (count[other + 'q'] == 0) {
    return true;
  } else if (count[other = 'n'] + count[other + 'b'] <= 1) {
    return true;
  }
  return false;
}
