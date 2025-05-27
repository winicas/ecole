############# Nouveau Systeme avec Next js et API##########################################
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import LoginSerializer
from django.contrib.auth import authenticate

class LoginAPIView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data

            # Générer les tokens JWT
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            # Renvoyer les tokens et les informations utilisateur
            return Response({
                'token': access_token,
                'refresh': refresh_token,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'role': user.role,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'email': user.email,
                }
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

########################### SUPERUSER ADMINISTRATEUR DE TOUT LE SYSTEME###########################
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Ecole
from .serializers import EcoleSerializer

class AdminDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if not request.user.is_superuser:
            raise PermissionDenied("Vous n'avez pas accès à cette ressource.")

        ecoles = Ecole.objects.all()
        serializer = EcoleSerializer(ecoles, many=True, context={'request': request})  # ← AJOUT ICI
        return Response({'ecoles': serializer.data})


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)


# views.py
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from .models import User
from .serializers import UpdateUserProfileSerializer

class UserProfileUpdateView(RetrieveUpdateAPIView):
    serializer_class = UpdateUserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.password_validation import validate_password
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.exceptions import TokenError

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")

        if not user.check_password(current_password):
            return Response({"error": "Mot de passe actuel incorrect."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(new_password, user=user)
            user.set_password(new_password)
            user.save()

            # ✅ Invalider tous les tokens (déconnexion forcée)
            try:
                tokens = OutstandingToken.objects.filter(user=user)
                for token in tokens:
                    BlacklistedToken.objects.get_or_create(token=token)
            except Exception as e:
                # Optionnel : log ou ignorer selon tes besoins
                pass

            return Response({"message": "Mot de passe modifié. Vous allez être déconnecté."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

#----------------Creation de l'Ecole par superuser-------------------------------------------
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .models import Ecole
from .serializers import EcoleSerializer

from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import viewsets
from .models import Ecole
from .serializers import EcoleSerializer

class EcoleViewSet(viewsets.ModelViewSet):
    queryset = Ecole.objects.all()
    serializer_class = EcoleSerializer

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound
from .models import Ecole
from .serializers import EcoleSerializer

class UserEcoleAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            ecole = request.user.ecole  # suppose que User a un champ `ecole = ForeignKey(Ecole, ...)`
        except Ecole.DoesNotExist:
            raise NotFound("Aucune école associée à cet utilisateur.")
        serializer = EcoleSerializer(ecole)
        return Response(serializer.data)

class CreateUpdateEcoleAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        if not request.user.is_superuser:
            raise PermissionDenied("Vous n'avez pas accès à cette ressource.")

        serializer = EcoleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk=None, *args, **kwargs):
        if not request.user.is_superuser:
            raise PermissionDenied("Vous n'avez pas accès à cette ressource.")

        try:
            ecole = Ecole.objects.get(pk=pk)
        except Ecole.DoesNotExist:
            return Response({"error": "École non trouvée."}, status=status.HTTP_404_NOT_FOUND)

        serializer = EcoleSerializer(ecole, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#-------------------- Creer le Directeur d'une Ecole ----------------------------------------------

from .serializers import DirecteurSerializer
class CreateDirecteurAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if not request.user.is_superuser:
            raise PermissionDenied("Vous n'avez pas accès à cette ressource.")

        serializer = DirecteurSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class SuperAdminDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

   
    def get(self, request):
        ecoles = Ecole.objects.all()
        serializer = EcoleSerializer(ecoles, many=True)
        return Response({"ecoles": serializer.data})


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .serializers import ComptableSerializer

class CreateComptableAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if not request.user.is_superuser:
            raise PermissionDenied("Seul un superutilisateur peut créer un comptable.")

        serializer = ComptableSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

###############"Directeur"####################################################

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import PermissionDenied
from django.db import models
from paiement_frais.models import Eleve, Agent
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .serializers import OptionSerializer

class DirecteurDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            raise PermissionDenied("Veuillez vous connecter.")

        if request.user.role != 'directeur':
            raise PermissionDenied("Vous n'avez pas accès à cette ressource.")

        ecole = request.user.ecole

        # Si aucune école n'est associée, renvoyez une réponse explicite
        if not ecole:
            return Response({
                'message': "Aucune école associée à ce directeur.",
                'nombre_ecoles': 0,
                'nombre_etudiants': 0,
                'nombre_agents': 0,
                'options': []
            }, status=status.HTTP_200_OK)

        # Calculer les statistiques pour l'école associée
        nombre_etudiants = Eleve.objects.filter(ecole=ecole).count()
        nombre_agents = Agent.objects.filter(ecole=ecole).count()

        options = Eleve.objects.filter(ecole=ecole).values('option_elev').annotate(total=models.Count('id'))
        options_serializer = OptionSerializer(options, many=True)

        # Préparer les données à renvoyer
        data = {
            'nombre_ecoles': 1,
            'nombre_etudiants': nombre_etudiants,
            'nombre_agents': nombre_agents,
            'options': options_serializer.data,
        }

        return Response(data, status=status.HTTP_200_OK)

##########################################################################################

#################Pour le COMPTABLE##########################################################
class SchoolDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            raise PermissionDenied("Vous n'avez pas accès à cette ressource.")

        ecole = request.user.ecole
        comptables = User.objects.filter(ecole=ecole, role='comptable')
        paiements = Paiement.objects.filter(ecole=ecole)

        comptables_serializer = UserSerializer(comptables, many=True)
        paiements_serializer = PaiementSerializer(paiements, many=True)

        return Response({
            'ecole': {'nom': ecole.nom},
            'comptables': comptables_serializer.data,
            'paiements': paiements_serializer.data
        })

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .models import User, Ecole

class ComptableDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if request.user.role != 'comptable':
            raise PermissionDenied("Vous n'avez pas accès à cette ressource.")

        ecole = request.user.ecole

        # Si aucune école n'est associée, renvoyez une réponse explicite
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
            'now': timezone.now().strftime('%d %B %Y à %H:%M:%S'),  # Date et heure actuelles
        }

        return Response(data, status=status.HTTP_200_OK)

#############################Enseignant##########################################
from .permissions import IsComptable  # ou utilisez IsAuthenticated si vous n’avez pas ce fichier
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .serializers import EnseignantSerializer
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

class CreateEnseignantAPIView(APIView):
    permission_classes = [IsAuthenticated]  # Assurez-vous que l'utilisateur est authentifié

    def post(self, request, *args, **kwargs):
        if request.user.role != 'comptable':
            raise PermissionDenied("Seul un utilisateur avec le rôle 'comptable' peut créer un enseignant.")

        # Passer l'utilisateur dans le contexte du sérialiseur pour accéder à `request.user.ecole`
        serializer = EnseignantSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            serializer.save()  # Sauvegarde de l'enseignant
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh_token")

        if not refresh_token:
            return Response({"error": "Token requis"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Déconnexion réussie"}, status=status.HTTP_200_OK)
        except TokenError:
            return Response({"error": "Token invalide ou déjà blacklisté"}, status=status.HTTP_400_BAD_REQUEST)


