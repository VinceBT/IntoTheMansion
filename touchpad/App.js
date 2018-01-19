/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import Canvas from 'react-native-canvas';
import {
  Platform,
  StyleSheet,
  Text,
  View,
    Alert,
    Button,
    Dimensions
} from 'react-native';

import { GameLoop } from "react-native-game-engine"
import Client from './src/model/client'
import Model from "./src/model/model";

export default class App extends Component<{}> {

    constructor(props){
      super(props);
      this.client = new Client("http://localhost:8080");
      this.model = new Model(this.client);
      this.ctx;

    }


    _onPressButton = () => {
        this.model.init();
        this.model.addRenderer(this.canvas);
    }

    handleCanvas = (canvas) => {
        this.canvas = canvas;
        this.canvas.height = Dimensions.get('window').height;
        this.canvas.width = Dimensions.get('window').width;
    }

  render() {
    return (
        <View style={styles.container}>
            <View style={styles.canvas}>
                <Canvas ref={this.handleCanvas}/>

            </View>
            <View style={styles.buttonContainer}>
                <Button
                    onPress={this._onPressButton}
                    title="Connexion"
                />
            </View>
        </View>

    );
  }
}

const full = {
    position:"absolute",
    width: '100%',
    height: '100%',
    flex: 1
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'red',
        flex: 1
    },
    canvas: {
        ...full,
        backgroundColor:"black",
        flex: 1
    },

    buttonContainer: {
        position:"absolute",
        margin: 20,
        bottom:20
    }
})