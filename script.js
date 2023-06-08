const rooms = ['Atrium','A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
let data; // Global variable to store the agenda data

fetch('agenda2.json')
  .then(response => response.json())
  .then(json => {
    data = json;
    populateDays();
    populateTable(0);
  });

function populateDays() {
  let select = document.getElementById('day-select');
  data.days.forEach((day, index) => {
    let option = document.createElement('option');
    option.textContent = day.day;
    option.value = index;
    select.appendChild(option);
  });
  select.addEventListener('change', function () {
    populateTable(this.value);
  });
}



function populateTable(dayIndex) {
  let table = document.getElementById('session-table');
  // clear existing rows
  while (table.rows.length > 1) {
    table.deleteRow(1);
  }

  // Initialize cellSpans array
  let cellSpans = [];

  // Calculate the maximum end time of all sessions to know how many rows we need
  let maxEndTime = data.days[dayIndex].sessions.reduce((max, session) => {
    let endTime = parseInt(session.end_time.split(':')[0]) * 4 + parseInt(session.end_time.split(':')[1]) / 15 - 32;
    return Math.max(max, endTime);
  }, 0);

  // Ensure we have enough rows in cellSpans
  for (let i = 0; i <= maxEndTime; i++) {
    cellSpans[i] = new Array(rooms.length).fill(0);
  }

  // Sort sessions by start time
  let sortedSessions = data.days[dayIndex].sessions.sort((a, b) => {
    let aStartTime = parseInt(a.start_time.split(':')[0]) * 4 + parseInt(a.start_time.split(':')[1]) / 15 - 32;
    let bStartTime = parseInt(b.start_time.split(':')[0]) * 4 + parseInt(b.start_time.split(':')[1]) / 15 - 32;
    return aStartTime - bStartTime;
  });

  // add sessions to table
  sortedSessions.forEach(session => {
    // calculate which row (time slot) to add the session to
    let startTime = parseInt(session.start_time.split(':')[0]) * 4 + parseInt(session.start_time.split(':')[1]) / 15 - 32; // start from 8:00
    let endTime = parseInt(session.end_time.split(':')[0]) * 4 + parseInt(session.end_time.split(':')[1]) / 15 - 32; // start from 8:00
    
    let roomIndex = rooms.findIndex(room => session.room === room);
    console.log(session.room, roomIndex)
    if (roomIndex !== -1) {
      for (let rowIndex = startTime + 1; rowIndex < endTime + 1; rowIndex++) {
        let row;
        if (table.rows.length > rowIndex) {
          row = table.rows[rowIndex];
        } else {
          row = table.insertRow();
          // Add time slot cell
          let timeSlotCell = row.insertCell();
          timeSlotCell.textContent = formatTime(Math.floor((rowIndex - 1 + 32) / 4), ((rowIndex - 1 + 32) % 4) * 15, Math.floor((rowIndex - 1 + 33) / 4), ((rowIndex - 1 + 33) % 4) * 15);
          timeSlotCell.classList.add('time-cell'); // Add the time-cell class here

          // Add cells for each room
          for (let i = 0; i < rooms.length; i++) {
            row.insertCell();
          }
        }
        // Check if there's already a cell spanning into this cell's position
        if (cellSpans[rowIndex][roomIndex] > 0) {
          row.deleteCell(-1);
          //cellSpans[rowIndex][roomIndex]--;

        } else {
          // Add cell for this session if it hasn't already been added
          let cell = row.cells[roomIndex + 1];

          if (!cell.textContent) {
            let duration = endTime - startTime;
            //let title = document.createElement('a');
            //title.textContent = session.title;
            //title.href = `session-details.html?session=${encodeURIComponent(JSON.stringify(session))}`;
            //title.classList.add('session-title'); // Add class for styling
            //cell.appendChild(title);

            // Add the session title
            let title = document.createElement('a');
            title.textContent = session.title;
            title.href = `session-details.html?session=${encodeURIComponent(JSON.stringify(session))}`;
            title.classList.add('session-title'); // Add class for styling
            cell.appendChild(title);

            // Array of rooms where presentations and presenters will be displayed
            let specificRooms = ['A','B','C','D','E','F','G','H']; // Update with your specific rooms

            if (specificRooms.includes(session.room)) {
              // Add each presentation and presenter to the cell
                session.presentations.forEach(presentation => {

                  let p = document.createElement('p');
                  p.textContent = presentation.title + '. ';
                  p.classList.add('session-presentation');
                  
                  let presenterName = document.createElement('strong');
                  presenterName.textContent = presentation.presenter;
                  p.appendChild(presenterName);
                  p.classList.add('session-presentation');
                  cell.appendChild(p);
                });
            }

            cell.rowSpan = duration;
            cell.style.backgroundColor = session.color; // Add color to the cell
            // Add class to session cells and update event listener
            if (!cell.classList.contains('session-cell')) {
              cell.classList.add('session-cell');
              cell.addEventListener('click', function () {
                showSessionDetails(session);
              });
            }
            // Update cellSpans for all cells this one spans over
            for (let i = 0; i < duration; i++) {
              if (cellSpans[rowIndex + i][roomIndex] === 0) {
                cellSpans[rowIndex + i][roomIndex] = duration - i;
              }
            }
          }
        }
      }
    }
  });
}




function showSessionDetails(session) {
  // Create a URL with session details
  let url = `session-details.html?session=${encodeURIComponent(JSON.stringify(session))}`;
  // Redirect to the session details page
  window.location.href = url;
}

function formatTime(startHours, startMinutes, endHours, endMinutes) {
  let startTime = `${String(startHours).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')}`;
  let endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  return `${startTime} - ${endTime}`;
}

document.addEventListener('DOMContentLoaded', function () {
  // ... your existing code ...

  // Add event listeners to the tab elements
  let agendaTab = document.getElementById('agenda-tab');
  let searchTab = document.getElementById('search-tab');

  agendaTab.addEventListener('click', function () {
    switchTab('agenda');
  });

  searchTab.addEventListener('click', function () {
    switchTab('search');
  });

  // Display the initial active tab (agenda by default)
  switchTab('agenda');

  // Add event listener to the search form
  let searchForm = document.getElementById('search-form');
  searchForm.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission

    let searchInput = document.getElementById('search-input');
    let searchTerm = searchInput.value.toLowerCase().trim(); // Convert search term to lowercase and remove leading/trailing whitespace

    // Filter presentations based on search term
    let filteredPresentations = data.days.flatMap(day => day.sessions)
      .flatMap(session => session.presentations)
      .filter(presentation => {
        // Search by author name or keyword
        let isAuthorMatch = presentation.presenter.toLowerCase().includes(searchTerm);
        let isKeywordMatch = presentation.title.toLowerCase().includes(searchTerm);

        return isAuthorMatch || isKeywordMatch;
      });

    // Display search results
    displaySearchResults(filteredPresentations);
  });
});

function displaySearchResults(presentations) {
  let searchResultsElement = document.getElementById('search-results');
  searchResultsElement.innerHTML = ''; // Clear existing results

  if (presentations.length === 0) {
    searchResultsElement.textContent = 'No results found.';
    return;
  }

  // Create a container for search results
  let resultList = document.createElement('div');
  resultList.classList.add('search-results-list');

  presentations.forEach(presentation => {

    let session = presentation.session;

    // Create a container for each search result
    let resultContainer = document.createElement('div');
    resultContainer.classList.add('search-result');

    // Session details (name and time)
    let sessionDetails = document.createElement('div');
    sessionDetails.classList.add('session-details');

    let sessionLink = document.createElement('a');
    sessionLink.textContent = session.title;
    sessionLink.href = `session-details.html?session=${encodeURIComponent(JSON.stringify(session))}`;

    let sessionTime = document.createElement('div');
    sessionTime.textContent = `Time: ${session.start_time} -  ${session.end_time}`;

    sessionDetails.appendChild(sessionLink);
    sessionDetails.appendChild(sessionTime);

    // Presentation details
    let presentationDetails = document.createElement('div');
    presentationDetails.classList.add('presentation-details');

    let presentationTime = document.createElement('div');
    presentationTime.textContent = `Presentation Time: ${presentation.presentation_time}`;

    let presentationTitle = document.createElement('div');
    presentationTitle.textContent = `Title: ${presentation.title}`;

    let presenterName = document.createElement('div');
    presenterName.textContent = `Presenter: ${presentation.presenter}`;

    presentationDetails.appendChild(presentationTime);
    presentationDetails.appendChild(presentationTitle);
    presentationDetails.appendChild(presenterName);

    // Append session details and presentation details to the result container
    resultContainer.appendChild(sessionDetails);
    resultContainer.appendChild(presentationDetails);

    // Append the result container to the search results container
    resultList.appendChild(resultContainer);
  });

  // Append the search results container to the search results element
  searchResultsElement.appendChild(resultList);
}

function switchTab(tabName) {
  let agendaTab = document.getElementById('agenda-tab');
  let searchTab = document.getElementById('search-tab');
  let agendaSection = document.getElementById('agenda-content');
  let searchSection = document.getElementById('search-content');

  if (tabName === 'agenda') {
    agendaTab.classList.add('active');
    searchTab.classList.remove('active');
    agendaSection.style.display = 'block';
    searchSection.style.display = 'none';
  } else if (tabName === 'search') {
    agendaTab.classList.remove('active');
    searchTab.classList.add('active');
    agendaSection.style.display = 'none';
    searchSection.style.display = 'block';
  }
}
