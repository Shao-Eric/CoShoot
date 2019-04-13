import React from 'react';
import { View, Text } from 'react-native';
import Header from '../components/Header'

export default class RoomScreen extends React.Component {

  render() {
    return (
      <View style={{ backgroundColor: 'white', flex: 1 }}>
        <Header
          titel="Shoot"
        />

        <Text>Room Screen</Text>
      </View>
    );
  }
}
