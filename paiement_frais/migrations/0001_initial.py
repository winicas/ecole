# Generated by Django 5.2.1 on 2025-05-19 12:08

import datetime
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('comptes', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='AnneeScolaire',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_debut', models.DateField()),
                ('date_fin', models.DateField()),
                ('nom', models.CharField(blank=True, max_length=20, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Agent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nom_agent', models.CharField(max_length=100)),
                ('postnom_agent', models.CharField(max_length=100)),
                ('prenom_agent', models.CharField(max_length=100)),
                ('sexe_agent', models.CharField(choices=[('M', 'Masculin'), ('F', 'Féminin')], max_length=1)),
                ('date_naissance_agent', models.DateField(blank=True, null=True)),
                ('matricule_agent', models.CharField(editable=False, max_length=8, unique=True)),
                ('fonction_agent', models.CharField(max_length=100)),
                ('adresse_agent', models.CharField(max_length=255)),
                ('salaire_total', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                ('telephone_agent1', models.CharField(max_length=15)),
                ('telephone_agent2', models.CharField(blank=True, max_length=15, null=True)),
                ('cours_dispenser', models.CharField(blank=True, max_length=255, null=True)),
                ('ecole', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='comptes.ecole')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='agent_profile', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='ArchiveMouvementFinancier',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('mouvement_id', models.PositiveIntegerField()),
                ('type_mouvement', models.CharField(max_length=100)),
                ('montant', models.DecimalField(decimal_places=2, max_digits=12)),
                ('date', models.DateTimeField()),
                ('description', models.TextField(blank=True, null=True)),
                ('reference', models.CharField(blank=True, max_length=255, null=True)),
                ('archived_data', models.JSONField()),
                ('date_archivage', models.DateTimeField(default=django.utils.timezone.now)),
                ('ecole', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='comptes.ecole')),
            ],
        ),
        migrations.CreateModel(
            name='Eleve',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nom_elev', models.CharField(max_length=100)),
                ('postnom_elev', models.CharField(max_length=100)),
                ('prenom_elev', models.CharField(max_length=100)),
                ('sexe', models.CharField(choices=[('M', 'Masculin'), ('F', 'Féminin')], default='M', max_length=1)),
                ('adresses', models.CharField(blank=True, max_length=255)),
                ('matricule_elev', models.CharField(blank=True, max_length=6, unique=True)),
                ('date_naissance_elev', models.DateField()),
                ('option_elev', models.CharField(choices=[('maternelle', 'Maternelle'), ('primaire', 'Primaire'), ('education_de_base', 'Éducation de Base'), ('pedagogie', 'Pédagogie'), ('litteraire', 'Littéraire'), ('commerciale_gestion', 'Commerciale et Gestion'), ('humanite_sciences', 'Humanité Sciences'), ('coupe_couture', 'Coupe et Couture'), ('mecanique', 'Mécanique'), ('hotellerie_restauration', 'Hôtellerie et Restauration'), ('electricite', 'Électricité'), ('electronique', 'Électronique')], max_length=100)),
                ('classe_elev', models.CharField(choices=[('1', '1'), ('2', '2'), ('3', '3'), ('4', '4'), ('5', '5'), ('6', '6'), ('7', '7'), ('8', '8')], max_length=2)),
                ('numero_parent1', models.CharField(max_length=15)),
                ('numero_parent2', models.CharField(blank=True, max_length=15)),
                ('ecole', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='comptes.ecole')),
            ],
        ),
        migrations.CreateModel(
            name='Fournisseur',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nom', models.CharField(max_length=255)),
                ('contact', models.CharField(blank=True, max_length=255, null=True)),
                ('adresse', models.TextField(blank=True, null=True)),
                ('ecole', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='comptes.ecole')),
            ],
        ),
        migrations.CreateModel(
            name='AchatFourniture',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fourniture', models.CharField(max_length=100)),
                ('quantite', models.PositiveIntegerField()),
                ('date_achat', models.DateField()),
                ('numero_facture', models.CharField(blank=True, max_length=50, null=True)),
                ('commentaire', models.TextField(blank=True, null=True)),
                ('montant_achat', models.DecimalField(decimal_places=2, max_digits=12)),
                ('ecole', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='comptes.ecole')),
                ('fournisseur', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='paiement_frais.fournisseur')),
            ],
        ),
        migrations.CreateModel(
            name='Paiement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('matricule', models.CharField(max_length=6)),
                ('montant_payer', models.DecimalField(decimal_places=2, max_digits=10)),
                ('date', models.DateField()),
                ('montant_total_payer', models.DecimalField(decimal_places=2, max_digits=10)),
                ('montant_total_a_payer', models.DecimalField(decimal_places=2, max_digits=10)),
                ('montant_restant', models.DecimalField(decimal_places=2, max_digits=10)),
                ('motif_paiement', models.CharField(max_length=255)),
                ('autres_frais_elev', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('ecole', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='comptes.ecole')),
                ('eleve', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='paiement_frais.eleve')),
            ],
        ),
        migrations.CreateModel(
            name='PaiementSalaireAgent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('montant_paye', models.DecimalField(decimal_places=2, max_digits=10)),
                ('montant_restant', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('date_paiement', models.DateField(default=datetime.date.today)),
                ('periode', models.CharField(max_length=20)),
                ('motif_paiement', models.TextField(blank=True, null=True)),
                ('agent', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='paiements', to='paiement_frais.agent')),
                ('ecole', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='comptes.ecole')),
            ],
        ),
        migrations.CreateModel(
            name='RapportJournalier',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(default=django.utils.timezone.now)),
                ('total_paiement_frais_scolaires', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('total_autres_frais', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('total_salaires', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('total_achats', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('solde', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
            ],
            options={
                'verbose_name': 'Rapport Journalier',
                'verbose_name_plural': 'Rapports Journaliers',
                'unique_together': {('date',)},
            },
        ),
        migrations.CreateModel(
            name='TypeFrais',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nom', models.CharField(max_length=100)),
                ('montant_total_a_payer', models.DecimalField(decimal_places=2, max_digits=10)),
                ('ecole', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='comptes.ecole')),
            ],
        ),
        migrations.CreateModel(
            name='PaiementAutresFrais',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('montant_payer_af', models.DecimalField(decimal_places=2, max_digits=10)),
                ('date_payement', models.DateTimeField(auto_now_add=True)),
                ('total_montant_payer_af', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('montant_restant_af', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('ecole', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='comptes.ecole')),
                ('eleve', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='paiement_frais.eleve')),
                ('type_de_frais', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='paiement_frais.typefrais')),
            ],
        ),
        migrations.CreateModel(
            name='Inscription',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('classe', models.CharField(choices=[('1', '1'), ('2', '2'), ('3', '3'), ('4', '4'), ('5', '5'), ('6', '6'), ('7', '7'), ('8', '8')], max_length=2)),
                ('option', models.CharField(choices=[('maternelle', 'Maternelle'), ('primaire', 'Primaire'), ('education_de_base', 'Éducation de Base'), ('pedagogie', 'Pédagogie'), ('litteraire', 'Littéraire'), ('commerciale_gestion', 'Commerciale et Gestion'), ('sciences', 'Sciences'), ('coupe_couture', 'Coupe et Couture'), ('mecanique', 'Mécanique'), ('hotellerie_restauration', 'Hôtellerie et Restauration'), ('electricite', 'Électricité'), ('electronique', 'Électronique')], max_length=100)),
                ('montant_inscription', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('date_inscription', models.DateField(auto_now_add=True)),
                ('annee_scolaire', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='paiement_frais.anneescolaire')),
                ('eleve', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='inscriptions', to='paiement_frais.eleve')),
            ],
            options={
                'verbose_name': 'Inscription',
                'verbose_name_plural': 'Inscriptions',
                'ordering': ['-date_inscription'],
                'unique_together': {('eleve', 'annee_scolaire')},
            },
        ),
        migrations.CreateModel(
            name='TypeFraisScolaire',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('option', models.CharField(max_length=100)),
                ('classe', models.CharField(max_length=50)),
                ('montant', models.DecimalField(decimal_places=2, max_digits=10)),
                ('description', models.TextField()),
                ('ecole', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='comptes.ecole')),
            ],
            options={
                'unique_together': {('option', 'classe', 'ecole')},
            },
        ),
    ]
