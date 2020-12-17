import React from "react";

import './styles/index.scss';
import TopBar from './components/TopBar.js';
import Heatmap from './components/Heatmap.js';
import * as d3Collection from 'd3-collection';


import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import purple from '@material-ui/core/colors/purple';
import pink from '@material-ui/core/colors/pink';
const d3 = require('d3');

window.d3 = d3;
window.d3Collection = d3Collection;



const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: pink,
    secondary: purple,
  },
});

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
    <ThemeProvider theme={theme}>
    <div className="App">
      <header className="App-header">
        <TopBar sendData={this.receiveData}/>
      </header>

      {view}
    </div>
    </ThemeProvider>
    ); 
  }
}

export default App;
