document.addEventListener("DOMContentLoaded", function() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const keyword = urlParams.get('keyword');
  const day = urlParams.get('day'); // Get the day parameter
  
  // Retrieve the search results from session storage
  const searchResults = JSON.parse(sessionStorage.getItem('searchResults'));
  const presentations = searchResults.presentations;


  displaySearchResults(presentations, day, keyword); // Pass the day parameter

  // Back button click event
  const backButton = document.querySelector('.back-link a');
  backButton.addEventListener('click', function() {
    window.location.href = 'index.html';
  });


  // Add click event listener to each search result
  const resultItems = document.querySelectorAll('.search-result');
  resultItems.forEach(item => {
    item.addEventListener('click', function() {
      const session = item.dataset.session;
      const day = item.dataset.day;
      showSessionDetails(JSON.parse(session), day);
    });
  });
});








function displaySearchResults(presentations, day, keyword) {
  const searchResultsElement = document.getElementById('search-results');
  searchResultsElement.innerHTML = ''; // Clear existing results

  if (presentations.length === 0) {
    searchResultsElement.textContent = 'No results found.';
    return;
  }

  const resultList = document.createElement('ul');
  resultList.classList.add('search-results-list');

  presentations.forEach(presentationData => {
    const presentation = presentationData.presentation;
    const session = presentationData.session;

    const listItem = document.createElement('li');
    listItem.classList.add('search-result');

    const presentationTitle = document.createElement('div');
    presentationTitle.innerHTML = `<span class="title">${presentation.title}</span>&nbsp;`;

    if (presentation.link) {
      const abstractLink = document.createElement('a');
      abstractLink.href = presentation.link;
      abstractLink.textContent = '[Abstract]';
      abstractLink.target = '_blank'; // Open in a new tab
      presentationTitle.appendChild(abstractLink);
    }

    let presenterElement = document.createElement('div');
    presenterElement.classList.add('authors');
    presenterElement.innerHTML = presentation.authors;

    const presentationTime = document.createElement('div');
    presentationTime.textContent = `Presentation Time: ${presentation.presentation_time}`;

    const sessionDetails = document.createElement('div');
    sessionDetails.classList.add('session-details');
    sessionDetails.style.display = 'inline-block';

    const sessionTitleLink = document.createElement('a');
    sessionTitleLink.href = `session_details.html?sessionId=${session.sessionId}&day=${encodeURIComponent(day)}`;
    sessionTitleLink.target = '_blank'; // Open in a new tab
    sessionTitleLink.textContent = `Session: ${session.title}`;
    sessionTitleLink.style.display = 'inline'; // Make it inline
    sessionTitleLink.style.marginRight = '10px'; // Add right margin for spacing


    const sessionTime = document.createElement('div');
    sessionTime.textContent = `${day}, ${session.start_time} - ${session.end_time}`;
    sessionTime.style.display = 'inline'; // Make it inline
    sessionTime.style.marginRight = '10px'; // Add right margin for spacing


    const sessionRoom = document.createElement('div');
    sessionRoom.textContent = session.room;
    sessionRoom.style.display = 'inline'; // Make it inline
    sessionRoom.style.marginRight = '10px'; // Add right margin for spacing


    const sessionDetailsContainer = document.createElement('div');
    sessionDetailsContainer.style.display = 'inline'; // Make it inline
    sessionDetailsContainer.appendChild(sessionTitleLink);
    sessionDetailsContainer.appendChild(sessionTime);
    sessionDetailsContainer.appendChild(sessionRoom);

    sessionDetails.appendChild(sessionDetailsContainer);

    
    listItem.appendChild(presentationTitle);
    listItem.appendChild(presenterElement);
    listItem.appendChild(sessionDetails);

  if (session.type === 'parallel') {
     listItem.appendChild(presentationTime);
  }


    resultList.appendChild(listItem);
  });

  searchResultsElement.appendChild(resultList);
  const pageTitleElement = document.getElementById('page-title');
  // Set the page title
  pageTitleElement.textContent = `Search Results for "${keyword}"`;

}


function showSessionDetails(session, day) {
  // Redirect to session_details.html with session ID and day as query parameters
  const sessionId = session.sessionId; // Assuming you have a unique identifier for each session
  window.location.href = `session_details.html?sessionId=${sessionId}&day=${encodeURIComponent(day)}`;
}
