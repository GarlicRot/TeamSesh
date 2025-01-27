// Initialize dropdown functionality
document.addEventListener('DOMContentLoaded', () => {
    const dropdownButton = document.querySelector('.dropdown button.dropbtn');
    const dropdownMenu = document.querySelector('.dropdown-content');

    // Toggle dropdown
    dropdownButton.addEventListener('click', () => {
        dropdownMenu.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.dropdown')) {
            dropdownMenu.classList.remove('show');
        }
    });

    // Artist selection handler
    document.querySelectorAll('.dropdown-content a').forEach(artistLink => {
        artistLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Update button text with selected artist
            dropdownButton.textContent = e.target.textContent;
            dropdownMenu.classList.remove('show');
            
            // Optional: Add visual feedback
            dropdownButton.classList.add('artist-selected');
            setTimeout(() => dropdownButton.classList.remove('artist-selected'), 200);
        });
    });
});
