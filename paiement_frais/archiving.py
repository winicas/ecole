import json
from decimal import Decimal

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError("Type not serializable")

def archiver_mouvement_financier(mouvement, ecole):
    from paiement_frais.models import ArchiveMouvementFinancier, Paiement, PaiementAutresFrais, PaiementSalaireAgent, AchatFourniture
    from django.utils import timezone
    
    archived_data = {}

    if isinstance(mouvement, Paiement):
        archived_data = {
            'eleve': mouvement.eleve.id,
            'matricule': mouvement.matricule,
            'montant_payer': str(mouvement.montant_payer),
            'montant_total_payer': str(mouvement.montant_total_payer),
            'montant_total_a_payer': str(mouvement.montant_total_a_payer),
            'montant_restant': str(mouvement.montant_restant),
            'motif_paiement': mouvement.motif_paiement,
            'autres_frais_elev': str(mouvement.autres_frais_elev),
        }
    elif isinstance(mouvement, PaiementAutresFrais):
        archived_data = {
            'eleve': mouvement.eleve.id,
            'montant_payer_af': str(mouvement.montant_payer_af),
            'type_de_frais': mouvement.type_de_frais.id,
            'total_montant_payer_af': str(mouvement.total_montant_payer_af),
            'montant_restant_af': str(mouvement.montant_restant_af),
        }
    elif isinstance(mouvement, PaiementSalaireAgent):
        archived_data = {
            'agent': mouvement.agent.id,
            'montant_paye': str(mouvement.montant_paye),
            'date_paiement': mouvement.date_paiement.isoformat() if mouvement.date_paiement else None,
            'periode': mouvement.periode,
            'motif_paiement': mouvement.motif_paiement,
        }
    elif isinstance(mouvement, AchatFourniture):
        archived_data = {
            'fourniture': mouvement.fourniture,
            'quantite': str(mouvement.quantite),
            'fournisseur': mouvement.fournisseur.id,
            'numero_facture': mouvement.numero_facture,
            'commentaire': mouvement.commentaire,
            'montant_achat': str(mouvement.montant_achat),
        }

    # Convert the archived_data dictionary to a JSON string
    json_data = json.dumps(archived_data, default=decimal_default)

    archive = ArchiveMouvementFinancier(
        mouvement_id=mouvement.id,
        type_mouvement=mouvement.__class__.__name__,
        montant=(
            mouvement.montant_achat if isinstance(mouvement, AchatFourniture) 
            else mouvement.montant_paye if isinstance(mouvement, PaiementSalaireAgent) 
            else mouvement.montant_payer_af if isinstance(mouvement, PaiementAutresFrais) 
            else mouvement.montant_payer if isinstance(mouvement, Paiement) 
            else 0
        ),
        date=(
            mouvement.date_achat if isinstance(mouvement, AchatFourniture) 
            else mouvement.date_paiement if isinstance(mouvement, PaiementSalaireAgent) 
            else timezone.now()
        ),
        description=(
            mouvement.commentaire if isinstance(mouvement, AchatFourniture) 
            else ''
        ),
        reference=(
            mouvement.numero_facture if isinstance(mouvement, AchatFourniture) 
            else ''
        ),
        ecole=ecole,  # Utilisez l'école passée en argument
        archived_data=json_data
    )
    archive.save()