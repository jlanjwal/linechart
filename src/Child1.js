import React, { Component } from "react";
import "./Child1.css";
import * as d3 from "d3";

class Child1 extends Component {
  state = { 
    company: "Apple", // Default Company
    selectedMonth: 'November' //Default Month
  };

  componentDidMount() {
    this.renderChart();
  }

  componentDidUpdate() {
    this.renderChart();
  }

  useEffect() {
    this.renderChart();
  }

  renderChart = () => {
    const data = this.props.csv_data
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    data.forEach(d => {d.Date = new Date(d.Date)});
    const month = months.indexOf(this.state.selectedMonth)

    const filteredMonthData = data.filter(d => d.Date.getMonth() === month)
    const filteredData = filteredMonthData.filter(d => d.Company === this.state.company)

    const margin = { top: 20, right: 30, bottom: 40, left: 40 },
      width = 500,
      height = 300,
      innerWidth = 500 - margin.left - margin.right,
      innerHeight = 300 - margin.top - margin.bottom; 
    
    const svg = d3.select('#mysvg').attr('width', width).attr('height', height).select('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x_Scale = d3.scaleTime().domain(d3.extent(filteredData, d => d.Date)).range([0, innerWidth]);

    const closeMin = d3.min(filteredData, d => d.Close);
    const openMin = d3.min(filteredData, d => d.Open);
    let min = 0;
    if(closeMin > openMin) {
        min = openMin
    }
    else{
        min = closeMin
    }

    const closeMax = d3.max(filteredData, d => d.Close);
    const openMax = d3.max(filteredData, d => d.Open);
    let max = 0;
    if(closeMax < openMax) {
        max = openMax
    }
    else{
        max = closeMax
    }

    const y_Scale = d3.scaleLinear().domain([min, max]).range([innerHeight, 0]);

    var openLineGenerator = d3.line()
      .x(d => x_Scale(d.Date))
      .y(d => y_Scale(d.Open))
      .curve(d3.curveCardinal);;

    var closeLineGenerator = d3.line()
      .x(d => x_Scale(d.Date))
      .y(d => y_Scale(d.Close))
      .curve(d3.curveCardinal);;

    var openPathData = openLineGenerator(filteredData);
    svg.selectAll(".openLine").data([openPathData]).join('path').attr('class', 'openLine').attr('d', myd => myd);

    var closePathData = closeLineGenerator(filteredData);
    svg.selectAll(".closeLine").data([closePathData]).join('path').attr('class', 'closeLine').attr('d', myd => myd);

    svg.selectAll('.x.axis').data([null]).join('g').attr('class', 'x axis').attr('transform', `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x_Scale)).selectAll('text').style('text-anchor', 'start').attr('transform', 'rotate(45)');

    svg.selectAll('.y.axis').data([null]).join('g').attr('class', 'y axis').call(d3.axisLeft(y_Scale));

    svg.selectAll('.openData').data(filteredData).join('circle').attr('class', 'openData').attr('cx', d => x_Scale(d.Date))
        .attr('cy', d => y_Scale(d.Open)).attr('r', 4)

    svg.selectAll('.closeData').data(filteredData).join('circle').attr('class', 'closeData').attr('cx', d => x_Scale(d.Date))
        .attr('cy', d => y_Scale(d.Close)).attr('r', 4)

    const tooltip = d3.select('.child1').append('div')
        .attr('class', 'tooltip');
    
    svg.selectAll('circle')
        .on('mouseover', (ev, d) => {
          const formattedDate = d.Date.toLocaleDateString('en-US');
          const difference = d.Open - d.Close;
          tooltip.style('visibility', 'visible')
            .html(`Date: ${formattedDate}<br>Open: ${d.Open.toFixed(2)}<br>Close: ${d.Close.toFixed(2)}<br>Difference: ${difference.toFixed(2)}`);
        })
        .on('mousemove', (ev) => {
          tooltip.style('top', (ev.pageY + 5) + 'px')
            .style('left', (ev.pageX + 5) + 'px');
        })
        .on('mouseout', () => {
          tooltip.style('visibility', 'hidden');
        });

      const legendSvg = d3.select('#legend').attr("height", "300").select('g');

      legendSvg.append("rect").attr('fill', "#b2df8a").attr("height", '20px').attr("width", "20px").attr("x", "0").attr("y", "0");
      legendSvg.append("text").text("Open").attr('x', "25").attr("y", "15");

      legendSvg.append("rect").attr('fill', "#e41a1c").attr("height", '20px').attr("width", "20px").attr("x", "0").attr("y", "30");
      legendSvg.append("text").text("Close").attr('x', "25").attr("y", "45");
  }

  handleRadioChange = (ev) => {
    this.setState({company: ev.target.value})
    console.log(ev.target.value)
  }

  handleDropdownChange = (ev) => {
    this.setState({selectedMonth: ev.target.value});
    console.log(ev.target.value)
  }

  render() {
    const options = ['Apple', 'Microsoft', 'Amazon', 'Google', 'Meta'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return (
      <div className="child1">
          <div className="radioButtons">
            <p>Companies:</p>
            {options.map(option => (
                <div className="radioButton">
                    <input type="radio" key={option} id={option} name="options" value={option} onChange={this.handleRadioChange}/>
                    <label htmlFor={option}>{option}</label>
                </div>
            ))}
          </div>
          <div className="dropdown">
            <p>Months:</p>
            <select value={this.state.selectedMonth} onChange={this.handleDropdownChange}>
                {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                ))}
            </select>
          </div>
          <div>
            <svg id="mysvg" width="700" height="400"><g></g></svg>
            <svg id="legend" width="100" height="400"><g></g></svg>
          </div>
      </div>
    );
  }
}

export default Child1;