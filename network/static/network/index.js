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
    document.querySelectorAll('.edit-form').forEach(form => {
        form.addEventListener('submit', function (event) {
            event.preventDefault(); // prevent the default form submission behavior
            console.log('edit form submitted');
            const newPostBody = document.querySelector('.edit-body').value;
            const csrfmiddlewaretoken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;

            const formActionValue = form.getAttribute('action');
            console.log('formActionValue', formActionValue);
            // make a Fetch API request to update the post
            fetch(formActionValue, {
                method: 'POST',
                body: JSON.stringify({
                    'body': newPostBody,
                    "csrfmiddlewaretoken": csrfmiddlewaretoken,
                }),
                headers: { "X-CSRFToken": csrfmiddlewaretoken }
            })
            .then(response => response.json())
            .then(result => {
                console.log('result', result);
                // update the post body in the browser
                postBody.innerText = newPostBody;

                // hide the edit form
                editForm.style.display = 'none';
            })

            // name csrfmiddlewaretoken

            // const postBody = {
            //     'csrfmiddlewaretoken': form.querySelector('input[name="csrfmiddlewaretoken"]').value,
            //     'id': form.querySelector('input[name="post-id"]').value,
            //     'body': form.querySelector('textarea[name="edit-body"]').value,
            // }

        });
    });
});

// add function that add event listener to edit-button-2 in fuser is logged in  add log to console that edit-button-2 clicked

function buttonEditPostClicked(button) {
    button.addEventListener('click', function (event) {
        console.log('edit button clicked');
        console.log("Event", event.target.id, event.target, event)

        const card = event.target.closest('.card')
        console.log("Card", card, card.dataset, card.dataset.postId)

        card.querySelector('.post-body').style.display = 'none';
        card.querySelector(".edit-post-div").style.display = 'block';
    });
};

// function that close edit-post-div and show post-body
function buttonClosePostClicked(button) {
    button.addEventListener('click', function (event) {
        console.log('close button clicked');
        const card = event.target.closest('.card')
        card.querySelector('.post-body').style.display = 'block';
        card.querySelector('.edit-post-div').style.display = 'none';
    });
}