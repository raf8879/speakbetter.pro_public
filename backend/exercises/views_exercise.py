# exercises/views_exercise.py
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Exercise
from .serializers import ExerciseSerializer
from accounts.permissions import IsTeacher


# class ExerciseViewSet(ModelViewSet):
#     queryset = Exercise.objects.all().order_by('-created_at')
#     serializer_class = ExerciseSerializer
#
#     def get_permissions(self):
#         if self.action in ['create', 'update', 'partial_update', 'destroy']:
#             return [IsAuthenticated(), IsTeacher()]
#         # Просмотр упражнений всем
#         if self.action in ['list', 'retrieve']:
#             return [AllowAny()]
#
#         return [IsAuthenticated()]
#
#     def perform_create(self, serializer):
#         # При создании упражнения, заполняем creator=current user
#         serializer.save(creator=self.request.user)
class ExerciseViewSet(ModelViewSet):
    serializer_class = ExerciseSerializer

    # Убираем прямое поле queryset=..., чтобы вызывать super().get_queryset()
    # (Либо оставляем, но нужно переопределить get_queryset всё равно.)
    queryset = Exercise.objects.all().order_by('-created_at')

    def get_queryset(self):
        qs = super().get_queryset()
        level = self.request.query_params.get('level', None)
        if level:
            qs = qs.filter(level=level)
        return qs

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsTeacher()]
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)