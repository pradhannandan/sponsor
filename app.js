// app.js
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const openModalBtn = document.getElementById('open-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const modal = document.getElementById('modal');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const eventForm = document.getElementById('event-form');
    const eventTableBody = document.getElementById('event-table-body');
    const filterKeyword = document.getElementById('filter-keyword');
    const filterStatus = document.getElementById('filter-status');
    const modalTitle = document.querySelector('#modal h3');

    // --- State Management ---
    // Initialize events ONLY from localStorage or as an empty array.
    // All hardcoded or default event data has been removed.
    let events = JSON.parse(localStorage.getItem('events')) || [];
    let editingEventId = null; // To track if we're editing an event

    // --- Utility Functions ---
    const saveEvents = () => {
        localStorage.setItem('events', JSON.stringify(events));
    };

    // --- Modal Logic ---
    const openModal = () => {
        modal.classList.remove('hidden');
        modalBackdrop.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        modalBackdrop.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
        eventForm.reset();
        editingEventId = null; // Reset editing state
        modalTitle.textContent = 'Create New Event'; // Reset modal title
    };

    openModalBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);

    // --- Event Handling (Delete, Edit, Filter) ---
    const deleteEvent = (eventId) => {
        if (confirm('Are you sure you want to delete this event?')) {
            events = events.filter(e => e.id !== eventId);
            saveEvents();
            renderEvents();
        }
    };

    const editEvent = (eventId) => {
        const eventToEdit = events.find(e => e.id === eventId);
        if (!eventToEdit) return;

        editingEventId = eventId;
        modalTitle.textContent = 'Edit Event';
        
        document.getElementById('event-title').value = eventToEdit.title;
        document.getElementById('event-date').value = eventToEdit.date;
        document.getElementById('event-location').value = eventToEdit.location;
        document.getElementById('audience-type').value = eventToEdit.audience;
        document.getElementById('audience-size').value = eventToEdit.audienceSize;
        document.getElementById('sponsorship-requirements').value = eventToEdit.sponsorship;
        document.getElementById('event-description').value = eventToEdit.description;
        
        openModal();
    };
    
    filterKeyword.addEventListener('input', () => renderEvents());
    filterStatus.addEventListener('change', () => renderEvents());

    // --- Form Submission (Create and Update) ---
    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(eventForm);
        const imageFile = formData.get('image');

        const processEventData = (imageUrl) => {
            if (editingEventId) {
                const eventIndex = events.findIndex(event => event.id === editingEventId);
                if (eventIndex > -1) {
                    const existingEvent = events[eventIndex];
                    events[eventIndex] = {
                        ...existingEvent,
                        title: formData.get('title'),
                        date: formData.get('date'),
                        location: formData.get('location'),
                        audience: formData.get('audience'),
                        audienceSize: formData.get('audienceSize'),
                        sponsorship: formData.get('sponsorship'),
                        description: formData.get('description'),
                        imageUrl: imageUrl || existingEvent.imageUrl,
                    };
                }
            } else {
                const newEvent = {
                    id: Date.now(),
                    title: formData.get('title'),
                    date: formData.get('date'),
                    location: formData.get('location'),
                    audience: formData.get('audience'),
                    audienceSize: formData.get('audienceSize'),
                    sponsorship: formData.get('sponsorship'),
                    description: formData.get('description'),
                    status: 'Draft',
                    imageUrl: imageUrl || 'https://via.placeholder.com/300x200.png?text=No+Image',
                };
                events.push(newEvent);
            }
            saveEvents();
            renderEvents();
            closeModal();
        };

        if (imageFile && imageFile.size > 0) {
            const reader = new FileReader();
            reader.onloadend = () => processEventData(reader.result);
            reader.readAsDataURL(imageFile);
        } else {
            processEventData(null);
        }
    });

    // --- Rendering Logic ---
    const createStatusBadge = (status) => {
        let colorClasses = 'bg-gray-100 text-gray-800';
        if (status.toLowerCase() === 'matched') {
            colorClasses = 'bg-green-100 text-green-800';
        } else if (status.toLowerCase() === 'pending') {
            colorClasses = 'bg-yellow-100 text-yellow-800';
        }
        return `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses}">${status}</span>`;
    };

    const renderEvents = () => {
        const keyword = filterKeyword.value.toLowerCase();
        const statusFilter = filterStatus.value.toLowerCase();

        const filteredEvents = events.filter(event => {
            const titleMatch = event.title.toLowerCase().includes(keyword);
            const statusMatch = statusFilter === 'all' || event.status.toLowerCase() === statusFilter;
            return titleMatch && statusMatch;
        });

        eventTableBody.innerHTML = filteredEvents.map(event => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap"><div class="text-sm font-medium text-gray-900">${event.title}</div></td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${event.date}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${event.audienceSize}</td>
                <td class="px-6 py-4 whitespace-nowrap">${createStatusBadge(event.status)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    <button data-id="${event.id}" class="edit-btn text-indigo-600 hover:text-indigo-900"><span class="material-icons align-middle">edit</span></button>
                    <button data-id="${event.id}" class="delete-btn text-red-600 hover:text-red-900 ml-4"><span class="material-icons align-middle">delete</span></button>
                </td>
            </tr>
        `).join('');

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => editEvent(parseInt(e.currentTarget.dataset.id)));
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => deleteEvent(parseInt(e.currentTarget.dataset.id)));
        });
    };

    renderEvents();
    setInterval(() => {
        const updatedEvents = JSON.parse(localStorage.getItem('events')) || [];
        if (JSON.stringify(events) !== JSON.stringify(updatedEvents)) {
            events = updatedEvents;
            renderEvents();
        }
    }, 2000);
});
