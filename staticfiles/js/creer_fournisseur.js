document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".form-fournisseur");

    // Example: Simple client-side validation
    form.addEventListener("submit", function (event) {
        const inputs = form.querySelectorAll("input, textarea");
        let isValid = true;

        inputs.forEach(input => {
            if (input.value.trim() === "") {
                isValid = false;
                input.classList.add("is-invalid");
                const errorMessage = document.createElement("div");
                errorMessage.className = "text-danger";
                errorMessage.textContent = "Ce champ est requis";
                if (!input.nextElementSibling || !input.nextElementSibling.classList.contains("text-danger")) {
                    input.parentElement.appendChild(errorMessage);
                }
            } else {
                input.classList.remove("is-invalid");
                if (input.nextElementSibling && input.nextElementSibling.classList.contains("text-danger")) {
                    input.parentElement.removeChild(input.nextElementSibling);
                }
            }
        });

        if (!isValid) {
            event.preventDefault();
        }
    });

    // Example: Remove validation message on input
    form.querySelectorAll("input, textarea").forEach(input => {
        input.addEventListener("input", function () {
            if (input.classList.contains("is-invalid")) {
                input.classList.remove("is-invalid");
                if (input.nextElementSibling && input.nextElementSibling.classList.contains("text-danger")) {
                    input.parentElement.removeChild(input.nextElementSibling);
                }
            }
        });
    });
});