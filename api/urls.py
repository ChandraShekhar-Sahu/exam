# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('api/verify_face/', views.verify_face, name='image'),
   #  path('', views.current_datetime),
] 
