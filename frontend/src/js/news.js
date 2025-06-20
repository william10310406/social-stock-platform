const API_BASE_URL = 'http://localhost:5001/api';

console.log('news.js loaded');

document.addEventListener('DOMContentLoaded', () => {
    const newsFeed = document.getElementById('news-feed');
    if (newsFeed) {
        const token = localStorage.getItem('token');
        if (!token) {
            // This case should ideally not be hit if dashboard.js protection works,
            // but it's good practice for defense-in-depth.
            return; 
        }

        // Connect to the SSE endpoint with the token as a query parameter.
        const evtSource = new EventSource(`${API_BASE_URL}/news/latest?token=${token}`);
        
        evtSource.onopen = function() {
            console.log("Connection to news server opened.");
        };

        evtSource.onmessage = function(event) {
            const newP = document.createElement("p");
            const parsedData = event.data.replace(/User .* sees news item/g, 'News');
            newP.innerHTML = `<strong>${parsedData}</strong>`;

            if(newsFeed.firstChild) {
                newsFeed.insertBefore(newP, newsFeed.firstChild);
            } else {
                newsFeed.appendChild(newP);
            }
            if(newsFeed.children.length > 10) {
                newsFeed.removeChild(newsFeed.lastChild);
            }
        };

        evtSource.onerror = function(err) {
            console.error("EventSource failed:", err);
            const errorP = document.createElement("p");
            errorP.innerHTML = `<strong>Error connecting to news feed. Maybe your session expired?</strong>`;
            newsFeed.prepend(errorP);
            evtSource.close();
        };
    }
}); 