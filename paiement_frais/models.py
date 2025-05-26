
from django.db import models
import random
import string
import datetime
from django.utils import timezone
from django.db.models import Sum
from paiement_frais.archiving import archiver_mouvement_financier
from django.core.exceptions import ValidationError
from comptes.models import Ecole, User  # Assurez-vous d'importer le modèle Ecole
from django.db import models
from django.core.exceptions import ValidationError
import random
import string

class Eleve(models.Model):
    OPTIONS = [
        ('maternelle', 'Maternelle'),
        ('primaire', 'Primaire'),
        ('education_de_base', 'Éducation de Base'),
        ('pedagogie', 'Pédagogie'),
        ('litteraire', 'Littéraire'),
        ('commerciale_gestion', 'Commerciale et Gestion'),
        ('humanite_sciences', 'Humanité Sciences'),
        ('coupe_couture', 'Coupe et Couture'),
        ('mecanique', 'Mécanique'),
        ('hotellerie_restauration', 'Hôtellerie et Restauration'),
        ('electricite', 'Électricité'),
        ('electronique', 'Électronique'),
    ]

    CLASSES = [
        ('1', '1'),
        ('2', '2'),
        ('3', '3'),
        ('4', '4'),
        ('5', '5'),
        ('6', '6'),
        ('7', '7'),
        ('8', '8'),
    ]

    SEXE_CHOICES = [
        ('M', 'Masculin'),
        ('F', 'Féminin'),
    ]

    ecole = models.ForeignKey(Ecole, on_delete=models.CASCADE)
    nom_elev = models.CharField(max_length=100)
    postnom_elev = models.CharField(max_length=100)
    prenom_elev = models.CharField(max_length=100)
    sexe = models.CharField(max_length=1, choices=SEXE_CHOICES, default='M')  # ✅ ajouté
    adresses = models.CharField(max_length=255, blank=True)  # ✅ ajouté
    matricule_elev = models.CharField(max_length=6, unique=True, blank=True)
    date_naissance_elev = models.DateField()
    lieu_naissance_elev = models.CharField(max_length=255)
    option_elev = models.CharField(max_length=100, choices=OPTIONS)
    classe_elev = models.CharField(max_length=2, choices=CLASSES)
    numero_parent1 = models.CharField(max_length=15)
    numero_parent2 = models.CharField(max_length=15, blank=True)

    def save(self, *args, **kwargs):
        if not self.matricule_elev:
            self.matricule_elev = self.generate_unique_matricule()
        super().save(*args, **kwargs)

    def generate_unique_matricule(self):
        while True:
            matricule = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            if not Eleve.objects.filter(matricule_elev=matricule).exists():
                return matricule

    def clean(self):
        if Eleve.objects.filter(
            nom_elev=self.nom_elev,
            postnom_elev=self.postnom_elev,
            prenom_elev=self.prenom_elev,
            option_elev=self.option_elev,
            classe_elev=self.classe_elev
        ).exclude(id=self.id).exists():
            raise ValidationError("Un élève avec les mêmes nom, postnom, prénom, option et classe existe déjà.")

    def __str__(self):
        return f'{self.nom_elev} {self.postnom_elev} {self.prenom_elev}'

################################# rapport financier,analyse des tendance#######################

class TypeFraisScolaire(models.Model):
    option = models.CharField(max_length=100)
    classe = models.CharField(max_length=50)
    ecole = models.ForeignKey(Ecole, on_delete=models.CASCADE)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()

    class Meta:
        unique_together = ('option', 'classe', 'ecole')  # ✅ empêche les doublons

    def __str__(self):
        return f"{self.option} - {self.classe} ({self.ecole.nom})"

class Paiement(models.Model):
    eleve = models.ForeignKey('Eleve', on_delete=models.CASCADE)
    ecole = models.ForeignKey(Ecole, on_delete=models.CASCADE)  # Nouvelle clé étrangère
    matricule = models.CharField(max_length=6)
    montant_payer = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    montant_total_payer = models.DecimalField(max_digits=10, decimal_places=2)
    montant_total_a_payer = models.DecimalField(max_digits=10, decimal_places=2)
    montant_restant = models.DecimalField(max_digits=10, decimal_places=2)
    motif_paiement = models.CharField(max_length=255)
    autres_frais_elev = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    def save(self, *args, **kwargs):
        super(Paiement, self).save(*args, **kwargs)
        archiver_mouvement_financier(self, self.ecole)
############################################## paiement autres frais ########################
class TypeFrais(models.Model):
    nom = models.CharField(max_length=100)
    montant_total_a_payer = models.DecimalField(max_digits=10, decimal_places=2)
    ecole = models.ForeignKey(Ecole, on_delete=models.CASCADE)

    def __str__(self):
        return self.nom

class PaiementAutresFrais(models.Model):
    eleve = models.ForeignKey('Eleve', on_delete=models.CASCADE)
    ecole = models.ForeignKey(Ecole, on_delete=models.CASCADE)  # Nouvelle clé étrangère
    montant_payer_af = models.DecimalField(max_digits=10, decimal_places=2)
    type_de_frais = models.ForeignKey('TypeFrais', on_delete=models.CASCADE)
    date_payement = models.DateTimeField(auto_now_add=True)
    total_montant_payer_af = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    montant_restant_af = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def save(self, *args, **kwargs):
        # Calcul du montant total payé et restant
        montant_total_a_payer = self.type_de_frais.montant_total_a_payer
        existing_payments = PaiementAutresFrais.objects.filter(eleve=self.eleve, type_de_frais=self.type_de_frais).exclude(id=self.id)
        total_paye = existing_payments.aggregate(Sum('montant_payer_af'))['montant_payer_af__sum'] or 0
        self.total_montant_payer_af = total_paye + self.montant_payer_af
        self.montant_restant_af = montant_total_a_payer - self.total_montant_payer_af

        super(PaiementAutresFrais, self).save(*args, **kwargs)
        archiver_mouvement_financier(self, self.ecole)
################################### pour enregistrer un nouvel agent ###########################
class Agent(models.Model):
    SEXE_CHOICES = [
        ('M', 'Masculin'),
        ('F', 'Féminin'),
    ]
    ecole = models.ForeignKey(Ecole, on_delete=models.CASCADE)  # Nouvelle clé étrangère
    nom_agent = models.CharField(max_length=100)
    postnom_agent = models.CharField(max_length=100)
    prenom_agent = models.CharField(max_length=100)
    sexe_agent = models.CharField(max_length=1, choices=SEXE_CHOICES)
    date_naissance_agent = models.DateField(null=True, blank=True)
    matricule_agent = models.CharField(max_length=8, unique=True, editable=False)
    fonction_agent = models.CharField(max_length=100)
    adresse_agent = models.CharField(max_length=255)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="agent_profile")
    salaire_total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)  # Nouveau champ pour le salaire total
    telephone_agent1 = models.CharField(max_length=15)
    telephone_agent2 = models.CharField(max_length=15, blank=True, null=True)
    cours_dispenser = models.CharField(max_length=255, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.matricule_agent:
            self.matricule_agent = self.generate_matricule()
        super().save(*args, **kwargs)

    @staticmethod
    def generate_matricule():
        letters = ''.join(random.choices(string.ascii_uppercase, k=4))
        digits = ''.join(random.choices(string.digits, k=4))
        matricule = ''.join(random.sample(letters + digits, 8))
        return matricule

    def __str__(self):
        return f'{self.nom_agent} {self.postnom_agent} {self.prenom_agent}'

##################################################################################################
############################### models pour le paiement de salaires ###############################
class PaiementSalaireAgent(models.Model):
    agent = models.ForeignKey('Agent', on_delete=models.CASCADE, related_name='paiements')
    ecole = models.ForeignKey(Ecole, on_delete=models.CASCADE)
    montant_paye = models.DecimalField(max_digits=10, decimal_places=2)
    montant_restant = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    date_paiement = models.DateField(default=datetime.date.today)
    periode = models.CharField(max_length=20)
    motif_paiement = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        # Calculer le montant restant dans la méthode save
        if self.agent:
            total_paye_periode = PaiementSalaireAgent.objects.filter(
                agent=self.agent, periode=self.periode).aggregate(total=models.Sum('montant_paye'))['total'] or 0
            salaire_total = self.agent.salaire_total  # Assurez-vous que salaire_total est défini dans le modèle Agent
            self.montant_restant = salaire_total - (total_paye_periode + self.montant_paye)
            if self.montant_restant < 0:
                raise ValueError(f"Le montant payé pour la période {self.periode} dépasse le salaire total.")
        super(PaiementSalaireAgent, self).save(*args, **kwargs)

##########################################################################################################
###########################" concerne les achats de fournitures #########################################
class Fournisseur(models.Model):
    ecole = models.ForeignKey(Ecole, on_delete=models.CASCADE)  # Nouvelle clé étrangère
    nom = models.CharField(max_length=255)
    contact = models.CharField(max_length=255, blank=True, null=True)
    adresse = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nom

class AchatFourniture(models.Model):
    ecole = models.ForeignKey(Ecole, on_delete=models.CASCADE)  # Nouvelle clé étrangère
    fourniture = models.CharField(max_length=100)
    quantite = models.PositiveIntegerField()
    date_achat = models.DateField()
    fournisseur = models.ForeignKey('Fournisseur', on_delete=models.CASCADE)
    numero_facture = models.CharField(max_length=50, blank=True, null=True)
    commentaire = models.TextField(blank=True, null=True)
    montant_achat = models.DecimalField(max_digits=12, decimal_places=2)

    def save(self, *args, **kwargs):
        super(AchatFourniture, self).save(*args, **kwargs)
        archiver_mouvement_financier(self, self.ecole)
    
############################# pour archive automatique #########################################################
from django.db import models
from django.utils import timezone
import json

# Définir le modèle ArchiveMouvementFinancier
class ArchiveMouvementFinancier(models.Model):
    ecole = models.ForeignKey(Ecole, on_delete=models.CASCADE)  # Nouvelle clé étrangère
    mouvement_id = models.PositiveIntegerField()
    type_mouvement = models.CharField(max_length=100)
    montant = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateTimeField()
    description = models.TextField(blank=True, null=True)
    reference = models.CharField(max_length=255, blank=True, null=True)
    archived_data = models.JSONField()  # Stockage des données archivées
    date_archivage = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f'Archive: {self.mouvement_id} - {self.type_mouvement} - {self.montant}'

################################# rapport financier,analyse des tendajjjjjnce#######################
######################## modele pour enregistrer le rapport journalier #################""
from django.db import models
from django.utils import timezone

class RapportJournalier(models.Model):
    date = models.DateField(default=timezone.now)  # La date du rapport
    total_paiement_frais_scolaires = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_autres_frais = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_salaires = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_achats = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    solde = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        verbose_name = "Rapport Journalier"
        verbose_name_plural = "Rapports Journaliers"
        unique_together = ('date',)

    def __str__(self):
        return f"Rapport du {self.date}"
############################################################################################
from django.db import models
class AnneeScolaire(models.Model):
    date_debut = models.DateField()
    date_fin = models.DateField()
    nom = models.CharField(max_length=20, unique=True, blank=True)

    def save(self, *args, **kwargs):
        # Génére automatiquement le nom : ex. "2024-2025"
        self.nom = f"{self.date_debut.year}-{self.date_fin.year}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nom

class Inscription(models.Model):
    OPTIONS = [
        ('maternelle', 'Maternelle'),
        ('primaire', 'Primaire'),
        ('education_de_base', 'Éducation de Base'),
        ('pedagogie', 'Pédagogie'),
        ('litteraire', 'Littéraire'),
        ('commerciale_gestion', 'Commerciale et Gestion'),
        ('sciences', 'Sciences'),
        ('coupe_couture', 'Coupe et Couture'),
        ('mecanique', 'Mécanique'),
        ('hotellerie_restauration', 'Hôtellerie et Restauration'),
        ('electricite', 'Électricité'),
        ('electronique', 'Électronique'),
    ]

    CLASSES = [
        ('1', '1'),
        ('2', '2'),
        ('3', '3'),
        ('4', '4'),
        ('5', '5'),
        ('6', '6'),
        ('7', '7'),
        ('8', '8'),
    ]

    eleve = models.ForeignKey("Eleve", on_delete=models.CASCADE, related_name='inscriptions')
    annee_scolaire = models.ForeignKey(AnneeScolaire, on_delete=models.CASCADE)
    classe = models.CharField(max_length=2, choices=CLASSES)
    option = models.CharField(max_length=100, choices=OPTIONS)
    montant_inscription = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    date_inscription = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ('eleve', 'annee_scolaire')
        verbose_name = "Inscription"
        verbose_name_plural = "Inscriptions"
        ordering = ["-date_inscription"]

    def __str__(self):
        return f"{self.eleve} - {self.classe} {self.option} ({self.annee_scolaire})"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)  # Enregistrer d'abord l'inscription

        # Ensuite, mettre à jour les champs de l'élève
        eleve = self.eleve
        eleve.classe_elev = self.classe
        eleve.option_elev = self.option
        eleve.save()

