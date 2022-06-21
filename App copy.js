import { Amplify } from '@aws-amplify/core';
import { Auth } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import bg from './assets/bg.jpeg';
import awsconfig from './src/aws-exports';


Amplify.configure(awsconfig)

function App() {
  const [map , setMap] = useState([
    ["", "", ""],
    ["", "", ""],
    ["", "", ""]
  ]);

  const [currentUser , setCurrentUser] = useState("X");
  const [gameMode , setGameMode] = useState("EASY");
  const gameModeArr = ["LOCAL" , "EASY" , "MEDIUM"]

  useEffect(()=>{
    if(currentUser !== "X" && gameMode !== "LOCAL"){
      runBot();
    }
  },[currentUser]);

  useEffect(()=>{
    const winner = checkWinStatus(map);

    if(winner){
      onGameOver(`Hurray !!! "${winner}" won the game`);
    }else{
      onGameTie()
    }
  },[map]);

  const onPress = (ri , ci)=>{
    if(map[ri][ci] !== ""){
      Alert.alert("Position already occupied");
      return;
    }
    
    setMap((prevMap)=>{
      const newMap = [...prevMap];
      newMap[ri][ci] = currentUser;
      return newMap;
    });

    setCurrentUser(current => current === "X" ? "O" : "X");
  };

  const onLogout = () => {
    Auth.signOut()
  }

  const checkWinStatus = (mapcopy) => {
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

  const onGameOver = (msg) => {
    Alert.alert(msg , "" ,
      [{
        text : "Restart",
        onPress : resetGame
      }]
    )
  } 

  const onGameTie = () => {
    if(!map.some(row => row.some( cell => cell === ""))){
      onGameOver("OOOOOOOhhhhhhh , Its a TIE");
    }
  }

  const resetGame = () => {
    setMap([
      ["", "", ""],
      ["", "", ""],
      ["", "", ""]
    ]);
    setCurrentUser("X");
  }

  const copyMapFun = (original) => {
    const copy = JSON.parse(JSON.stringify(original));
    return copy
  }

  const runBot = () => {
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
        })
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
        })
      }
    }

    // Random Bot
    if(!chosenOption){
      chosenOption = possibleMoves[(Math.floor(Math.random() * possibleMoves.length))];
    }

    if(chosenOption){
      onPress(chosenOption.row , chosenOption.col)
    }
  }

  return (
    <View style={styles.container}>
      <ImageBackground source={bg} style={styles.bg} resizeMode={"contain"}>
        <Text style={styles.text}>
          Current Turn : {currentUser.toLocaleUpperCase()}
        </Text>
        <View style={styles.map}>
          {
            map.map((row , ri) => (
              <View style={styles.row} key={`row-${ri}`}>
                {row.map((cell , ci) => (
                    <Pressable onPress={()=> onPress(ri,ci)} style={styles.cell} key={`row-${ri}-col-${ci}`}>
                      {cell === "O" && <View style={styles.circle}/> }
                      {cell === "X" && <View style={styles.cross}>
                                          <View style={styles.crossline}/>
                                          <View style={[styles.crossline,styles.crosslinerev]}/>
                                        </View>}
                    </Pressable>
                  )
                )}
              </View>
            ))
          }
        </View> 
        <View style={styles.buttons}>
          {
            gameModeArr.map((_gameMode , gi) => (
              <Text 
              onPress = {() => setGameMode(_gameMode)}
              style={[styles.button , {backgroundColor : gameMode === _gameMode ? "#4F5686" : "#191F24" }]} 
              key={`row-${gi}`}>
                {_gameMode}
              </Text>
            ))
          }
        </View> 
        <View style={[styles.buttons, {bottom: 50}]}>
          <Text 
            onPress = {onLogout}
            style={[styles.button , {backgroundColor : "red" }]} >
            LOGOUT
          </Text>
        </View> 
      </ImageBackground>      
      {/* <StatusBar style="auto" /> */}
    </View>
  );
}

export default withAuthenticator(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#242D34',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bg: {
    width: "100%",
    height: "100%",
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20
  },
  text: {
    fontWeight: "bold",
    fontSize: 24,
    color: "white",
    position: "absolute",
    top: 50
  },
  map: {
    width: "80%",
    aspectRatio: 1,
  },
  row:{
    flex: 1,
    flexDirection: "row"
  },
  cell: {
    flex: 1,
    width: 100,
    height: 100,
    // margin: 10,
  },
  circle: {
    // left: 2* 105,
    // position: "absolute",
    flex:1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    borderRadius: 50,
    borderWidth: 10,
    borderColor: "white"
  },
  cross: {
    flex:1
  },
  crossline: {
    left: "48%",
    position: "absolute",
    backgroundColor: "white",
    width: 10,
    height: "100%",
    borderRadius: 10,
    transform: [
      {rotate: "45deg" }
    ]
  },
  crosslinerev: {
    transform: [
      {rotate: "-45deg" }
    ]
  },
  buttons:{
    position: "absolute",
    bottom: 100,
    flexDirection: "row"
  },
  button:{
    backgroundColor: "#191F24",
    fontWeight: "bold",
    fontSize: 16,
    color: "white",
    padding: 10,
    margin: 10,
  }

});
