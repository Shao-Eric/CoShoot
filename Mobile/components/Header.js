import { Constants } from 'expo';
import React from 'react';
import { Image, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { withNavigation } from 'react-navigation';

class Header extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <View
        style={styles.header}>
        <View style={{ justifyContent: 'flex-start', flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={{ padding: 16 }}
            onPress={() => this.props.onBackPressed?this.props.onBackPressed():this.props.navigation.goBack()}
          >
            <Image
              resizeMode="contain"
              style={styles.button(this.props.dark)}
              source={Platform.OS === 'ios' ? require('../images/navigation/ic_action_chevron_left.png') : require('../images/navigation/ic_action_arrow_back.png')}
            />
          </TouchableOpacity>
          <Text style={styles.title}>{this.props.title}</Text>

        </View>
        <View style={{ justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {this.props.children}
        </View>
      </View>
    );
  }
}

export default withNavigation(Header)

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? Constants.statusBarHeight : StatusBar.currentHeight;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    paddingTop: STATUSBAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: (dark) => ({
    flex: 1,
    fontSize: 16,
    color: dark?"white":"black",
    flexWrap: 'wrap',
    fontFamily: 'roboto_regular'
  }),
  button: (dark) => ({
    width: 24,
    tintColor: dark?'white':'black',
    height: 24
  })
})
