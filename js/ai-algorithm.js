var timeTaken = 0;
var minimaxDepth = 2;

Chess.prototype.getMove = function(color) {
  var start = new Date().getTime();
  let move = this.minimax(color, minimaxDepth);
  console.log(`${color} ${move.move}: score ${move.score}`);
  var end = new Date().getTime();
  timeTaken = end - start;

  return move;
}

Chess.prototype.minimax = function(color, depth, alpha = -Infinity, beta = Infinity, maximizingPlayer = true) {
  // If the program runs out of depth, return the current score
  if (depth == 0) {
    return { score: this.getBoardScore(color, maximizingPlayer) }
  } 

  var legalMoves = [];
  var otherColor = color == 'b' ? 'w' : 'b';
  var maximizingColor = maximizingPlayer ? color : otherColor;
  var board = this;

  winner = board.winner(color);
  if (winner) {
    if (winner == maximizingColor) {
      return { score: 20000 }
    } else if (winner = 'draw') {
      return { score: 0 }
    } else {
      return { score: -20000 }
    }
  }

  for (let coord in this) {
    if (this.isPiece(coord)) {
      let piece = {
        color: this[coord][0],
        type: this[coord][1]
      }

      if (piece.color == color) {
        let pieceMoves = this.legalMoves(coord, depth == minimaxDepth);

        for (let move of pieceMoves.moves) {
          legalMoves.push([coord, move]);
        }
        for (let capture of pieceMoves.captures) {
          legalMoves.push([coord, capture]);
        }
      }
    }
  }


  // Recursively find the score of every legal move
  var board = this;
  var optimalMoves = [];
  var bestScore = maximizingPlayer ? -Infinity : Infinity;
  for (let action of legalMoves) {
    let newBoard = board.getCopy('deep');
    newBoard.movePiece(action[0], action[1]);
    // Avoid threefold repititions
    if (depth == minimaxDepth - 1 && newBoard.threeFold()) {
      console.log('Threefold detected ' + maximizingPlayer);
      return { move: action, score: -10000 }
    }
    let move = {};
    move.move = action;
    move.score = newBoard.minimax(otherColor, depth - 1, alpha, beta, !maximizingPlayer).score;

    if (maximizingPlayer) {
      // Find max move score
      if (move.score > bestScore) {
        optimalMoves = [move];
        bestScore = move.score;
        alpha = bestScore;
      } else if (move.score == bestScore) {
        optimalMoves.push(move);
      }
      if (beta < alpha) break;
    } else {
      if (move.score < bestScore) {
        optimalMoves = [move];
        bestScore = move.score;
        beta = bestScore;
      } else if (move.score == bestScore) {
        optimalMoves.push(move);
      }
      if (beta < alpha) break;
    }
  }

  // If there is no optimal move, assume terminal state
  if (optimalMoves.length == 0) {
    console.log('a');
    let winner = this.winner(color);
    if (winner == 'draw') {
      return { score: 0 }
    }
    if (maximizingColor == color) {
      return { score: Infinity }
    } else {
      return { score: -Infinity }
    }
  }

  // Get a random optimal move
  let optimalMove = optimalMoves[Math.floor(Math.random() * optimalMoves.length)];
  return optimalMove;
}


/***
Board Evaluation Functions
Credit: https://www.chessprogramming.org/Simplified_Evaluation_Function
 ***/

// Gets score of maximizing player based on pieces and positions
Chess.prototype.getBoardScore = function(color, maximizingPlayer) {
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
    evaluationArray = data[piece.type + ' endgame'];

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
  let other = color == 'w' ? 'b' : 'w';
  let count = this.countPieces();
  if (count[other + 'q'] == 0 && count[other + 'r'] <= 1) {
    return true;
  } else if (count[other + 'n'] + count[other + 'b'] <= 1 && count[other + 'r'] == 0) {
    return true;
  }
  return false;
}