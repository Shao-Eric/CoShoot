import React from "react";


export const FileContext = React.createContext();

export default class Files extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        addfile: (file, thumbnail_image) => this.setState({files: [{file, thumbnail_image, title: new Date().toString(), artist: "Team Co-Shoot"}, ...this.state.files]}),
        files: []
    }
  }

  render() {
    return (
      <FileContext.Provider value={this.state}>
        {this.props.children}
      </FileContext.Provider>
    );
  }
}
