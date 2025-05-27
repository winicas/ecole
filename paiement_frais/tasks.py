from celery import shared_task
from .models import Paiement, PaiementSalaireAgent, ArchiveMouvementFinancier, AchatFourniture
from django.utils import timezone
import datetime

@shared_task
def archive_all_mouvements():
    mouvements = Paiement.objects.all()
    for mouvement in mouvements:
        ArchiveMouvementFinancier.objects.update_or_create(
            mouvement_id=mouvement.id,
            defaults={
                'type_mouvement': 'Paiement',
                'montant': mouvement.montant_payer,
                'date': mouvement.date,
                'description': mouvement.motif_paiement,
                'reference': mouvement.matricule,
                'archived_data': json.dumps({
                    'eleve': mouvement.eleve.id,
                    'montant_total_payer': mouvement.montant_total_payer,
                    'montant_total_a_payer': mouvement.montant_total_a_payer,
                    'montant_restant': mouvement.montant_restant
                })
            }
        )
        archive.save()

    # Répétez pour PaiementSalaireAgent ou autres modèles si nécessaire



########################### rapport et analyse ##########################################
@shared_task
def generate_financial_reports():
    now = timezone.now()
    start_of_month = now.replace(day=1)
    start_of_quarter = (now.month - 1) // 3 * 3 + 1
    start_of_quarter = now.replace(month=start_of_quarter, day=1)
    start_of_year = now.replace(month=1, day=1)

    generate_report(start_of_month, now, 'mensuel')
    generate_report(start_of_quarter, now, 'trimestriel')
    generate_report(start_of_year, now, 'annuel')

def generate_report(start_date, end_date, report_type):
    paiements = Paiement.objects.filter(date__range=(start_date, end_date))
    salaires = PaiementSalaireAgent.objects.filter(date_paiement__range=(start_date, end_date))
    achats = AchatFourniture.objects.filter(date_achat__range=(start_date, end_date))

    total_paiements = sum(p.montant_payer for p in paiements)
    total_salaires = sum(s.montant_paye for s in salaires)
    total_achats = sum(a.montant_total for a in achats)

    archive_data = {
        'total_paiements': total_paiements,
        'total_salaires': total_salaires,
        'total_achats': total_achats,
        'details_paiements': list(paiements.values()),
        'details_salaires': list(salaires.values()),
        'details_achats': list(achats.values()),
    }

    ArchiveMouvementFinancier.objects.create(
        mouvement_id=None,  # Utiliser un ID unique si nécessaire
        type_mouvement=f'Rapport {report_type}',
        montant=total_paiements - total_salaires - total_achats,
        date=end_date,
        description=f'Rapport financier {report_type} du {start_date} au {end_date}',
        archived_data=archive_data,
    )

#####################"" envoie les notification de chaque mouvement financier par email ########
from celery import shared_task
from django.core.mail import send_mail

@shared_task
def send_financial_notification(email, subject, message):
    send_mail(
        subject,
        message,
        'willyloseka@gmail.com',  # Remplacez par l'email de l'expéditeur
        [email],
        fail_silently=False,
    )

