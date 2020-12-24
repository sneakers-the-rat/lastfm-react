//
// using code from
// https://observablehq.com/@d3/calendar-view
// and
// https://github.com/g1eb/calendar-heatmap
// <3
//

import React from 'react';
import Grid from '@material-ui/core/Grid';
import Select from '@material-ui/core/Select';
import Chip from '@material-ui/core/Chip';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';

import { nest } from 'd3-collection';
// import {legend} from "@d3/color-legend";
const d3 = require('d3');

// let data = 0;

class Heatmap extends React.Component {
  constructor(props) {
    super(props);
    // this.renderCalendar = this.renderCalendar.bind(this)
    this.state = {
      artists: [],
      filteredArtists: [],
      filteredData: {},
      playsPerDay: {}
    }

    this.filterArtist = this.filterArtist.bind(this)
    this.filterAlbum = this.filterAlbum.bind(this)
    this.renderHeatmap = this.renderHeatmap.bind(this)
  }

  componentDidMount() {
    let {data} = this.props;
    console.log('initial data');
    console.log(data);
    data.forEach((d) => {
      d.day = new Date(
        d.date.getFullYear(),
        d.date.getMonth(),
        d.date.getDate()
      );
    });

    // get artists
    let artists = nest().
      key(d => d.artist).
      sortKeys(d3.ascending).
      rollup(d => d.length).
      entries(data);

    // double nest to get each artist play per day
    data = nest().
      key((d) => (d.day)).
      key((d) => (d.artist)).
      rollup((d) => (d.length)).
      entries(data);

    // summarize total plays for each day
    data.forEach((d) => {
      d.date = new Date(d.key);
      // console.log(d);
      d.value = d.values.reduce(
        (accumulator, currentval) => (accumulator + currentval.value), 0);
      //   sort values!
      d.values = d.values.sort((a, b) => (b.value - a.value));
      // let sortable = Object.entries(d.values)
      //     .sort(([,a],[,b]) => a-b)
      //     .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
      // d.summary = sortable;
    });

    this.setState({
      playsPerDay: data,
      artists
    })

    this.renderHeatmap();
  }

  renderHeatmap(){
    if (this.state.playsPerDay.length === undefined){
      return(`<div>loading</div>`)
    }

    console.log('final data');
    console.log(this.state.playsPerDay);

    // console.log(data);

    // debugger;
    const years = d3.groups(this.state.playsPerDay, (d) => d.date.getUTCFullYear()).reverse();
    const cellSize = 17;
    const width = 954;
    const height = 153;
    const weekday = 'sunday';
    const timeWeek = weekday === 'sunday' ? d3.utcSunday : d3.utcMonday;
    const countDay = weekday === 'sunday' ? (i) => i : (i) => (i + 6) % 7;

    // const formatValue = d3.format('');
    // const formatClose = d3.format('$,.2f');
    // const formatDate = d3.utcFormat('%x');
    const formatDay = (i) => 'SMTWTFS'[i];
    const formatMonth = d3.utcFormat('%b');

    const color_max = d3.quantile(this.state.playsPerDay.map((d) => Math.abs(d.value)).sort(d3.ascending), 0.9975);
    const color = d3.scaleLinear().domain([0, color_max])
      .interpolate(d3.interpolateHcl)
      .range([d3.rgb('#111111'), d3.rgb('#e91e63')]);
    // d3.scaleSequential(d3.interpolateRdPu).domain([0, +color_max]);

    function pathMonth(t) {
      const n = weekday === 'weekday' ? 5 : 7;
      const d = Math.max(0, Math.min(n, countDay(t.getUTCDay())));
      const w = timeWeek.count(d3.utcYear(t), t);
      return `${d === 0 ? `M${w * cellSize},0`
        : d === n ? `M${(w + 1) * cellSize},0`
          : `M${(w + 1) * cellSize},0V${d * cellSize}H${w * cellSize}`}V${n * cellSize}`;
    }

    // clear any previous stuff
    d3.select("#calendar-svg").selectAll("*").remove();
    const svg = d3.select('#calendar-svg')
      .append('svg')
      .attr('viewBox', [0, 0, width, height * years.length])
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10);
    //
    // const tooltip = d3.select('#calendar-svg').append('div')
    //   .attr('class', 'heatmap-tooltip')
    //   .style('opacity', 0);

    const year = svg.selectAll('g')
      .data(years)
      .join('g')
      .attr('transform', (d, i) => `translate(40.5,${height * i + cellSize * 1.5})`);

    year.append('text')
      .attr('x', -5)
      .attr('y', -5)
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'end')
      .text(([key]) => key);

    year.append('g')
      .attr('text-anchor', 'end')
      .selectAll('text')
      .data(weekday === 'weekday' ? d3.range(1, 6) : d3.range(7))
      .join('text')
      .attr('x', -5)
      .attr('y', (i) => (countDay(i) + 0.5) * cellSize)
      .attr('dy', '0.31em')
      .text(formatDay);

    year.append('g')
      .selectAll('rect')
      .data(weekday === 'weekday'
        ? ([, values]) => values.filter((d) => ![0, 6].includes(d.date.getUTCDay()))
        : ([, values]) => values)
      .join('rect')
      .attr('width', cellSize - 1)
      .attr('height', cellSize - 1)
      .attr('x', (d) => timeWeek.count(d3.utcYear(d.date), d.date) * cellSize + 0.5)
      .attr('y', (d) => countDay(d.date.getUTCDay()) * cellSize + 0.5)
      .attr('fill', (d) => color(d.value))
      .append('title')
      .text((d) => {
        // debugger;
        // console.log(d);
        if (d.values === undefined) {
          return ('');
        }
        let tooltip_html = '';
        tooltip_html += `Total songs listened:${d.value}\n`;

        if (d.values.length <= 5) {
          for (let i = 0; i < d.values.length; i++) {
            tooltip_html += `${d.values[i].key}: `;
            tooltip_html += `${d.values[i].value}\n`;
          }
        } else {
          for (let i = 0; i < 5; i++) {
            tooltip_html += `${d.values[i].key}: `;
            tooltip_html += `${d.values[i].value}\n`;
          }
          tooltip_html += '\n';

          let other_projects_sum = 0;
          for (let i = 5; i < d.values.length; i++) {
            other_projects_sum = +d.values[i].value;
          }
          tooltip_html += 'Other: ';
          tooltip_html += other_projects_sum;
        }
        return (tooltip_html);

        // tooltip.html(tooltip_html)
        //     .style('left', (timeWeek.count(d3.utcYear(d.date), d.date) * cellSize + 0.5)+"px")
        //     .style('top', (countDay(d.date.getUTCDay()) * cellSize + 0.5)+"px")
        //     .transition()
        //     .duration(100)
        //     .ease(d3.easeLinear)
        //     .style('opacity', 1);
        //   return(tooltip_html)
      });

    // tooltips
    // https://bl.ocks.org/HarryStevens/302d078a089caf5aeb13e480b86fdaeb
    d3.select('body').append('div').attr('class', 'tip').style('display', 'none');

    d3.selectAll('rect')
      .on('mouseover', function (d) {
        d3.select(this).classed('selected', true);

        d3.select('.tip')
          .style('display', 'block')
          .html((tip) => {
          // debugger;
          // console.log(d);
          d = d3.select(this).data()[0];

          if (d.values === undefined) {
            return ('');
          }
          let tooltip_html = '';
          tooltip_html += `<p class="head">Total songs listened<span class="num">${d.value}</span></p>`;

          if (d.values.length <= 5) {
            for (let i = 0; i < d.values.length; i++) {
              tooltip_html += `<p>${d.values[i].key}`;
              tooltip_html += `<span class="num">${d.values[i].value}</span></p>`;
            }
          } else {
            for (let i = 0; i < 5; i++) {
              tooltip_html += `<p>${d.values[i].key}`;
              tooltip_html += `<span class="num">${d.values[i].value}</span></p>`;
            }
            tooltip_html += '<p>\n</p>';

            let other_projects_sum = 0;
            for (let i = 5; i < d.values.length; i++) {
              other_projects_sum = +d.values[i].value;
            }
            tooltip_html += '<p>Other';
            tooltip_html += `<span class="num">${other_projects_sum}</span></p>`;
          }
          return (tooltip_html);
        });


         // figure out where to draw it!!
         // https://stackoverflow.com/a/26053262/13113166
        const bounding_rect = this.getBoundingClientRect();

        // let row_pos = parseFloat(d3.select(this).attr('x')) + bounding_rect.x;
        // let col_pos = parseFloat(d3.select(this).attr('y')) + bounding_rect.top;
        let row_pos =  bounding_rect.x;
        let col_pos =  bounding_rect.top;

        const tip_pos = d3.select('.tip').node().getBoundingClientRect();
        const tip_width = tip_pos.width;
        const tip_height = tip_pos.height;

        const left = row_pos-(tip_width/2);
        const top = col_pos + cellSize * 2;



        //
        // // const {row_pos, col_pos} = getNodePos(this);
        // console.log('row pos: '+ row_pos +' col pos: ' + col_pos);

        // const grid_pos = d3.select('#calendar-svg').node().getBoundingClientRect();
        // const grid_left = grid_pos.left;
        // const grid_top = grid_pos.top;
        //
        // // const left = grid_left + col_pos + (row_pos / 2) - (tip_width / 2);
        // // const top = grid_top + row_pos - tip_height - 5;
        //
        // const left = row_pos;
        // const top = col_pos;

        d3.select('.tip')
          .style('left', `${left}px`)
          .style('top', `${top}px`);

        // d3.select(`.x.axis .tick:nth-of-type(${d.column}) text`).classed('selected', true);
        // d3.select(`.y.axis .tick:nth-of-type(${d.row}) text`).classed('selected', true);
        // d3.select(`.x.axis .tick:nth-of-type(${d.column}) line`).classed('selected', true);
        // d3.select(`.y.axis .tick:nth-of-type(${d.row}) line`).classed('selected', true);
      })
      .on('mouseout', () => {
        d3.selectAll('rect').classed('selected', false);
        d3.select('.tip').style('display', 'none');
        // d3.selectAll('.axis .tick text').classed('selected', false);
        // d3.selectAll('.axis .tick line').classed('selected', false);
      });

    // debugger;
    const month = year.append('g')
      .selectAll('g')
      .data(([, values]) => d3.utcMonths(values[values.length - 1].date,
        d3.utcMonth(values[0].date)))
      .join('g');
    // console.log(month);

    month.filter((d, i) => i).append('path')
      .attr('fill', 'none')
      .attr('class', 'month-path')
      .attr('d', pathMonth);

    month.append('text')
      .attr('x', (d) => timeWeek.count(d3.utcYear(d), timeWeek.ceil(d)) * cellSize + 2)
      .attr('y', -5)
      .text(formatMonth);

    console.log(month);

    // return(svg.node());
  }



  filterArtist(filt){
    this.setState({filteredArtists: filt.target.value})
    this.renderHeatmap();
  }

  filterAlbum(filt){

  }

  render() {
    return (
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <Select
            labelId="demo-mutiple-chip-label"
            id="demo-mutiple-chip"
            multiple
            value={this.state.filteredArtists}
            onChange={this.filterArtist}
            input={<Input id="select-multiple-chip" />}
            fullWidth
            displayEmpty
            renderValue={(selected) => {
              if (selected.length === 0) {
                return <em>Filter {this.state.artists.length} Artists</em>;
              }
              else {return(
                <div className="chips">
                {this.state.filteredArtists.map((value) => (
                  <Chip key={value} label={value} className="chip"/>
                ))}
              </div>
              )}
            }}
          >
            <MenuItem>Filter Artists</MenuItem>
            {this.state.artists.map((name) => (
              <MenuItem key={name.key} value={name.key} className="filterItem">
                {name.key}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={12}>

        </Grid>
        <Grid item xs={12}>
          <div className="calendar-map">
            <svg id="calendar-svg" ></svg>
          </div>
        </Grid>
      </Grid>
    );
  }
}


// function nest_data(data) {
//   return (
//     nest()
//       .key((d) => new Date(
//         d.date.getFullYear(),
//         d.date.getMonth(),
//         d.date.getDay()
//       ))
//       .rollup((d) => (d.length))
//       .entries(data)
//   );
// }

export default Heatmap;
