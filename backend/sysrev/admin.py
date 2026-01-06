from django.contrib import admin

# Register your models here.




from django.contrib import admin 
from .models import Review, Study, Author, Tag
  
admin.site.register(Review)
admin.site.register(Study)
admin.site.register(Author)
admin.site.register(Tag)