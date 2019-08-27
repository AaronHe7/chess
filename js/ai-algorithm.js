Chess.prototype.getMove = function(color) {
  return this.minimax(color, 2);
}

Chess.prototype.minimax = function(color, depth, maximizingPlayer = true) {
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
    if (maximizingColor == color) {
      return { score: 20000 }
    } else {
      return { score: -20000 }
    }
  }

  // Add entropy to avoid repitition
  if (depth == 2) {
    let range = 25;
    let boardScore = this.boardScore(color, maximizingPlayer);
    if (boardScore > 1000) {
      range = boardScore/40;
    }
    var bestMoveScore = maximizingPlayer ? Math.max(...moves.map(move => move.score)) :  Math.min(...moves.map(move => move.score));
    if (maximizingPlayer) {
      optimalMoves = moves.filter(move => move.score + range >= bestMoveScore);
    } else {
      optimalMoves = moves.filter(move => move.score - range <= bestMoveScore);
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
  if (piece.type == 'k' && this.isEndGame()) 
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
Chess.prototype.isEndGame = function() {
  let count = this.countPieces();
  if (count['bq'] == 0 && count['wq'] == 0) {
    return true;
  } else if (count['wn'] + count['wb'] <= 1 && count['bn'] + count['bb'] <= 1) {
    return true;
  }
  return false;
}
