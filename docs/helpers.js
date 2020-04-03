
const months = ["JAN", "FEB", "MAR","APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];


function loadTable(caseData, metric="positive") {
    var tableColumns = document.getElementById("tableHead");
    var tableData = document.getElementById("tableBody");
    let headHtml = `<th onclick="loadTable(sortState(dataSet))">State</th>`;
    let bodyHtml = '';

    // build html string for header row with click event to sort data by that column.
    for(let c of cols) {
        headHtml += `<th onclick="loadTable(sortSub(dataSet,${c}),metric)">${formatDate(c)}</th>`;
    }
    // apply the string
    tableColumns.innerHTML = '<tr>' + headHtml + '</tr>';

    // built html string for body, loop through each row of data.
    caseData.forEach(state => {
        bodyHtml += `<tr>`;

        // state is the first column
        bodyHtml += `<td>${state["state"]}</td>`;

        // add additional columns, default is the last 7 days.
        cols.forEach(col => {
            var val;

            // some values are undefined so we set those to 0
            if(col in state){
                val = state[col][metric]; 
            } else {
                val = 0;
            }
            
            bodyHtml += `<td>${val}</td>`;
        });
        
        bodyHtml += `</tr>`;

    } );
   
    // apply the body html
    tableBody.innerHTML = bodyHtml;

};

function stateFilter(data) {
    if(stateCurrent) {
        return data.filter(a=> a.state == stateCurrent);
    } else {
        return data;
    }

};



// this takes long data and nests it for each state and date.
// the result is one row for each state and within each state,
// one object for each date.
function formatdata(data) {
    newobj = {};
    newdata = [];
    for(var i=0; i < data.length; i++) {
        var st = data[i]["state"];
        var dt = data[i]["date"];

        var ob = {
                "positive": data[i]["positive"] | 0,
                "negative": data[i]["negative"] | 0,
                "death": data[i]["death"] | 0,
                "total": data[i]["total"] | 0,
                "positiveIncrease": data[i]["positiveIncrease"] | 0,
                "deathIncrease": data[i]["deathIncrease"] | 0,
                "testIncrease": data[i]["testIncrease"] | 0,
                "hospitalized": data[i]["hospitalized"] | 0
            }
        if(st in newobj){
            newobj[st][dt] = ob; 
        
        }else{
            newobj[st] = {};
            newobj[st]['state'] = st;
            newobj[st][dt] = ob;
        
        }

    };
    for (const property in newobj) {
      newdata.push(newobj[property]);
    };
    return newdata;
};

function toggleMenu() {
        document.getElementById("myDropdown").classList.toggle("show");
    };

function toggleSourceMenu() {
        document.getElementById("sourceDropdown").classList.toggle("show");
    };


    function mouseover(d) {  // Add interactivity
        var x = Math.min(xScale(formatDate(d.date))-1,850);
        var y = Math.max(yScale(d[metric])-1, 30);

        d3.select("#svg1")
            .append("text")
            .attr("id","tooltip")
            .attr("x",x)
            .attr("y",y)
            .text(formatNumber(d[metric])+" " + metricLuShort[metric]);
            
    };

    function mouseout() {

        d3.select("#tooltip")
            .remove();
    };



// change caption depending on what metric we are looking at
function setMetric(val) {
    metric = val;
    
};

// show dates as month and day
function formatDate(dt) {
    var val = '' + dt;
    return months[+val.slice(4,6)-1] + " " + val.slice(6);

}   

// add commas to numbers
function formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  }


// sort the data by state. It toggles ascending and descending
function sortState(data, col='state') {
    sortOrder = !sortOrder;
    
    return data.sort((a, b) => {  
        if (a[col] > b[col]) {
            return sortOrder;
        } else if (a[col] < b[col]) {
            return !sortOrder;
        } else {
            return 0;
        }
        });

};

// sort by dates. some values are undefined so we treat those as 0s;
function sortSub(data, col) {

    sortOrder = !sortOrder;
    return data.sort((a, b) => { 
        if(col in a) {
            var x = a[col][metric];
        } else {
            x = 0;
        }

        if(col in b) {
            var y = b[col][metric];
        } else {
            y = 0;
        }
                   
        if (x > y) {
            return sortOrder;
        } else if (x < y) {
            return !sortOrder;
        } else {
            return 0;
        }
     });
};

var metricLu = {
    'positive': 'Number of Positive Cases',
    'death': 'Total Number of Deaths',
    'total': 'Total Number of Tests',
    'positiveIncrease': 'Daily Positive Cases',
    'testIncrease': 'Daily Tests Conducted',
    'hospitalized': 'Hospitalizations'
};

var metricLuShort = {
    'positive': 'Positive Cases',
    'death': 'Deaths',
    'total': 'Tests',
    'positiveIncrease': 'New Cases',
    'testIncrease': 'New Tests',
    'hospitalized': 'Hospitalizations'
}


function plotUs(data) {

    let dates = data.map(a=>a.date).sort();

    d3.select("#fig1").selectAll("svg").remove();

    xScale = d3.scaleBand()
        .domain(dates.map(a => formatDate(a)))
        .range([0, width]);

    yScale = d3.scaleLinear()
        .domain([0, d3.max(rawUs.map(a=>a[metric]))]) 
        .range([height, 0]);

    var svg = d3.select("#fig1").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("id","svg1")
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    caption = metricLu[metric];
    
    svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("font-weight", "bold")  
        .text(caption);


    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).tickValues(xScale.domain().filter(function(d,i){ return !(i%4)})));
    //

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale));


    var line = d3.line(metric)
        .x(d => xScale(formatDate(d.date)))
        .y(d => yScale(d[metric])) 
        ;

    svg.append("path")
        .datum(data) 
        .attr("class", "line") 
        .attr("d", line);


    svg.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle") 
        .attr("class", "dot")
        .attr("cx", d => xScale(formatDate(d.date)))
        .attr("cy", d => yScale(d[metric]))
        .attr("r", 5)
        .on("mouseover", d=>mouseover(d))
        .on("mouseout", mouseout);
};