from rest_framework import serializers
from .models import Eleve
import random
import string


from rest_framework import serializers
from .models import RapportJournalier

class RapportJournalierSerializer(serializers.ModelSerializer):
    class Meta:
        model = RapportJournalier
        fields = [
            'date',
            'total_paiement_frais_scolaires',
            'total_autres_frais',
            'total_salaires',
            'total_achats',
            'solde',
        ]

# serializers.py
from rest_framework import serializers
from .models import Eleve
class EleveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Eleve
        fields = [
            'id',
            'nom_elev',
            'postnom_elev',
            'prenom_elev',
            'sexe',
            'adresses',
            'matricule_elev',
            'date_naissance_elev',
            'lieu_naissance_elev',
            'option_elev',
            'classe_elev',
            'numero_parent1',
            'numero_parent2',
        ]

    def create(self, validated_data):
        ecole = self.context['request'].user.ecole
        validated_data.pop('ecole', None)
        return Eleve.objects.create(ecole=ecole, **validated_data)
    
from rest_framework import serializers
from .models import Inscription, AnneeScolaire, Eleve

class InscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inscription
        fields = [
            'id',
            'eleve',
            'annee_scolaire',
            'classe',
            'option',
            'montant_inscription',  # ← ajoute ce champ
            'date_inscription',
        ]
        read_only_fields = ['date_inscription']

    def validate(self, attrs):
        eleve = attrs.get('eleve')
        annee_scolaire = attrs.get('annee_scolaire')

        if Inscription.objects.filter(eleve=eleve, annee_scolaire=annee_scolaire).exists():
            raise serializers.ValidationError("Cet élève est déjà inscrit pour cette année scolaire.")
        return attrs

class AnneeScolaireSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnneeScolaire
        fields = ['id', 'date_debut', 'date_fin', 'nom']
        read_only_fields = ['nom']

from rest_framework import serializers
from .models import Eleve

class EleveSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Eleve
        fields = ['id', 'nom_elev', 'postnom_elev', 'prenom_elev', 'classe_elev', 'option_elev', 'matricule_elev']

from rest_framework import serializers
from .models import Paiement, TypeFraisScolaire

class PaiementSerializer(serializers.ModelSerializer):
    nom_ecole = serializers.CharField(source='ecole.nom', read_only=True)
    class Meta:
        model = Paiement
        fields = [
            'id',
            'matricule',
            'montant_payer',
            'montant_total_payer',
            'montant_total_a_payer',
            'montant_restant',
            'motif_paiement',
            'date',
            'nom_ecole', 
        ]
from rest_framework import serializers
from .models import TypeFraisScolaire

class TypeFraisScolaireSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeFraisScolaire
        exclude = ['ecole']  # L'école est injectée automatiquement dans la vue

from rest_framework import serializers
from .models import TypeFrais

class TypeFraisSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeFrais
        fields = ['id', 'nom', 'montant_total_a_payer']

    def create(self, validated_data):
        validated_data['ecole'] = self.context['request'].user.ecole
        return super().create(validated_data)
###############################################################################
from rest_framework import serializers
from .models import PaiementAutresFrais

class PaiementAutresFraisSerializer(serializers.ModelSerializer):
    type_de_frais_nom = serializers.CharField(source='type_de_frais.nom', read_only=True)
    montant_total_a_payer = serializers.DecimalField(
        source='type_de_frais.montant_total_a_payer',
        max_digits=10, decimal_places=2,
        read_only=True
    )
    nom_ecole = serializers.CharField(source='ecole.nom', read_only=True)
    receipt_number = serializers.SerializerMethodField()
    date = serializers.DateTimeField(source='date_payement', format="%d/%m/%Y %H:%M", read_only=True)

    class Meta:
        model = PaiementAutresFrais
        fields = [
            'id', 'eleve', 'ecole', 'montant_payer_af', 'type_de_frais',
            'total_montant_payer_af', 'montant_restant_af',
            'type_de_frais_nom', 'montant_total_a_payer', 'nom_ecole',
            'receipt_number', 'date'
        ]

    def get_receipt_number(self, obj):
        return f"AF-{obj.id:04d}"  # Par exemple : AF-0005

from rest_framework import serializers
from .models import PaiementAutresFrais, Eleve

class PaiementsAutresFraisSerializer(serializers.ModelSerializer):
    type_de_frais_nom = serializers.CharField(source='type_de_frais.nom', read_only=True)
    montant_total_a_payer = serializers.DecimalField(
        source='type_de_frais.montant_total_a_payer',
        max_digits=10, decimal_places=2,
        read_only=True
    )
    nom_ecole = serializers.CharField(source='ecole.nom', read_only=True)
    receipt_number = serializers.SerializerMethodField()
    date = serializers.DateTimeField(source='date_payement', format="%d/%m/%Y %H:%M", read_only=True)

    nom_elev = serializers.CharField(source='eleve.nom_elev', read_only=True)
    postnom_elev = serializers.CharField(source='eleve.postnom_elev', read_only=True)
    prenom_elev = serializers.CharField(source='eleve.prenom_elev', read_only=True)

    class Meta:
        model = PaiementAutresFrais
        fields = [
            'id', 'eleve', 'ecole', 'montant_payer_af', 'type_de_frais',
            'total_montant_payer_af', 'montant_restant_af',
            'type_de_frais_nom', 'montant_total_a_payer', 'nom_ecole',
            'receipt_number', 'date',
            'nom_elev', 'postnom_elev', 'prenom_elev'
        ]

    def get_receipt_number(self, obj):
        return f"AF-{obj.id:04d}"


from rest_framework import serializers
from .models import Paiement

class ElevesSerializer(serializers.ModelSerializer):
    nom_elev = serializers.CharField(source='eleve.nom_elev')
    postnom_elev = serializers.CharField(source='eleve.postnom_elev')
    prenom_elev = serializers.CharField(source='eleve.prenom_elev')

    class Meta:
        model = Paiement
        fields = ['nom_elev', 'postnom_elev', 'prenom_elev', 'montant_total_payer', 'montant_restant']

###########################Pour imprimer les reçus ##################
from rest_framework import serializers
from .models import Paiement

class PaiementsSerializer(serializers.ModelSerializer):
    nom = serializers.CharField(source='eleve.nom_elev')
    postnom = serializers.CharField(source='eleve.postnom_elev')
    prenom = serializers.CharField(source='eleve.prenom_elev')

    class Meta:
        model = Paiement
        fields = ['id', 'nom', 'postnom', 'prenom', 'matricule', 'montant_payer', 'motif_paiement', 'date']

##################pour modifier les frais scolaire#####"
class PaiementssSerializer(serializers.ModelSerializer):
    nom = serializers.CharField(source='eleve.nom_elev')
    postnom = serializers.CharField(source='eleve.postnom_elev')
    prenom = serializers.CharField(source='eleve.prenom_elev')
    matricule = serializers.CharField(source='eleve.matricule_elev')
    classe = serializers.CharField(source='eleve.classe_elev.nom', default='Non défini')
    option = serializers.CharField(source='eleve.option_elev.nom', default='Non défini')
    ecole = serializers.CharField(source='ecole.nom', default='Nom école')

    class Meta:
        model = Paiement
        fields = [
            'id',
            'eleve',
            'nom',
            'postnom',
            'prenom',
            'matricule',
            'classe',
            'option',
            'ecole',
            'montant_payer',
            'date',
            'motif_paiement',
        ]
 
from decimal import Decimal
from .models import Paiement, TypeFraisScolaire, Eleve
from datetime import date

class PaiementssSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paiement
        fields = '__all__'  # ou liste des champs que tu veux autoriser

    def update(self, instance, validated_data):
        montant_payer = validated_data.get('montant_payer')
        motif_paiement = validated_data.get('motif_paiement', instance.motif_paiement)

        if montant_payer is not None:
            try:
                montant_payer = Decimal(str(montant_payer))
            except Exception:
                raise serializers.ValidationError({'montant_payer': 'Montant invalide.'})

            # Ajout du montant au total
            instance.montant_payer = montant_payer
            instance.montant_total_payer += montant_payer
            instance.montant_restant = instance.montant_total_a_payer - instance.montant_total_payer

        instance.motif_paiement = motif_paiement
        instance.date = date.today()  # mettre à jour la date à aujourd'hui
        instance.save()
        return instance

############################################ Ajouter un Agent ############################"

from comptes.models import Ecole
from rest_framework import serializers
from comptes.models import User
from .models import Agent

class AgentSerializer(serializers.ModelSerializer):
    user =  serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True)
    ecole = serializers.PrimaryKeyRelatedField(queryset=Ecole.objects.all(), required=True)

    class Meta:
        model = Agent
        fields = [
            'user', 
            'ecole', 
            'nom_agent', 
            'postnom_agent', 
            'prenom_agent', 
            'sexe_agent', 
            'date_naissance_agent', 
            'fonction_agent', 
            'adresse_agent', 
            'salaire_total', 
            'telephone_agent1', 
            'telephone_agent2', 
            'cours_dispenser'
        ]

    def __init__(self, *args, **kwargs):
        super(AgentSerializer, self).__init__(*args, **kwargs)
        user = self.context.get('user')
        if user:
            # Limiter les utilisateurs au sein de la même école que l'utilisateur connecté
            self.fields['user'].queryset = User.objects.filter(ecole=user.ecole)

    def create(self, validated_data):
        # Extraire l'utilisateur et créer l'agent
        user = validated_data.pop('user')
        agent = Agent.objects.create(user=user, **validated_data)
        return agent

################" Agent paiement salaire"##############################
class AgentsSerializer(serializers.ModelSerializer):
    ecole_id = serializers.IntegerField(source='ecole.id', read_only=True)  # Ajoutez cet attribut

    class Meta:
        model = Agent
        fields = [
            'id',
            'nom_agent',
            'postnom_agent',
            'prenom_agent',
            'matricule_agent',
            'salaire_total',
            'ecole_id'  # Incluez-le ici
        ]
from rest_framework import serializers
from .models import PaiementSalaireAgent

from rest_framework import serializers
from .models import PaiementSalaireAgent
from django.db.models import Sum
class PaiementSalaireAgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaiementSalaireAgent
        fields = '__all__'

    def validate(self, data):
        agent = data['agent']
        montant_paye = data['montant_paye']
        periode = data['periode']

        # Calcul du total payé pour cette période
        total_paye = PaiementSalaireAgent.objects.filter(agent=agent, periode=periode).aggregate(
            total=Sum('montant_paye')
        )['total'] or 0

        salaire_totals = agent.salaire_total

        if total_paye + montant_paye > salaire_totals:
            raise serializers.ValidationError({
                'montant_paye': f"Le montant total pour la période '{periode}' dépasse le salaire mensuel de l'agent ({salaire_totals} FC)."
            })

        return data

    def create(self, validated_data):
        # Si ecole n'est pas fourni, utilisez l'école associée à l'agent
        if 'ecole' not in validated_data:
            validated_data['ecole'] = validated_data['agent'].ecole
        return super().create(validated_data)
    

from rest_framework import serializers
from .models import Ecole  # adapte ce chemin si nécessaire

class EcoleSerializer(serializers.ModelSerializer):
    logo = serializers.SerializerMethodField()
    class Meta:
        model = Ecole
        fields = [
            'id',
            'nom',
            'adresse',
            'telephone',
            'logo',
        ]
    
    def get_logo(self, obj):
        request = self.context.get('request')
        if obj.logo:
            return request.build_absolute_uri(obj.logo.url)
        return None

############################################################################################################
################################ Fournisseur et autres Depense ####################################################
# serializers.py
from rest_framework import serializers
from .models import Fournisseur, AchatFourniture

class FournisseurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fournisseur
        fields = '__all__'

class AchatFournitureSerializer(serializers.ModelSerializer):
    class Meta:
        model = AchatFourniture
        fields = '__all__'


from rest_framework import serializers
from paiement_frais.models import ArchiveMouvementFinancier

class ArchiveMouvementFinancierSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArchiveMouvementFinancier
        fields = '__all__'

