from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('config')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'archive-all-mouvements-every-day': {
        'task': 'paiement_frais.tasks.archive_all_mouvements',
        'schedule': 86400.0,  # Une fois par jour
    },
}


######################## rapport############################################
from celery.schedules import crontab

app.conf.beat_schedule = {
    'generate-monthly-report': {
        'task': 'paiement_frais.tasks.generate_financial_reports',
        'schedule': crontab(day_of_month=1, hour=0, minute=0),  # Tous les mois
    },
    'generate-quarterly-report': {
        'task': 'paiement_frais.tasks.generate_financial_reports',
        'schedule': crontab(day_of_month=1, month_of_year='1,4,7,10', hour=0, minute=0),  # Tous les trimestres
    },
    'generate-annual-report': {
        'task': 'paiement_frais.tasks.generate_financial_reports',
        'schedule': crontab(day_of_month=1, month_of_year='1', hour=0, minute=0),  # Tous les ans
    },
}