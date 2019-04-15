import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import RootNav from './navigation/RootNav';
import Socket from './context/SocketContext';
import Files from './context/FileContext';
import firebase from 'firebase'

export default class App extends React.Component {
  componentWillMount() {
    let config = {
      apiKey: "AIzaSyBgxvTXp5J9srxjKar-xBnOfY-2e08A144",
      authDomain: "coshoot-7b820.firebaseapp.com",
      databaseURL: "https://coshoot-7b820.firebaseio.com",
      projectId: "coshoot-7b820",
      storageBucket: "coshoot-7b820.appspot.com",
      messagingSenderId: "70890304758"
    };
    firebase.initializeApp(config);

  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Socket>
          <Files>
            <RootNav />
          </Files>
        </Socket>
      </View>
    );
  }
}
