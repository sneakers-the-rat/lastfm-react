import React from "react";
import { nest } from 'd3-collection';
import { merge } from 'd3-array';
// import {legend} from "@d3/color-legend";
const d3 = require('d3');

const { agnes } = require('ml-hclust');

class Waterfall extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            order: "cluster",
            sorted: [],
        }

        this.makePlot = this.makePlot.bind(this);
    }

    componentDidMount(){
        let data = this.props.data;

        let artists = nest()
            .key((play) => play.artist).sortKeys(d3.ascending)
            .rollup((anartist) => anartist.map(asong => asong.date))
            .entries(data);

        this.setState({sorted: artists})

        // sort artists by play count

        // let clustered = clusterArtists(data);
        // this.updateState({clustered});

    }

    makePlot(){

    }



    render(){
        return(<div>hay wip</div>)
    }
}

function corr_coef(a, b){
//    compute correlation coefficient given two numerical arrays of equal length
//     adapted from https://gist.github.com/matt-west/6500993//
    console.assert(a.length === b.length);

    let sum_a = d3.sum(a),
        sum_b = d3.sum(b),
        sum_sq_a = d3.sum(a.map(val => val**2)),
        sum_sq_b = d3.sum(b.map(val => val**2)),
        dot_prod = d3.sum(a.map((val, idx) => val*b[idx])),
        n = a.length;

    let numerator = dot_prod - (sum_a * sum_b / n),
        denominator = Math.sqrt(
            (sum_sq_a - (sum_a**2)/n) *
            (sum_sq_b - (sum_b**2)/n)
        );

    if (denominator == 0) return 0;

    return(numerator/denominator);

}

function calcSimilarity(a, b){
    // define a function to use for calculating similarity by timestamps
    // for use with hclust

    // gather up times into single array
    let times = []
    a.value.forEach(play => times.push(
        {
            artist: a.key,
            date: new Date(play.getFullYear(), play.getMonth(), 1)
        })
    );
    b.value.forEach(play => times.push(
        {
            artist: b.key,
            date: new Date(play.getFullYear(), play.getMonth(), 1)
        })
    );

    //    get plays/day for each artist
    // do it this way to quickly iterate over possible days and make sure value for each artist
    let playday = nest()
        .key(d => d.date).sortKeys(d3.ascending)
        .rollup(function(d){
            return(
                {
                    'a':d.filter(e => e.artist === a.key).length,
                    'b':d.filter(e => e.artist === b.key).length
                });
        })
        .entries(times);

    // then split into two arrays
    let a_ts = playday.map(aday => aday.value.a),
        b_ts = playday.map(aday => aday.value.b);

    // return correlation coefficient
    return(corr_coef(a_ts, b_ts));

}

function clusterArtists(data){
    //    given an array of song objects (from scrape), do clustering from # plays/day

    // get all timestamps for each artist
    let artists = nest()
        .key((play) => play.artist).sortKeys(d3.ascending)
        .rollup((anartist) => anartist.map(asong => asong.date))
        .entries(data);

    let tree = agnes(artists, {
        distanceFunction: calcSimilarity,
        method: "average"
    });
    return(tree);
}

export default Waterfall