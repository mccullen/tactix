var computerPlayerFactory: any = function (spec) {

    var computerPlayer: any = {};

    // Private variables

    var mBoardToMoves = {};
    var mValues = Object.freeze({
        OWin: -1,
        Draw: 0,
        XWin: 1
    });

    var mMinimax: any = function (board, row, column) {
        var response;
        var iRow = 0;
        var iColumn = 0;

        // The value of the board assuming you play a piece somewhere
        // and the other player plays optimally
        var bestMove = {
            // Row and column params get passed down from higher
            // up in the tree
            row: row,
            column: column,

            // These values get passed up to parent nodes in base case
            depth: undefined,// [jrm] board.getNumMoves()
            state: undefined
        };

        if (board.getState() !== board.state.unfinished) {
            // we are at a terminal node (draw, xWon, or oWon)
            // so evaluate
            bestMove.state = board.getState();
            bestMove.depth = board.getNumMoves();
            mBoardToMoves[board] = [];

            // [jrm] Don't need these in hash map but it is fun to 
            // know how many valid boards there are.
            /*
            mBoardToMoves[board].push({
                row: row,
                column: column,
                state: board.getState(),
                depth: board.getNumMoves()
            });
            */

        } else if (board.getCurrentPlayer() === board.piece.x) {
            // it is maximizer's turn (x)

            bestMove.state = board.state.oWon; // assume the worst
            bestMove.depth = 0;
            mBoardToMoves[board] = [];

            for (iRow = 0; iRow < board.getNumRows(); iRow += 1) {
                for (iColumn = 0; iColumn < board.getNumColumns();
                        iColumn += 1) {
                    if (board.isEmpty({row: iRow, column: iColumn})) {

                        board.playPiece({row: iRow, column: iColumn});

                        // Get value of terminal state for playing 
                        // the piece above assuming the other player
                        // and you both play optimally
                        response = mMinimax(board, iRow, iColumn);

                        board.undoLastMove();

                        // Store it in the hash table
                        mBoardToMoves[board].push(response);

                        if (response.state > bestMove.state) {
                            bestMove.state = response.state;
                            bestMove.depth = response.depth;
                        } else if (response.state === bestMove.state) {
                            if (response.state === board.state.oWon) {
                                bestMove.depth = Math.max(bestMove.depth, response.depth);
                            } else if (response.state === board.state.xWon){
                                bestMove.depth = Math.min(bestMove.depth, response.depth);
                            } else {
                                bestMove.depth = response.depth;
                            }
                        }
                    }
                }
            }
        } else {
            // it is minimizer's turn (o)

            bestMove.state = board.state.xWon; // assume the worst
            bestMove.depth = 0;
            mBoardToMoves[board] = [];

            for (iRow = 0; iRow < board.getNumRows(); iRow += 1) {
                for (iColumn = 0; iColumn < board.getNumColumns();
                        iColumn += 1) {
                    if (board.isEmpty({row: iRow, column: iColumn})) {
                        
                        board.playPiece({row: iRow, column: iColumn});

                        response = mMinimax(board, iRow, iColumn);
                        board.undoLastMove();

                        mBoardToMoves[board].push(response);

                        if (response.state < bestMove.state) {
                            bestMove.state = response.state;
                            bestMove.depth = response.depth;
                        } else if (response.state === bestMove.state) {
                            if (response.state === board.state.oWon) {
                                bestMove.depth = Math.min(bestMove.depth, response.depth);
                            } else if (response.state === board.state.xWon){
                                bestMove.depth = Math.max(bestMove.depth, response.depth);
                            } else {
                                bestMove.depth = response.depth;
                            }
                        }
                    }
                }
            }
        }
        return bestMove;
    };


    /**
     * Given a board, get an array of all valid moves along
     * with their values and the depths which lead to that value.
     */
    computerPlayer.getMoveValues = function (board) {
        var moveValues = [];
        // If already stored, get the value and return it.
        if (mBoardToMoves.hasOwnProperty(board)) {
            moveValues = mBoardToMoves[board];
        } 
        // Otherwise, minimax
        else {
            mMinimax(board);
            moveValues = mBoardToMoves[board];
        }

        return moveValues;
    };
    computerPlayer.hasBoard = function (board) {
        return mBoardToMoves.hasOwnProperty(board);
    };
    
    computerPlayer.getMoveValue = function (board, row, column) {
        if (!board.isEmpty({row: row, column: column})) {
            throw {
                message: "Error!!!"
            };
        }
        var moveValues = computerPlayer.getMoveValues(board);
        var result = moveValues[0];
        var iMove = 1;
        while (result.row !== row || result.column !== column) {
            result = moveValues[iMove];
            iMove += 1;
        }
        return result;
    };

    computerPlayer.getStats = function () {
        const boardStats: any = {
            totalMoves: 0,
            totalWinsX: 0,
            totalWinsO: 0,
            totalDraws: 0,
            totalDepthForWinsX: 0,
            totalDepthForWinsO: 0,
            totalDepthForDraws: 0,
            shortestWinDepthX: Infinity,
            shortestWinDepthO: Infinity,
            longestDrawDepth: 0,
            uniqueBoardStates: 0,
            moveCounts: {},
            firstMoveWinRateX: 0,
            firstMoveWinRateO: 0,
            firstMoveTotalX: 0,
            firstMoveTotalO: 0,
            moveFrequencies: {}
          };
          
          for (const board in mBoardToMoves) {
            const moves = mBoardToMoves[board];
            boardStats.totalMoves += moves.length;
            boardStats.uniqueBoardStates += 1; // Count unique board states
          
            moves.forEach((move, index) => {
              if (move.state === 1) { // X wins
                boardStats.totalWinsX += 1;
                boardStats.totalDepthForWinsX += move.depth;
                if (move.depth < boardStats.shortestWinDepthX) {
                  boardStats.shortestWinDepthX = move.depth;
                }
                if (index === 0) {
                  boardStats.firstMoveWinRateX += 1;
                }
              } else if (move.state === -1) { // O wins
                boardStats.totalWinsO += 1;
                boardStats.totalDepthForWinsO += move.depth;
                if (move.depth < boardStats.shortestWinDepthO) {
                  boardStats.shortestWinDepthO = move.depth;
                }
                if (index === 1) {
                  boardStats.firstMoveWinRateO += 1;
                }
              } else if (move.state === 0) { // Draw
                boardStats.totalDraws += 1;
                boardStats.totalDepthForDraws += move.depth;
                if (move.depth > boardStats.longestDrawDepth) {
                  boardStats.longestDrawDepth = move.depth;
                }
              }
          
              // Track move counts by depth
              if (!boardStats.moveCounts[move.depth]) {
                boardStats.moveCounts[move.depth] = 0;
              }
              boardStats.moveCounts[move.depth] += 1;
          
              // Track move frequencies
              const moveKey = `${move.row}-${move.column}`;
              if (!boardStats.moveFrequencies[moveKey]) {
                boardStats.moveFrequencies[moveKey] = 0;
              }
              boardStats.moveFrequencies[moveKey] += 1;
            });
          }
          
          // Calculate averages
          boardStats.averageDepthForWinsX = boardStats.totalWinsX > 0 ? boardStats.totalDepthForWinsX / boardStats.totalWinsX : 0;
          boardStats.averageDepthForWinsO = boardStats.totalWinsO > 0 ? boardStats.totalDepthForWinsO / boardStats.totalWinsO : 0;
          boardStats.averageDepthForDraws = boardStats.totalDraws > 0 ? boardStats.totalDepthForDraws / boardStats.totalDraws : 0;
          
          // Calculate win rates
          boardStats.winRateX = (boardStats.totalWinsX / boardStats.totalMoves) * 100;
          boardStats.winRateO = (boardStats.totalWinsO / boardStats.totalMoves) * 100;
          boardStats.drawRate = (boardStats.totalDraws / boardStats.totalMoves) * 100;
          
          // Calculate first move win rates
          boardStats.firstMoveWinRateX = (boardStats.firstMoveWinRateX / boardStats.uniqueBoardStates) * 100;
          boardStats.firstMoveWinRateO = (boardStats.firstMoveWinRateO / boardStats.uniqueBoardStates) * 100;
          
          // Determine most frequent winning moves
          const mostFrequentWinningMoveX = Object.entries(boardStats.moveFrequencies).reduce((a: any, b: any) => boardStats.moveFrequencies[a] > boardStats.moveFrequencies[b] ? a : b, null);
          const mostFrequentWinningMoveO = Object.entries(boardStats.moveFrequencies).reduce((a: any, b: any) => boardStats.moveFrequencies[a] > boardStats.moveFrequencies[b] ? a : b, null);
          
          console.log('Board Statistics:', boardStats);
          console.log('Most Frequent Winning Move for X:', mostFrequentWinningMoveX);
          console.log('Most Frequent Winning Move for O:', mostFrequentWinningMoveO);
        return boardStats;
    };

    computerPlayer.getBoardToMoves = function () {
        return mBoardToMoves;
    };

    computerPlayer.setBoardToMoves = function (boardToMoves) {
        mBoardToMoves = boardToMoves;
    };

    // Get best move {row: ?, column: ?} given a board
    computerPlayer.getBestMove = function (board) {
        var moveValues = computerPlayer.getMoveValues(board);
        var iMove = 1;

        var bestMove = {
            row: moveValues[0].row,
            column: moveValues[0].column,
            state: moveValues[0].state,
            depth: moveValues[0].depth
        };

        if (board.getCurrentPlayer() === board.piece.x) {
            // look for move w/ max value
            for (iMove = 1; iMove < moveValues.length; iMove += 1) {
                if (moveValues[iMove].state > bestMove.state ||
                        (moveValues[iMove].state === bestMove.state &&
                        moveValues[iMove].depth < bestMove.depth)) {
                    var bestMove = {
                        row: moveValues[iMove].row,
                        column: moveValues[iMove].column,
                        state: moveValues[iMove].state,
                        depth: moveValues[iMove].depth
                    };
                }
            }
        } else {
            // look for move w/ min value
            for (iMove = 1; iMove < moveValues.length; iMove += 1) {
                if (moveValues[iMove].state < bestMove.state ||
                        (moveValues[iMove].state === bestMove.state &&
                        moveValues[iMove].depth < bestMove.depth)) {
                    var bestMove = {
                        row: moveValues[iMove].row,
                        column: moveValues[iMove].column,
                        state: moveValues[iMove].state,
                        depth: moveValues[iMove].depth
                    };
                }
            }
        }

        return bestMove;
    };

    return computerPlayer;

}

//return computerPlayerFactory;
export { computerPlayerFactory };
