Chess.prototype.getMove = function(color) {
  return this.minimax(color, 3);
}

Chess.prototype.minimax = function(color, levels) {
  let legalMoves = []
  for (let coord in this) {
    if (this.isPiece(coord) && this[coord][0] == color) {
      let pieceMoves = this.legalMoves(coord);
      var castleMove;
      pieceMoves.moves.concat(pieceMoves.captures).forEach(function(move) {
        legalMoves.push([coord, move]);
      })
    }
  }
  return legalMoves[Math.floor(Math.random() * legalMoves.length)];
}