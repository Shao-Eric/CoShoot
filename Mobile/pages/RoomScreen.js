import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
  Share
} from "react-native";
import { SocketContext } from "../context/SocketContext";

export default class RoomScreen extends React.Component {
  constructor(props) {
    super(props);
    let { name, roomId } = this.props.navigation.state.params;

    this.state = {
      first: { uid: 0, name },
      roomCode: roomId,
      users: roomId ? [] : [{ uid: 0, name }],
      userInfo: roomId ? null : { uid: 0, name }
    };

    this.newRoom = !roomId;
  }

  static contextType = SocketContext;

  componentDidMount() {
    let { name, roomId } = this.props.navigation.state.params;
    this.context.emit("join", { roomId, name });
    this.context.on("room created", msg => {
      this.setState({ roomCode: msg });
    });
    this.context.on("user joined", msg => {
      if (!this.state.userInfo) {
        this.setState({ userInfo: msg });
      }
      this.setState({ users: [...this.state.users, msg] });
    });
    this.context.on("start", msg => {
      this.props.navigation.navigate("Shoot", {
        firstUser: msg.user,
        userInfo: this.state.userInfo,
        owner: this.newRoom,
        roomId: this.state.roomCode
      });
    });
  }

  render() {
    return (
      <View style={{ backgroundColor: "white", flex: 1 }}>
        <View
          style={{
            backgroundColor: "#ff1744",
            justifyContent: "center",
            alignItems: "center",
            height: 90,
            paddingTop: 30,
            shadowColor: "#181f28",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.5,
            elevation: 2,
            flexDirection: "row",
            justifyContent: "space-between",
            position: "relative"
          }}
        >
          <TouchableOpacity
            style={{ padding: 16 }}
            onPress={() => this.props.navigation.goBack()}
          >
            <Image
              resizeMode="contain"
              style={{
                width: 24,
                tintColor: "white",
                height: 24
              }}
              source={
                Platform.OS === "ios"
                  ? require("../images/navigation/ic_action_chevron_left.png")
                  : require("../images/navigation/ic_action_arrow_back.png")
              }
            />
          </TouchableOpacity>
          {this.state.roomCode && (
            <TouchableOpacity
              style={{ alignItems: "flex-end", margin: 10, borderRadius: 24 }}
              onPress={() =>
                Share.share({
                  message: this.state.roomCode
                })
              }
            >
              <Text style={{ fontSize: 18, padding: 8, color: "white" }}>
                Code: {this.state.roomCode?this.state.roomCode:"joining..."}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={this.state.users}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                margin: 12,
                justifyContent: "space-between"
              }}
            >
              <Text>{item.name}</Text>
              {this.newRoom &&
                (this.state.first.uid === item.uid ? (
                  <Text>First Shooter</Text>
                ) : (
                  <TouchableOpacity
                    style={{ justifyContent: "flex-end", borderRadius: 24 }}
                    onPress={() =>
                      this.setState({ first: item }, () =>
                        console.log(this.state.first.uid)
                      )
                    }
                  >
                    <Text>Set As First Shooter</Text>
                  </TouchableOpacity>
                ))}
            </View>
          )}
          extraData={this.state.first}
          keyExtractor={item => item.uid}
        />

        {this.newRoom ? (
          <TouchableOpacity
            onPress={() => this.context.emit("start", this.state.first)}
            style={{
              justifyContent: "flex-end",
              alignItems: "center",
              margin: 4,
              borderRadius: 16,
              padding: 12,
              borderWidth: 2,
              borderColor: "#ff1744"
            }}
          >
            <Text style={{ fontSize: 18, color: "#ff1744" }}>
              Start Shooting
            </Text>
          </TouchableOpacity>
        ) : (
          <View
            style={{
              justifyContent: "flex-end",
              alignItems: "center",
              margin: 4,
              borderRadius: 16,
              padding: 12
            }}
          >
            <Text style={{ fontSize: 18, color: "#ff1744" }}>
              Waiting to start...
            </Text>
          </View>
        )}
      </View>
    );
  }
}
