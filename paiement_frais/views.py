from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied
from .serializers import EleveSerializer
class ComptableDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if request.user.role != 'comptable':
            raise PermissionDenied("Vous n'avez pas accès à cette ressource.")

        ecole = request.user.ecole

        if not ecole:
            return Response({
                'message': "Aucune école associée à ce comptable.",
                'ecole': None,
                'now': timezone.now().strftime('%d %B %Y à %H:%M:%S'),
            }, status=status.HTTP_200_OK)

        data = {
            'message': f"Bienvenue, {request.user.first_name or request.user.username}. Voici votre tableau de bord.",
            'ecole': {
                'id': ecole.id,
                'nom': ecole.nom,
                'adresse': ecole.adresse,
                'telephone': ecole.telephone,
            },
            'now': timezone.now().strftime('%d %B %Y à %H:%M:%S'),
        }

        return Response(data, status=status.HTTP_200_OK)
# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .serializers import EleveSerializer
from .models import Eleve, Inscription


class CreateEleveAPIView(APIView):
    def post(self, request, *args, **kwargs):
        # Passer le contexte avec la requête
        serializer = EleveSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()  # L'école sera ajoutée automatiquement dans le sérialiseur
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Eleve
from .serializers import EleveSerializer
from rest_framework.generics import RetrieveAPIView, UpdateAPIView

from rest_framework.generics import RetrieveUpdateAPIView
from .models import Eleve
from .serializers import EleveSerializer

class EleveDetailUpdateAPIView(RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Eleve.objects.all()
    serializer_class = EleveSerializer
    lookup_field = 'pk'

from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Ecole
from .serializers import EcoleSerializer

class EcoleAPIView(APIView):
    def get(self, request):
        ecole = Ecole.objects.first()
        serializer = EcoleSerializer(ecole, context={'request': request})
        return Response(serializer.data)


class UpdateEleveIdentityView(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Eleve.objects.all()
    serializer_class = EleveSerializer

    def patch(self, request, *args, **kwargs):
        eleve = self.get_object()
        for field in ['nom_elev', 'postnom_elev', 'prenom_elev']:
            if field in request.data:
                setattr(eleve, field, request.data[field])
        eleve.save()
        return Response(EleveSerializer(eleve).data, status=status.HTTP_200_OK)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import InscriptionSerializer

class CreateInscriptionAPIView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = InscriptionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from rest_framework.generics import CreateAPIView
from .models import AnneeScolaire
from .serializers import AnneeScolaireSerializer

class CreateAnneeScolaireAPIView(CreateAPIView):
    queryset = AnneeScolaire.objects.all()
    serializer_class = AnneeScolaireSerializer

from rest_framework.generics import ListAPIView
from .models import AnneeScolaire
from .serializers import AnneeScolaireSerializer

class ListAnneeScolaireAPIView(ListAPIView):
    queryset = AnneeScolaire.objects.all()
    serializer_class = AnneeScolaireSerializer


from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

class GenererInscriptionsNouvelleAnnee(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            annee_id = request.data.get("annee_scolaire_id")
            nouvelle_annee = AnneeScolaire.objects.get(id=annee_id)
            ancienne_annee = AnneeScolaire.objects.filter(id__lt=annee_id).order_by('-id').first()
            if not ancienne_annee:
                return Response({"error": "Aucune année précédente trouvée"}, status=400)

            inscriptions = Inscription.objects.filter(annee_scolaire=ancienne_annee)
            count = 0

            for inscription in inscriptions:
                if Inscription.objects.filter(eleve=inscription.eleve, annee_scolaire=nouvelle_annee).exists():
                    continue  # déjà inscrit

                prochaine_classe = self.get_prochaine_classe(inscription.classe)
                if not prochaine_classe:
                    continue  # classe finale atteinte

                Inscription.objects.create(
                    eleve=inscription.eleve,
                    annee_scolaire=nouvelle_annee,
                    classe=prochaine_classe,
                    option=inscription.option,
                    montant_inscription=0
                )
                count += 1

            return Response({"message": f"{count} inscriptions générées avec succès."}, status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def get_prochaine_classe(self, classe):
        progression = ["7", "8", "9", "10", "11", "12"]
        if classe in progression:
            idx = progression.index(classe)
            return progression[idx + 1] if idx + 1 < len(progression) else None
        return None

#########################################################################################################
##########################################################################################################

from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from .models import Eleve
from .serializers import EleveSerializer
from django.db.models import Q

class SmallPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'

class EleveListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = EleveSerializer
    pagination_class = SmallPagination

    def get_queryset(self):
        ecole_id = self.request.user.ecole.id
        queryset = Eleve.objects.filter(ecole_id=ecole_id)

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(matricule_elev__icontains=search) |
                Q(nom_elev__icontains=search) |
                Q(postnom_elev__icontains=search) |
                Q(prenom_elev__icontains=search)
            )

        return queryset.order_by('nom_elev')
#############################################################################################################

from decimal import Decimal, InvalidOperation
from datetime import date
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Paiement, Eleve
from .serializers import PaiementSerializer
from rest_framework import viewsets
from decimal import Decimal, InvalidOperation
from django.utils.timezone import now
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Eleve, Paiement, TypeFraisScolaire
from .serializers import PaiementSerializer
from datetime import date
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from decimal import Decimal, InvalidOperation
from datetime import date
from .models import Eleve, Paiement, TypeFraisScolaire
from .serializers import PaiementSerializer
from rest_framework.permissions import IsAuthenticated


class EnregistrerPaiementView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        eleve_id = request.data.get('eleve_id')
        montant_payer = request.data.get('montant_payer')
        motif_paiement = request.data.get('motif_paiement')

        if not all([eleve_id, montant_payer, motif_paiement]):
            return Response({'error': 'Données manquantes.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            montant_payer = Decimal(str(montant_payer))
        except (InvalidOperation, ValueError):
            return Response({'error': 'Montant invalide.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            eleve = Eleve.objects.get(id=eleve_id, ecole=request.user.ecole)
        except Eleve.DoesNotExist:
            return Response({'error': 'Élève introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        # ✅ Récupérer le premier frais défini correspondant à la combinaison
        frais = TypeFraisScolaire.objects.filter(
            option=eleve.option_elev,
            classe=eleve.classe_elev,
            ecole=request.user.ecole
        ).first()

        if not frais:
            return Response({
                'error': "Frais scolaires non définis pour l'option et la classe de cet élève."
            }, status=status.HTTP_404_NOT_FOUND)

        montant_total_a_payer = frais.montant

        # ✅ Création ou mise à jour du paiement
        paiement, created = Paiement.objects.get_or_create(
            eleve=eleve,
            ecole=request.user.ecole,
            defaults={
                'matricule': eleve.matricule_elev,
                'montant_payer': montant_payer,
                'date': date.today(),
                'motif_paiement': motif_paiement,
                'montant_total_payer': montant_payer,
                'montant_total_a_payer': montant_total_a_payer,
                'montant_restant': montant_total_a_payer - montant_payer,
            }
        )

        if not created:
            paiement.montant_payer = montant_payer
            paiement.date = date.today()
            paiement.motif_paiement = motif_paiement
            paiement.montant_total_payer += montant_payer
            paiement.montant_restant = paiement.montant_total_a_payer - paiement.montant_total_payer
            paiement.save()

        serializer = PaiementSerializer(paiement)
        return Response({
            'message': 'Paiement enregistré avec succès.',
            'receipt_number': f"REC-{paiement.id}",
            'nom_ecole': request.user.ecole.nom,
            **serializer.data
        }, status=status.HTTP_200_OK)

from rest_framework.generics import RetrieveAPIView
from .models import Eleve, TypeFraisScolaire
from .serializers import EleveSerializer, TypeFraisScolaireSerializer
from rest_framework.permissions import IsAuthenticated

class EleveDetailView(RetrieveAPIView):
    queryset = Eleve.objects.all()
    serializer_class = EleveSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import TypeFraisScolaire
from .serializers import TypeFraisScolaireSerializer

class TypeFraisScolaireListCreateView(generics.ListCreateAPIView):
    serializer_class = TypeFraisScolaireSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TypeFraisScolaire.objects.filter(ecole=self.request.user.ecole)

    def perform_create(self, serializer):
        serializer.save(ecole=self.request.user.ecole)
############################################################################################

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import TypeFrais
from .serializers import TypeFraisSerializer
from rest_framework import generics, permissions
from rest_framework.permissions import IsAuthenticated
from .models import TypeFrais
from .serializers import TypeFraisSerializer
import logging
logger = logging.getLogger(__name__)

# Liste et création
class TypeFraisListCreateView(generics.ListCreateAPIView):
    serializer_class = TypeFraisSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TypeFrais.objects.filter(ecole=self.request.user.ecole)

    def perform_create(self, serializer):
        serializer.save(ecole=self.request.user.ecole)

# Détail, mise à jour et suppression
class TypeFraisDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TypeFraisSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TypeFrais.objects.filter(ecole=self.request.user.ecole)

    def perform_update(self, serializer):
        serializer.save(ecole=self.request.user.ecole)


from rest_framework import status
from .models import PaiementAutresFrais, TypeFrais, Eleve
from .serializers import PaiementAutresFraisSerializer
from django.utils.timezone import localtime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from decimal import Decimal
from .models import Eleve, TypeFrais, PaiementAutresFrais
from .serializers import PaiementAutresFraisSerializer

class EnregistrerPaiementAutresFraisView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        eleve_id = request.data.get('eleve_id')
        type_frais_id = request.data.get('type_frais_id')
        montant_payer = request.data.get('montant_payer_af')

        if not all([eleve_id, type_frais_id, montant_payer]):
            return Response({'error': 'Données manquantes.'}, status=400)

        try:
            montant_payer = Decimal(str(montant_payer))
        except:
            return Response({'error': 'Montant invalide.'}, status=400)

        try:
            eleve = Eleve.objects.get(id=eleve_id, ecole=request.user.ecole)
            type_frais = TypeFrais.objects.get(id=type_frais_id, ecole=request.user.ecole)
        except (Eleve.DoesNotExist, TypeFrais.DoesNotExist):
            return Response({'error': 'Élève ou type de frais introuvable.'}, status=404)

        paiement = PaiementAutresFrais.objects.create(
            eleve=eleve,
            ecole=request.user.ecole,
            type_de_frais=type_frais,
            montant_payer_af=montant_payer,
        )

        # Sérialiser et retourner toutes les données
        serializer = PaiementAutresFraisSerializer(paiement)
        return Response(serializer.data, status=200)
###########################################################################################
#############"LISTE DES ELEVE EN ORDRE AVEC LES FRAIS SCOLAIRE "
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Paiement
from .serializers import ElevesSerializer  # Ce serializer devra utiliser les données de Eleve ET Paiement

class ElevesEnOrdreAPIView(APIView):
    def get(self, request):
        option = request.GET.get('option')
        classe = request.GET.get('classe')
        quota = request.GET.get('quota')

        if not option or not classe or not quota:
            return Response({'error': 'Les paramètres option, classe et quota sont requis.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            quota = float(quota)
        except ValueError:
            return Response({'error': 'Le quota doit être un nombre.'}, status=status.HTTP_400_BAD_REQUEST)

        paiements = Paiement.objects.filter(
            eleve__option_elev=option,
            eleve__classe_elev=classe,
            montant_total_payer__gte=quota
        )

        serializer = ElevesSerializer(paiements, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from .models import PaiementAutresFrais, TypeFrais
from .serializers import PaiementsAutresFraisSerializer
class ListePaiementAutresFraisOrdre(APIView):
    def get(self, request):
        option = request.GET.get('option')
        classe = request.GET.get('classe')
        type_frais_id = request.GET.get('type_frais')
        quota = request.GET.get('quota')

        if not (option and classe and type_frais_id):
            return Response({"error": "Champs requis : option, classe, type_frais"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            type_frais = TypeFrais.objects.get(id=type_frais_id)
        except TypeFrais.DoesNotExist:
            return Response({"error": "Type de frais introuvable"}, status=status.HTTP_404_NOT_FOUND)

        try:
            quota = float(quota)
        except (TypeError, ValueError):
            return Response({"error": "Quota invalide"}, status=status.HTTP_400_BAD_REQUEST)

        paiements = PaiementAutresFrais.objects.filter(
            eleve__option_elev=option,
            eleve__classe_elev=classe,
            type_de_frais=type_frais,
            total_montant_payer_af__gte=quota
        ).order_by('eleve__nom_elev')

        if not paiements.exists():
            return Response({"message": "Aucun élève n'a atteint ce quota."}, status=status.HTTP_200_OK)

        serializer = PaiementsAutresFraisSerializer(paiements, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

from rest_framework.generics import ListAPIView
from .models import TypeFrais
from .serializers import TypeFraisSerializer

class TypeFraisListAPIView(ListAPIView):
    queryset = TypeFrais.objects.all()
    serializer_class = TypeFraisSerializer

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from django.http import FileResponse
from .models import Eleve
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import qrcode

class CarteScolaireAPIView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        eleve_id = request.POST.get('eleve_id')
        photo = request.FILES.get('photo')

        if not eleve_id or not photo:
            return Response({'error': 'Élève ou photo manquant'}, status=400)

        eleve = Eleve.objects.select_related('ecole').get(id=eleve_id)
        ecole_nom = eleve.ecole.nom.upper()

        # Création cartee
        image = Image.new("RGB", (1000, 600), "white")
        draw = ImageDraw.Draw(image)

        # Polices personnalisées si tu veux (doit être installéfe)
        font = ImageFont.load_default()

        # En-tête
        draw.text((50, 30), "RÉPUBLIQUE DÉMOCRATIQUE DU CONGO", fill="black", font=font)
        draw.text((50, 60), "MINISTÈRE DE L’ENSEIGNEMENT PRIMAIRE, SECONDAIRE ET PROFESSIONNEL", fill="black", font=font)
        draw.text((50, 100), ecole_nom, fill="blue", font=font)
        draw.text((50, 130), f"ANNÉE SCOLAIRE 2025-2026", fill="black", font=font)

        # Infos élève
        draw.text((50, 180), f"NOM : {eleve.nom_elev}", fill="black", font=font)
        draw.text((50, 210), f"POSTNOM : {eleve.postnom_elev}", fill="black", font=font)
        draw.text((50, 240), f"PRÉNOM : {eleve.prenom_elev}", fill="black", font=font)
        draw.text((50, 270), f"ADRESSE : Q/MIMOZA, C/NGALIEMA", fill="black", font=font)
        draw.text((50, 300), f"SEXE : FILLE", fill="black", font=font)  # Tu peux l'ajouter dans le modèle
        draw.text((50, 330), f"OPTION : {eleve.option_elev.upper()}", fill="black", font=font)
        draw.text((50, 360), f"CLASSE : {eleve.classe_elev}ÈME", fill="black", font=font)

        # Photo élève
        profile_img = Image.open(photo).resize((200, 200))
        image.paste(profile_img, (750, 150))

        # QR Code
        qr_data = f"{eleve.nom_elev} {eleve.postnom_elev} {eleve.prenom_elev}, {eleve.option_elev}, {eleve.classe_elev}"
        qr_img = qrcode.make(qr_data).resize((150, 150))
        image.paste(qr_img, (750, 400))

        # Retour de l’image
        buffer = BytesIO()
        image.save(buffer, format="PNG")
        buffer.seek(0)
        return FileResponse(buffer, content_type="image/png")

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import EleveSerializer
from .models import Eleve

class EleveListAllView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ecole_id = request.user.ecole.id
        eleves = Eleve.objects.filter(ecole_id=ecole_id).order_by('nom_elev')
        serializer = EleveSerializer(eleves, many=True)
        return Response(serializer.data)

################################ Ajouter un nouvel Agent ##########################################
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import AgentSerializer
from rest_framework.permissions import IsAuthenticated

class AjouterAgentAPIView(APIView):
    permission_classes = [IsAuthenticated]  # Pour s'assurer que l'utilisateur est authentifié

    def post(self, request, *args, **kwargs):
        user = request.user  # Utilisateur connecté
        data = request.data
        data['ecole'] = user.ecole.id  # Préciser l'école de l'utilisateur connecté
        serializer = AgentSerializer(data=data, context={'user': user})
        
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Agent ajouté avec succès"}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from comptes.models import User

class UtilisateursEcoleAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        user = request.user
        utilisateurs = User.objects.filter(ecole=user.ecole)  # Filtrer les utilisateurs de la même école
        usernames = [{"id": u.id, "username": u.username} for u in utilisateurs]
        return Response({"users": usernames})

################## Liste Agent et leur modalité de paiement de salaire #################"
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Agent
from .serializers import AgentsSerializer

class ListeAgentsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        agents = Agent.objects.filter(ecole=request.user.ecole)
        serializer = AgentsSerializer(agents, many=True)
        return Response(serializer.data)

# views.py
from rest_framework import generics
from .models import PaiementSalaireAgent
from paiement_frais.models import Ecole
from .serializers import PaiementSalaireAgentSerializer, EcoleSerializer

class PaiementSalaireAgentCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = PaiementSalaireAgent.objects.all()
    serializer_class = PaiementSalaireAgentSerializer

from rest_framework import generics
from .models import Agent, PaiementSalaireAgent
from .serializers import AgentSerializer, PaiementSalaireAgentSerializer

class AgentDetailAPIView(generics.RetrieveAPIView):
    queryset = Agent.objects.all()
    serializer_class = AgentSerializer
    lookup_field = 'id'

from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .serializers import EcoleSerializer

class EcoleDetailAPIView(APIView):
    def get(self, request, id, format=None):
        try:
            ecole = Ecole.objects.get(id=id)
            serializer = EcoleSerializer(ecole)
            return Response(serializer.data)
        except Ecole.DoesNotExist:
            return Response({'error': "École non trouvée."}, status=status.HTTP_404_NOT_FOUND)

##############################Fourniture foursnisseur depense#############################
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .serializers import FournisseurSerializer, AchatFournitureSerializer
from .models import AchatFourniture, Fournisseur


class AchatFournitureViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = AchatFourniture.objects.all()
    serializer_class = AchatFournitureSerializer
class FournisseurViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Fournisseur.objects.all()
    serializer_class = FournisseurSerializer

    def perform_create(self, serializer):
        # Par exemple, si chaque utilisateur a une école associée
        serializer.save(ecole=self.request.user.ecole)
######################################" Rapport"######################
from django.utils import timezone
from django.db.models import Sum
from datetime import datetime
from django.db.models import Sum
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import RapportJournalier, Paiement, PaiementAutresFrais, PaiementSalaireAgent, AchatFourniture
from .serializers import RapportJournalierSerializer

class RapportJournalierAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        date_str = request.GET.get('date')
        force = request.GET.get('force') == 'true'

        if not date_str:
            return Response({"error": "La date est requise."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({"error": "Format de date invalide."}, status=status.HTTP_400_BAD_REQUEST)

        # Si force est activé, on supprime l'ancien rapport pour forcer la recréation
        if force:
            RapportJournalier.objects.filter(date=date).delete()

        rapport, created = RapportJournalier.objects.get_or_create(date=date)

        if created or force:
            # Recalcul des totaux
            total_frais_scolaires = Paiement.objects.filter(
                date=date
            ).aggregate(total=Sum('montant_payer'))['total'] or 0

            total_autres_frais = PaiementAutresFrais.objects.filter(
                date_payement__date=date
            ).aggregate(total=Sum('montant_payer_af'))['total'] or 0

            total_salaires = PaiementSalaireAgent.objects.filter(
                date_paiement=date
            ).aggregate(total=Sum('montant_paye'))['total'] or 0

            total_achats = AchatFourniture.objects.filter(
                date_achat=date
            ).aggregate(total=Sum('montant_achat'))['total'] or 0

            solde = (total_frais_scolaires + total_autres_frais) - (total_salaires + total_achats)

            # Mise à jour du rapport
            rapport.total_paiement_frais_scolaires = total_frais_scolaires
            rapport.total_autres_frais = total_autres_frais
            rapport.total_salaires = total_salaires
            rapport.total_achats = total_achats
            rapport.solde = solde
            rapport.save()

        serializer = RapportJournalierSerializer(rapport)
        return Response(serializer.data)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ArchiveMouvementFinancier
from .serializers import ArchiveMouvementFinancierSerializer
from datetime import datetime, timedelta
from datetime import datetime, timedelta
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

class HistoriqueMouvementsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ecole = request.user.ecole
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        mouvements = ArchiveMouvementFinancier.objects.filter(ecole=ecole)

        if start_date_str and end_date_str:
            try:
                # On récupère les dates comme des datetimes
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d') + timedelta(days=1) - timedelta(microseconds=1)

                mouvements = mouvements.filter(date__range=(start_date, end_date))
            except (ValueError, TypeError):
                return Response({'error': 'Dates invalides'}, status=400)

        mouvements = mouvements.order_by('-date')
        serializer = ArchiveMouvementFinancierSerializer(mouvements, many=True)
        return Response(serializer.data)

##########################Modifier paiement ##############################""
from django.utils.timezone import now
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Paiement
from .serializers import PaiementssSerializer
from datetime import timedelta

from datetime import timedelta
from django.utils.timezone import localdate
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateAPIView

from .models import Paiement
from .serializers import PaiementsSerializer # Assure-toi que c'est bien le nom

class PaiementsDeuxJoursSpecifiquesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = localdate()
        yesterday = today - timedelta(days=1)

        # Si l'utilisateur est lié à une école
        ecole = request.user.ecole  # adapte si besoin

        paiements = Paiement.objects.filter(
            ecole=ecole,
            date__in=[yesterday, today]
        ).order_by('date', 'id')

        serializer = PaiementsSerializer(paiements, many=True)
        return Response(serializer.data)


class PaiementDetailAPIView(RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Paiement.objects.all()
    serializer_class = PaiementssSerializer  # Nom corrigé
    lookup_field = 'id'
    def get_queryset(self):
        return Paiement.objects.filter(ecole=self.request.user.ecole)


