import React from "react";


import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';


import { getAllPages, cleanData } from '../scrape/scraper.js'


class TopBar extends React.Component {

	state = {
        username: '',
        currentPage: 0,
        totalPages: 0,
        downloading: false,
        progress: 0,
        userData: ''
    }

    constructor(props){
    	super(props);
    	this.scrapeData = this.scrapeData.bind(this);
    	this.updateProgress = this.updateProgress.bind(this);
    	this.updateUsername = this.updateUsername.bind(this);

    }





    scrapeData(){
    	console.log('scraping')
    	console.log(this.state.username);

    	this.setState({downloading: true})
    	getAllPages(this.state.username, this.updateProgress, process.env.REACT_APP_LASTFM_API_KEY).then(r => {
    		if (!r){
    			console.log('no data gotten!!');
    			return;
    		}

    		// clean data
    		let clean_data = cleanData(r);
    		this.setState({userData: clean_data});


    		this.props.sendData(clean_data)
    	})


    }

    updateProgress(page, pages){
    	// console.log('updateprogress: page' + page + "total pages" + pages)

    	this.setState({currentPage: this.state.currentPage + 1,
    				   totalPages: pages})

    	// console.log("curentPage: " + this.state.currentPage + "totalPages: " + this.state.totalPages + " progress: " )

    	this.setState({progress: (this.state.currentPage / this.state.totalPages) * 100})
    }

    updateUsername(event){
    	this.setState({username:event.target.value});
    	// console.log('username:' + this.state.username);
    }

    render(){
    	return(
            <Grid container spacing={1} justify="flex-end" alignItems="center" height="100%">
            <Grid item xs={8}>
                <TextField 
                    id="username" 
                    label="Last.fm Username" 
                    type="search" 
                    size="small" 
                    variant="outlined" 
                    color="primary"
                    fullWidth 
                    onChange={this.updateUsername}/>
            </Grid>
            <Grid item xs={1}>
                <CircularProgress variant="determinate" value={this.state.progress} style={{margin:'auto', display:'block'}}/>
                
            </Grid>
            <Grid item xs={3}>
                <Button 
                onClick={this.scrapeData}
                variant="contained" 
                color="primary"
                size="large"
                {...this.state.username.length ? {disabled:false} : {disabled:true}}
                style={{width: "100%", height:"100%"}}>Scrape Data</Button>
            </Grid>
            </Grid>

        
        )
    }

}

export default TopBar;