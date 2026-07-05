from rest_framework import serializers
from .models import ShortURL

class ShortURLSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShortURL
        fields = ['alias', 'original_url', 'created_at']