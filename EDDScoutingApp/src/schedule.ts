export class Schedule {
    teams: number[] = []
    matches: number[][] = [];

    addTeam(team: number) {
        this.teams.push(team);
    }

    setTeams(teams: number[]) {
        this.teams = teams;
    }

    addMatch(matchnum: number, teams: number[]) {
        if (matchnum < 1) return;
        if (teams.length != 6) return;
        this.matches.splice(matchnum-1, 0, teams);
    }

    getTeams(matchnum: number): number[] {
        return this.matches[matchnum] || [];
    }
}