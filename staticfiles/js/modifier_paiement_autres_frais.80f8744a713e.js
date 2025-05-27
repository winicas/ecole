// modifier_paiement_autres_frais.js

document.addEventListener('DOMContentLoaded', function () {
    const montantPayerInput = document.getElementById('id_montant_payer_af');
    const montantTotalInput = document.getElementById('id_montant_total_a_payer_af');
    const montantRestantInput = document.getElementById('id_montant_restant_af');

    // Écouter les changements sur le champ "Montant payé" pour mettre à jour le montant restant
    montantPayerInput.addEventListener('input', function () {
        const montantPayer = parseFloat(montantPayerInput.value) || 0;
        const montantTotal = parseFloat(montantTotalInput.value) || 0;

        // Calculer le montant restant
        const montantRestant = montantTotal - montantPayer;
        montantRestantInput.value = montantRestant.toFixed(2);
    });

    // Écouter les changements sur le champ "Montant total à payer" pour mettre à jour le montant restant
    montantTotalInput.addEventListener('input', function () {
        const montantPayer = parseFloat(montantPayerInput.value) || 0;
        const montantTotal = parseFloat(montantTotalInput.value) || 0;

        // Calculer le montant restant
        const montantRestant = montantTotal - montantPayer;
        montantRestantInput.value = montantRestant.toFixed(2);
    });
});