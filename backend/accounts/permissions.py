from rest_framework.permissions import BasePermission


class IsTeacher(BasePermission):
    def has_permission(self, request, view):

        return request.user.is_authenticated and getattr(request.user, 'role', None) == 'teacher'
