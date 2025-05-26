from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Paiement, PaiementSalaireAgent, ArchiveMouvementFinancier
import json
from decimal import Decimal

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError("Type not serializable")

@receiver(post_save, sender=Paiement)
def archive_paiement(sender, instance, **kwargs):
    archive = ArchiveMouvementFinancier(
        mouvement_id=instance.id,
        type_mouvement='Paiement',
        montant=float(instance.montant_payer),  # Convertir Decimal en float
        date=instance.date,
        description=instance.motif_paiement,
        reference=instance.matricule,
        archived_data=json.dumps({
            'eleve': instance.eleve.id,
            'montant_total_payer': float(instance.montant_total_payer),
            'montant_total_a_payer': float(instance.montant_total_a_payer),
            'montant_restant': float(instance.montant_restant)
        }, default=decimal_default)  # Utiliser decimal_default
    )
    archive.save()

@receiver(post_save, sender=PaiementSalaireAgent)
def archive_paiement_salaire_agent(sender, instance, **kwargs):
    archive = ArchiveMouvementFinancier(
        mouvement_id=instance.id,
        type_mouvement='Paiement Salaire Agent',
        montant=float(instance.montant_paye),  # Convertir Decimal en float
        date=instance.date_paiement,
        description=instance.motif_paiement,
        reference=instance.agent.matricule_agent,
        archived_data=json.dumps({
            'agent': instance.agent.id,
            'periode': instance.periode
        }, default=decimal_default)  # Utiliser decimal_default
    )
    archive.save()