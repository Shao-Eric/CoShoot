import React from "react";
import io from "socket.io-client";

const socket = io("https://5fbdf468.ngrok.io");

export const SocketContext = React.createContext();

export default class Socket extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <SocketContext.Provider value={socket}>
        {this.props.children}
      </SocketContext.Provider>
    );
  }
}
