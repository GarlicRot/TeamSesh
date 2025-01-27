// Initialize dropdown functionality
document.addEventListener('DOMContentLoaded', function() {
    const dropBtn = document.querySelector('.dropbtn');
    const dropdownContent = document.querySelector('.dropdown-content');

    // Toggle dropdown visibility
    dropBtn.addEventListener('click', function() {
        dropdownContent.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.matches('.dropbtn') && !event.target.closest('.dropdown-content')) {
            dropdownContent.classList.remove('show');
        }
    });

    // Add click handlers for artist links
    document.querySelectorAll('.dropdown-content a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            // Add your artist selection logic here
            console.log('Selected artist:', this.textContent);
            dropdownContent.classList.remove('show');
        });
    });
});
