// if edit button clicked then:
// add console log
// hide #post-body
console.log('JavaScript code is actually being executed')
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.edit-button').forEach(button => {
        buttonEditPostClicked(button)
    })
    document.querySelectorAll('.close-textarea').forEach(button => {
        buttonClosePostClicked(button)
    });
    document.querySelectorAll('.card').forEach(card => {
        card.querySelector(".edit-button").addEventListener('click', function (event) {
            const card = event.target.closest('.card')
            console.log("Card", card, card.dataset, card.dataset.postId)
            card.querySelector('.post-body').style.display = 'none';
            card.querySelector(".edit-post-div").style.display = 'block';

            let postBody = card.querySelector('.card-body .post-body > p').textContent;
            console.log('postBody', postBody);

            card.querySelector(".edit-form .edit-body").value = postBody;
            console.log("edit body value", card.querySelector(".edit-form .edit-body").value)

        })
    })
    document.querySelectorAll('.card').forEach(card => {

        card.querySelector(".card-body").addEventListener('submit', function (event) {
            event.preventDefault(); // prevent the default form submission behavior
            console.log('edit form submitted');
            const csrfmiddlewaretoken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;

            const formActionValue = card.querySelector(".edit-form").getAttribute('action');
            const newPostBody = card.querySelector(".edit-form .edit-body").value;


            console.log('formActionValue', formActionValue);
            // make a Fetch API request to update the post
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
                console.log(result);
                console.log('newPostBody', newPostBody);
                console.log('----------------- it should said message from edited form -----------------',
                card.querySelector(".edit-form .edit-body").value);
                console.log('this is end of fetch');

            });
            card.querySelector('.card-body .post-body > p').textContent = newPostBody

            card.querySelector('.edit-post-div').style.display = 'none';
            card.querySelector('.post-body').style.display = 'block';
            // add function that add event listener to edit-body-submit if user click this button change newPostBody to newPostBody
        });
    });
});

// add function that add event listener to edit-button-2 in fuser is logged in  add log to console that edit-button-2 clicked

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