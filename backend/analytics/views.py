from django.http import JsonResponse
from django.db.models import Count
from django.utils.timezone import now
from datetime import timedelta

from users.models import User
from matches.models import Match


def summary(request):
    total_users = User.objects.count()
    total_matches = Match.objects.count()

    return JsonResponse({
        "total_users": total_users,
        "total_matches": total_matches,
    })


def matches_over_time(request):
    last_7_days = now() - timedelta(days=7)

    data = (
        Match.objects
        .filter(created_at__gte=last_7_days)
        .extra({'day': "date(created_at)"})
        .values('day')
        .annotate(count=Count('id'))
        .order_by('day')
    )

    return JsonResponse(list(data), safe=False)
