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
from django.urls import path
from sysrev.views import TagTreeView, StudiesView, AuthorsView, SysRevView, tag_study_counts,flag_study_counts, ReviewExportView, ReviewImportView, RegisterView
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/reviews/', SysRevView.as_view(), name='review-list'),
    path('api/reviews/<int:review_id>/', SysRevView.as_view(), name='review-detail'),
    path('api/tags/', TagTreeView.as_view(), name='tag-tree'),
    path('api/tags/<int:tag_id>/', TagTreeView.as_view(), name='tag-detail'),
    path('api/studies/', StudiesView.as_view(), name='study-list'),
    path('api/studies/<int:study_id>/', StudiesView.as_view(), name='study-detail'),
    path('api/tags/count/', tag_study_counts, name='tag-study-counts'),
    path('api/flags/count/', flag_study_counts, name='flag-study-counts'),
    path('api/authors/', AuthorsView.as_view(), name='author-list'),
    path('api/authors/<int:author_id>/', AuthorsView.as_view(), name='author-detail'),
    path('api/export/', ReviewExportView.as_view(), name='review-export'),
    path('api/import/', ReviewImportView.as_view(), name='review-import'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', RegisterView.as_view(), name='register'),

]
