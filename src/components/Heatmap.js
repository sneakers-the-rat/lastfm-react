import React from "react";

import { nest } from 'd3-collection';
// import {legend} from "@d3/color-legend";
const d3 = require('d3');

// let data = 0;

class Heatmap extends React.Component {

  constructor(props){
    super(props);
    // this.renderCalendar = this.renderCalendar.bind(this)
  }

  componentDidMount(){
    let data = this.props.data;

    data.forEach(function(d){
      d.day = new Date(
              d.date.getFullYear(), 
              d.date.getMonth(), 
              d.date.getDate());
    })

    data = nest()
            .key(function(d){return(d.day)})
            .rollup(function(d){return(d.length)})
            .entries(data);

    data.forEach(function(d){
      d.date = new Date(d.key);
    })    

    console.log(data);

    // debugger;
    let years = d3.groups(data, d => d.date.getUTCFullYear()).reverse();
    let cellSize = 17;
    let width = 954;
    let height = 153;
    let weekday = "sunday";
    let timeWeek = weekday === "sunday" ? d3.utcSunday : d3.utcMonday;
    let countDay = weekday === "sunday" ? i => i : i => (i + 6) % 7;


    let formatValue = d3.format("")
    let formatClose = d3.format("$,.2f")
    let formatDate = d3.utcFormat("%x")
    let formatDay = i => "SMTWTFS"[i]
    let formatMonth = d3.utcFormat("%b")

    let color_max = d3.quantile(data.map(d => Math.abs(d.value)).sort(d3.ascending), 0.9975);
    let color =  d3.scaleLinear().domain([0,color_max])
        .interpolate(d3.interpolateHcl)
        .range([d3.rgb("#111111"), d3.rgb('#e91e63')]);
        // d3.scaleSequential(d3.interpolateRdPu).domain([0, +color_max]);



    function pathMonth(t) {
      const n = weekday === "weekday" ? 5 : 7;
      const d = Math.max(0, Math.min(n, countDay(t.getUTCDay())));
      const w = timeWeek.count(d3.utcYear(t), t);
      return `${d === 0 ? `M${w * cellSize},0`
          : d === n ? `M${(w + 1) * cellSize},0`
          : `M${(w + 1) * cellSize},0V${d * cellSize}H${w * cellSize}`}V${n * cellSize}`;
    }


    const svg = d3.select('#calendar-svg')
      .attr("viewBox", [0, 0, width, height * years.length])
      .attr("font-family", "sans-serif")
      .attr("font-size", 10);

    const year = svg.selectAll("g")
    .data(years)
    .join("g")
      .attr("transform", (d, i) => `translate(40.5,${height * i + cellSize * 1.5})`);

    year.append("text")
      .attr("x", -5)
      .attr("y", -5)
      .attr("font-weight", "bold")
      .attr("text-anchor", "end")
      .text(([key]) => key);

    year.append("g")
      .attr("text-anchor", "end")
    .selectAll("text")
    .data(weekday === "weekday" ? d3.range(1, 6) : d3.range(7))
    .join("text")
      .attr("x", -5)
      .attr("y", i => (countDay(i) + 0.5) * cellSize)
      .attr("dy", "0.31em")
      .text(formatDay);

    year.append("g")
    .selectAll("rect")
    .data(weekday === "weekday"
        ? ([, values]) => values.filter(d => ![0, 6].includes(d.date.getUTCDay()))
        : ([, values]) => values)
    .join("rect")
      .attr("width", cellSize - 1)
      .attr("height", cellSize - 1)
      .attr("x", d => timeWeek.count(d3.utcYear(d.date), d.date) * cellSize + 0.5)
      .attr("y", d => countDay(d.date.getUTCDay()) * cellSize + 0.5)
      .attr("fill", d => color(d.value))
    .append("title")
      .text(d => `${formatDate(d.date)}
    ${formatValue(d.value)} songs played`);

    // debugger;
    const month = year.append("g")
    .selectAll("g")
    .data(([, values]) => d3.utcMonths(values[values.length - 1].date, d3.utcMonth(values[0].date)))
    .join("g");
    // console.log(month);

    month.filter((d, i) => i).append("path")
      .attr("fill", "none")
      .attr('class', 'month-path')
      .attr("d", pathMonth);


    month.append("text")
      .attr("x", d => timeWeek.count(d3.utcYear(d), timeWeek.ceil(d)) * cellSize + 2)
      .attr("y", -5)
      .text(formatMonth);

    console.log(month);

    return svg.node();

    }

  render(){
    return(
    <div className="calendar-map">
      <svg id="calendar-svg"></svg>
    </div>
    )
  }


}


function nest_data(data){
	return(
	    nest()
	    	.key(function(d){return new Date(
	    		d.date.getFullYear(), 
	    		d.date.getMonth(), 
	    		d.date.getDay());
	    })
	    	.rollup(function(d){return(d.length)})
	    	.entries(data)
	)
}

export default Heatmap;