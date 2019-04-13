import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Header from "../components/Header";

const fakeArray = ["a", "b", "c"];
export default class HomeScreen extends React.Component {
  state = {
    modalVisible: false,
    data: []
  };

  componentWillMount() {
    fetch("https://rallycoding.herokuapp.com/api/music_albums")
      .then(response => response.json())
      .then(data =>
        this.setState({ data }, () => {
          console.log(this.state.data);
        })
      );
  }

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <View
          style={{
            backgroundColor: "#97befc",
            justifyContent: "center",
            alignItems: "center",
            height: 90,
            paddingTop: 30,
            shadowColor: "#181f28",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.5,
            elevation: 2,
            position: "relative"
          }}
        >
          <Text style={{ fontSize: 20 }}>CoShoot</Text>
        </View>

        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            Alert.alert("Modal has been closed.");
          }}
          style={{ flex: 1 }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#97befc"
            }}
          >
            <View
              style={{
                width: 300,
                height: 300,
                backgroundColor: "#97befc"
              }}
            >
              <TextInput
                placeholder="Code"
                placeholderTextColor="rgba(255,255,255,0.8)"
                returnKeyType="next"
                onSubmitEditing={() => this.passwordInput.focus()}
                keyboardType="default"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                onChangeText={code => this.setState({ code })}
                value={this.state.code}
              />

              <TextInput
                placeholder="Name"
                placeholderTextColor="rgba(255,255,255,0.8)"
                returnKeyType="go"
                ref={inputs => (this.passwordInput = inputs)}
                keyboardType="default"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                onChangeText={name => this.setState({ name })}
                value={this.state.name}
              />

              <TouchableOpacity
                onPress={() => {
                  console.log("code: " + this.state.code);
                  console.log("name: " + this.state.name);
                }}
              >
                <Text style={styles.textStyle}>Join</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  this.setModalVisible(!this.state.modalVisible);
                }}
              >
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={() => this.props.navigation.navigate("Room")}
          >
            <Text style={styles.textStyle}>Create A Shoot</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={() => {
              this.setModalVisible(true);
            }}
          >
            <Text style={styles.textStyle}>Join a Shoot</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          style={{ flex: 1 }}
          data={this.state.data}
          keyExtractor={item => item.title}
          renderItem={each => (
            <View
              style={{
                borderWidth: 1,
                borderRadius: 2,
                borderColor: "#ddd",
                borderBottomWidth: 0,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 1,
                marginLeft: 5,
                marginRight: 5
              }}
            >
              <View
                style={{
                  borderBottomWidth: 1,
                  padding: 5,
                  backgroundColor: "#fff",
                  justifyContent: "space-between",
                  flexDirection: "row",
                  borderColor: "#ddd",
                  position: "relative"
                }}
              >
                <View style={styles.thumbnailContainerStyle}>
                  <Image
                    style={{ height: 80, width: 80 }}
                    source={{
                      uri: each.item.thumbnail_image
                    }}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.headerContentStyle}>
                  <Text style={{ fontSize: 18, textAlign: "center" }}>
                    {each.item.title}
                  </Text>
                  <Text style={{ marginTop: 10, fontSize: 15 }}>
                    {each.item.artist}
                  </Text>
                </View>

                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "black"
                  }}
                >
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      fontWeight: "bold",
                      backgroundColor: "white",
                      justifyContent: "center",
                      paddingRight: 10
                    }}
                  >
                    <FontAwesome name="edit" size={25} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      </View>
    );
  }
}

const styles = {
  textStyle: {
    alignSelf: "center",
    color: "#007aff",
    fontSize: 16,
    fontWeight: "600",
    paddingTop: 10,
    paddingBottom: 10
  },
  buttonStyle: {
    flex: 1,
    alignSelf: "stretch",
    backgroundColor: "#fff"
  },
  input: {
    height: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginBottom: 10,
    color: "#FFF",
    paddingHorizontal: 10,
    fontSize: 20
  },
  thumbnailContainerStyle: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    marginRight: 10
  },
  headerContentStyle: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  }
};
