# Generated by Django 5.1.4 on 2024-12-28 02:27

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('exercises', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterField(
            model_name='exercise',
            name='level',
            field=models.CharField(blank=True, choices=[('Beginner', 'Beginner'), ('Intermediate', 'Intermediate'), ('Advanced', 'Advanced')], default='Beginner', max_length=15),
        ),
        migrations.CreateModel(
            name='ExerciseAttempt',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('score', models.FloatField(default=0.0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('exercise', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attempts', to='exercises.exercise')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='exercise_attempts', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
