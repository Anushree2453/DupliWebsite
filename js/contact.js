document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const clearSearchButton = document.getElementById('clearSearch');
    const filterButton = document.getElementById('filterButton');
    const contactTable = document.querySelector('.contact-table tbody');
    const noResultsMessage = document.getElementById('noResults');
    const resultsCounter = document.getElementById('resultsCounter');

    const starredContacts = new Set(JSON.parse(localStorage.getItem('starredContacts')) || []);

    // Function to get a unique identifier for a contact row
    const getContactId = (row) => {
        const nameSpan = row.querySelector('.contact-name span:first-of-type');
        const name = nameSpan ? nameSpan.innerText.trim() : '';
        const profession = row.querySelector('.contact-profession').innerText.trim();
        return `${name}-${profession}`;
    };

    // Render stars on page load
    const renderStars = () => {
        document.querySelectorAll('.contact-row').forEach(row => {
            const id = getContactId(row);
            const starIcon = row.querySelector('.star-icon');
            if (starredContacts.has(id)) {
                starIcon.classList.add('starred');
                starIcon.innerHTML = '★'; // Filled star
            } else {
                starIcon.classList.remove('starred');
                starIcon.innerHTML = '☆'; // Empty star
            }
        });
    };

    // Update results counter
    const updateResultsCounter = (count) => {
        resultsCounter.textContent = `Showing ${count} contacts.`;
    };

    // Filter and search logic
    const filterAndSearch = () => {
        const query = searchInput.value.toLowerCase();
        const showStarredOnly = filterButton.classList.contains('active');
        let visibleCount = 0;

        document.querySelectorAll('.contact-row').forEach(row => {
            const rowText = row.innerText.toLowerCase();
            const id = getContactId(row);
            const isStarred = starredContacts.has(id);
            const matchesSearch = rowText.includes(query);

            if ((!showStarredOnly || isStarred) && matchesSearch) {
                row.classList.remove('hidden');
                visibleCount++;
            } else {
                row.classList.add('hidden');
            }
        });

        // Hide or show category headers based on visible rows
        document.querySelectorAll('.category-header').forEach(header => {
            const nextRow = header.nextElementSibling;
            if (nextRow && !nextRow.classList.contains('hidden') && nextRow.classList.contains('table-header')) {
                // Check if there are any visible rows in this category
                let hasVisibleRows = false;
                let currentRow = nextRow.nextElementSibling;
                while (currentRow && !currentRow.classList.contains('category-header')) {
                    if (!currentRow.classList.contains('hidden')) {
                        hasVisibleRows = true;
                        break;
                    }
                    currentRow = currentRow.nextElementSibling;
                }
                header.style.display = hasVisibleRows ? '' : 'none';
            }
        });

        if (visibleCount === 0) {
            noResultsMessage.style.display = 'block';
            resultsCounter.style.display = 'none';
        } else {
            noResultsMessage.style.display = 'none';
            resultsCounter.style.display = 'block';
        }

        updateResultsCounter(visibleCount);
    };

    // Event listeners
    searchButton.addEventListener('click', filterAndSearch);
    clearSearchButton.addEventListener('click', () => {
        searchInput.value = '';
        filterAndSearch();
    });
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            filterAndSearch();
        }
    });

    filterButton.addEventListener('click', () => {
        filterButton.classList.toggle('active');
        filterAndSearch();
    });

    contactTable.addEventListener('click', (e) => {
        const starIcon = e.target.closest('.star-icon');
        if (starIcon) {
            const row = e.target.closest('.contact-row');
            const id = getContactId(row);
            if (starredContacts.has(id)) {
                starredContacts.delete(id);
            } else {
                starredContacts.add(id);
            }
            localStorage.setItem('starredContacts', JSON.stringify(Array.from(starredContacts)));
            renderStars();
            filterAndSearch(); // Re-run filter to hide/show contacts if filter is active
        }
    });

    // Initial render
    renderStars();
    filterAndSearch();
});
