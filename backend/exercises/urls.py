from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views_exercise import ExerciseViewSet
from .views_submit import SubmitAnswersView

router = DefaultRouter()
router.register('exercises', ExerciseViewSet, basename='exercise')

urlpatterns = [
    path('', include(router.urls)),
    path('<int:exercise_id>/submit/', SubmitAnswersView.as_view(), name='exercise_submit'),
]
