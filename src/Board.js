import React, { useState } from "react";
import Cell from "./Cell";

class Player {
  constructor(number, human, opponent) {
    this.number = number;
    this.human = human;
    this.opponent = opponent;
  }
}

let player1;
let player2;
let player;
let gameOn = true;
let board = [];
let runComputer;

export default function Board() {
    
  const [gameBoard, setBoard] = useState({ values: board });
  const [hide, setHide] = useState({ one: true, two: true });
  const [string, setString] = useState("Play Connect 4!");
  const [moveList, setMove] = useState([]);

  function initializeGame(p1, p2) {
    player1 = new Player(1, p1, 2);
    player2 = new Player(2, p2, 1);
    player = player1;
    board = [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ];

    setBoard({ values: board });
    setHide({ one: false, two: false });
    setString("Player 1's Turn");
    setTimeout(() => {
      if (!player.human) {
        computer();
      }
    }, 0);
  }
  function checkRow(array, value) {
    if (array.length < 4) {
      return false;
    } else {
      for (let i = 0; i < 4; i++) {
        if (array[i] != value) {
          const [head, ...tail] = array;
          return checkRow(tail, value);
        }
      }
      return true;
    }
  }
  function columnArray(column, board) {
    let colArr = [];
    for (let i = 5; i > -1; i--) {
      colArr.push(board[i][column]);
    }
    return colArr;
  }

  function checkGame(row, column) {
    let x = board[row];
    let diag1 = frontDiag(row, column, board);
    let diag2 = backDiag(row, column, board);
    let col = columnArray(column, board);
    if (
      checkRow(x, player.number) ||
      checkRow(col, player.number) ||
      checkRow(diag1, player.number) ||
      checkRow(diag2, player.number)
    ) {
      gameOn = false;
      setString("Player " + player.number + " wins!");
    } else {
      switchPlayer();
    }
  }

  function switchPlayer() {
    if (player == player1) {
      player = player2;
    } else {
      player = player1;
    }
    setString("Player " + player.number + "'s Turn");
    setTimeout(() => {
      if (!player.human) {
        computer();
      }
    }, 500);
  }

  function dropChip(boardx, column, p) {
    if (gameOn) {
      for (let r = 5; r > -1; r--) {
        if (boardx[r][column] == 0) {
          boardx[r][column] = p.number;
          setBoard({ values: boardx });
          return r;
        }
      }
      return -1;
    }
  }

  function undrop() {
    if (moveList.length != 0 && gameOn) {
      clearTimeout(runComputer);
      let lastMove = moveList.pop();
      let [row, col] = [lastMove[0], lastMove[1]];
      board[row][col] = 0;
      setBoard({ values: board });
      switchPlayer();
    }
  }

  function click(i) {
    if (player.human) {
      let r = dropChip(board, i, player);
      if (r != -1) {
        setMove((moveList) => [...moveList, [r, i]]);
        checkGame(r, i);
      }
    }
  }

  function frontDiag(i, j) {
    let forward = [];
    let backward = [];

    let row = i;
    let column = j;

    while (row < 5 && column < 6) {
      forward.push(board[++row][++column]);
    }
    row = i;
    column = j;
    while (row > 0 && column > 0) {
      backward.unshift(board[--row][--column]);
    }
    return [...backward, board[i][j], ...forward];
  }

  function backDiag(i, j, board) {
    let forward = [];
    let backward = [];

    let row = i;
    let column = j;

    while (row > 0 && column < 6) {
      forward.push(board[--row][++column]);
    }
    row = i;
    column = j;
    while (row < 5 && column > 0) {
      backward.unshift(board[++row][--column]);
    }
    return [...backward, board[i][j], ...forward];
  }

  function scoringHeuristic(array, p, score) {
    const [head, ...tail] = array;
    let firstFour = [head, tail[0], tail[1], tail[2]];
    if (firstFour.every((x) => x == p.number)) {
      score += 50;
    }
    if (
      (head == 0 &&
        tail[0] == p.number &&
        tail[1] == p.number &&
        tail[2] == p.number) ||
      (head == p.number &&
        tail[0] == p.number &&
        tail[1] == p.number &&
        tail[2] == 0)
    ) {
      score += 5;
    }
    if (
      firstFour.every((x) => x != p.opponent) &&
      firstFour.filter((x) => x == p.number).length == 2
    ) {
      score += 1;
    }
    if (firstFour.every((x) => x == p.opponent)) {
      score -= 50;
    }
    if (
      (head == 0 &&
        tail[0] == p.opponent &&
        tail[1] == p.opponent &&
        tail[2] == p.opponent) ||
      (head == p.opponent &&
        tail[0] == p.opponent &&
        tail[1] == p.opponent &&
        tail[2] == 0)
    ) {
      score -= 5;
    }
    if (
      firstFour.every((x) => x != p.number) &&
      firstFour.filter((x) => x == p.opponent).length == 2
    ) {
      score -= 1;
    }
    if (tail.length > 3) {
      return scoringHeuristic(tail, p, score);
    } else {
      return score;
    }
  }

  function evalBoard(aboard, p) {
    let val = 0;

    let positiveDiag = [];
    let backwardDiag = [];
    let columns = [];

    for (let i = 0; i < 7; i++) {
      columns.push(columnArray(i, aboard));
    }
    for (let r = 5; r > 2; r--) {
      positiveDiag.push(backDiag(r, 0, aboard));
      positiveDiag.push(backDiag(5, r - 2, aboard));
    }
    for (let x = 0; x < 3; x++) {
      backwardDiag.push(frontDiag(x, 0, aboard));
      backwardDiag.push(frontDiag(0, x + 1, aboard));
    }
    val += [positiveDiag, backwardDiag, columns, aboard]
      .map((y) =>
        y
          .map((x) => scoringHeuristic(x, p, val))
          .reduce((previous, current) => previous + current)
      )
      .reduce((previous, current) => previous + current);

    return p == player1 ? val : -1 * val;
  }

  function miniMax(aboard, depth, p, alpha, beta) {
    let moves = [0, 1, 2, 3, 4, 5, 6];
    let valid_moves = moves.filter((x) => aboard[0][x] == 0);
    if (depth == 0 || valid_moves.length == 0) {
      return [null, evalBoard(aboard, p)];
    }

    if (p == player1) {
      let bestMove = null;
      for (const i of valid_moves) {
        let board_ = JSON.parse(JSON.stringify(aboard));
        dropChip(board_, i, p);
        let mini = miniMax(board_, depth - 1, player2, alpha, beta);
        let score = mini[1];
        if (score > alpha) {
          alpha = score;
          bestMove = i;
        }
        if (alpha > beta) {
          break;
        }
      }
      return [bestMove, alpha];
    } else {
      let bestMove = null;
      for (const i of valid_moves) {
        let board_ = JSON.parse(JSON.stringify(aboard));
        dropChip(board_, i, p);
        let mini = miniMax(board_, depth - 1, player1, alpha, beta);
        let score = mini[1];
        if (score < beta) {
          beta = score;
          bestMove = i;
        }
        if (beta < alpha) {
          break;
        }
      }
      return [bestMove, beta];
    }
  }

  function computer() {
    let algo = miniMax(
      board,
      4,
      player,
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY
    );

    let c = algo[0];
    let r = dropChip(board, c, player);
    setMove((moveList) => [...moveList, [r, c]]);
    setTimeout(() => checkGame(r, c), 0);
  }

  return (
    <div>
      <h1>{string}</h1>
      {hide.one && (
        <div className="menu">
          <button className="menu" onClick={() => initializeGame(true, true)}>
            Vs. Human
          </button>

          <button className="menu" onClick={() => initializeGame(true, false)}>
            Vs. Computer
          </button>
        </div>
      )}
      {!hide.one && (
        <table>
          <tbody>
            {gameBoard.values.map((row, rowNumber) => {
              return (
                <tr key={rowNumber}>
                  {row.map((cell, cellNumber) => {
                    return (
                      <Cell
                        number={cell}
                        onClick={() => click(cellNumber)}
                        key={cellNumber}
                      />
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {!hide.one && <button className="undo" onClick={() => undrop()}>undo</button>}
    </div>
  );
}
