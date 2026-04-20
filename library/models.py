from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Category(models.Model):
    """Категории материалов (с вложенностью)"""
    name = models.CharField(max_length=255, verbose_name="Название")
    slug = models.SlugField(max_length=255, unique=True)
    parent = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='children',
        verbose_name="Родительская категория"
    )
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    sort_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Категория"
        verbose_name_plural = "Категории"
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name

class MaterialType(models.Model):
    """Типы материалов (книга, видео, презентация)"""
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    icon = models.CharField(max_length=100, blank=True, help_text="Эмодзи или код иконки")
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Тип материала"
        verbose_name_plural = "Типы материалов"
        ordering = ['sort_order']

    def __str__(self):
        return self.name

class Material(models.Model):
    """Учебный материал"""
    title = models.CharField(max_length=500, verbose_name="Название")
    slug = models.SlugField(max_length=500, unique=True)
    author = models.CharField(max_length=500, verbose_name="Автор(ы)")
    description = models.TextField(verbose_name="Краткое описание")
    full_description = models.TextField(verbose_name="Полное описание", blank=True)
    category = models.ForeignKey(
        Category, 
        on_delete=models.PROTECT, 
        related_name='materials',
        verbose_name="Категория"
    )
    material_type = models.ForeignKey(
        MaterialType, 
        on_delete=models.PROTECT, 
        related_name='materials',
        verbose_name="Тип материала"
    )
    cover = models.ImageField(upload_to='covers/', blank=True, null=True, verbose_name="Обложка")
    file_url = models.URLField(max_length=500, blank=True, verbose_name="Ссылка на материал")
    date_published = models.DateField(null=True, blank=True, verbose_name="Дата публикации")
    is_active = models.BooleanField(default=True, verbose_name="Активен")
    views_count = models.PositiveIntegerField(default=0, verbose_name="Просмотры")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата добавления")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        verbose_name = "Материал"
        verbose_name_plural = "Материалы"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['material_type']),
            models.Index(fields=['created_at']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return self.title

class Favorite(models.Model):
    """Избранные материалы пользователя"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    material = models.ForeignKey(Material, on_delete=models.CASCADE, related_name='favorited_by')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Избранное"
        verbose_name_plural = "Избранное"
        unique_together = ['user', 'material']  # Чтобы нельзя было добавить дважды

    def __str__(self):
        return f"{self.user.email} -> {self.material.title}"