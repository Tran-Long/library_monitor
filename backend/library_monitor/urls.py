"""
URL configuration for library_monitor project.
"""
from django.contrib import admin
from django.urls import path, include
from ninja import NinjaAPI

from api.router import router

api = NinjaAPI(title="Library Monitor API", version="1.0.0")
api.add_router("", router)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api.urls),
]
