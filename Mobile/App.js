import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import RootNav from './navigation/RootNav';

export default class App extends React.Component {
  render() {
    return (
      <View style={{flex: 1}}>
        <RootNav/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
});
