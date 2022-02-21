const Agent = require("ai-agents").Agent;
// const solver = require("./solver");
const transposeHex = require("./transposeHex");
const boardPath = require("./boardScore");
const boardScore = require("./boardScore");
const getEmptyHex = require("./getEmptyHex");
//Arbol minMax
var tree = [];

//infinito negativo
const ninfinity = -999999999;
//infinito positivo
const pinfinity = 999999999;
class HexAgent extends Agent {
  constructor(value) {
    super(value);
    this.cache = {};
  }

    /**
   * Returns an array containing the [k,j] of the empty hex in the board
   * @param {Matrix} board
   */
  getEmptyHexPosition(board) {
    let result = [];
    let size = board.length;
    for (let k = 0; k < size; k++) {
      for (let j = 0; j < size; j++) {
        if (board[k][j] === 0) {
          result.push([k, j]);
        }
      }
    }
    return result;
  }

  /**
   * Función que retorna los hijos de un nodo dado, dependiendo
   * del jugador
   * @param {*} node
   * @returns
   */
  returnChildren(node, id_Agent) {
    var emptyPositions = this.getEmptyHexPosition(node);
    var children = [];
    for (let i = 0; i < emptyPositions.length; i++) {
      var row = node[emptyPositions[i][0]].slice();
      var board = node.slice();
      row[emptyPositions[i][1]] = id_Agent;
      //Despues de haber reemplazado el id del agente dentro de la fila de board, se reemplaza la fila entera dentro de este mismo
      board[emptyPositions[i][0]] = row;
      children.push([board, [emptyPositions[i][0], emptyPositions[i][1]]]);
    }
    return children;
  }

  /**
   *
   * @param {*} array
   * @param {*} value
   * @returns
   */
  searchSolution(array, value) {
    var i = 0;
    while (i < array.length) {
      if (array[i][0] == value && array[i][1] == 1) {
        return array[i][2];
      }
      i = i + 1;
    }
  }

  podaAlphaBeta(
    node,
    deepNode,
    i,
    depthTree,
    alpha,
    beta,
    stateMax,
    valuesArray
  ) {
    if (
      depthTree === 0 ||
      boardScore(node, "1") === ninfinity ||
      boardScore(node, "1") === pinfinity
    ) {
      valuesArray.push([boardScore(node, "1"), deepNode]);
      return boardScore(node, "1");
    }
    if (stateMax) {
      var value = ninfinity;
      //Meter los hijos para el caso del jugador 1, se pone un movimiento del jugador 1
      var children = this.returnChildren(node, "1");
      var j = 0;
      while (j < children.length) {
        value = Math.max(
          value,
          this.podaAlphaBeta(
            children[j][0],
            deepNode + 1,
            i + 1,
            depthTree - 1,
            alpha,
            beta,
            false,
            valuesArray
          )
        );
        valuesArray.push([value, deepNode, children[j]]);
        if (value >= beta) {
          break;
        }
        alpha = Math.max(alpha, value);
        j = j + 1;
      }
      return value;
    } else {
      var value = pinfinity;
      //Meter los hijos para el caso del jugador 2, se pone un movimiento del jugador 2
      var children = this.returnChildren(node, "2");
      var j = 0;
      while (j < children.length) {
        value = Math.min(
          value,
          this.podaAlphaBeta(
            children[j][0],
            deepNode + 1,
            i + 1,
            depthTree - 1,
            alpha,
            beta,
            true,
            valuesArray
          )
        );
        valuesArray.push([value, deepNode, children[j]]);
        if (value <= alpha) {
          break;
        }

        beta = Math.min(beta, value);
        j = j + 1;
      }
      return value;
    }
  }

  /**
   * return a new move. The move is an array of two integers, representing the
   * row and column number of the hex to play. If the given movement is not valid,
   * the Hex controller will perform a random valid movement for the player
   * Example: [1, 1]
   */

  send() {
    let board = this.perception;
    let id = this.getID();
    //tamaño del tablero
    let size = board.length;
    let available = getEmptyHex(board);
    let nTurn = size * size - available.length;
    if (id === "2") {
      board = transposeHex(board);
    }
    var values = [];
    var value = this.podaAlphaBeta(
      board,
      1,
      0,
      2,
      ninfinity,
      pinfinity,
      true,
      values
    );
    var move = this.searchSolution(values, value)[1];
    if (id === "2") {
      console.log(move);
      return [move[1], move[0]];
    } else {
      console.log(move);
      return move;
    }
  }
}

// let board = [
//   ["1", "2", 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0],
// ];

let board = [
  [0, 0, "1"],
  [0, 0, "2"],
  ["1", "2", 0],
];

module.exports = HexAgent;