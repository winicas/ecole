from django.contrib import admin
from django.urls import path, include
from comptes import views as comptes_views
from django.http import HttpResponseRedirect
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('comptes.urls')),  # Inclure les URL de l'application comptes
    path('', include('paiement_frais.urls')),
    path('api/auth/', include('djoser.urls')),
    path('api/auth/', include('djoser.urls.jwt')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
