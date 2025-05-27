from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EcoleViewSet  #CreateUpdateEcoleAPIView,
from .views import LoginAPIView,UserEcoleAPIView, LogoutView,CreateComptableAPIView,ChangePasswordView, UserProfileUpdateView,UserProfileView, CreateEnseignantAPIView,DirecteurDashboardAPIView,CreateDirecteurAPIView, AdminDashboardAPIView,  ComptableDashboardAPIView
router = DefaultRouter()
router.register(r'ecoles', EcoleViewSet)

urlpatterns = [
    path('api/login/', LoginAPIView.as_view(), name='api-login'),
    path('api/dashboard/admin/', AdminDashboardAPIView.as_view(), name='api-admin-dashboard'),
    path('api/dashboard/comptable/', ComptableDashboardAPIView.as_view(), name='api-comptable-dashboard'),
    #path('api/ecole/create/', CreateUpdateEcoleAPIView.as_view(), name='api-create-ecole'),
    #path('api/ecole/update/<int:pk>/', CreateUpdateEcoleAPIView.as_view(), name='api-update-ecole'),
    path('api/directeur/create/', CreateDirecteurAPIView.as_view(), name='api-create-directeur'),
    path('api/dashboard/directeur/', DirecteurDashboardAPIView.as_view(), name='api-directeur-dashboard'),
    path('api/comptable/create/', CreateComptableAPIView.as_view(), name='api-create-comptable'),
    path('api/dashboard/comptable/', ComptableDashboardAPIView.as_view(), name='api-comptable-dashboard'),
    path('api/enseignants/create/', CreateEnseignantAPIView.as_view(), name='create_enseignant'),
    path('api/me/', UserProfileView.as_view(), name='user-profile'),
    path("api/me/update/", UserProfileUpdateView.as_view(), name="update-profile"),
    path("api/me/change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("api/logout/", LogoutView.as_view(), name="logout"),
    path('api/', include(router.urls)),
    path('api/mon-ecole/', UserEcoleAPIView.as_view(), name='user-ecole'),

    
]






