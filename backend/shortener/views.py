import string, secrets
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import ShortURL, ClickEvent
from .serializers import ShortURLSerializer
from django.db.models import Count
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
from .rate_limiter import rate_limit


def generate_alias(length=6):
    chars = string.ascii_letters + string.digits
    return ''.join(secrets.choice(chars) for _ in range(length))

@api_view(['GET'])
def list_urls(request):
    urls = ShortURL.objects.all().order_by('-created_at')
    serializer = ShortURLSerializer(urls, many= True)
    return Response(serializer.data)


def redirect_view(request, alias):
    alias = alias
    short_url = get_object_or_404(ShortURL, alias=alias)
    ClickEvent.objects.create(short_url= short_url)
    return HttpResponseRedirect(short_url.original_url)

@api_view(['GET'])
def url_stats(request, alias):
    short_url = get_object_or_404(ShortURL, alias=alias)
    today = timezone.now().date()
    since = timezone.now() - timedelta(days=7)
    clicks_by_day = (
        ClickEvent.objects
        .filter(short_url=short_url, clicked_at__gte=since)
        .annotate(day=TruncDate('clicked_at'))
        .values('day')
        .annotate(clicks=Count('id'))
    )
    clicks_map = {entry['day']: entry['clicks'] for entry in clicks_by_day}
    result = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        result.append({
            "date": day.isoformat(),
            "clicks": clicks_map.get(day, 0),
        })
    return Response(result)


@api_view(['POST'])
@rate_limit(max_requests=5, window_seconds=60)
def shorten_url(request):
    long_url = request.data.get('url')
    if not long_url:
        return Response({"error": "url is required"}, status=400)
    alias = generate_alias()
    while ShortURL.objects.filter(alias=alias).exists():
        alias = generate_alias()
    short_url = ShortURL.objects.create(alias=alias, original_url=long_url)
    serializer = ShortURLSerializer(short_url)
    return Response(serializer.data, status=201)