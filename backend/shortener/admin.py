from django.contrib import admin
from .models import ShortURL, ClickEvent


@admin.register(ShortURL)
class ShortURLAdmin(admin.ModelAdmin):
    list_display = ("alias", "original_url", "created_at")
    ordering = ("-created_at",)


@admin.register(ClickEvent)
class ClickEventAdmin(admin.ModelAdmin):
    list_display = ("short_url", "clicked_at")
    ordering = ("-clicked_at",)
