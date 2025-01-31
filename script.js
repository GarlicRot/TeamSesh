document.addEventListener("DOMContentLoaded", async () => {
  // DOM Elements
  const dropdownButton = document.querySelector(".dropdown button.dropbtn");
  const dropdownMenu = document.querySelector(".dropdown-content");
  const albumsContainer = document.getElementById("albumsContainer");
  const albumsGrid = document.getElementById("albumsGrid");
  const selectedArtistHeading = document.getElementById("selectedArtist");

  // Add dropdown toggle functionality
  dropdownButton.addEventListener("click", (e) => {
    e.stopPropagation();
    const isExpanded = dropdownButton.getAttribute("aria-expanded") === "true";
    dropdownMenu.classList.toggle("show");
    dropdownButton.setAttribute("aria-expanded", !isExpanded);
  });

  // Load artist data from external JSON
  let artistsData = [];
  try {
    const response = await fetch("data/artists.json");
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    artistsData = data.artists;
    populateArtistDropdown(artistsData);
  } catch (error) {
    console.error("Error loading artist data:", error);
    showErrorMessage("Failed to load artist data. Please try again later.");
    return;
  }

  // Populate dropdown with artists
  function populateArtistDropdown(artists) {
    dropdownMenu.innerHTML = artists
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(
        (artist) => `
          <a href="#" 
             class="artist-option" 
             data-artist="${artist.name}"
             role="menuitem">
              ${artist.name}
          </a>
        `
      )
      .join("");

    // Add event listeners to new artist options
    document.querySelectorAll(".artist-option").forEach((option) => {
      option.addEventListener("click", handleArtistSelection);
    });
  }

  // Create sort dropdown
  function createSortDropdown() {
    const sortDropdown = document.createElement('select');
    sortDropdown.className = 'sort-dropdown';
    sortDropdown.innerHTML = `
      <option value="year-desc">Year (Newest First)</option>
      <option value="year-asc">Year (Oldest First)</option>
      <option value="title-asc">Title (A-Z)</option>
      <option value="title-desc">Title (Z-A)</option>
    `;
    return sortDropdown;
  }

  // Sort function for albums/singles
  function sortReleases(releases, sortValue) {
    const [criterion, direction] = sortValue.split('-');
    return [...releases].sort((a, b) => {
      let comparison;
      if (criterion === 'year') {
        comparison = a.year - b.year;
      } else if (criterion === 'title') {
        comparison = a.title.localeCompare(b.title);
      }
      return direction === 'asc' ? comparison : -comparison;
    });
  }

  // Handle artist selection
  async function handleArtistSelection(e) {
    e.preventDefault();
    const artistName = e.target.dataset.artist;
    const artist = artistsData.find((a) => a.name === artistName);

    if (!artist) {
      showErrorMessage("Artist data not found");
      return;
    }

    // Update UI
    updateSelectedArtist(artistName);
    await displayMusic(artist);
  }

  // Update selected artist display
  function updateSelectedArtist(artistName) {
    dropdownButton.textContent = artistName;
    dropdownMenu.classList.remove("show");
    selectedArtistHeading.textContent = artistName;
    dropdownButton.setAttribute("aria-expanded", "false");
  }

  // Create platform links HTML
  function createPlatformLinks(links) {
    if (!links) return "";

    return Object.entries(links)
      .map(
        ([platform, url]) => `
          <a href="${url}" 
             class="platform-link" 
             target="_blank"
             rel="noopener noreferrer"
             aria-label="${platform}">
              <img src="assets/icons/${platform}.svg" 
                   alt="${platform} icon"
                   class="platform-icon">
          </a>
        `
      )
      .join("");
  }

  // Create a card for either an album or single
  function createMusicCard(release, artistPath) {
    const card = document.createElement("article");
    card.className = "album-card";
    card.innerHTML = `
        <div class="album-art" 
            style="background-image: url('assets/artists/${artistPath}/${release.art}')"
            role="img" 
            aria-label="${release.title} cover">
        </div>
        <div class="album-info">
            <h3 class="album-title">${release.title || "Untitled"}</h3>
            <p class="album-year">${release.year || "N/A"}</p>
            <div class="platform-links">
                ${createPlatformLinks(release.links)}
            </div>
        </div>
        <div class="album-details">
            ${release.description ? `<p class="album-description">${release.description}</p>` : ""}
            ${release.tracks ? `
            <div class="tracklist">
                <h4 class="tracklist-title">Track List</h4>
                <ul class="tracklist-items">
                    ${release.tracks.map(track => `
                        <li class="track">
                            <span class="track-title">${track.title}</span>
                            <span class="track-duration">${track.duration}</span>
                        </li>
                    `).join("")}
                </ul>
            </div>
            ` : ""}
        </div>
    `;

    // Add expansion functionality
    card.addEventListener("click", function(e) {
      if (e.target.closest("a")) return;
      const wasExpanded = this.classList.contains("expanded");
      document.querySelectorAll(".album-card.expanded").forEach(card => {
        card.classList.remove("expanded");
        card.setAttribute("aria-expanded", "false");
      });
      if (!wasExpanded) {
        this.classList.add("expanded");
        this.setAttribute("aria-expanded", "true");
      }
    });

    return card;
  }

  // Display music (albums and singles) for selected artist
  async function displayMusic(artist) {
    if (!artist) {
      showErrorMessage("Invalid artist data");
      return;
    }

    // Create and add back to top button
    const backToTopButton = document.createElement("button");
    backToTopButton.className = "back-to-top";
    backToTopButton.setAttribute("aria-label", "Back to top");
    backToTopButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 15l-6-6-6 6"/>
      </svg>
    `;
    document.body.appendChild(backToTopButton);

    // Back to top button functionality
    window.addEventListener("scroll", () => {
      if (window.pageYOffset > 100) {
        backToTopButton.classList.add("visible");
      } else {
        backToTopButton.classList.remove("visible");
      }
    });

    backToTopButton.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });

    albumsGrid.innerHTML = '<div class="loading">Loading music...</div>';
    albumsContainer.classList.add("visible");

    try {
      // Clear the grid before adding new content
      albumsGrid.innerHTML = "";

      // Create albums section if there are albums
      if (artist.albums && artist.albums.length > 0) {
        const albumsSection = document.createElement('section');
        albumsSection.className = 'music-section';
        
        // Create section header with sort dropdown
        const sectionHeader = document.createElement('div');
        sectionHeader.className = 'section-header';
        const albumSortDropdown = createSortDropdown();
        sectionHeader.innerHTML = `<h3 class="section-title">Albums</h3>`;
        sectionHeader.appendChild(albumSortDropdown);
        
        albumsSection.appendChild(sectionHeader);
        
        const albumsGridElement = document.createElement('div');
        albumsGridElement.className = 'albums-grid';
        albumsSection.appendChild(albumsGridElement);
        
        // Sort dropdown event listener
        albumSortDropdown.addEventListener('change', (e) => {
          const sortedAlbums = sortReleases(artist.albums, e.target.value);
          albumsGridElement.innerHTML = '';
          sortedAlbums.forEach(album => {
            const card = createMusicCard(album, artist.path);
            albumsGridElement.appendChild(card);
          });
        });
        
        // Initial display of albums
        artist.albums.forEach(album => {
          const card = createMusicCard(album, artist.path);
          albumsGridElement.appendChild(card);
        });
        
        albumsGrid.appendChild(albumsSection);
      }

      // Create singles section if there are singles
      if (artist.singles && artist.singles.length > 0) {
        const singlesSection = document.createElement('section');
        singlesSection.className = 'music-section';
        
        // Create section header with sort dropdown
        const sectionHeader = document.createElement('div');
        sectionHeader.className = 'section-header';
        const singlesSortDropdown = createSortDropdown();
        sectionHeader.innerHTML = `<h3 class="section-title">Singles</h3>`;
        sectionHeader.appendChild(singlesSortDropdown);
        
        singlesSection.appendChild(sectionHeader);
        
        const singlesGridElement = document.createElement('div');
        singlesGridElement.className = 'albums-grid';
        singlesSection.appendChild(singlesGridElement);
        
        // Sort dropdown event listener
        singlesSortDropdown.addEventListener('change', (e) => {
          const sortedSingles = sortReleases(artist.singles, e.target.value);
          singlesGridElement.innerHTML = '';
          sortedSingles.forEach(single => {
            const card = createMusicCard(single, artist.path);
            singlesGridElement.appendChild(card);
          });
        });
        
        // Initial display of singles
        artist.singles.forEach(single => {
          const card = createMusicCard(single, artist.path);
          singlesGridElement.appendChild(card);
        });
        
        albumsGrid.appendChild(singlesSection);
      }

      // Scroll into view after loading
      albumsContainer.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Error displaying music:", error);
      showErrorMessage("Failed to load music. Please try again.");
    }
  }

  // Error handling
  function showErrorMessage(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    document.body.prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  }

  // Close dropdown when clicking outside
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".dropdown")) {
      dropdownMenu.classList.remove("show");
      dropdownButton.setAttribute("aria-expanded", "false");
    }
  });
});
