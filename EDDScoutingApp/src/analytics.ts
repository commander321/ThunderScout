import * as events from "./matchevents.js";
import * as matchdata from "./matchdata.js";
import * as bluetooth from "./bluetooth.js";
import {Chart} from 'chart.js/auto';

//let chart: Chart;
let pieChart: Chart;
let eventsDropdown: string[] = [];

/**
 * The load button imports match data into the saved matches.
 */
function setupLoadButton(): void {
  let loadButton = document.getElementById("load");
  if (!loadButton) return;
  if (!(loadButton instanceof HTMLInputElement)) return;
  loadButton.onchange = () => {
    if (!loadButton) return;
    if (!(loadButton instanceof HTMLInputElement)) return;
    if (!loadButton.files) return;
    // const file = loadButton.files?.[0];
    //if (!file) return;

    for (const file of loadButton.files) {

        const reader = new FileReader();

        reader.onload = () => {
        const matches: matchdata.MatchData[] = JSON.parse(reader.result as string);

        for (const match of matches) {
            //Check for duplicates and remove them
            matchdata.removeDuplicates(match.matchNumber, match.teamNumber, match.allianceStation, match.matchType, match.eventCode);

            //Add event counts for analytics. Also add event types
            match.eventcounts = new Map<string, number>();
            for (const event of match.matchEvents) {
                if (match.eventcounts.has(event.type)) {
                    let count = match.eventcounts.get(event.type);
                    match.eventcounts.set(event.type, (count === undefined) ? 1 : count + 1);
                } else {
                    match.eventcounts.set(event.type, 1);
                }

                if (!events.getEventTypes().includes(event.type)) {
                    events.addEventType(event.type);
                }
            }

            //Set text data map based on the JSON string
            if (match.textDataJSON.trim().length != 0) {
                match.textData = new Map<string, string>(Object.entries(JSON.parse(match.textDataJSON)))
                match.textDataJSON = "";
            } else {
                match.textData = new Map<string, string>();
            }

            //Create new matchdata object (this makes it a true MatchData object)
            let newMatch = new matchdata.MatchData();
            newMatch.matchNumber = match.matchNumber;
            newMatch.teamNumber = match.teamNumber;
            newMatch.allianceStation = match.allianceStation;
            newMatch.matchType = match.matchType;
            newMatch.eventCode = match.eventCode;
            newMatch.matchEvents = match.matchEvents;
            newMatch.textData = match.textData;
            newMatch.textDataJSON = match.textDataJSON;
            newMatch.eventcounts = match.eventcounts;

            //For 1511, turns Shift's into the active or inactive shifts
            newMatch = parseShiftGroups1511(newMatch);

            //Add to the list of matches to be added (since it doesn't include duplicates)
            matchdata.addMatch(newMatch);
        }

        updateEventsDropdown();

        //Need to add loading analytics things here
        };
        
        reader.readAsText(file);

    }

  };
}

/**
 * Updates the events dropdown selection with the current list of event types
 */
function updateEventsDropdown(): void {
    let eventSelect = document.getElementById("events");
    if (!eventSelect) return;
    if (!(eventSelect instanceof HTMLSelectElement)) return;

    //Add all events to the selection

    for (const type of events.getEventTypes()) {
        if (eventsDropdown.includes(type)) continue;

        const option: HTMLOptionElement = document.createElement("option");
        option.value = type;
        option.text = type;
        eventSelect.appendChild(option);
        eventsDropdown.push(type);
    }

}

/**
 * Test button to print all saved matches
 */
function setupTestButton(): void {
    let closeDesignerButton = document.getElementById("test");
    if (!closeDesignerButton) return;

    let teamnum1 = document.getElementById("team1");
    if (!teamnum1) return;
    if (!(teamnum1 instanceof HTMLInputElement)) return;

    let teamnum2 = document.getElementById("team2");
    if (!teamnum2) return;
    if (!(teamnum2 instanceof HTMLInputElement)) return;

    let teamnum3 = document.getElementById("team3");
    if (!teamnum3) return;
    if (!(teamnum3 instanceof HTMLInputElement)) return;

    let teamnum4 = document.getElementById("team4");
    if (!teamnum4) return;
    if (!(teamnum4 instanceof HTMLInputElement)) return;

    let teamnum5 = document.getElementById("team5");
    if (!teamnum5) return;
    if (!(teamnum5 instanceof HTMLInputElement)) return;

    let teamnum6 = document.getElementById("team6");
    if (!teamnum6) return;
    if (!(teamnum6 instanceof HTMLInputElement)) return;

    let eventSelect = document.getElementById("events");
    if (!eventSelect) return;
    if (!(eventSelect instanceof HTMLSelectElement)) return;
    updateEventsDropdown();

    closeDesignerButton.onclick = () => {
        console.log(matchdata.getAllMatches());
        let eventTypes: string[] = []
        for (const option of eventSelect.selectedOptions) {
            eventTypes.push(option.value);
        }
        updateChart(parseInt(teamnum1.value), eventTypes, "graph1");
        updatePieChart(parseInt(teamnum1.value), eventTypes);
        updateTable(parseInt(teamnum1.value), eventTypes);
        updateByMatchTable1511(parseInt(teamnum1.value), "table1511-1");
        updateScheduleTable();
        if (teamnum2.value.length != 0) {
            updateByMatchTable1511(parseInt(teamnum2.value), "table1511-2");
            updateChart(parseInt(teamnum2.value), eventTypes, "graph2");
        } else {
            Chart.getChart("graph2")?.destroy();
            document.getElementById("graph2")?.classList.add("hidden");

            let table2 = document.getElementById("table1511-2");
            if (!table2) return;
            table2.classList.add("hidden");
            table2.innerHTML = "";
        }

        if (teamnum3.value.length != 0) {
            updateByMatchTable1511(parseInt(teamnum3.value), "table1511-3");
            updateChart(parseInt(teamnum3.value), eventTypes, "graph3");
        } else {
            Chart.getChart("graph3")?.destroy();
            document.getElementById("graph3")?.classList.add("hidden");

            let table3 = document.getElementById("table1511-3");
            if (!table3) return;
            table3.classList.add("hidden");
            table3.innerHTML = "";
        }

        if (teamnum4.value.length != 0) {
            updateByMatchTable1511(parseInt(teamnum4.value), "table1511-4");
            updateChart(parseInt(teamnum4.value), eventTypes, "graph4");
        } else {
            Chart.getChart("graph4")?.destroy();
            document.getElementById("graph4")?.classList.add("hidden");

            let table4 = document.getElementById("table1511-4");
            if (!table4) return;
            table4.classList.add("hidden");
            table4.innerHTML = "";
        }

        if (teamnum5.value.length != 0) {
            updateByMatchTable1511(parseInt(teamnum5.value), "table1511-5");
            updateChart(parseInt(teamnum5.value), eventTypes, "graph5");
        } else {
            Chart.getChart("graph5")?.destroy();
            document.getElementById("graph5")?.classList.add("hidden");

            let table5 = document.getElementById("table1511-5");
            if (!table5) return;
            table5.classList.add("hidden");
            table5.innerHTML = "";
        }

        if (teamnum6.value.length != 0) {
            updateByMatchTable1511(parseInt(teamnum6.value), "table1511-6");
            updateChart(parseInt(teamnum6.value), eventTypes, "graph6");
        } else {
            Chart.getChart("graph6")?.destroy();
            document.getElementById("graph6")?.classList.add("hidden");

            let table6 = document.getElementById("table1511-6");
            if (!table6) return;
            table6.classList.add("hidden");
            table6.innerHTML = "";
        }
    };
}

/**
 * Setup the button to send all saved matches via bluetooth
 */
function setupBluetoothButton() {
    const button = document.getElementById("bluetooth");
    if (!button) return;
    if (!(button instanceof HTMLButtonElement)) return;

    /*
    button.onclick = (e) => {
        e.stopPropagation();

        //send data
        bluetooth.sendMatches(matchdata.getAllMatches());
    }
    */
}

function setupChart(id: string): Chart | null {
    let graph = document.getElementById(id);
    if (!graph) return null;
    if (!(graph instanceof HTMLCanvasElement)) return null;

    graph.classList.remove("hidden");
    graph.style.display = "inline";

    let chart = new Chart(graph, {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                data: []
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            animation: false,
            scales: {
                y: {
                    title: {
                        display: true,
                        text: "Count",
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: "Match"
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: "Team ####",
                    color: "#000000",
                    align: "center",
                    font: {
                        size: 22,
                        family: "Arial"
                    }
                }
            }
        }
    });

    return chart;
}

function setupPieChart(): void {
    let chart = document.getElementById("piechart");
    if (!chart) return;
    if (!(chart instanceof HTMLCanvasElement)) return;

    pieChart = new Chart(chart, {
        type: "pie",
        data: {
            labels: [
                "Event",
                "None"
            ],
            datasets: [{
                data: [3, 5]
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
        }
    })

}

function updatePieChart(teamNum: number, eventTypes: string[]): void {
    if (!pieChart) return;

    let matches: number[] = [];
    for (const match of matchdata.getAllMatches()) {
        if (match.teamNumber == teamNum) matches.push(match.matchNumber);
    }
    matches.sort((a, b) => a - b);

    pieChart.data.labels = eventTypes;

    pieChart.data.datasets = [];

    let data: number[] = [];

    for (const type of eventTypes) {
        let count: number = 0;

        for (const matchNum of matches) {
            let c: number = 0;
            for (const match of matchdata.getAllMatches()) {
                if (match.matchNumber != matchNum || match.teamNumber != teamNum) continue;
                let count = match.eventcounts.get(type)
                if (!count) continue;
                c = count;
                break;
            }
            count += c;
        }

        data.push(count);
    }

    const dataset = {
        data: data
    }

    pieChart.data.datasets.push(dataset);

    pieChart.update();

}

/**
 * Updates the chart to show current requirements
 */
function updateChart(teamNum: number, eventTypes: string[], chartID: string): void {
    let chart = Chart.getChart(chartID);
    if (!chart) {
        let newChart = setupChart(chartID);
        if (!newChart) return;
        chart = newChart;
    }

    let matches: number[] = []
    for (const match of matchdata.getAllMatches()) {
        if (match.teamNumber == teamNum) matches.push(match.matchNumber);
    }
    matches.sort((a, b) => a - b);

    chart.data.labels = matches;
    chart.data.datasets = [];

    if (chart.options.plugins && chart.options.plugins.title) {
        chart.options.plugins.title.text = teamNum.toString();
    }
    
    for (const type of eventTypes) {
        let counts: number[] = [];

        for (const matchNum of matches) {
            let c = 0;
            for (const match of matchdata.getAllMatches()) {
                if (match.matchNumber != matchNum || match.teamNumber != teamNum) continue;
                let count = match.eventcounts.get(type)
                if (!count) continue;
                c = count;
                break;
            }
            counts.push(c);
        }

        const dataset = {
            label: type,
            data: counts,
        }
        chart.data.datasets.push(dataset);
    }

    chart.update();
}

/**
 * Updates the tabel to show event counts, totals, and averages
 */
function updateTable(teamNum: number, eventTypes: string[]): void {
    let table = document.getElementById("table");
    if (!table) return;
    if (!(table instanceof HTMLTableElement)) return;

    //reset table
    table.innerHTML = "";

    //get matches the team is in
    let matches: number[] = []
    for (const match of matchdata.getAllMatches()) {
        if (match.teamNumber == teamNum) matches.push(match.matchNumber);
    }
    matches.sort((a, b) => a - b);

    //add headers to the table
    let headerRow: HTMLTableRowElement = document.createElement("tr");
    let headerEvent: HTMLTableCellElement = document.createElement("th");
    let headerTotal: HTMLTableCellElement = document.createElement("th");
    let headerAverage: HTMLTableCellElement = document.createElement("th");
    headerEvent.innerHTML = "Event";
    headerTotal.innerHTML = "Total";
    headerAverage.innerHTML = "Average";
    headerRow.appendChild(headerEvent);
    headerRow.appendChild(headerTotal);
    headerRow.appendChild(headerAverage);
    for (const match of matches) {
        let matchCell: HTMLTableCellElement = document.createElement("th");
        matchCell.innerHTML = "Match " + match.toString();
        headerRow.appendChild(matchCell);
    }
    table.appendChild(headerRow);

    //Add each event type to the table
    for (const type of eventTypes) {
        let row: HTMLTableRowElement = document.createElement("tr");
        let rowName: HTMLTableCellElement = document.createElement("td");
        let rowTotal: HTMLTableCellElement = document.createElement("td");
        let rowAverage: HTMLTableCellElement = document.createElement("td");
        rowName.innerHTML = type;
        rowTotal.innerHTML = "0";
        rowAverage.innerHTML = "0";
        row.appendChild(rowName);
        row.appendChild(rowTotal);
        row.appendChild(rowAverage);

        let total: number = 0;

        //Get counts for each match (in ascending order of by match number)
        for (const matchNum of matches) {
            let c = 0;
            for (const match of matchdata.getAllMatches()) {
                if (match.matchNumber != matchNum || match.teamNumber != teamNum) continue;
                let count = match.eventcounts.get(type)
                if (!count) continue;
                c = count;

                break;
            }
            let rowMatch: HTMLTableCellElement = document.createElement("td");
            rowMatch.innerHTML = c.toString();
            row.appendChild(rowMatch);

            total += c;
        }

        //Set totals and averages
        rowTotal.innerHTML = total.toString();
        rowAverage.innerHTML = (total/matches.length).toFixed(2);
        
        table.appendChild(row);
    }
} 

/**
 * Generic by match table (not adding this yet)
 */
function updateByMatchTable(teamNum: number) {

}

/**
 * By match table specific to what 1511 wants this year. I haven't finished an analytics builder yet so this is what I'm gonna do.
 */
function updateByMatchTable1511(teamNum: number, tableId: string) {
    const table = document.getElementById(tableId);
    if (!table) return;
    if (!(table instanceof HTMLTableElement)) return;

    //colors of the cells in different sections
    const winStyle = "background-color:#B6D7A8;";
    const autoStyle = "background-color:#EA9999;";
    const loseStyle = "background-color:#FFE599;";

    //reset table
    table.innerHTML = "";
    table.classList.remove("hidden");
    
    let teamLabel = document.createElement("h3");
    teamLabel.innerHTML = teamNum.toString() + ":";
    teamLabel.style.marginBottom = "0px";
    teamLabel.style.marginTop = "40px";
    table.appendChild(teamLabel);

    //get matches the team is in
    let matches: number[] = []
    for (const match of matchdata.getAllMatches()) {
        if (match.teamNumber == teamNum) matches.push(match.matchNumber);
    }
    matches.sort((a, b) => a - b);

    const headerRow1: HTMLTableRowElement = document.createElement("tr");
    addHeaderCell(headerRow1, "Match Setup", 3);
    addHeaderCell(headerRow1, "Autonomous", 4, autoStyle);
    addHeaderCell(headerRow1, "Teleop - Win/Tie Auto", 6, winStyle);
    addHeaderCell(headerRow1, "Teleop - Lose Auto", 6, loseStyle);
    addHeaderCell(headerRow1, "Match Summary", 5);
    table.appendChild(headerRow1);

    const headerRow2: HTMLTableRowElement = document.createElement("tr");
    addHeaderCell(headerRow2, "Match #");
    addHeaderCell(headerRow2, "Scouter Name");
    addHeaderCell(headerRow2, "Starting Location");
    addHeaderCell(headerRow2, "Actions", 1, autoStyle);
    addHeaderCell(headerRow2, "Intake", 1, autoStyle);
    addHeaderCell(headerRow2, "Climb?", 1, autoStyle);
    addHeaderCell(headerRow2, "W/L Auto", 1, autoStyle);
    addHeaderCell(headerRow2, "Inac-Hub 1", 1, winStyle);
    addHeaderCell(headerRow2, "Active-Hub 1", 1, winStyle);
    addHeaderCell(headerRow2, "Inac-Hub 2", 1, winStyle);
    addHeaderCell(headerRow2, "Active-Hub 2", 1, winStyle);
    addHeaderCell(headerRow2, "Endgame", 1, winStyle);
    addHeaderCell(headerRow2, "Climb?", 1, winStyle);
    addHeaderCell(headerRow2, "Active-Hub 1", 1, loseStyle);
    addHeaderCell(headerRow2, "Inac-Hub 1", 1, loseStyle);
    addHeaderCell(headerRow2, "Active-Hub 2", 1, loseStyle);
    addHeaderCell(headerRow2, "Inac-Hub 2", 1, loseStyle);
    addHeaderCell(headerRow2, "Endgame", 1, loseStyle);
    addHeaderCell(headerRow2, "Climb?", 1, loseStyle);
    addHeaderCell(headerRow2, "Shoot Grid");
    addHeaderCell(headerRow2, "Path");
    addHeaderCell(headerRow2, "Beached?");
    addHeaderCell(headerRow2, "Robot Die?");
    addHeaderCell(headerRow2, "<- Why?");
    table.appendChild(headerRow2);

    for (const matchNum of matches) {
        for (const match of matchdata.getAllMatches()) {
            if (match.matchNumber != matchNum || match.teamNumber != teamNum) continue;

            //add each match here!
            const row = document.createElement("tr");

            //PRE MATCH
            addCell(row, matchNum.toString());
            addCell(row, match.textData.get("Scouter Name") || "");
            addCell(row, match.getEventsByGroup("StartLoc").toString());
            
            //AUTO #EA9999
            addCell(row, match.getEventsByGroup("Auto").toString(), autoStyle);
            addCell(row, match.getEventsByGroup("AutoIntake").toString(), autoStyle);
            addCell(row, match.getEventsByGroup("AutoHang").toString(), autoStyle);
            addCell(row, match.getEventsByGroup("WinAuto").toString(), autoStyle);

            //TELEOP 
            if (match.getEventCount("Win")) {
                //WIN AUTO #B6D7A8
                addCell(row, match.getEventsByGroup("Inactive 1").toString(), winStyle);
                addCell(row, match.getEventsByGroup("Active 1").toString(), winStyle);
                addCell(row, match.getEventsByGroup("Inactive 2").toString(), winStyle);
                addCell(row, match.getEventsByGroup("Active 2").toString(), winStyle);
                addCell(row, match.getEventsByGroup("Endgame").toString(), winStyle);
                addCell(row, match.getEventsByGroup("TeleopHang").toString(), winStyle);
                for (let i=0;i<6;i++) addCell(row, "", loseStyle);
            } else {
                //LOSE AUTO #FFE599
                for (let i=0;i<6;i++) addCell(row, "", winStyle);
                addCell(row, match.getEventsByGroup("Active 1").toString(), loseStyle);
                addCell(row, match.getEventsByGroup("Inactive 1").toString(), loseStyle);
                addCell(row, match.getEventsByGroup("Active 2").toString(), loseStyle);
                addCell(row, match.getEventsByGroup("Inactive 2").toString(), loseStyle);
                addCell(row, match.getEventsByGroup("Endgame").toString(), loseStyle);
                addCell(row, match.getEventsByGroup("TeleopHang").toString(), loseStyle);
            }

            //MATCH SUMMARY
            addCell(row, match.getTextData("Shoot Grid"))
            addCell(row, match.getEventsByGroup("Path").toString());
            addCell(row, match.getEventsByGroup("Beached").toString());
            addCell(row, (match.getEventCount("Robot Died") > 0) ? "Yes" : "No");
            addCell(row, match.getTextData("WhyDied"));

            table.appendChild(row);

            break;
        }
    }


    //handle exporting the data to CSV
    let exportButton = document.createElement("button");
    exportButton.innerHTML = "Export to CSV";

    /*const exportButton = document.getElementById("table-export");
    if (!exportButton) return;
    if (!(exportButton instanceof HTMLButtonElement)) return;*/
    exportButton.onclick = (e) => {
        e.stopPropagation();

        const rows: HTMLTableRowElement[] = Array.from(table.querySelectorAll("tr"));
        // 1. Map rows to CSV strings
        const csvContent = rows.map(row => {
            const cells = Array.from(row.querySelectorAll('th, td'));
            return cells.map(cell => {
                // Escape double quotes and wrap in quotes to handle commas
                let data = cell.innerHTML.replace(/"/g, '""');
                return `"${data}"`;
            }).join(',');
        }).join('\n');

        // 2. Create a Blob and Download Link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        // 3. Trigger browser download
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'table');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    console.log(exportButton.onclick.toString());

    table.appendChild(exportButton);
}

/**
 * Turns all "Shift #" event gorups into the proper ones based on active/inactive shifts
 */
function parseShiftGroups1511(data: matchdata.MatchData): matchdata.MatchData {
    const wonAuto: Boolean = data.getEventCount("Win") > 0;
    for (const event of data.matchEvents) {
        if (event.group === "Shift 1") event.group = wonAuto ? "Inactive 1" : "Active 1";
        if (event.group === "Shift 2") event.group = wonAuto ? "Active 1" : "Inactive 1";
        if (event.group === "Shift 3") event.group = wonAuto ? "Inactive 2" : "Active 2";
        if (event.group === "Shift 4") event.group = wonAuto ? "Active 2" : "Inactive 2";
    }

    return data;
}

function addCell(row: HTMLTableRowElement, value: string, style?: string): void {
    const cell = document.createElement("td");
    cell.innerHTML = value;
    if (style) cell.style = style;
    row.appendChild(cell);
}

function addHeaderCell(row: HTMLTableRowElement, value: string, colSpan?: number, style?: string): void {
    const cell = document.createElement("th");
    cell.innerHTML = value;
    if (colSpan) cell.colSpan = colSpan;
    if (style) cell.style = style;
    row.appendChild(cell);
}

function updateScheduleTable() {
    const scheduleTable = document.getElementById("schedule-table");
    if (!scheduleTable) return;

    scheduleTable.innerHTML = "";

    let header = document.createElement("tr");
    addHeaderCell(header, "Match #");
    addHeaderCell(header, "Red 1");
    addHeaderCell(header, "Red 2");
    addHeaderCell(header, "Red 3");
    addHeaderCell(header, "Blue 1");
    addHeaderCell(header, "Blue 2");
    addHeaderCell(header, "Blue 3");
    scheduleTable.appendChild(header);

    //always show at least 5 matches
    let highestMatch = 5;
    let rows = [];

    for (const match of matchdata.getAllMatches()) {
        if (match.matchNumber > highestMatch) highestMatch = match.matchNumber;
    }

    highestMatch += 2;

    //add a row for each match played so far
    for (let i=1;i<highestMatch;i++) {
        let row = document.createElement("tr");
        addCell(row, i.toString());
        addCell(row, "");
        addCell(row, "");
        addCell(row, "");
        addCell(row, "");
        addCell(row, "");
        addCell(row, "");
        rows.push(row);
    }

    //add each match to the table where it should go
    for (const match of matchdata.getAllMatches()) {
        if (match.matchNumber <= 0) continue;
        let row = rows[match.matchNumber-1];
        if (!row) continue;

        let cell = row.children[match.allianceStation.startsWith("Red") ? parseInt(match.allianceStation.charAt(4)) : 3+parseInt(match.allianceStation.charAt(5))];
        if (!cell) continue;
        if (!(cell instanceof HTMLTableCellElement)) continue;

        cell.innerHTML = match.teamNumber.toString();
        cell.style.backgroundColor = "#00FF00";
    }

    //add all rows to the schedule
    for (const row of rows) {
        scheduleTable.appendChild(row);
    }
}

/**
 * Exports the analytics page to HTML
 */
function exportToHTML() {
    let content = "";

    const team1 = document.getElementById("team1");
    const team2 = document.getElementById("team2");
    const team3 = document.getElementById("team3");
    const team4 = document.getElementById("team4");
    const team5 = document.getElementById("team5");
    const team6 = document.getElementById("team6");
    if (!team1) return;
    if (!team2) return;
    if (!team3) return;
    if (!team4) return;
    if (!team5) return;
    if (!team6) return;
    if (!(team1 instanceof HTMLInputElement)) return;
    if (!(team2 instanceof HTMLInputElement)) return;
    if (!(team3 instanceof HTMLInputElement)) return;
    if (!(team4 instanceof HTMLInputElement)) return;
    if (!(team5 instanceof HTMLInputElement)) return;
    if (!(team6 instanceof HTMLInputElement)) return;


    //head and style
    content += "<html> <head>";
    content += document.getElementById("style")?.outerHTML;
    content += "</head><body>";

    //Add the 1511 tables
    content += document.getElementById("table1511-div-1")?.outerHTML;
    content += document.getElementById("table1511-div-2")?.outerHTML;
    content += document.getElementById("table1511-div-3")?.outerHTML;
    content += document.getElementById("table1511-div-4")?.outerHTML;
    content += document.getElementById("table1511-div-5")?.outerHTML;
    content += document.getElementById("table1511-div-6")?.outerHTML;

    content += "<div style=\"height:70px;\"></div>";

    //Get graphs
    if (Chart.getChart("graph1")) content += "<img src=" + Chart.getChart("graph1")?.toBase64Image() + "></img>";
    if (Chart.getChart("graph2")) content += "<img src=" + Chart.getChart("graph2")?.toBase64Image() + "></img>";
    if (Chart.getChart("graph3")) content += "<img src=" + Chart.getChart("graph3")?.toBase64Image() + "></img>";
    if (Chart.getChart("graph4")) content += "<img src=" + Chart.getChart("graph4")?.toBase64Image() + "></img>";
    if (Chart.getChart("graph5")) content += "<img src=" + Chart.getChart("graph5")?.toBase64Image() + "></img>";
    if (Chart.getChart("graph6")) content += "<img src=" + Chart.getChart("graph6")?.toBase64Image() + "></img>";

    content += "</body></html>"

    //download file
    const blob = new Blob([content], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "analytics-" + team1.value + "-" + team2.value + "-" + team3.value + "-" + team4.value + "-" + team5.value + "-" + team6.value + ".html";
    
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

function setupExportButton() {
    const exportButton = document.getElementById("export");
    if (!exportButton) return;
    if (!(exportButton instanceof HTMLButtonElement)) return;

    exportButton.onclick = exportToHTML;
}

//=========================
// Analytics Table Objects
//=========================

/*
export abstract class AnalyticsColumn {

    /**
     * Creates a cell in a row in the table
     
    abstract addToRow(row: HTMLTableRowElement, match: matchdata.MatchData): void;
}

export class AnalyticsMatchNumColumn extends AnalyticsColumn{

    addToRow(row: HTMLTableRowElement, match: matchdata.MatchData) {
        
    }
}
*/

//Example events (change later)!
/*
let types: string[] = [
    "Auto Fuel 0",
    "Auto Fuel 1-10",
    "Auto Fuel 11-20",
    "Auto Fuel 21-30",
    "Auto Fuel 30-50",
    "Auto Fuel 51-75",
    "Auto Fuel 76-100",
    "Auto Fuel 100+",
    "Fuel 0",
    "Fuel 1-10",
    "Fuel 11-20",
    "Fuel 21-30",
    "Fuel 30-50",
    "Fuel 51-75",
    "Fuel 76-100",
    "Fuel 100+"
]
events.setEventTypes(types);*/

setupLoadButton();
setupTestButton();
setupBluetoothButton();
setupPieChart();
setupExportButton();