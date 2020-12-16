import React from "react";

import './styles/index.scss';
import TopBar from './components/TopBar.js';
import Heatmap from './components/Heatmap.js';
import * as d3Collection from 'd3-collection';

const d3 = require('d3');

window.d3 = d3;
window.d3Collection = d3Collection;

class App extends React.Component {

  state = {
    data: '',
    selected: 'init'
  }

  constructor(props){
    super(props);
    this.receiveData = this.receiveData.bind(this);
  }

  receiveData(new_data){
    this.setState({data: new_data,
                   selected:'timeline'});
    console.log('parent got data')
    console.log(new_data)
    // debugger;
    // create_chart(new_data)

  }



  render(){
    let view;
    if (this.state.selected == "init"){
      view = <h1 style={{padding: '1rem'}}>Scrape some data to continue!</h1>;
    } else if (this.state.selected == "timeline") {
      view = <Heatmap data={this.state.data} />;
    }

    return(
    <div className="App">
      <header className="App-header">
        <TopBar sendData={this.receiveData}/>
      </header>

      {view}
    </div>
    ); 
  }
}

export default App;
