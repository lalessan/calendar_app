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

  // Create list items for presentations
  session.presentations.forEach(presentation => {
    let listItem = document.createElement('li');
    listItem.textContent = `Title: ${presentation.title}, Speaker: ${presentation.speaker}`;
    presentationListElement.appendChild(listItem);
  });
}
