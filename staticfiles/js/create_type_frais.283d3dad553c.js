document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const typeFraisInput = document.querySelector('#id_nom');
    const descriptionInput = document.querySelector('#id_description');

    form.addEventListener('submit', function (event) {
        // Example validation
        if (!typeFraisInput.value.trim()) {
            event.preventDefault();
            alert('Veuillez entrer un nom pour le type de frais.');
        }
    });
});