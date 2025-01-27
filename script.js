// script.js
document.addEventListener('DOMContentLoaded', async () => {
    // DOM Elements
    const dropdownButton = document.querySelector('.dropdown button.dropbtn');
    const dropdownMenu = document.querySelector('.dropdown-content');
    const albumsContainer = document.getElementById('albumsContainer');
    const albumsGrid = document.getElementById('albumsGrid');
    const selectedArtistHeading = document.getElementById('selectedArtist');

    // Load artist data from external JSON
    let artistsData = [];
    try {
        const response = await fetch('data/artists.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        artistsData = data.artists;
        populateArtistDropdown(artistsData);
    } catch (error) {
        console.error('Error loading artist data:', error);
        showErrorMessage('Failed to load artist data. Please try again later.');
        return;
    }

    // Populate dropdown with artists
    function populateArtistDropdown(artists) {
        dropdownMenu.innerHTML = artists
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(artist => `
                <a href="#" 
                   class="artist-option" 
                   data-artist="${artist.name}"
                   role="menuitem">
                    ${artist.name}
                </a>
            `).join('');

        // Add event listeners to new artist options
        document.querySelectorAll('.artist-option').forEach(option => {
            option.addEventListener('click', handleArtistSelection);
        });
    }

    // Handle artist selection
    async function handleArtistSelection(e) {
        e.preventDefault();
        const artistName = e.target.dataset.artist;
        const artist = artistsData.find(a => a.name === artistName);

        if (!artist) {
            showErrorMessage('Artist data not found');
            return;
        }

        // Update UI
        updateSelectedArtist(artistName);
        await displayAlbums(artist);
    }

    // Update selected artist display
    function updateSelectedArtist(artistName) {
        dropdownButton.textContent = artistName;
        dropdownMenu.classList.remove('show');
        selectedArtistHeading.textContent = `${artistName}'s Scrolls`;
        dropdownButton.setAttribute('aria-expanded', 'false');
    }

    // Display albums for selected artist
    async function displayAlbums(artist) {
        albumsGrid.innerHTML = '<div class="loading">Loading scrolls...</div>';
        albumsContainer.classList.add('visible');

        try {
            // Clear previous content
            albumsGrid.innerHTML = '';

            // Create album cards
            artist.albums.forEach(album => {
                const albumCard = document.createElement('article');
                albumCard.className = 'album-card';
                albumCard.innerHTML = `
                    <div class="album-art" 
                         style="background-image: url('assets/${artist.path}/${album.art}')"
                         role="img" 
                         aria-label="${album.title} album cover">
                    </div>
                    <div class="album-info">
                        <h3 class="album-title">${album.title}</h3>
                        <p class="album-year">${album.year}</p>
                        <div class="platform-links">
                            ${createPlatformLinks(album.links)}
                        </div>
                    </div>
                `;
                albumsGrid.appendChild(albumCard);
            });

            // Scroll to albums section
            albumsContainer.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('Error displaying albums:', error);
            showErrorMessage('Failed to load albums. Please try again.');
        }
    }

    // Create platform links HTML
    function createPlatformLinks(links) {
        return Object.entries(links).map(([platform, url]) => `
            <a href="${url}" 
               class="platform-link" 
               target="_blank"
               rel="noopener noreferrer"
               aria-label="${platform}">
                <img src="assets/icons/${platform}.svg" 
                     alt="${platform} icon"
                     class="platform-icon">
            </a>
        `).join('');
    }

    // Error handling
    function showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.prepend(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.dropdown')) {
            dropdownMenu.classList.remove('show');
            dropdownButton.setAttribute('aria-expanded', 'false');
        }
    });
});
