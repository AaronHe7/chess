# Chess with AI
***
In this project, I programmed the entire chess game using pure HTML, CSS, and JavaScript. This game is made using object-oriented programming, where all the rules and functionality are implemented using classes and methods. These rules include castling, en passant, pawn promotion, and detecting draws. Inside the game, players can only make legal moves, and whenever a winner (or draw) is found, it is automatically declared.   

Additionally, I created an AI that plays logically using an algorithm called minimax. The computer searches the game tree to a certain depth and decides what the best move is based on the value and worth of each piece in the board.

## Special Moves
***
Here are some lesser known moves in chess I implemented.  

**Castling**  
Castling occurs when a king moves two spaces to either the left or the right, and the rook crosses over the king. Castling is possible if there are no pieces between the chosen rook and king, and if the king does not move out of, into, or through a check.

**En passant**  
En passant is a move that a pawn can make when an opposing pawn immidiately makes a double move, ending up adjacent to the current pawn, where the opposing pawn can be captured as if it moved one square forward.

**Pawn promotion**  
When a pawn moves to the player's final rank, the pawn can change to either a queen, rook, bishop, or knight.

## Minimax algorithm

