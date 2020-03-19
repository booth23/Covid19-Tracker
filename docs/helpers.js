
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

function loadJhu(caseData) {
    var tableColumns = document.getElementById("tableHead");
    var tableData = document.getElementById("tableBody");

    var jhuCols = jhuHeaders.slice(-7);
    
    let headHtml = '<th onclick="loadJhu(sortState(jhuUS))">State</th>';
    let bodyHtml = '';
    

    // build html string for header row with click event to sort data by that column.
    for(let c of jhuCols) {
        headHtml += `<th onclick="loadJhu(sortState(jhuUS), ${c})">${formatJhuDate(c)}</th>`;
    }
    // apply the string
    tableColumns.innerHTML = '<tr>' + headHtml + '</tr>';

    

    // built html string for body, loop through each row of data.
    caseData.forEach(row => {
        bodyHtml += `<tr>`;

        // state is the first column
        bodyHtml += `<td>${row["state"]}</td>`;

        // add additional columns, default is the last 7 days.
        jhuCols.forEach(col => {
                     
            bodyHtml += `<td>${row[col]}</td>`;
        });
        
        bodyHtml += `</tr>`;

    } );
   
    // apply the body html
    tableBody.innerHTML = bodyHtml;

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
        var pos = data[i]["positive"] | 0;
        var prev = 0;
        var ob = {
                "positive": data[i]["positive"] | 0,
                "negative": data[i]["negative"] | 0,
                "death": data[i]["death"] | 0,
                "total": data[i]["total"] | 0
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

// change caption depending on what metric we are looking at
function setMetric(val) {
    metric = val;
    var cap = document.getElementById("dataTable").createCaption();
    if(val=='positive') {
        cap.innerHTML = '<b>Number of positive cases</b>'; 
    } else if(val=='death') {
        cap.innerHTML = '<b>Number of deaths</b>'; 
    } else if(val=='total') {
        cap.innerHTML = '<b>Number of tests reported (positive and negative)</b>'; 
    }
    
};

// show dates as month and day
function formatDate(dt) {
    var val = '' + dt;
    return months[+val.slice(4,6)-1] + " " + val.slice(6);

}   

function formatJhuDate(dt) {
    let vs = dt.split("/");
    return months[vs[0]-1] + " " + vs[1];
};


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



function toJSON(csv){

    var lines=csv.split("\n");
  
    var result = [];
  
    var headers=lines[0].trim().split(",");
    jhuHeaders = headers;
    headers[0] = 'state';
    headers[1] = 'country';
   
    for(var i=1;i<lines.length;i++){
  
        var obj = {};
        var currentline=lines[i].trim().split(",");
  
        for(var j=0;j<headers.length;j++){
            if(j < 2) {
                obj[headers[j]] = currentline[j];
            } else {
                obj[headers[j]] = +currentline[j];
            }
        }
  
        result.push(obj);
  
    }

    return result; 
  }