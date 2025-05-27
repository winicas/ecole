document.addEventListener('DOMContentLoaded', function () {
    const formElements = document.querySelectorAll('form input, form select, form textarea');

    formElements.forEach(element => {
        element.addEventListener('focus', function () {
            this.parentElement.classList.add('form-focus');
        });

        element.addEventListener('blur', function () {
            this.parentElement.classList.remove('form-focus');
        });
    });
});

// static/js/agent_form.js
document.addEventListener('DOMContentLoaded', () => {
    const nomField = document.querySelector('#id_nom_agent');
    const postnomField = document.querySelector('#id_postnom_agent');
    const prenomField = document.querySelector('#id_prenom_agent');

    if (nomField) {
        nomField.addEventListener('input', () => {
            nomField.value = nomField.value.toUpperCase();
        });
    }

    if (postnomField) {
        postnomField.addEventListener('input', () => {
            postnomField.value = postnomField.value.toUpperCase();
        });
    }

    if (prenomField) {
        prenomField.addEventListener('input', () => {
            const words = prenomField.value.split(' ');
            prenomField.value = words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
        });
    }
});
