from rest_framework import serializers
from .models import Category, MaterialType, Material, Favorite

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'parent']

class MaterialTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialType
        fields = ['id', 'name', 'slug']

class MaterialListSerializer(serializers.ModelSerializer):
    """Сериализатор для списка материалов (сокращённый)"""
    category = CategorySerializer(read_only=True)
    material_type = MaterialTypeSerializer(read_only=True)
    in_favorite = serializers.SerializerMethodField()

    class Meta:
        model = Material
        fields = [
            'id', 'title', 'author', 'description',
            'category', 'material_type', 'cover',
            'created_at', 'views_count', 'in_favorite'
        ]

    def get_in_favorite(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, material=obj).exists()
        return False

class MaterialDetailSerializer(serializers.ModelSerializer):
    """Сериализатор для детальной страницы (полный)"""
    category = CategorySerializer(read_only=True)
    material_type = MaterialTypeSerializer(read_only=True)
    in_favorite = serializers.SerializerMethodField()

    class Meta:
        model = Material
        fields = '__all__'

    def get_in_favorite(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, material=obj).exists()
        return False

class FavoriteSerializer(serializers.ModelSerializer):
    material = MaterialListSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'material', 'added_at']