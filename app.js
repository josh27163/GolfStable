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
    { name: 'Tom', handicap: 4, scores: Array(course.length).fill(null) },
    { name: 'Garry', handicap: 12, scores: Array(course.length).fill(null) },
    { name: 'Nigel', handicap: 12, scores: Array(course.length).fill(null) },
    { name: 'Porky', handicap: 12, scores: Array(course.length).fill(null) },
    { name: 'Whybrow', handicap: 22, scores: Array(course.length).fill(null) },
    { name: 'Gibbs', handicap: 14, scores: Array(course.length).fill(null) },
    { name: 'Josh', handicap: 7, scores: Array(course.length).fill(null) },
    { name: 'George', handicap: 4, scores: Array(course.length).fill(null) },
    { name: 'Chelsea', handicap: 16, scores: Array(course.length).fill(null) },
    { name: 'Iwan', handicap: 12, scores: Array(course.length).fill(null) },
    { name: 'Balaam', handicap: 15, scores: Array(course.length).fill(null) }
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
            ${player.scores.map((score, index) => `<td><input type="number" inputmode="numeric" pattern="[0-9]*" value="${score !== null ? score : ''}" data-player="${player.name}" data-index="${index}" /></td>`).join('')}
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
        player.scores = Array.from(inputs).map(input => input.value);
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
        player.scores = Array(course.length).fill(null); // Reset scores to null
    });
    updatePlayersTable(); // Re-render the players table with reset scores
}

function calculateStableford() {
    const resultsBody = document.getElementById('results-body');
    resultsBody.innerHTML = ''; // Clear previous results

    let highestScore = 0;
    let winners = [];

    players.forEach(player => {
        let stablefordPoints = 0;
        const handicapStrokes = course.map(hole => 
            Math.floor(player.handicap / 9) + (hole.strokeIndex <= (player.handicap % 9) ? 1 : 0)
        );

        player.scores.forEach((score, holeIndex) => {
            if (score === null || score === '') return; // Skip holes with no score

            const { par } = course[holeIndex];
            const strokesReceived = handicapStrokes[holeIndex];
            const netScore = score - strokesReceived;
            console.log(player.name, score, strokesReceived, netScore);
            stablefordPoints += calculatePoints(par, netScore);
        });

        if (stablefordPoints > highestScore) {
            highestScore = stablefordPoints;
            winners = [player.name];
        } else if (stablefordPoints === highestScore) {
            winners.push(player.name);
        }

        const resultRow = document.createElement('tr');
        resultRow.innerHTML = `<td>${player.name}</td><td>${stablefordPoints}</td>`;
        resultsBody.appendChild(resultRow);
    });

    // Display winner message
    const messageElement = document.createElement('div');
    let msgText = '';
    messageElement.id = 'winner-message';
    if (winners.length === 1) {
        messageElement.textContent = `Congratulations to ${winners[0]} for winning with ${highestScore} points!`;
        msgText = `Congratulations to ${winners[0]} for winning with ${highestScore} points!`;
    } else if (winners.length > 1) {
        messageElement.textContent = `It's a tie! Congratulations to ${winners.join(', ')} for winning with ${highestScore} points each!`;
        msgText = `It's a tie! Congratulations to ${winners.join(', ')} for winning with ${highestScore} points each!`;
    } else {
        messageElement.textContent = 'No winners determined. Please check the scores.';
        msgText = 'No winners determined. Please check the scores.';
    }
    
    // Replace the alert with a custom modal
    showCustomModal(msgText);
    resultsBody.parentNode.insertAdjacentElement('afterend', messageElement);
}

// Add this new function to create and show a custom modal
function showCustomModal(message) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background-color: white;
        padding: 20px;
        border-radius: 5px;
        max-width: 80%;
        text-align: center;
    `;

    const messageElement = document.createElement('p');
    messageElement.textContent = message;

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.onclick = () => document.body.removeChild(modal);

    modalContent.appendChild(messageElement);
    modalContent.appendChild(closeButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

function calculatePoints(par, netScore) {
    const difference = par - netScore;
    if (difference <= -2) return 0;
    if (difference === -1) return 1;
    if (difference === 0) return 2;
    if (difference === 1) return 3;
    if (difference === 2) return 4;
    if (difference >= 3) return 5;
    return 0;
}

function toggleVisibility(id) {
    const element = document.getElementById(id);
    if (element.style.display === "none") {
        element.style.display = "table-row-group"; // or "block" if not a table
    } else {
        element.style.display = "none";
    }
}

// Initialize course and players table on load
document.addEventListener('DOMContentLoaded', () => {
    updateCourseTable();
    loadScores();
    updatePlayersTable();
});