import * as events from "./events.js";
import * as matchdata from "./matchdata.js";
import { Chart } from 'chart.js/auto';
let chart;
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
        const file = loadButton.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = () => {
            const data = JSON.parse(reader.result);
            const matches = data.matches;
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
                    if (!events.getEventTypes().includes(event.type))
                        events.addEventType(event.type);
                }
            }
            matchdata.addMatches(matches);
            updateEventsDropdown();
            //Need to add loading analytics things here
        };
        reader.readAsText(file);
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
        const option = document.createElement("option");
        option.value = type;
        option.text = type;
        eventSelect.appendChild(option);
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
    chart.data.labels = matches;
    chart.data.datasets.pop();
    for (const type of eventTypes) {
        let counts = [];
        for (const match of matchdata.getAllMatches()) {
            if (match.teamNumber != teamNum)
                continue;
            let count = match.eventcounts.get(type);
            if (!count)
                continue;
            counts.push(count);
        }
        const dataset = {
            label: type,
            data: counts,
        };
        chart.data.datasets.push(dataset);
    }
    chart.update();
}
setupLoadButton();
setupTestButton();
setupChart();
//# sourceMappingURL=analytics.js.map