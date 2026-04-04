import * as events from "./events.js";
import * as matchdata from "./matchdata.js";
import { Chart } from 'chart.js/auto';
let chart;
let eventsDropdown = [];
/**
 * The load button imports match data into the saved matches.
 */
function setupLoadButton() {
    let loadButton = document.getElementById("load");
    if (!loadButton)
        return;
    if (!(loadButton instanceof HTMLInputElement))
        return;
    loadButton.onchange = () => {
        if (!loadButton)
            return;
        if (!(loadButton instanceof HTMLInputElement))
            return;
        if (!loadButton.files)
            return;
        // const file = loadButton.files?.[0];
        //if (!file) return;
        for (const file of loadButton.files) {
            const reader = new FileReader();
            reader.onload = () => {
                const matches = JSON.parse(reader.result);
                //const matches: matchdata.MatchData[] = data.matches;
                //Add event counts for analytics. Also add event types
                for (const match of matches) {
                    match.eventcounts = new Map();
                    for (const event of match.matchEvents) {
                        if (match.eventcounts.has(event.type)) {
                            let count = match.eventcounts.get(event.type);
                            match.eventcounts.set(event.type, (count === undefined) ? 1 : count + 1);
                        }
                        else {
                            match.eventcounts.set(event.type, 1);
                        }
                        if (!events.getEventTypes().includes(event.type)) {
                            events.addEventType(event.type);
                        }
                    }
                }
                matchdata.addMatches(matches);
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
function updateEventsDropdown() {
    let eventSelect = document.getElementById("events");
    if (!eventSelect)
        return;
    if (!(eventSelect instanceof HTMLSelectElement))
        return;
    //Add all events to the selection
    for (const type of events.getEventTypes()) {
        if (eventsDropdown.includes(type))
            continue;
        const option = document.createElement("option");
        option.value = type;
        option.text = type;
        eventSelect.appendChild(option);
        eventsDropdown.push(type);
    }
}
/**
 * Test button to print all saved matches
 */
function setupTestButton() {
    let closeDesignerButton = document.getElementById("test");
    if (!closeDesignerButton)
        return;
    let teamnum = document.getElementById("team");
    if (!teamnum)
        return;
    if (!(teamnum instanceof HTMLInputElement))
        return;
    let eventSelect = document.getElementById("events");
    if (!eventSelect)
        return;
    if (!(eventSelect instanceof HTMLSelectElement))
        return;
    updateEventsDropdown();
    closeDesignerButton.onclick = () => {
        console.log(matchdata.getAllMatches());
        let eventTypes = [];
        for (const option of eventSelect.selectedOptions) {
            eventTypes.push(option.value);
        }
        updateChart(parseInt(teamnum.value), eventTypes);
        updateTable(parseInt(teamnum.value), eventTypes);
        updateByMatchTable1511(parseInt(teamnum.value));
    };
}
function setupChart() {
    let graph = document.getElementById("graph");
    if (!graph)
        return;
    if (!(graph instanceof HTMLCanvasElement))
        return;
    chart = new Chart(graph, {
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
            }
        }
    });
}
/**
 * Updates the chart to show current requirements
 */
function updateChart(teamNum, eventTypes) {
    if (!chart)
        return;
    let matches = [];
    for (const match of matchdata.getAllMatches()) {
        if (match.teamNumber == teamNum)
            matches.push(match.matchNumber);
    }
    matches.sort((a, b) => a - b);
    chart.data.labels = matches;
    chart.data.datasets = [];
    for (const type of eventTypes) {
        let counts = [];
        for (const matchNum of matches) {
            let c = 0;
            for (const match of matchdata.getAllMatches()) {
                if (match.matchNumber != matchNum || match.teamNumber != teamNum)
                    continue;
                let count = match.eventcounts.get(type);
                if (!count)
                    continue;
                c = count;
                break;
            }
            counts.push(c);
        }
        const dataset = {
            label: type,
            data: counts,
        };
        chart.data.datasets.push(dataset);
    }
    chart.update();
}
/**
 * Updates the tabel to show event counts, totals, and averages
 */
function updateTable(teamNum, eventTypes) {
    let table = document.getElementById("table");
    if (!table)
        return;
    if (!(table instanceof HTMLTableElement))
        return;
    //reset table
    table.innerHTML = "";
    //get matches the team is in
    let matches = [];
    for (const match of matchdata.getAllMatches()) {
        if (match.teamNumber == teamNum)
            matches.push(match.matchNumber);
    }
    matches.sort((a, b) => a - b);
    //add headers to the table
    let headerRow = document.createElement("tr");
    let headerEvent = document.createElement("th");
    let headerTotal = document.createElement("th");
    let headerAverage = document.createElement("th");
    headerEvent.innerHTML = "Event";
    headerTotal.innerHTML = "Total";
    headerAverage.innerHTML = "Average";
    headerRow.appendChild(headerEvent);
    headerRow.appendChild(headerTotal);
    headerRow.appendChild(headerAverage);
    for (const match of matches) {
        let matchCell = document.createElement("th");
        matchCell.innerHTML = "Match " + match.toString();
        headerRow.appendChild(matchCell);
    }
    table.appendChild(headerRow);
    //Add each event type to the table
    for (const type of eventTypes) {
        let row = document.createElement("tr");
        let rowName = document.createElement("td");
        let rowTotal = document.createElement("td");
        let rowAverage = document.createElement("td");
        rowName.innerHTML = type;
        rowTotal.innerHTML = "0";
        rowAverage.innerHTML = "0";
        row.appendChild(rowName);
        row.appendChild(rowTotal);
        row.appendChild(rowAverage);
        let total = 0;
        //Get counts for each match (in ascending order of by match number)
        for (const matchNum of matches) {
            let c = 0;
            for (const match of matchdata.getAllMatches()) {
                if (match.matchNumber != matchNum || match.teamNumber != teamNum)
                    continue;
                let count = match.eventcounts.get(type);
                if (!count)
                    continue;
                c = count;
                break;
            }
            let rowMatch = document.createElement("td");
            rowMatch.innerHTML = c.toString();
            row.appendChild(rowMatch);
            total += c;
        }
        //Set totals and averages
        rowTotal.innerHTML = total.toString();
        rowAverage.innerHTML = (total / matches.length).toFixed(2);
        table.appendChild(row);
    }
}
/**
 * Generic by match table
 */
function updateByMatchTable(teamNum) {
}
/**
 * By match table specific to what 1511 wants this year. I haven't finished an analytics builder yet so this is what I'm gonna do.
 */
function updateByMatchTable1511(teamNum) {
    let table = document.getElementById("table1511");
    if (!table)
        return;
    if (!(table instanceof HTMLTableElement))
        return;
    //reset table
    table.innerHTML = "";
    //get matches the team is in
    let matches = [];
    for (const match of matchdata.getAllMatches()) {
        if (match.teamNumber == teamNum)
            matches.push(match.matchNumber);
    }
    matches.sort((a, b) => a - b);
    let headerRow = document.createElement("tr");
    let headerMatch = document.createElement("th");
    headerMatch.innerHTML = "Match";
    headerRow.appendChild(headerMatch);
    table.appendChild(headerRow);
    for (const matchNum of matches) {
        for (const match of matchdata.getAllMatches()) {
            if (match.matchNumber != matchNum || match.teamNumber != teamNum)
                continue;
            //add each match here!
            let row = document.createElement("tr");
            let rowMatch = document.createElement("td");
            rowMatch.innerHTML = matchNum.toString();
            row.appendChild(rowMatch);
            table.appendChild(row);
            break;
        }
    }
}
//Example events (change later)!
let types = [
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
];
events.setEventTypes(types);
setupLoadButton();
setupTestButton();
setupChart();
//# sourceMappingURL=analytics.js.map