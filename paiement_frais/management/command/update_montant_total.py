from django.core.management.base import BaseCommand
from paiement_frais.models import Paiement

class Command(BaseCommand):
    help = 'Mise à jour du montant total à payer pour tous les étudiants'

    def handle(self, *args, **kwargs):
        nouveau_montant = calculer_nouveau_montant()
        
        paiements = Paiement.objects.all()
        for paiement in paiements:
            paiement.montant_total_a_payer = nouveau_montant
            paiement.montant_restant = nouveau_montant - paiement.montant_total_payer
            paiement.save()

        self.stdout.write(self.style.SUCCESS('Montant total à payer mis à jour avec succès'))
