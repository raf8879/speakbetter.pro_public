# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import ExerciseViewSet, ExerciseStatsView
#
# router = DefaultRouter()
# router.register('exercises', ExerciseViewSet, basename='exercise')
#
# urlpatterns = [
#     path('', include(router.urls)),
#     path('stats/', ExerciseStatsView.as_view(), name='exercise_stats'),
# ]
# exercises/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views_exercise import ExerciseViewSet
from .views_submit import SubmitAnswersView
# from .views_stats import ExerciseStatsView

router = DefaultRouter()
router.register('exercises', ExerciseViewSet, basename='exercise')

urlpatterns = [
    path('', include(router.urls)),

    # Ручка для отправки ответов
    path('<int:exercise_id>/submit/', SubmitAnswersView.as_view(), name='exercise_submit'),
]
