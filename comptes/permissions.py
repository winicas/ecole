# permissions.py
from rest_framework.permissions import BasePermission

class IsComptable(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'comptable'
