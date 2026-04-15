"""
Application configuration.

Django uses this to initialize the application and register signals or configurations
when starting the server.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/ref/applications/#module-django.apps
"""

from django.apps import AppConfig


class SysrevConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'sysrev'
