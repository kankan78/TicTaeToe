import { Amplify } from '@aws-amplify/core';
import { Auth, DataStore } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, ImageBackground, Pressable, Text, View } from 'react-native';
import styles from './App.style';
import bg from './assets/bg.jpeg';
import awsconfig from './src/aws-exports';
import { Game } from './src/models';
import { runBot } from './src/utils/botLogic';
import { checkWinStatus, isTie } from './src/utils/gameLogic';
import { emptyArr } from './src/utils/index';

Amplify.configure({
  ...awsconfig,
  Analytics : {
    disabled : true
  }
})

function App() {
  const [map , setMap] = useState(emptyArr);
  const [currentTurn , setCurrentTurn] = useState("X");
  const [myPlayerType , setMyPlayerType] = useState("");
  const [gameMode , setGameMode] = useState("EASY");
  const [game , setGame] = useState(null);
  const [authUser , setAuthUser] = useState(null);

  const gameModeArr = ["LOCAL" , "EASY" , "MEDIUM" , "ONLINE"]

  useEffect(()=>{
    if(currentTurn === "O" && ["EASY" , "MEDIUM"].includes(gameMode)){
      const chosenOption = runBot(map , gameMode);
      if(chosenOption){
        onPress(chosenOption.row , chosenOption.col)
      }
    }
  },[currentTurn,gameMode]);

  useEffect(()=>{
    const winner = checkWinStatus(map);

    if(winner){
      onGameOver(`Hurray !!! "${winner}" won the game`);
    }else{
      onGameTie()
    }
  },[map]);

  useEffect(()=>{
    if(!game){
      return;
    }
    // update cloud game
    if(game.map !== JSON.stringify(map) || game.currentPlayer !== currentTurn){
      DataStore.save(
        Game.copyOf(game, (updatedGame) => { 
          updatedGame.currentPlayer = currentTurn;
          updatedGame.map = JSON.stringify(map);
        })
      )
    };
  },[map]);

  useEffect(()=>{
    if(!game){
      return;
    }

    const subscription = DataStore.observe(Game, game.id).subscribe(msg => {
      if(msg.opType === "UPDATE"){
        const updatedGame = msg.element;
        setGame(updatedGame);
        updatedGame.currentPlayer && setCurrentTurn(updatedGame.currentPlayer);
        updatedGame.map && setMap(JSON.parse(updatedGame.map));
      }
    });

    return () => subscription.unsubscribe();
  },[game?.id]);

  useEffect(()=>{
    resetGame();
    if(gameMode === "ONLINE"){
      createStartOnlineGame();
    }else{
      deleteTempGame();
    }
  },[gameMode]);

  useEffect(()=>{
    Auth.currentAuthenticatedUser().then(user => setAuthUser(user)); // get auth current user data
  },[authUser]);

  const onPress = (ri , ci)=>{
    if(gameMode === "ONLINE" && myPlayerType !== currentTurn){
      Alert.alert("Wait for your TURN!!!!!");
      return;
    }

    if(map[ri][ci] !== ""){
      Alert.alert("Position already occupied");
      return;
    }
    
    setMap((prevMap)=>{
      const newMap = [...prevMap];
      newMap[ri][ci] = currentTurn;
      return newMap;
    });

    setCurrentTurn(current => current === "X" ? "O" : "X");
  };

  const onLogout = async () => {
    await DataStore.clear();
    Auth.signOut();
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
    if(isTie(map)){
      onGameOver("OOOOOOOhhhhhhh , Its a TIE");
    }
  }

  const resetGame = () => {
    setMap([
      ["", "", ""],
      ["", "", ""],
      ["", "", ""]
    ]);
    setCurrentTurn("X");
  }

  const onModeChange = (_gameMode) => {
    setGameMode(_gameMode);
    resetGame();
  }

  /*
  ======================= MULTI-PLAYER START ====================
  */

  const createStartOnlineGame = async ()=>{
    // query for already running games where 1 player needed
    const games = await getAvailableGames();

    if(games.length > 0){
      joinGame(games[0]);
    }else {
      // if no such game available , create new 1
      await createOnlineGame();
    }
  }

  const getAvailableGames = async ()=> {
    const games = await DataStore.query(Game, g => g.playerO("eq", null));
    return games;
  }

  const joinGame = async (game) => {
    const updatedGame = await DataStore.save(
      Game.copyOf(game, (updatedGame) => { 
        updatedGame.playerO = authUser.attributes.sub; // setting current auth user to available game as playerO
      })
    );
    setGame(updatedGame);
    setMyPlayerType("O");
  }

  const deleteTempGame = async ()=> {
    if(!game || game.playerO){
      setGame(null);
      return;
    }else{
      await DataStore.delete(Game, game.id)
      setGame(null);
    }
  }

  const createOnlineGame = async ()=>{
    
    const mapString = JSON.stringify([
                          ["", "", ""],
                          ["", "", ""],
                          ["", "", ""]
                        ]); // Stringify the empty Array as Model accept only string

    // create Game Object
    const newGame = new Game({
      playerX : authUser.attributes.sub, // get auth current user unique id in attribute>sub 
      map : mapString,
      currentPlayer : 'X',
      pointsX : 0,
      pointsO : 0,
    });

    const createdGame = await DataStore.save(newGame)

    setGame(createdGame);
    setMyPlayerType("X");
  }

  /*
  ======================= MULTI-PLAYER END ====================
  */

  return (
    <View style={styles.container}>
      <ImageBackground source={bg} style={styles.bg} resizeMode={"contain"}>
        <Text style={styles.text}>
          Current Turn : {currentTurn.toLocaleUpperCase()}
        </Text>
        {game && <Text style={{ color : "white" }}>
          Game : {game.id}
        </Text>}
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
              onPress = { () => onModeChange(_gameMode) }
              style={[styles.button , {backgroundColor : gameMode === _gameMode ? "#4F5686" : "#191F24" }]} 
              key={`row-${gi}`}>
                {_gameMode}
              </Text>
            ))
          }
        </View> 
        <View style={[styles.buttons, {bottom: 20}]}>
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
