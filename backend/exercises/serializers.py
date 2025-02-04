from rest_framework import serializers
from .models import Exercise, ExerciseBlank, ExerciseAttempt

class ExerciseBlankSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExerciseBlank
        fields = ['id', 'blank_key', 'correct_answer', 'position', 'choices']
        read_only_fields = ['id']

class ExerciseSerializer(serializers.ModelSerializer):
    # Если хотим видеть список blanks
    blanks = ExerciseBlankSerializer(many=True, read_only=True)

    class Meta:
        model = Exercise
        fields = [
            'id', 'title', 'text', 'level', 'exercise_type',
            'creator', 'created_at',
            'blanks'  # <- добавляем
        ]
        read_only_fields = ['creator', 'created_at']

class ExerciseAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExerciseAttempt
        fields = ['id', 'user', 'exercise', 'score', 'created_at']
        read_only_fields = ['user', 'exercise', 'created_at']
