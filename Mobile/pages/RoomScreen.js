import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import Header from '../components/Header'
import { Button } from 'react-native';


export default class RoomScreen extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      users:
        [
          {
            "name": "Ayo Johnson",
            "first": "1"
          },
          {
            "name": "David Maloglin",
            "first": "2"
          },
          {
            "name": "Eric Hue",
            "first": "3"
          },
          {
            "name": "Deren Titan",
            "first": "4"
          },
          {
            "name": "Simon Locasaur",
            "first": "5"
          },
          {
            "name": "John Vincet",
            "first": "6"
          },
          {
            "name": "John Vincet",
            "first": "6"
          },
          {
            "name": "John Vincet",
            "first": "6"
          },
        ]

    }
  }

  render() {
    return (
      <View style={{ backgroundColor: 'white', flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', }} >
          <Header
            title="Home"
          />
          <TouchableOpacity style={{ justifyContent: 'flex-end', margin: 10, borderRadius: 24 }}>
            <Text style={{fontSize: 18, padding: 8}}>Share Code </Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', padding: 25, justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 18 }}>Name</Text>
          <Text style={{ fontSize: 18 }}>First</Text>
        </View>

        <FlatList
          data={this.state.users}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) =>
            <View style={{ flexDirection: 'row', padding: 25, justifyContent: 'space-between' }}>
              <Text style={{ }}>{item.name}</Text>
              <Text>{item.first}</Text>
            </View>
          }
          keyExtractor={item => item.first}
        />


        <TouchableOpacity style={{  justifyContent: 'flex-end', alignItems: 'center', padding: 15, backgroundColor:'#00b300' }}>
         <Text style={{fontSize: 18, color: 'white'}}>Start Shooting</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
