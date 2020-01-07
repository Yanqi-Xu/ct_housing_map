const $container = d3.select('.container');
const $graphic = d3.select('.scroll__graphic');
const $chart = d3.select('.chart');
const $text = d3.select('.scroll__text');
const $step = d3.selectAll('.step');

const scroller = scrollama();
let inputValue = 0;
let year = ["2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018"];

// Width and Height of the whole visualization

const width = 800;
const height = 520;

const margin = {
    top: 50,
    right: 30,
    bottom: 45,
    left: 60
}

const svg = $chart
    .append("svg")
    .attr("width", width)
    .attr("height", height);

    const color = d3.scaleQuantize([0, 20], d3.schemeBlues[9]);
// Create SVG
// const svg = d3.select("body")
//     .append("svg")
//     .attr("width", width)
//     .attr("height", height);
// const color = d3.scaleQuantize([0, 10], d3.schemeBlues[9]);
// Append empty placeholder g element to the SVG
// g will contain geometry elements
const g = svg.append("g")

/*        g.attr("transform", 'translate(580,20)')
       .append(() => d3.legendColor({scale:color, title: "Percentage of Housing Units Affordable", width: 260}));
*/

// Width and Height of the whole visualization
// Set Projection Parameters
/* const albersProjection = d3.geoAlbers()
    .rotate([71.057, 0])
    .center([0, 42.313])
    .translate([width / 2, height / 2]); */


d3.select('body')
    .append('div')
    .attr('id', 'tooltip')
    .attr('style', 'position: absolute; opacity: 0;');

d3.select("#rate").html(
    "Year: " + year[year.length - 1]
);

const width_slider = 920;
const height_slider = 50;

Promise.all([
    d3.csv('https://raw.githubusercontent.com/Yanqi-Xu/housing/master/data/ct_appeals.csv'),
    d3.json('https://raw.githubusercontent.com/Yanqi-Xu/housing/master/shapefiles/ct_towns.json')
]).then(([csvData, ct]) => {
    const topo = ct.features[0];
    const topoTown = topojson.feature(topo, topo.objects.ct_towns);
    const towns = topoTown.features;
    var albersProjection = d3.geoAlbers()
        .scale(9000)
        .rotate([71.057, 0])
        .center([0, 42.313])
        //.translate( [width/2,height/2] )
        .fitExtent([
            [10, 10],
            [890, 510]
        ], topoTown);


    const geoPath = d3.geoPath()
        .projection(albersProjection);

    function yearSelector(i) {
        const appeals = csvData.reduce((accumulator, d) => {
            accumulator[d.town] = +d[year[i]]
            return accumulator;
        }, {});
        return appeals
    }

    // when the input range changes update the value 
    d3.select("#timeslide").on("input", function () {
        update(+this.value);
        tooltipUpdate(+this.value)
    });


    // update the fill of each SVG of class "incident" with value
    function update(value) {
        document.getElementById("range").innerHTML = year[value];
        inputValue = year[value];
        d3.selectAll(".towns")
            .attr("fill", data => {
                return color(yearSelector(value)[data.properties.town])
            });
    }

    function tooltipUpdate(value) {
        d3.selectAll("path")
            .on('mouseover', d => d3.select('#tooltip').transition().duration(200).style('opacity', 1).text(d.properties.town + ",\n Total percentage of affordable housing: " + yearSelector(value)[d.properties.town] + "%"))
    }

    inputValue = document.getElementById("range").value
    g.selectAll('path')
        .data(towns)
        .join('path')
        .attr("class", "towns")
        .attr('d', geoPath)
        .attr('fill', data => {
            return color(yearSelector(0)[data.properties.town])
        })
        /* .attr('fill', d => color(function(d) {
            for (let i = 0; i < csvData.length; i++) {
                const appeals = csvData.reduce((accumulator, d) => {
                    accumulator[d.town] = +d[year]
                    return accumulator;
                }) */
        /*         const dataValue = csvData[i][year[year.length-1]];
                //console.log(dataValue)
                const townName = csvData[i].town;
                for (let j = 0; j < towns.length; j++) {
                  const jsonTown = towns[j].properties.town;
                  if (townName == jsonTown) {
                    towns[j].properties.percent_afford = dataValue;
                    console.log(towns[j].properties.percent_afford) */

        //.attr('fill', d => color(appeals[d.properties.town]))
        .on('mouseover', d => d3.select('#tooltip').transition().duration(200).style('opacity', 1).text(d.properties.town + ",\n Total percentage of affordable housing: " + yearSelector(0)[d.properties.town] + "%"))
        .on('mousemove', d => d3.select('#tooltip').style('left', (d3.event.pageX + 10) + 'px').style('top', (d3.event.pageY + 10) + 'px'))
        .on('mouseout', d => d3.select('#tooltip').style('opacity', 0));

    svg.append("path")
        .datum(topojson.mesh(topo, topo.objects.ct_towns, (a, b) => a !== b))
        .attr('fill', "none")
        .attr('stroke', 'white')
        .attr("d", geoPath);

        function legend({
            color,
            title,
            tickSize = 6,
            width = 320,
            height = 44 + tickSize,
            marginTop = 18,
            marginRight = 0,
            marginBottom = 16 + tickSize,
            marginLeft = 0,
            ticks = width / 64,
            tickFormat,
            tickValues
        } = {}) {
    
            const svg = d3.create("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", [0, 0, width, height])
                .style("overflow", "visible")
                .style("display", "block");
    
            let x;
    
            // Continuous
            if (color.interpolator) {
                x = Object.assign(color.copy()
                    .interpolator(d3.interpolateRound(marginLeft, width - marginRight)), {
                        range() {
                            return [marginLeft, width - marginRight];
                        }
                    });
    
                svg.append("image")
                    .attr("x", marginLeft)
                    .attr("y", marginTop)
                    .attr("width", width - marginLeft - marginRight)
                    .attr("height", height - marginTop - marginBottom)
                    .attr("preserveAspectRatio", "none")
                    .attr("xlink:href", ramp(color.interpolator()).toDataURL());
    
                // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
                if (!x.ticks) {
                    if (tickValues === undefined) {
                        const n = Math.round(ticks + 1);
                        tickValues = d3.range(n).map(i => d3.quantile(color.domain(), i / (n - 1)));
                    }
                    if (typeof tickFormat !== "function") {
                        tickFormat = d3.format(tickFormat === undefined ? ",f" : tickFormat);
                    }
                }
            }
    
            // Discrete
            else if (color.invertExtent) {
                const thresholds = color.thresholds ? color.thresholds() // scaleQuantize
                    :
                    color.quantiles ? color.quantiles() // scaleQuantile
                    :
                    color.domain(); // scaleThreshold
    
                const thresholdFormat = tickFormat === undefined ? d => d :
                    typeof tickFormat === "string" ? d3.format(tickFormat) :
                    tickFormat;
    
                x = d3.scaleLinear()
                    .domain([-1, color.range().length - 1])
                    .rangeRound([marginLeft, width - marginRight]);
    
                svg.append("g")
                    .selectAll("rect")
                    .data(color.range())
                    .join("rect")
                    .attr("x", (d, i) => x(i - 1))
                    .attr("y", marginTop)
                    .attr("width", (d, i) => x(i) - x(i - 1))
                    .attr("height", height - marginTop - marginBottom)
                    .attr("fill", d => d);
    
                tickValues = d3.range(thresholds.length);
                tickFormat = i => thresholdFormat(thresholds[i], i);
            }
    
            svg.append("g")
                .attr("transform", `translate(0, ${height - marginBottom})`)
                .call(d3.axisBottom(x)
                    .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
                    .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
                    .tickSize(tickSize)
                    .tickValues(tickValues))
                .call(g => g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height))
                .call(g => g.select(".domain").remove())
                .call(g => g.append("text")
                    .attr("y", marginTop + marginBottom - height - 6)
                    .attr("fill", "currentColor")
                    .attr("text-anchor", "start")
                    .attr("font-weight", "bold")
                    .text(title));
    
            return svg.node();
        }
    
        svg.append("g")
            .attr("class", "legend")
            .attr('transform', `translate(${width/2 + 100}, ${height- 70})`)
            .append(() => legend({
                color,
                title: "share of affordable units (%)",
                width: 260,
                tickFormat: ".0f"
            }))
        
            g.append('text')
            .attr('id', 'plotcaption')
            .attr('y', plotHeight)
            .attr('x', plotWidth / 2 + 50)
            .text("Source: CT Dept. of Housing");

});