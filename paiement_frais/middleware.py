from django.shortcuts import redirect
from django.urls import reverse
from django.http import JsonResponse

class AuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Si l'utilisateur est authentifié, on laisse passer
        if request.user.is_authenticated:
            return self.get_response(request)

        # Laisser passer certaines requêtes API (ajuste selon les besoins)
        if request.path.startswith('/api/') and '/search-eleve/' in request.path:
            return self.get_response(request)

        # Si c'est une requête API, renvoyer une réponse JSON (pas de redirection)
        if request.path.startswith('/api/'):
            return JsonResponse({'detail': 'Non authentifié'}, status=401)

        # Sinon, rediriger vers la page de connexion (si la route 'login' existe)
        try:
            return redirect(reverse('login'))
        except:
            # Fallback vers une URL par défaut si 'login' n'est pas définie
            return redirect('/connexion/')


class Redirect404Middleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Ne redirige pas les 404 pour les appels API
        if response.status_code == 404 and not request.path.startswith('/api/'):
            try:
                return redirect(reverse('login'))
            except:
                return redirect('/connexion/')

        return response
