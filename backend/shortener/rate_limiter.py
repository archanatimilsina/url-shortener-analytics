import time
import threading
from functools import wraps
from rest_framework.response import Response

_request_log = {}
_lock = threading.Lock()


def get_client_ip(request):
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def rate_limit(max_requests=5, window_seconds=60):
    def decorator(view_func):
        @wraps(view_func)
        def wrapped(request, *args, **kwargs):
            ip = get_client_ip(request)
            now = time.time()
            with _lock:
                timestamps = _request_log.get(ip, [])
                window_start = now - window_seconds
                timestamps = [t for t in timestamps if t > window_start]
                if len(timestamps) >= max_requests:
                    oldest = timestamps[0]
                    retry_after = round(window_seconds - (now - oldest))
                    return Response(
                        {
                            "error": "Too many requests. Please slow down.",
                            "retry_after_seconds": max(retry_after, 1),
                        },
                        status=429,
                    )
                timestamps.append(now)
                _request_log[ip] = timestamps
            return view_func(request, *args, **kwargs)

        return wrapped

    return decorator
