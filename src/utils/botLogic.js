import { checkWinStatus } from "./gameLogic";
import { copyMapFun } from "./index";

export const runBot = (map , gameMode) => {
    // collect all possible moves
    const possibleMoves = [];
    map.forEach((row, ri) => {
        row.forEach((cell, ci) => {
            if(cell === "" ) possibleMoves.push({row: ri, col: ci} )
        })
    });

    let chosenOption = null;

    if(gameMode === "MEDIUM"){
        // Attack
        if(!chosenOption){
            // Check if Bot wins when takes position "O"
            possibleMoves.forEach(position => {
                const copymap = copyMapFun(map);
                copymap[position.row][position.col] = "O";
                if(checkWinStatus(copymap) === "O"){
                // Attack that position
                chosenOption = position;
                }
            });
        }

        // Defend
        if(!chosenOption){
            // Check if opponent wins when takes position "X"
            possibleMoves.forEach(position => {
                const copymap = copyMapFun(map);
                copymap[position.row][position.col] = "X";
                if(checkWinStatus(copymap) === "X"){
                // Defend that position
                chosenOption = position;
                }
            });
        }
    }

    // Random Bot
    if(!chosenOption){
        chosenOption = possibleMoves[(Math.floor(Math.random() * possibleMoves.length))];
    }

    return chosenOption
}