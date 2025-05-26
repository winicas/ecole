document.addEventListener('DOMContentLoaded', function () {
    // Exemple d'animation pour les lignes de tableau
    const rows = document.querySelectorAll('tbody tr');

    rows.forEach(row => {
        row.addEventListener('mouseover', function () {
            this.classList.add('highlight');
        });

        row.addEventListener('mouseout', function () {
            this.classList.remove('highlight');
        });
    });
});