from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Category, MaterialType, Material, Favorite
from .serializers import (
    CategorySerializer, MaterialTypeSerializer,
    MaterialListSerializer, MaterialDetailSerializer,
    FavoriteSerializer
)

class CategoryListView(generics.ListAPIView):
    """Получение списка категорий (для фильтров)"""
    queryset = Category.objects.filter(is_active=True).order_by('sort_order', 'name')
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class MaterialTypeListView(generics.ListAPIView):
    """Получение списка типов материалов"""
    queryset = MaterialType.objects.all().order_by('sort_order')
    serializer_class = MaterialTypeSerializer
    permission_classes = [permissions.AllowAny]

class MaterialListView(generics.ListAPIView):
    """Список материалов с фильтрацией, поиском и пагинацией"""
    serializer_class = MaterialListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    
    # Фильтры
    filterset_fields = ['category', 'material_type', 'is_active']
    
    # Поиск по названию и автору
    search_fields = ['title', 'author']
    
    # Сортировка
    ordering_fields = ['created_at', 'title', 'views_count']
    ordering = ['-created_at']  # По умолчанию - сначала новые

    def get_queryset(self):
        queryset = Material.objects.filter(is_active=True).select_related('category', 'material_type')
        
        # Фильтр по дате (если переданы параметры date_from и date_to)
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)
            
        return queryset

class MaterialDetailView(generics.RetrieveAPIView):
    """Детальная страница материала"""
    queryset = Material.objects.filter(is_active=True).select_related('category', 'material_type')
    serializer_class = MaterialDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'

    def retrieve(self, request, *args, **kwargs):
        # Увеличиваем счётчик просмотров
        instance = self.get_object()
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        return super().retrieve(request, *args, **kwargs)

class FavoriteListView(generics.ListAPIView):
    """Список избранных материалов пользователя"""
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related('material')

class FavoriteToggleView(APIView):
    """Добавление / удаление из избранного"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        material_id = request.data.get('material_id')
        
        if not material_id:
            return Response(
                {'error': 'material_id обязателен'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            material = Material.objects.get(id=material_id, is_active=True)
        except Material.DoesNotExist:
            return Response(
                {'error': 'Материал не найден'},
                status=status.HTTP_404_NOT_FOUND
            )

        favorite, created = Favorite.objects.get_or_create(
            user=request.user,
            material=material
        )

        if not created:
            # Удаляем, если уже был в избранном
            favorite.delete()
            return Response({'status': 'removed'})
        
        return Response({'status': 'added'})
