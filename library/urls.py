from django.urls import path
from . import views

urlpatterns = [
    # Категории и типы
    path('categories/', views.CategoryListView.as_view(), name='categories'),
    path('types/', views.MaterialTypeListView.as_view(), name='types'),
    
    # Материалы
    path('materials/', views.MaterialListView.as_view(), name='materials-list'),
    path('materials/<int:id>/', views.MaterialDetailView.as_view(), name='materials-detail'),
    
    # Избранное
    path('favorites/', views.FavoriteListView.as_view(), name='favorites-list'),
    path('favorites/toggle/', views.FavoriteToggleView.as_view(), name='favorites-toggle'),
]