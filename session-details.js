document.addEventListener('DOMContentLoaded', function () {
  // Get the session details from the URL query parameter
  let searchParams = new URLSearchParams(window.location.search);
  let session = searchParams.get('session');
  if (session) {
    session = JSON.parse(decodeURIComponent(session));
    displaySessionDetails(session);
  }
});

function displaySessionDetails(session) {
  let sessionTitleElement = document.getElementById('session-title');
  let presentationListElement = document.getElementById('presentation-list');

  // Set session title
  sessionTitleElement.textContent = session.title;

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
    titleElement.textContent = `${presentation.title}`;

    let presenterElement = document.createElement('div');
    presenterElement.classList.add('presenter');
    presenterElement.textContent = `Presenter: ${presentation.presenter}`;

    presentationInfo.appendChild(titleElement);
    presentationInfo.appendChild(presenterElement);

    presentationItem.appendChild(timeElement);
    presentationItem.appendChild(presentationInfo);
    presentationListElement.appendChild(presentationItem);
  });
}

