export class Schedule {
    constructor() {
        this.teams = [];
        this.matches = [];
    }
    addTeam(team) {
        this.teams.push(team);
    }
    setTeams(teams) {
        this.teams = teams;
    }
    addMatch(matchnum, teams) {
        if (matchnum < 1)
            return;
        if (teams.length != 6)
            return;
        this.matches.splice(matchnum - 1, 0, teams);
    }
    getTeams(matchnum) {
        return this.matches[matchnum] || [];
    }
}
//# sourceMappingURL=schedule.js.map