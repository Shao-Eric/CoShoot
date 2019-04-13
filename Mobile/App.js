import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import RootNav from './navigation/RootNav';
import Socket from './context/SocketContext';

export default class App extends React.Component {
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Socket>
          <RootNav />
        </Socket>
      </View>
    );
  }
}
