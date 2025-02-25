const SPREADSHEET_ID = "1ZnDRA2knHnosc_3XFIXGug8Nqj2mnQXWblzn9G-Xw4M";
const SHEET_NAME = "Albums";

// Load config, then Google API
fetch("config.json")
  .then((response) => response.json())
  .then((config) => {
    const API_KEY = config.apiKey;
    gapi.load("client", () => initClient(API_KEY));
  })
  .catch((error) => {
    console.error("Error loading config:", error);
    document.getElementById("releases").innerHTML = "Failed to load config.";
  });

function initClient(apiKey) {
  gapi.client
    .init({
      apiKey: apiKey,
      discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
    })
    .then(() => {
      gapi.client.sheets.spreadsheets.values
        .get({
          spreadsheetId: SPREADSHEET_ID,
          range: `${SHEET_NAME}!A:D`, // Adjust based on Sheet columns
        })
        .then((response) => {
          const rows = response.result.values || [];
          const releases = processSheetData(rows);
          displayReleases(releases);
        })
        .catch((error) => {
          console.error("Error fetching sheet:", error);
          document.getElementById("releases").innerHTML = "Failed to load releases.";
        });
    });
}

function processSheetData(rows) {
  const releases = [];
  for (let i = 1; i < rows.length; i++) { // Skip header
    const row = rows[i];
    const title = row[0] || "";
    const date = row[1] || "";
    const links = [];
    if (row[2]) links.push({ platform: "Spotify", url: row[2] });
    if (row[3]) links.push({ platform: "SoundCloud", url: row[3] });

    // Map album art from repo assets
    const artSlug = title.toLowerCase().replace(/[^a-z0-9]/g, "");
    const artUrl = `${artSlug}.jpg`; // Assumes images in root as .jpg

    releases.push({
      title: title,
      date: date,
      art: artUrl,
      links: links,
    });
  }
  return releases;
}

function displayReleases(releases) {
  const releasesDiv = document.getElementById("releases");
  releasesDiv.innerHTML = "";
  releases.forEach((release) => {
    const releaseDiv = document.createElement("div");
    releaseDiv.className = "release";

    const title = document.createElement("h2");
    title.textContent = release.title;
    releaseDiv.appendChild(title);

    if (release.art) {
      const img = document.createElement("img");
      img.src = release.art;
      img.alt = `${release.title} cover`;
      img.onerror = () => img.remove(); // Remove if image doesn't exist
      releaseDiv.appendChild(img);
    }

    const linksDiv = document.createElement("div");
    release.links.forEach((link) => {
      const a = document.createElement("a");
      a.href = link.url;
      a.textContent = link.platform;
      a.target = "_blank";
      linksDiv.appendChild(a);
    });
    releaseDiv.appendChild(linksDiv);

    releasesDiv.appendChild(releaseDiv);
  });
}
