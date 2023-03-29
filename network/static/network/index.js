// if edit button clicked then:
// add console log
// hide #post-body
console.log('JavaScript code is actually being executed')
// To store the logs in localStorage


document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.edit-button').forEach(button => {
        buttonEditPostClicked(button)
    })
    document.querySelectorAll('.close-textarea').forEach(button => {
        buttonClosePostClicked(button)
    });

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
                    console.log('postId', postId);
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

    document.querySelectorAll('.card').forEach(card => {
        const editButton = card.querySelector('.edit-button');
        if (editButton) {
            editButton.addEventListener('click', function (event) {
                const card = event.target.closest('.card')
                console.log("Card", card, card.dataset, card.dataset.postId)
                card.querySelector('.post-body').style.display = 'none';
                card.querySelector(".edit-post-div").style.display = 'block';

                let postBody = card.querySelector('.card-body .post-body > p').textContent;
                console.log('postBody', postBody);

                card.querySelector(".edit-form .edit-body").value = postBody;
                console.log("edit body value", card.querySelector(".edit-form .edit-body").value)
            })
        }
    })
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
                        console.log('newPostBody', newPostBody);
                        console.log(result);
                        console.log('----------------- it should said message from edited form -----------------',
                        card.querySelector(".edit-form .edit-body").value);
                        console.log('this is end of fetch');
                        card.querySelector('.card-body .post-body > p').textContent = newPostBody

                        card.querySelector('.edit-post-div').style.display = 'none';
                        card.querySelector('.post-body').style.display = 'block';
                        } catch (error) {
                            console.error('Error parsing JSON data:', error.message);
                        }
                        })
                    .catch(error => {
                      console.error('Error fetching data:', error.message);
                    });
                // add function that add event listener to edit-body-submit if user click this button change newPostBody to newPostBody
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