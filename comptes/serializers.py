from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Identifiants incorrects")

from rest_framework import serializers
from .models import Ecole
from rest_framework import serializers
from .models import Ecole

from rest_framework import serializers
from .models import Ecole

class EcoleSerializer(serializers.ModelSerializer):
    logo = serializers.ImageField(required=False, allow_null=True, use_url=True)

    class Meta:
        model = Ecole
        fields = '__all__'  # Inclut tous les champs du modèle Ecole

    def validate(self, data):
        # Exemple de validation personnalisée (optionnel)
        if 'email' in data and data['email'] and '@' not in data['email']:
            raise serializers.ValidationError({
                'email': "L'adresse e-mail n'est pas valide."
            })
        return data


class OptionSerializer(serializers.Serializer):
    option_elev = serializers.CharField()
    total = serializers.IntegerField()

class DashboardSerializer(serializers.Serializer):
    nombre_ecoles = serializers.IntegerField()
    nombre_etudiants = serializers.IntegerField()
    nombre_agents = serializers.IntegerField()
    options = OptionSerializer(many=True)


from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    photo = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'photo', 'role', 'ecole']

    def get_photo(self, obj):
        request = self.context.get('request')
        if obj.profile_picture:
            return request.build_absolute_uri(obj.profile_picture.url)
        return None

# serializers.py
from rest_framework import serializers
from .models import User

class UpdateUserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'profile_picture']
        read_only_fields = ['username']


from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class DirecteurSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)
    ecole_id = serializers.IntegerField(write_only=True, required=True)  # Champ pour recevoir l'ID de l'école
    ecole = EcoleSerializer(read_only=True)  # Serializer pour représenter l'école associée

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password1', 'password2', 'ecole_id', 'ecole', 'role')
        extra_kwargs = {
            'role': {'default': 'directeur', 'write_only': True},  # Fixe le rôle par défaut à 'directeur'
        }

    def validate(self, data):
        # Vérifie si les mots de passe correspondent
        if data['password1'] != data['password2']:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})

        # Valide le mot de passe selon les règles de Django
        try:
            validate_password(data['password1'])
        except ValidationError as e:
            raise serializers.ValidationError({'password1': list(e.messages)})

        # Vérifie si l'école existe
        ecole_id = data.get('ecole_id')
        if not ecole_id:
            raise serializers.ValidationError({"ecole_id": "Cet champ est obligatoire."})
        try:
            Ecole.objects.get(id=ecole_id)
        except Ecole.DoesNotExist:
            raise serializers.ValidationError({"ecole_id": "École non trouvée."})

        return data

    def create(self, validated_data):
        # Supprime les champs spécifiques au serializer
        password1 = validated_data.pop('password1')
        password2 = validated_data.pop('password2')
        ecole_id = validated_data.pop('ecole_id')

        # Récupère l'école par ID
        ecole = Ecole.objects.get(id=ecole_id)

        # Crée l'utilisateur avec les données validées
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=password1,
            role='directeur',
            ecole=ecole,
            is_staff=True
        )
        return user
    
from rest_framework import serializers

class OptionSerializer(serializers.Serializer):
    option_elev = serializers.CharField()
    total = serializers.IntegerField()

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import serializers

class ComptableSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)
    ecole_id = serializers.IntegerField(write_only=True, required=True)  # Champ pour recevoir l'ID de l'école
    ecole = EcoleSerializer(read_only=True)  # Serializer pour représenter l'école associée

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password1', 'password2', 'ecole_id', 'ecole', 'role')
        extra_kwargs = {
            'role': {'default': 'comptable', 'write_only': True},  # Fixe le rôle par défaut à 'comptable'
        }

    def validate(self, data):
        if data['password1'] != data['password2']:
            raise serializers.ValidationError({"password2": "Les mots de passe ne correspondent pas."})

        try:
            validate_password(data['password1'])  # Validez le mot de passe selon les règles de Django
        except ValidationError as e:
            raise serializers.ValidationError({'password1': list(e.messages)})

        try:
            Ecole.objects.get(id=data['ecole_id'])  # Vérifiez que l'école existe
        except Ecole.DoesNotExist:
            raise serializers.ValidationError({"ecole_id": "École non trouvée."})

        return data

    def create(self, validated_data):
        password = validated_data.pop('password1')
        validated_data.pop('password2')
        ecole_id = validated_data.pop('ecole_id')

        ecole = Ecole.objects.get(id=ecole_id)  # Récupérez l'école par ID
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=password,
            role='comptable',
            ecole=ecole,
            is_staff=True
        )
        return user

#############################""Enseignant########################################
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework.exceptions import ValidationError

class EnseignantSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)
    ecole_id = serializers.IntegerField(write_only=True, required=False)  # Ce champ peut être omis, il est extrait de l'utilisateur connecté
    ecole = EcoleSerializer(read_only=True)  # Serializer pour représenter l'école associée à l'enseignant

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password1', 'password2', 'ecole_id', 'ecole')

    def validate(self, data):
        # Validation des mots de passe
        if data['password1'] != data['password2']:
            raise serializers.ValidationError({"password2": "Les mots de passe ne correspondent pas."})

        try:
            validate_password(data['password1'])  # Valider le mot de passe
        except ValidationError as e:
            raise serializers.ValidationError({'password1': list(e.messages)})

        return data

    def create(self, validated_data):
        # Récupérer l'ID de l'école de l'utilisateur connecté
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            ecole_id = request.user.ecole.id  # Associer automatiquement l'ID de l'école de l'utilisateur connecté
        else:
            raise ValidationError({"ecole_id": "Aucun utilisateur connecté, impossible de déterminer l'école."})

        # Enlever les mots de passe du dictionnaire et l'école_id
        password = validated_data.pop('password1')
        validated_data.pop('password2')

        # Création de l'enseignant avec l'ID de l'école
        enseignant = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=password,
            ecole_id=ecole_id,  # L'ID de l'école est pris de l'utilisateur connecté
        )
        return enseignant
