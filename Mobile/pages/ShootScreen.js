import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Camera, Permissions } from "expo";
import { SocketContext } from "../context/SocketContext";
import firebase from "firebase";

export default class ShootScreen extends React.Component {
    constructor(props) {
        super(props);
        let { firstUser } = this.props.navigation.state.params;

        this.camera = React.createRef();
        this.state = {
            permissionsGranted: false,
            currentShooter: firstUser,
            timer: 5
        };
    }

    static contextType = SocketContext;

    async componentDidMount() {
        let {
            firstUser,
            userInfo,
            owner,
            roomId
        } = this.props.navigation.state.params;

        let cameraResponse = await Permissions.askAsync(Permissions.CAMERA);
        if (cameraResponse.status == "granted") {
            let audioResponse = await Permissions.askAsync(
                Permissions.AUDIO_RECORDING
            );
            if (audioResponse.status == "granted") {
                this.setState({ permissionsGranted: true });
            }
        }

        this.context.on("control", msg => {
            this.setState({ currentShooter: msg.user });
        });
        this.context.on("stop", msg => {
            this.camera.stopRecording();
            this.props.navigation.navigate("Home");
        });

        this.interval = setInterval(
            () =>
                this.setState({ timer: this.state.timer - 1 }, () => {
                    console.log(this.state.timer);
                    if (this.state.timer === 0) {
                        this.camera
                            .recordAsync({
                                quality: Camera.Constants.VideoQuality["720p"]
                            })
                            .then(data => {
                                new Promise((resolve, reject) => {
                                    const xhr = new XMLHttpRequest();
                                    xhr.onload = function () {
                                        resolve(xhr.response); // when BlobModule finishes reading, resolve with the blob
                                    };
                                    xhr.onerror = function () {
                                        reject(new TypeError("Network request failed")); // error occurred, rejecting
                                    };
                                    xhr.responseType = "blob"; // use BlobModule's UriHandler
                                    xhr.open("GET", data.uri, true); // fetch the blob from uri in async mode
                                    xhr.send(null); // no initial data
                                }).then(blob => {
                                    const ref = firebase
                                        .storage()
                                        .ref()
                                        .child("files/" + roomId + "-" + userInfo.uid);
                                    ref.put(blob).then(snapshot => {
                                        let url = snapshot.ref.getDownloadURL().then(url =>
                                            this.context.emit("recieve file", url)
                                        )
                                    })
                                })
                            });
                    }
                }),
            1000
        );
    }

    componentDidUpdate() {
        if (this.state.timer === 0) {
            clearInterval(this.interval);
        }
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        let { firstUser, userInfo, owner } = this.props.navigation.state.params;


            return (
                <View
                    style={{
                        flex: 1,
                        backgroundColor: "black"
                    }}
                >
                    <Camera
                        style={{
                            flex: 1,
                            justifyContent: "center",
                            flexDirection: "column",
                            alignItems: "center"
                        }}
                        ref={ref => (this.camera = ref)}
                    >
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: "transparent",
                                borderWidth: 1,
                                borderColor: "red",
                                position: "absolute",
                                width: "85%",
                                height: "85%",
                                top: 60
                            }}
                        >
                            <TouchableOpacity
                                style={{
                                    flex: 0.1,
                                    alignSelf: "flex-end",
                                    alignItems: "center"
                                }}
                                onPress={() => {
                                    this.setState({
                                        type:
                                            this.state.type === Camera.Constants.Type.back
                                                ? Camera.Constants.Type.front
                                                : Camera.Constants.Type.back
                                    });
                                }}
                            >
                                <Text
                                    style={{ fontSize: 18, marginBottom: 10, color: "white" }}
                                >
                                    {this.state.currentShooter.uid === userInfo.uid
                                        ? "You are live!"
                                        : `${this.state.currentShooter.name} has the shot`}
                                </Text>
                            </TouchableOpacity>

                            <View
                                style={{
                                    justifyContent: "center",
                                    alignItems: "center"
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 150,
                                        marginBottom: 10,
                                        color: "white",
                                        top: "90%"
                                    }}
                                >
                                    {this.state.timer > 0 ? this.state.timer : null}
                                </Text>
                            </View>
                        </View>
                    </Camera>
                    <View
                        style={{
                            width: "85%",
                            height: 120,
                            backgroundColor: "black",
                            bottom: 0,
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "row",
                            paddingLeft: 50
                        }}
                    >
                        {owner && (
                            <TouchableOpacity
                                onPress={() => this.context.emit("stop")}
                                style={{
                                    width: "38%",
                                    flex: 1,
                                    alignItems: "center",
                                    margin: 4,
                                    borderRadius: 16,
                                    padding: 8,
                                    borderWidth: 2,
                                    borderColor: "#ff1744",
                                    opacity: this.state.timer !== 0 ? 0.1 : 1
                                }}
                                disabled={this.state.timer !== 0}
                            >
                                <Text
                                    style={{
                                        textAlign: "center",
                                        fontWeight: "bold",
                                        fontSize: 22,
                                        color: "#ff1744"
                                    }}
                                >
                                    Stop
                </Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={() => this.context.emit("control")}
                            disabled={this.state.currentShooter.uid == userInfo.uid}
                            style={{
                                width: "38%",
                                flex: 1,
                                alignItems: "center",
                                margin: 4,
                                borderRadius: 16,
                                padding: 8,
                                borderWidth: 2,
                                borderColor: "#42f4a7",
                                opacity: this.state.currentShooter.uid == userInfo.uid ? 0.1 : 1
                            }}
                        >
                            <Text
                                style={{
                                    textAlign: "center",
                                    fontWeight: "bold",
                                    fontSize: 22,
                                    color: "#42f4a7"
                                }}
                            >
                                TakeOver
              </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
    }
}
