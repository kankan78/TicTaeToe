import { StyleSheet } from 'react-native';

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

  export default styles;