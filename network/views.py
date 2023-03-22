"""
Views for the network app.
New Post: Users who are signed in should be able to write a new text-based post by filling in text into a text area and then clicking a button to submit the post.
The screenshot at the top of this specification shows the “New Post” box at the top of the “All Posts” page. You may choose to do this as well, or you may make the “New Post” feature a separate page.
Posts should be displayed, most recent first.
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


class FollowForm(forms.Form):
    follow = forms.BooleanField(label="follow", required=False, initial=True, widget=forms.HiddenInput)


class UnfollowForm(forms.Form):
    unfollow = forms.BooleanField(label="unfollow", required=False, initial=True, widget=forms.HiddenInput)


class NewPostForm(forms.Form):
    body = forms.CharField(widget=forms.Textarea, label="")


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
                   "previous_page_url": previous_page_url})


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