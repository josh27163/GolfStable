const course = [
    { hole: 1, par: 3, strokeIndex: 5 },
    { hole: 2, par: 4, strokeIndex: 9 },
    { hole: 3, par: 3, strokeIndex: 3 },
    { hole: 4, par: 4, strokeIndex: 1 },
    { hole: 5, par: 3, strokeIndex: 6 },
    { hole: 6, par: 4, strokeIndex: 4 },
    { hole: 7, par: 3, strokeIndex: 8 },
    { hole: 8, par: 4, strokeIndex: 7 },
    { hole: 9, par: 4, strokeIndex: 2 }
];

let players = [
    { name: 'Tom', handicap: 4, scores: Array(course.length).fill(0) },
    { name: 'Garry', handicap: 12, scores: Array(course.length).fill(0) },
    { name: 'Nigel', handicap: 12, scores: Array(course.length).fill(0) },
    { name: 'Porky', handicap: 12, scores: Array(course.length).fill(0) },
    { name: 'Whybrow', handicap: 22, scores: Array(course.length).fill(0) },
    { name: 'Gibbs', handicap: 14, scores: Array(course.length).fill(0) },
    { name: 'Josh', handicap: 7, scores: Array(course.length).fill(0) },
    { name: 'George', handicap: 4, scores: Array(course.length).fill(0) },
    { name: 'Chelsea', handicap: 16, scores: Array(course.length).fill(0) },
    { name: 'Iwan', handicap: 12, scores: Array(course.length).fill(0) },
    { name: 'Balaam', handicap: 15, scores: Array(course.length).fill(0) }
];

function updateCourseTable() {
    const courseBody = document.getElementById('course-body');
    courseBody.innerHTML = ''; // Clear the table before re-rendering

    course.forEach(hole => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${hole.hole}</td>
            <td>${hole.par}</td>
            <td>${hole.strokeIndex}</td>
        `;
        courseBody.appendChild(row);
    });
}

function updatePlayersTable() {
    const playersBody = document.getElementById('players-body');
    playersBody.innerHTML = ''; // Clear the table before re-rendering

    players.forEach(player => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${player.name}</td>
            <td><input type="number" inputmode="numeric" value="${player.handicap}" /></td>
            ${player.scores.map((score, index) => `<td><input type="number" inputmode="numeric" pattern="[0-9]*" value="${score}" data-player="${player.name}" data-index="${index}" /></td>`).join('')}
        `;
        playersBody.appendChild(row);
    });

    // Add event listeners to all score inputs
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('change', function() {
            saveScores();
        });
    });
}

function saveScores() {
    players.forEach(player => {
        const inputs = document.querySelectorAll(`input[data-player="${player.name}"]`);
        player.scores = Array.from(inputs).map(input => Number(input.value));
    });
    localStorage.setItem('players', JSON.stringify(players));
}

function loadScores() {
    const storedPlayers = JSON.parse(localStorage.getItem('players'));
    if (storedPlayers) {
        players = storedPlayers;
    }
}

function resetPlayers() {
    localStorage.clear(); // Clears all local storage data
    players.forEach(player => {
        player.scores = Array(course.length).fill(0); // Reset scores to 0
    });
    updatePlayersTable(); // Re-render the players table with reset scores
}

function calculateStableford() {
    const resultsBody = document.getElementById('results-body');
    resultsBody.innerHTML = ''; // Clear previous results

    const playerRows = document.querySelectorAll('#players-body tr');
    playerRows.forEach((row, playerIndex) => {
        const playerName = row.children[0].textContent;
        const handicap = Number(row.children[1].children[0].value);
        const scores = Array.from(row.querySelectorAll('input[type="number"]')).slice(2).map(input => Number(input.value));

        let stablefordPoints = 0;

        scores.forEach((score, holeIndex) => {
            const { par, strokeIndex } = course[holeIndex];
            const strokesReceived = Math.floor(handicap / 18) + (handicap % 18 >= strokeIndex ? 1 : 0);
            const netScore = score - strokesReceived;
            stablefordPoints += calculatePoints(par, netScore);
        });

        const resultRow = document.createElement('tr');
        resultRow.innerHTML = `<td>${playerName}</td><td>${stablefordPoints}</td>`;
        resultsBody.appendChild(resultRow);
    });
}

function calculatePoints(par, netScore) {
    const scoreDifference = netScore - par;
    switch (scoreDifference) {
        case -2: return 4;
        case -1: return 3;
        case 0: return 2;
        case 1: return 1;
        default: return 0;
    }
}

function toggleVisibility(id) {
    var element = document.getElementById(id);
    if (element.style.display === 'none') {
        element.style.display = '';
    } else {
        element.style.display = 'none';
    }
}

// Initialize course and players table on load
document.addEventListener('DOMContentLoaded', () => {
    updateCourseTable();
    loadScores();
    updatePlayersTable();
});
