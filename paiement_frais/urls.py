from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AchatFournitureViewSet, FournisseurViewSet

from .views import (
    CreateEleveAPIView, 
    EleveListView,
    EnregistrerPaiementView,
    EleveDetailView,
    TypeFraisScolaireListCreateView,
    TypeFraisListCreateView,
    TypeFraisDetailView,
    EnregistrerPaiementAutresFraisView,
    CreateInscriptionAPIView,
    CreateAnneeScolaireAPIView,
    ListAnneeScolaireAPIView,
    GenererInscriptionsNouvelleAnnee,
    UpdateEleveIdentityView,
    EleveDetailUpdateAPIView,
    ElevesEnOrdreAPIView,
    ListePaiementAutresFraisOrdre,
    TypeFraisListAPIView,
    CarteScolaireAPIView,
    EleveListAllView,
    AjouterAgentAPIView,
    UtilisateursEcoleAPIView,
    ListeAgentsAPIView,
    PaiementSalaireAgentCreateView,
    AgentDetailAPIView,
    EcoleDetailAPIView,
    RapportJournalierAPIView,
    HistoriqueMouvementsAPIView,
    EcoleAPIView,
    PaiementsDeuxJoursSpecifiquesAPIView, 
    PaiementDetailAPIView,
 
    
    

)
router = DefaultRouter()
router.register(r'achats-fournitures', AchatFournitureViewSet, basename='achats-fournitures')
router.register(r'fournisseurs', FournisseurViewSet, basename='fournisseurs')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/comptable/create-eleve/', CreateEleveAPIView.as_view(), name='create-eleve'),
    path('api/eleves/', EleveListView.as_view(), name='eleve-list'),
    path('api/paiements/', EnregistrerPaiementView.as_view(), name='enregistrer-paiement'),
    path('api/eleves/<int:id>/', EleveDetailView.as_view(), name='eleve-detail'),
    path('api/eleves/all/', EleveListAllView.as_view(), name='eleve-list-all'),
    path('api/ecoles/<int:id>/', EcoleDetailAPIView.as_view(), name='ecole-detail'),
    path('api/ecole/', EcoleAPIView.as_view(), name='ecole-api'),


    # Frais scolaire
    path('api/type-frais-scolaire/', TypeFraisScolaireListCreateView.as_view(), name='type-frais-list-create'),
    path('api/autres-frais/', TypeFraisListCreateView.as_view(), name='autres-frais'),
    path('type-frais/<int:pk>/', TypeFraisDetailView.as_view(), name='type-frais-detail'),
    path('api/paiement-autres-frais/', EnregistrerPaiementAutresFraisView.as_view(), name='paiement-autres-frais'),
    path('api/inscriptions/', CreateInscriptionAPIView.as_view(), name='create-inscription'),
    path('api/annees-scolaires/create/', CreateAnneeScolaireAPIView.as_view()),
    path("api/annees-scolaires/", ListAnneeScolaireAPIView.as_view()),
    path('api/generer-inscriptions/', GenererInscriptionsNouvelleAnnee.as_view(), name='generer-inscriptions'),  
    path('api/eleves/<int:pk>/', EleveDetailUpdateAPIView.as_view(), name='eleve-detail'),
    path("api/eleves/<int:pk>/identite/", UpdateEleveIdentityView.as_view(), name="update_eleve_identite"),
    path('api/eleves-en-ordre/', ElevesEnOrdreAPIView.as_view(), name='eleves_en_ordre'),
    path('api/liste-autres-frais/', ListePaiementAutresFraisOrdre.as_view(), name='liste_autres_frais'),
    path('api/type-frais-list/', TypeFraisListAPIView.as_view(), name='type-frais-list'),
    ################################## Carte d'eleve ########################################
    path('api/generate-carte/', CarteScolaireAPIView.as_view(), name='generate_carte'),
    path('api/agents/ajouter/', AjouterAgentAPIView.as_view(), name='ajouter-agent'),
    path('api/utilisateurs-ecole/', UtilisateursEcoleAPIView.as_view(), name='utilisateurs_ecole'),
    path('api/agents/', ListeAgentsAPIView.as_view(), name='api_agents'),
    path('api/paiements-salaire/', PaiementSalaireAgentCreateView.as_view(), name='create_paiement_salaire'),
    path('api/agents/<int:id>/', AgentDetailAPIView.as_view(), name='agent-detail'),
    path('api/rapport-journalier/', RapportJournalierAPIView.as_view(), name='rapport-journalier'),
    path('api/historique-mouvements/', HistoriqueMouvementsAPIView.as_view(), name='historique-mouvements'),
    path('api/paiements-hier-aujourdhui/', PaiementsDeuxJoursSpecifiquesAPIView.as_view()),
    path('api/paiement/<int:id>/', PaiementDetailAPIView.as_view()),  # pour modifier un paiement
 ]


