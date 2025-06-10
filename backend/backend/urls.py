"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
<<<<<<< Updated upstream
from django.urls import path
from sysrev.views import TagTreeView, StudiesView, AuthorsView, tag_study_counts, ReviewExportView, ReviewImportView
=======
from django.urls import path, include
from sysrev.views import csrf_token_view, LoginView, LogoutView, TagTreeView, StudiesView, AuthorsView, SysRevView, tag_study_counts,flag_study_counts, ReviewExportView, ReviewImportView
from rest_framework.authtoken.views import obtain_auth_token
>>>>>>> Stashed changes

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/tags/', TagTreeView.as_view(), name='tag-tree'),
    path('api/tags/<int:tag_id>/', TagTreeView.as_view(), name='tag-detail'),
    path('api/studies/', StudiesView.as_view(), name='study-list'),
    path('api/studies/<int:study_id>/', StudiesView.as_view(), name='study-detail'),
    path('api/tags/count/', tag_study_counts, name='tag-study-counts'),
    path('api/authors/', AuthorsView.as_view(), name='author-list'),
    path('api/authors/<int:author_id>/', AuthorsView.as_view(), name='author-detail'),
    path('api/export/', ReviewExportView.as_view(), name='review-export'),
    path('api/import/', ReviewImportView.as_view(), name='review-import'),
<<<<<<< Updated upstream
=======
    path('api-auth/', include('rest_framework.urls')),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/csrf/', csrf_token_view, name='csrf-token'),

>>>>>>> Stashed changes
]
