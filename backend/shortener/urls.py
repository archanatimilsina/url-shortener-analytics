from django.urls import path
from . import views
urlpatterns = [
    path('api/shorten/', views.shorten_url, name='shorten'),
    path('api/urls/', views.list_urls, name='list_urls'),
    path('api/urls/<str:alias>/stats/', views.url_stats, name='url_stats'),  
    path('<str:alias>/', views.redirect_view, name='redirect')
]
