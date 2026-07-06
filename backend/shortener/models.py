from django.db import models


class ShortURL(models.Model):
    alias = models.CharField(max_length=6, unique=True)
    original_url = models.URLField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)


class ClickEvent(models.Model):
    short_url = models.ForeignKey(
        ShortURL, related_name="clicks", on_delete=models.CASCADE
    )
    clicked_at = models.DateTimeField(auto_now_add=True)
