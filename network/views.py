"""
Views for the network app.
New Post: Users who are signed in should be able to write a new text-based post by filling in text into a text area and then clicking a button to submit the post.
The screenshot at the top of this specification shows the “New Post” box at the top of the “All Posts” page. You may choose to do this as well, or you may make the “New Post” feature a separate page.
Posts should be displayed, most recent first.
"""
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django import forms
from .models import User, Post
from django.contrib.auth.decorators import login_required

from .models import User


class NewPostForm(forms.Form):
    body = forms.CharField(widget=forms.Textarea, label="")


def index(request):
    return render(request, "network/index.html",
                  {"new_post_form": NewPostForm(),
                   "posts": Post.objects.all().order_by("-timestamp"),
                  })


@login_required(login_url='/login')
def new_post(request):
    user_by_id = User.objects.get(id=request.user.id)
    if request.method == "POST":
        form = NewPostForm(request.POST)
        if form.is_valid():
            body = form.cleaned_data["body"]
            post = Post(body=body, user=user_by_id)
            post.save()
    # redirect to index
    return HttpResponseRedirect(reverse("index"))


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")