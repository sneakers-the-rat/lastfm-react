import React from "react";

import './styles/index.scss';
import TopBar from './components/TopBar.js';
import * as d3Collection from 'd3-collection';

import {create_chart} from './components/Heatmap.js';

const d3 = require('d3');

window.d3 = d3;
window.d3Collection = d3Collection;

class App extends React.Component {

  state = {
    data: ''
  }

  constructor(props){
    super(props);
    this.receiveData = this.receiveData.bind(this);
  }

  receiveData(new_data){
    this.setState({data: new_data});
    console.log('parent got data')
    console.log(new_data)
    // debugger;
    create_chart(new_data)

  }



  render(){
    return(
    <div className="App">
      <header className="App-header">
        <TopBar sendData={this.receiveData}/>
      </header>
      <div className="calendar-map">
      </div>
    </div>
    ); 
  }
}

export default App;
