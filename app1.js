// app1.js
// app1.js
document.addEventListener('DOMContentLoaded', function () {
    // --- UI Element Selectors ---
    const eventGrid = document.getElementById('event-grid');
    const modal = document.getElementById('event-modal');
    const modalBackdrop = document.getElementById('event-modal-backdrop');
    const closeModalButton = document.getElementById('close-modal-button');
    const modalTitle = document.getElementById('modal-title');
    const modalContentArea = document.getElementById('modal-content-area');

    // --- Data Handling ---
    let events = JSON.parse(localStorage.getItem('events')) || [];

    const saveEvents = () => {
        localStorage.setItem('events', JSON.stringify(events));
    };

    // --- Modal Logic ---
    const closeModal = () => {
        modal.classList.add('hidden');
        modalBackdrop.classList.add('hidden');
    };

    const openModal = (event) => {
        modalTitle.textContent = event.title;
        modalContentArea.innerHTML = `
            <img src="${event.imageUrl}" alt="Event Image" class="w-full h-48 object-cover rounded-md mb-4">
            <p class="text-gray-700 mb-4">${event.description}</p>
            <div class="text-sm text-gray-600 space-y-2">
                <p><strong>Location:</strong> ${event.location}</p>
                <p><strong>Date:</strong> ${event.date}</p>
                <p><strong>Audience:</strong> ${event.audience} (${event.audienceSize} people)</p>
                <p><strong>Sponsorship Needs:</strong> ${event.sponsorship}</p>
            </div>
        `;
        modal.classList.remove('hidden');
        modalBackdrop.classList.remove('hidden');
    };

    closeModalButton.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);

    // --- Sponsor Action ---
    const sponsorEvent = (eventId) => {
        const eventIndex = events.findIndex(e => e.id === eventId);
        if (eventIndex !== -1) {
            events[eventIndex].status = 'Matched';
            saveEvents();
            renderEvents(); // Re-render to update the button state
        }
    };


    // --- Rendering Logic ---
    const renderEvents = () => {
        eventGrid.innerHTML = events.map(event => {
            const isMatched = event.status.toLowerCase() === 'matched';
            return `
            <div class="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                <!-- Image container with fixed aspect ratio -->
                <div class="w-full h-40 bg-gray-200">
                     <img src="${event.imageUrl}" alt="${event.title}" class="w-full h-full object-cover">
                </div>
                <div class="p-4">
                    <h3 class="font-bold text-lg text-gray-800">${event.title}</h3>
                    <p class="text-sm text-gray-500">${event.date}</p>
                    <p class="text-sm text-gray-600 mt-2">Audience: ${event.audience}</p>
                    <div class="mt-4 flex justify-between items-center">
                        <button data-event-id="${event.id}" class="view-details-btn text-indigo-600 font-semibold text-sm">View Details</button>
                        ${isMatched 
                            ? `<span class="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Sponsored</span>`
                            : `<button data-event-id="${event.id}" class="sponsor-btn bg-indigo-600 text-white px-3 py-1 rounded-md font-semibold text-sm hover:bg-indigo-700">Sponsor</button>`
                        }
                    </div>
                </div>
            </div>
            `;
        }).join('');
        
        // Add event listeners after rendering
        document.querySelectorAll('.view-details-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const eventId = parseInt(e.target.dataset.eventId, 10);
                const event = events.find(ev => ev.id === eventId);
                if (event) openModal(event);
            });
        });
        
        document.querySelectorAll('.sponsor-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const eventId = parseInt(e.target.dataset.eventId, 10);
                sponsorEvent(eventId);
            });
        });
    };

    // Initial render
    renderEvents();
});

   
   