import React from "react";

import './styles/index.scss';
import TopBar from './components/TopBar.js';
import Heatmap from './components/Heatmap.js';
import Waterfall from "./components/Waterfall";
import * as d3Collection from 'd3-collection';
import * as d3Array from 'd3-array';

import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';


import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import purple from '@material-ui/core/colors/purple';
import pink from '@material-ui/core/colors/pink';
const d3 = require('d3');

window.d3 = d3;
window.d3Collection = d3Collection;
window.d3Array = d3Array;



const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: pink,
    secondary: purple,
  },
});

class ViewButtons extends React.Component {

  render(){
      let disabled = false;
      if (this.props.selected === "init"){
        disabled = true;
      }

      return(
          <ButtonGroup className="plot-selection" disabled={disabled} color="primary">
            <Button onClick={() => {this.props.setSelected('timeline')}}>Heatmap</Button>
            <Button onClick={() => {this.props.setSelected('waterfall')}}>Waterfall</Button>
          </ButtonGroup>
      )

  }
}

class App extends React.Component {

  state = {
    data: '',
    selected: 'init'
  }

  constructor(props){
    super(props);
    this.receiveData = this.receiveData.bind(this);
    this.setSelected = this.setSelected.bind(this);
  }

  receiveData(new_data){
    this.setState({data: new_data,
                   selected:'timeline'});
    // console.log('parent got data')
    // console.log(new_data)
    // debugger;
    // create_chart(new_data)

  }

  setSelected(new_state){
    this.setState({selected:new_state})
  }

  render(){
    let view;
    let buttons;

    let disabled = false;
    if (this.state.selected == "init"){
      view = <h1 style={{padding: '1rem'}}>Scrape some data to continue!</h1>;
      disabled = true;
    } else if (this.state.selected == "timeline") {
      view = <Heatmap data={this.state.data} />;
    } else if (this.state.selected == "waterfall"){
      view = <Waterfall data={this.state.data} />;
    }

    return(
    <ThemeProvider theme={theme}>
    <div className="App">
      <header className="App-header">
        <TopBar sendData={this.receiveData}/>
      </header>
      <ViewButtons selected={this.state.selected} setSelected={this.setSelected}/>
      {view}
    </div>
    </ThemeProvider>
    ); 
  }
}

export default App;
