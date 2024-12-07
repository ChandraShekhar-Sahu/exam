from .views import index
from django.urls import path

urlpatterns = [
    path('', index),
    path('login', index ),
    path('register', index),
    path('profile',index),
    path('notify',index),
    path('mycollege',index),
    path('editStudent',index),
    path('attendance',index),
    path('myreport',index),
    path('change_password',index),
    path('explore-college',index),
    path('colleges',index),
    path('student-list',index),
    path('verify',index),
]