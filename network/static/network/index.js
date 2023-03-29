document.addEventListener('DOMContentLoaded', function() {
    /*
    this part of code listens to the click event on the edit button
    if button to edit the post is clicked than show the textarea and hide the post body
    and if button to close the textarea is clicked than hide the textarea and show the post body
     */
    document.querySelectorAll('.edit-button').forEach(button => {
        buttonEditPostClicked(button)
    })
    document.querySelectorAll('.close-textarea').forEach(button => {
        buttonClosePostClicked(button)
    });

    /*
    this part of code listens to the click event on the like button
    and sends a request to the server to like or dislike the post
    and updates the number of likes
    and use the fetch API to send a request to the server
    and use cfscmiddlewaretoken to prevent cross-site request forgery
     */

    document.querySelectorAll('.card').forEach(card => {
        const favoriteIcons = card.querySelector('.favorites-icons');
        const likeDislikeButton = card.querySelector('.card-footer .fav-btn');
        const favoritesCount = card.querySelector(".favorites-count");
        const postId = card.dataset.postId; // card (post) id

        if (favoriteIcons) {
            favoriteIcons.addEventListener('submit', function (event) {
                event.preventDefault(); // prevent the default form submission behavior
                const buttonClassName = likeDislikeButton.className
                let favoritesCountValue = parseInt(favoritesCount.innerHTML);
                if(buttonClassName.includes("favorites-checked-button")){ // if the button is checked -dislike post
                    likeDislikeButton.classList.remove("favorites-checked-button");
                    likeDislikeButton.classList.add("favorites-unchecked-button");

                    // decrease the number of likes by one (class="favorites-count") and convert it to string
                    favoritesCountValue -= 1;
                    favoritesCount.innerHTML = favoritesCountValue.toString();

                    const csrfmiddlewaretoken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
                    const postAction = `/post/${postId}/unlike/`
                    fetch(postAction, {
                        method: 'POST',
                        body: JSON.stringify({
                        }),
                        headers: { "X-CSRFToken": csrfmiddlewaretoken }
                    })
                    .then(response => {
                        console.log(response);
                })
                // fetch also for dislike
                } else { // if the button is unchecked - like post
                    likeDislikeButton.classList.remove("favorites-unchecked-button");
                    likeDislikeButton.classList.add("favorites-checked-button");

                    // increase the number of likes by one (class="favorites-count"), and convert to string
                    favoritesCountValue += 1;
                    favoritesCount.innerHTML = favoritesCountValue.toString();

                    const csrfmiddlewaretoken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
                    const likeAction = `/post/${postId}/like/`
                    fetch(likeAction, {
                        method: 'POST',
                        body: JSON.stringify({
                        }),
                        headers: { "X-CSRFToken": csrfmiddlewaretoken }
                    })
                    .then(response => {
                        console.log(response);
                    })
                }
            })
        }
    });
    /*
    this part of code listens to the click event on the edit button
    if button to edit the post is clicked than show the textarea and hide the post body
    and fill the textarea with the post body
     */
    document.querySelectorAll('.card').forEach(card => {
        const editButton = card.querySelector('.edit-button');
        if (editButton) {
            editButton.addEventListener('click', function (event) {
                const card = event.target.closest('.card')
                card.querySelector('.post-body').style.display = 'none';
                card.querySelector(".edit-post-div").style.display = 'block';
                let postBody = card.querySelector('.card-body .post-body > p').textContent;
                card.querySelector(".edit-form .edit-body").value = postBody;
            })
        }
    })

    /*
    this part of code listens to the click event on the edit post div
    if button to save edited post is clicked than send a request to the server to update the post
    and update the post body
    use the fetch API to send a request to the server
    and use cfscmiddlewaretoken to prevent cross-site request forgery
     */
    document.querySelectorAll('.card').forEach(card => {
        const editPost = card.querySelector(".edit-post-div")
        if (editPost) {
            editPost.addEventListener('submit', function (event) {
                event.preventDefault(); // prevent the default form submission behavior
                console.log('edit form submitted');
                const csrfmiddlewaretoken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;

                const formActionValue = card.querySelector(".edit-form").getAttribute('action');
                const newPostBody = card.querySelector(".edit-form .edit-body").value;


                console.log('formActionValue', formActionValue);
                // make a Fetch API request to update the post
                let logs = JSON.parse(localStorage.getItem("logs")) || [];
                logs.push('formActionValue', formActionValue);
                localStorage.setItem("logs", JSON.stringify(logs));
                fetch(formActionValue, {
                    method: 'POST',
                    body: JSON.stringify({
                        'body': newPostBody
                    }),
                    headers: { "X-CSRFToken": csrfmiddlewaretoken }
                })
                .then(response => {
                    console.log(response);
                })
                .then(result => {
                    try {
                        console.log(result);
                        card.querySelector('.card-body .post-body > p').textContent = newPostBody;
                        card.querySelector('.edit-post-div').style.display = 'none';
                        card.querySelector('.post-body').style.display = 'block';
                        } catch (error) {
                            console.error('Error parsing JSON data:', error.message);
                        }
                        })
                .catch(error => {
                  console.error('Error fetching data:', error.message);
                });
            });
        }
    });
});

function buttonEditPostClicked(button) {
    button.addEventListener('click', function (event) {
        const card = event.target.closest('.card')
        card.querySelector('.post-body').style.display = 'none';
        card.querySelector(".edit-post-div").style.display = 'block';
    });
};

// function that close edit-post-div and show post-body
function buttonClosePostClicked(button) {
    button.addEventListener('click', function (event) {
        const card = event.target.closest('.card')
        card.querySelector('.post-body').style.display = 'block';
        card.querySelector('.edit-post-div').style.display = 'none';
    });
}