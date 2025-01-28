// script.js
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
    await displayAlbums(artist);
  }

  // Update selected artist display
  function updateSelectedArtist(artistName) {
    dropdownButton.textContent = artistName;
    dropdownMenu.classList.remove("show");
    selectedArtistHeading.textContent = `${artistName}'s Albums`;
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

  // Display albums for selected artist
  async function displayAlbums(artist) {
    if (!artist || !artist.albums) {
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

    albumsGrid.innerHTML = '<div class="loading">Loading albums...</div>';
    albumsContainer.classList.add("visible");

    try {
      // Clear the grid before adding new albums
      albumsGrid.innerHTML = "";

      // Loop through each album and create its card
      artist.albums.forEach((album) => {
        if (!album) return;

        const card = document.createElement("article");
        card.className = "album-card";
        card.innerHTML = `
          <div class="album-art" 
              style="background-image: url('assets/artists/${artist.path}/${
          album.art
        }')"
              role="img" 
              aria-label="${album.title} album cover">
          </div>
          <div class="album-info">
              <h3 class="album-title">${album.title || "Untitled"}</h3>
              <p class="album-year">${album.year || "N/A"}</p>
              <div class="platform-links">
                  ${createPlatformLinks(album.links)}
              </div>
          </div>
          <div class="album-details">
              ${
                album.description
                  ? `<p class="album-description">${album.description}</p>`
                  : ""
              }
              ${
                album.tracks
                  ? `
              <div class="tracklist">
                  <h4 class="tracklist-title">Track List</h4>
                  <ul class="tracklist-items">
                      ${album.tracks
                        .map(
                          (track) => `
                          <li class="track">
                              <span class="track-title">${track.title}</span>
                              <span class="track-duration">${track.duration}</span>
                          </li>
                      `
                        )
                        .join("")}
                  </ul>
              </div>
              `
                  : ""
              }
          </div>
        `;

        // Expansion functionality
        card.addEventListener("click", function (e) {
          // Don't trigger expansion on link clicks
          if (e.target.closest("a")) return;

          const wasExpanded = this.classList.contains("expanded");

          // Close all other cards
          document.querySelectorAll(".album-card.expanded").forEach((card) => {
            card.classList.remove("expanded");
            card.setAttribute("aria-expanded", "false");
          });

          // Toggle if not already expanded
          if (!wasExpanded) {
            this.classList.add("expanded");
            this.setAttribute("aria-expanded", "true");
          }
        });

        // Append the album card to the grid
        albumsGrid.appendChild(card);
      });

      // Scroll into view after loading albums
      albumsContainer.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Error displaying albums:", error);
      showErrorMessage("Failed to load albums. Please try again.");
    }
  }

  // Create platform links HTML
  function createPlatformLinks(links) {
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
