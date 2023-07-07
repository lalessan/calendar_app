
document.addEventListener('DOMContentLoaded', function () {
  // Get the session ID and day from the URL query parameters
  const searchParams = new URLSearchParams(window.location.search);
  const sessionId = searchParams.get('sessionId');
  const day = searchParams.get('day');

  // Modify the back link to include the day parameter
  const backLink = document.querySelector('.back-link a');
  backLink.href += `?day=${day}`;

  if (sessionId && day) {
    // Fetch the session details based on the ID and day
    fetchSessionDetails()
      .then(data => {
        const session = findSessionById(data, sessionId);
        if (session) {
          displaySessionDetails(session, day); // Pass the day to the displaySessionDetails function
        } else {
          console.error('Session not found');
        }
      })
      .catch(error => {
        console.error('Error fetching session details:', error);
      });
  } else {
    console.error('Invalid sessionId or day');
  }
});

function openRoomModal(element) {
  var roomMapUrl = ` https://laura.alessandretti.com/public/${element.textContent}.png`.replace(/\s/g,"");
  var modal = document.getElementById('modal');
  var modalImage = document.getElementById('modalImage');
  modal.style.display = 'block';
  modalImage.src = roomMapUrl;
}

// Close the modal when the close button is clicked
var closeButton = document.getElementById('modalClose');
closeButton.addEventListener('click', function() {
  var modal = document.getElementById('modal');
  modal.style.display = 'none';
});

// Close the modal when clicking outside the image
var modal = document.getElementById('modal');
modal.addEventListener('click', function(event) {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});

function fetchSessionDetails() {
  // Replace this with your own logic to fetch the session details from agenda2.json
  return fetch('agenda2.json')
    .then(response => response.json())
    .then(data => data.days)
    .catch(error => {
      console.error('Error fetching session details:', error);
    });
}

function findSessionById(days, sessionId) {
  for (const day of days) {
    for (const session of day.sessions) {
      if (session.sessionId === sessionId) {
        return session;
      }
    }
  }
  return null;
}

function displaySessionDetails(session, day) {
  let sessionTitleElement = document.getElementById('session-title');
  let sessionDetailsElement = document.getElementById('session-details');
  let presentationListElement = document.getElementById('presentation-list');

  // Set session title
  sessionTitleElement.textContent = session.title.replace("STREAMING: ", "");
  // Set session details
  sessionDetailsElement.innerHTML = `
    <div class="session-time"> ${day}, ${session.start_time} - ${session.end_time}</div>
    <div class="session-room" data-room-map="YourMapUrlHere" onClick="openRoomModal(this)"> ${session.room}</div>
  `;

  // Clear any existing content in the presentation list
  presentationListElement.innerHTML = '';

  // Create presentation elements and append them to the presentation list
  session.presentations.forEach(presentation => {
    let presentationItem = document.createElement('div');
    presentationItem.classList.add('presentation-item');

    let timeElement = document.createElement('div');
    timeElement.classList.add('time');
    timeElement.textContent = presentation.presentation_time;

    let presentationInfo = document.createElement('div');
    presentationInfo.classList.add('presentation-info');

    let titleElement = document.createElement('div');
    titleElement.classList.add('title');

    let presentationTitle = document.createElement('span');
    presentationTitle.classList.add('presentation-title');
    presentationTitle.textContent = presentation.title + " ";
    titleElement.appendChild(presentationTitle);

    if (presentation.link) {
      let pdfLink = document.createElement('a');
      pdfLink.classList.add('pdf-link');
      pdfLink.textContent = '[abstract]';
      pdfLink.target = '_blank'; // Open in a new tab
      pdfLink.href = presentation.link;
      titleElement.appendChild(pdfLink);
    }

    let presenterElement = document.createElement('div');
    presenterElement.classList.add('authors');
    presenterElement.innerHTML = presentation.authors;



    if (session.type === 'poster') {
      let posterBoardElement = document.createElement('div');
      presentationTitle.textContent = `[Posterboard ${presentation.poster_board_id}]`+" "+presentation.title + " ";
      presentationInfo.appendChild(titleElement);
      presentationInfo.appendChild(presenterElement);
      
      // Display the presentations as a bullet list
      let presentationsList = document.createElement('ul');
      presentationsList.classList.add('poster-presentations-list');

      let presentationItemWrapper = document.createElement('li');
      presentationItemWrapper.appendChild(presentationInfo);
      presentationsList.appendChild(presentationItemWrapper);

      presentationItem.appendChild(presentationsList);
    } else if (session.type === 'keynote') {
      // Add presentation abstract and bio
      let abstractElement = document.createElement('div');
      abstractElement.classList.add('abstract');
      abstractElement.innerHTML = `<strong>Abstract: </strong>${presentation.abstract}`;

      let bioElement = document.createElement('div');
      bioElement.classList.add('bio');
      bioElement.innerHTML = `<strong>Bio: </strong>${presentation.bio}`;

      presentationInfo.appendChild(abstractElement);
      presentationInfo.appendChild(bioElement);


      presentationItem.appendChild(presentationInfo);
    } else if (session.type === 'other') {
      // Add presentation abstract and bio
      let abstractElement = document.createElement('div');
      abstractElement.classList.add('abstract');
      abstractElement.innerHTML = `<strong>Abstract: </strong>${presentation.abstract}`;

      presentationInfo.appendChild(abstractElement);


      presentationItem.appendChild(presentationInfo);
    } else if (session.type === 'tutorial') {
      // Add presentation abstract and bio
      let abstractElement = document.createElement('div');
      abstractElement.classList.add('abstract');
      abstractElement.innerHTML = `<strong>Description: </strong>${presentation.abstract}`;

      let bioElement = document.createElement('div');
      bioElement.classList.add('bio');
      bioElement.innerHTML = `<strong>Teachers: </strong>${presentation.presenter}`;


      let linkElement = document.createElement('a');
      linkElement.classList.add('link_tutorial');
      linkElement.href = presentation.link;
      linkElement.target = "_blank"; // This makes it open in a new tab.
      linkElement.textContent = 'Link to website';

      presentationInfo.appendChild(abstractElement);
      presentationInfo.appendChild(bioElement);
      presentationInfo.appendChild(linkElement);

      presentationItem.appendChild(presentationInfo);
    }else {
      presentationInfo.appendChild(titleElement);
      presentationInfo.appendChild(presenterElement);
      // For other session types, display as usual
      presentationItem.appendChild(timeElement);
      presentationItem.appendChild(presentationInfo);
    }

    presentationListElement.appendChild(presentationItem);
  });
}
