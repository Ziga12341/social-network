"""
Views for the network app.
"""
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django import forms
from .models import User, Post
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.http import JsonResponse
import json


class FollowForm(forms.Form):
    follow = forms.BooleanField(label="follow", required=False, initial=True, widget=forms.HiddenInput)


class UnfollowForm(forms.Form):
    unfollow = forms.BooleanField(label="unfollow", required=False, initial=True, widget=forms.HiddenInput)


class NewPostForm(forms.Form):
    body = forms.CharField(widget=forms.Textarea, label="")


class EditPostForm(forms.Form):
    body = forms.CharField(
        widget=forms.Textarea(attrs={"class": "edit-body", "opacity": "0"}),
        label="")


def index(request):
    next_page_url = None
    previous_page_url = None
    all_posts = Post.objects.all().order_by("-timestamp")
    paginator = Paginator(all_posts, 10) # Show 10 items per page
    page = request.GET.get('page')
    all_posts = paginator.get_page(page)
    # Check if there is a next page
    if all_posts.has_next():
        # Get the URL for the next page by incrementing the current page number by 1
        next_page_url = f'?page={all_posts.next_page_number()}'
    if all_posts.has_previous():
        previous_page_url = f'?page={all_posts.previous_page_number()}'
    return render(request, "network/index.html",
                  {"new_post_form": NewPostForm(),
                   "posts": all_posts,
                   "paginator": paginator,
                   "next_page_url": next_page_url,
                   "previous_page_url": previous_page_url,
                   "edit_post_form": EditPostForm()})


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


@login_required(login_url='/login')
def update_post(request, post_id):
    print(request.method)

    # Editing posts must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    user = User.objects.get(id=request.user.id)
    post = Post.objects.get(id=post_id)
    if user != post.user:
        return JsonResponse({"error": "You can only edit your own posts."}, status=400)

    # Get contents of from json
    data = json.loads(request.body)
    body = data.get("body", "")

    post = Post.objects.get(id=post_id)
    post.body = body
    post.save()
    return HttpResponseRedirect(reverse("index"))


# like a post
# note who liked the post
# if user did not like post jet but other users does, add user to liked posts
# check who already liked post and if logged-in user is in list
@login_required(login_url='/login')
def like(request, post_id):
    print(request.POST)
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    post = Post.objects.get(id=post_id)
    user = User.objects.get(id=request.user.id)
    # check if user already liked post
    if user in post.liked_posts.all():
        print("user already liked posts")
    else:
        user.liked_posts.add(post)
        post.likes += 1
        post.save()
    return HttpResponseRedirect(reverse("index"))


# unlike a post
def unlike(request, post_id):
    print(request.POST)
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    post = Post.objects.get(id=post_id)
    post.likes -= 1
    post.save()
    user = User.objects.get(id=request.user.id)
    try:
        user.liked_posts.remove(post_id)
    except(ValueError, post.DoesNotExist):
        "User did not like this post jet"

    return HttpResponseRedirect(reverse("index"))


def profile(request, username):
    user = User.objects.get(username=username)
    followers = user.followers.all()
    following = user.following.all()
    # all posts of user in reverse order
    all_posts = Post.objects.filter(user=user).order_by("-timestamp")

    # check if user is logged in
    if request.user.is_authenticated:
        following_status = False
        # if user that is logged on following user that is being viewed display status
        logged_on_user = User.objects.get(id=request.user.id)
        print("logged on user is: ", logged_on_user)
        if logged_on_user in followers and logged_on_user != user:
            print("following status is true, user who's logged in is following user that is being viewed")
            print("followers: ", followers)
            following_status = True

        if request.method == "POST":
            if "follow" in request.POST:
                logged_on_user.following.add(user)
                logged_on_user.save()
                user.followers.add(logged_on_user)
                user.save()
                following_status = True
                return HttpResponseRedirect(reverse("profile", args=(username, )))

            elif "unfollow" in request.POST:
                logged_on_user.following.remove(user)
                logged_on_user.save()
                user.followers.remove(logged_on_user)
                user.save()
                following_status = False
                return HttpResponseRedirect(reverse("profile", args=(username, )))

        return render(request, "network/profile.html",
                      {"users_profile": user,
                       "posts": all_posts,
                       "number_of_followers": len(followers),
                       "number_of_following": len(following),
                       "following_status": following_status,
                       "follow_form": FollowForm(),
                       "unfollow_form": UnfollowForm()})
    else:
        return render(request, "network/profile.html",
                      {"users_profile": user,
                       "posts": all_posts,
                       "number_of_followers": len(followers),
                       "number_of_following": len(following)})


@login_required(login_url='/login')
def following(request):
    next_page_url = None
    previous_page_url = None

    # get all users posts that I am following
    logged_in_user = User.objects.get(id=request.user.id)
    following = logged_in_user.following.all()

    # get all posts from users that the user who is logged in is following
    following_posts = Post.objects.filter(user__in=following).order_by("-timestamp")
    paginator = Paginator(following_posts, 10) # Show 10 items per page
    page = request.GET.get('page')
    following_posts = paginator.get_page(page)
    # Check if there is a next page
    if following_posts.has_next():
        # Get the URL for the next page by incrementing the current page number by 1
        next_page_url = f'?page={following_posts.next_page_number()}'
    if following_posts.has_previous():
        previous_page_url = f'?page={following_posts.previous_page_number()}'

    print("paginator.num_pages: ", paginator.num_pages)

    return render(request, "network/following.html",
                  {"following_posts": following_posts,
                   "paginator": paginator,
                   "next_page_url": next_page_url,
                   "previous_page_url": previous_page_url})


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