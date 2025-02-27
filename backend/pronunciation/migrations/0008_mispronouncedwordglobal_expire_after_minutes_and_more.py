# Generated by Django 5.1.4 on 2025-01-07 02:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pronunciation', '0007_alter_mispronouncedwordglobal_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='mispronouncedwordglobal',
            name='expire_after_minutes',
            field=models.PositiveIntegerField(default=5),
        ),
        migrations.AddField(
            model_name='mispronouncedwordglobal',
            name='reached_threshold_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
