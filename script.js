const rooms = ["Atrium", "Niels K. Jerne", "Einar Lundsgaard", "Henrik Dam", "Nielsine Nielsen", "Holst", "Room 13.1.41", "Room 13.1.63", "Room 7.15.92"];

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
  select.addEventListener('change', function() {
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
    let roomIndex = rooms.findIndex(room => session.room.includes(room));
    if (roomIndex !== -1) {
      for (let rowIndex = startTime + 1; rowIndex < endTime  + 1; rowIndex++) {
        let row;
        if (table.rows.length > rowIndex) {
          row = table.rows[rowIndex];
        } else {
          row = table.insertRow();
          // Add time slot cell
          let timeSlotCell = row.insertCell();
          timeSlotCell.textContent = formatTime(Math.floor((rowIndex - 1 + 32) / 4), ((rowIndex -1 + 32) % 4) * 15, Math.floor((rowIndex -1 + 33) / 4), ((rowIndex -1 + 33) % 4) * 15);
          timeSlotCell.style.width = '100px'; // Adjust the width as desired

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
            cell.textContent = session.title;
            cell.rowSpan = duration;
            cell.style.backgroundColor = session.color; // Add color to the cell
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

function formatTime(startHours, startMinutes, endHours, endMinutes) {
  let startTime = `${String(startHours).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')}`;
  let endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  return `${startTime} - ${endTime}`;
}
