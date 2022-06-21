export const checkWinStatus = (mapcopy) => {
    for(let row = 0 ; row < 3 ; row++){
      // For Row Check
      let rowXWinner = mapcopy[row].every(cell => cell === "X");
      let rowOWinner = mapcopy[row].every(cell => cell === "O");

      if(rowXWinner) return "X"; 
      if(rowOWinner) return "O"
      
      // For Col Check
      let colXWinner = true;
      let colOWinner = true;
      for(let col = 0 ; col < 3 ; col++){
        if(mapcopy[col][row] !== "X"){
          colXWinner = false;
        }
        if(mapcopy[col][row] !== "O"){
          colOWinner = false;
        }
      }

      if(colXWinner) return "X"; 
      if(colOWinner) return "O"; 
    }

    // For Diagonal Check
    if(mapcopy[0][0] === "X" && mapcopy[1][1] === "X" && mapcopy[2][2] === "X" ) return "X"; 
    if(mapcopy[2][0] === "X" && mapcopy[1][1] === "X" && mapcopy[0][2] === "X" ) return "X"; 
    if(mapcopy[0][0] === "O" && mapcopy[1][1] === "O" && mapcopy[2][2] === "O" ) return "O"; 
    if(mapcopy[2][0] === "O" && mapcopy[1][1] === "O" && mapcopy[0][2] === "O" ) return "O"; 

  }

export const isTie = (map) => {
    return !map.some(row => row.some( cell => cell === ""))
}