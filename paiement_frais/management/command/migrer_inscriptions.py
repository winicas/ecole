# fichier : paiement_frais/management/commands/migrer_inscriptions.py

from django.core.management.base import BaseCommand
from paiement_frais.models import Eleve, Inscription, AnneeScolaire

class Command(BaseCommand):
    help = "Migrer les anciennes données Eleve vers le modèle Inscription"

    def handle(self, *args, **kwargs):
        annee_scolaire, _ = AnneeScolaire.objects.get_or_create(
            nom="2023-2024",  # ou récupérée dynamiquement si besoin
            defaults={"date_debut": "2023-09-01", "date_fin": "2024-06-30"}
        )

        total = 0
        for eleve in Eleve.objects.all():
            if not Inscription.objects.filter(eleve=eleve, annee_scolaire=annee_scolaire).exists():
                Inscription.objects.create(
                    eleve=eleve,
                    annee_scolaire=annee_scolaire,
                    classe=eleve.classe_elev,
                    option=eleve.option_elev
                )
                total += 1

        self.stdout.write(self.style.SUCCESS(f'{total} inscriptions créées avec succès.'))
