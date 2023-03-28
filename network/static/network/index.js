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
        const likeDislikeButton = card.querySelector('.card-footer .fav-btn');
        if (likeDislikeButton) {
            likeDislikeButton.addEventListener('submit', function (event) {
                event.preventDefault(); // prevent the default form submission behavior
                console.log('likeDislikeButton clicked', likeDislikeButton)
                console.log('likeDislikeButton.className', likeDislikeButton.className)
                const buttonClassName = likeDislikeButton.className
                if(buttonClassName.includes("favorites-checked-button")){ // if the button is checked -dislike post
                    likeDislikeButton.classList.remove("favorites-checked-button");
                    likeDislikeButton.classList.add("favorites-unchecked-button");
                    const csrfmiddlewaretoken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
                    const formActionValue = card.querySelector(".unlike-form").getAttribute('action');
                    fetch(formActionValue, {
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
                    const csrfmiddlewaretoken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
                    const formActionValue = card.querySelector(".like-form").getAttribute('action');
                    console.log('formActionValue', formActionValue);
                    // To store the logs in localStorage
                    let logs = JSON.parse(localStorage.getItem("logs")) || [];
                    logs.push("formActionValue", formActionValue);
                    localStorage.setItem("logs", JSON.stringify(logs));
                    fetch(formActionValue, {
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