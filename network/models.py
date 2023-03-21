"""
 add additional models to this file to represent details about posts, likes, and followers.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    followers = models.ManyToManyField("User", blank=True, related_name="user_followers")
    following = models.ManyToManyField("User", blank=True, related_name="user_following")

    def __str__(self):
        return f"{self.username}"


class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    body = models.CharField(max_length=1000)
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user} posted {self.body} at {self.timestamp}"