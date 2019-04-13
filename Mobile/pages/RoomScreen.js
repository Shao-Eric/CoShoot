import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import Header from '../components/Header'
import { Button } from 'react-native';


export default class RoomScreen extends React.Component {

  render() {
    return (
      <View style={{ backgroundColor: 'white', flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', }} >
          <Header
            title="Shoot"
          />
          <View style={{ justifyContent: 'flex-end', margin: 10 }}>
            <Button
              title="Share Code"
              color="Red"
            />
          </View>
        </View>

        <View style={{ flexDirection: 'row', padding: 25, justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 16 }}>Name</Text>
          <Text style={{ fontSize: 16 }}>First</Text>
        </View>

        <FlatList 
        
        />


        <View style={{ flex: 1, justifyContent: 'flex-end', marginBottom: 30 }}>
          <Button
            title="Start Shooting"
            color="Red"
          />
        </View>
      </View>
    );
  }
}
