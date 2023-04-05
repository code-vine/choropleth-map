const eduUrl = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const countyUrl ="https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

const colors = ["palegreen", "lightgreen", "seagreen", "green"];

const svg = d3.select("svg")
              .attr("width", 960)
              .attr("height", 600)
              .style("background-color", "blue")

const tooltip = d3.select("#tooltip");

let eduData 
let countyData

d3.json(eduUrl)
  .then(data => {
    eduData = data;
    d3.json(countyUrl)
        .then(data => {
            countyData = topojson.feature(data,data.objects.counties).features;
            //create map
            svg.selectAll('path')
            .data(countyData)
            .enter()
            .append('path')
            .attr('d', d3.geoPath())
            .attr('class', 'county')
            .attr('fill', (d)=>{
                let fips = d.id;
                let county = eduData.find(c => c.fips === fips);
                let percent = county.bachelorsOrHigher;
                return colorFromPercent(percent);
            })
            .attr("data-fips", (d)=> d.id)
            .attr("data-education", (d) =>{
                let fips = d.id;
                let county = eduData.find(c => c.fips === fips);
                return county.bachelorsOrHigher;
            }).on("mouseover", (e,d)=>{
                let county = eduData.find(c => c.fips === d.id);
                e.target.style.fill="black";
                tooltip.style('opacity', 0.9);
                tooltip.html(`${county['area_name']}, ${county.state}: ${county.bachelorsOrHigher}%`)
                .style("left", e.pageX+15 + 'px')
                .style("top", e.pageY + 'px')
                .style("font-size", '14px')
                .attr("data-education", county.bachelorsOrHigher)
            }).on("mouseout", (e,d)=>{
                let county = eduData.find(c => c.fips === d.id);
                tooltip.style('opacity', 0);
                e.target.style.fill= colorFromPercent(county.bachelorsOrHigher);
            });

            createLegend();

        })
        .catch(e =>{
            console.log(e);
        });
  })
  .catch(e =>{
    console.log(e);
  });


function colorFromPercent(percent){
    if(percent <= 15)return colors[0];
    else if(percent <= 30)return colors[1];
    else if(percent <= 45) return colors[2];
    else return colors[3];
}

function createLegend(){
    let squareSize = 50;
    svg.append("g")
       .attr("id", "legend")
       .selectAll('rect')
       .data(colors)
       .enter()
       .append('rect')
       .attr('x', (d,i)=> 600 +  i * squareSize )
       .attr('y', (d)=> 30)
       .attr('width', squareSize)
       .attr('height', 10)
       .attr('fill', d => d)

       let x = d3.scaleLinear().domain([0,60]).rangeRound([600, 600 + 4*squareSize]);
       

       let axis = d3.axisBottom(x).ticks(5).tickSize(15)
       .tickFormat(function (x) {
         return Math.round(x) + '%';
       })
       svg.append("g")
       .call(axis)
       .attr('transform', `translate(0, 30)`)
       
}

