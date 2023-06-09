
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("new_post", views.new_post, name="new_post"),
    path("profile/<str:username>", views.profile, name="profile"),
    path("following", views.following, name="following"),
    path('update_post/<int:post_id>/', views.update_post, name='update_post'),
    path('post/<int:post_id>/like/', views.like, name='like'),
    path('post/<int:post_id>/unlike/', views.unlike, name='unlike'),
]