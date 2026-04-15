"""
Administration panel configuration.

This file registers the models in the Django admin site,
allowing superusers to view, create, edit, and delete registered
records (In this case: Reviews, Studies, Authors, Tags) from the web interface.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/ref/contrib/admin/#module-django.contrib.admin
"""

from django.contrib import admin 
from .models import Review, Study, Author, Tag

# Register your models here.
  
admin.site.register(Review)
admin.site.register(Study)
admin.site.register(Author)
admin.site.register(Tag)