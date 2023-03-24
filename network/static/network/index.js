// if edit button clicked then:
// add console log
// hide #post-body
console.log('JavaScript code is actually being executed')
document.addEventListener('DOMContentLoaded', function() {
    let editButton = document.querySelector('#edit-button-2');
    if (editButton) {
        editButton.addEventListener('click', function (event) {
            console.log('edit button clicked');
        });
    }
});

// add function that add event listener to edit-button-2 in fuser is logged in  add log to console that edit-button-2 clicked

function edit_button_clicked() {
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelector('#edit-button-2').addEventListener('click', function (event) {
            console.log('edit button clicked');
        });
    });
  console.log('edit button clicked');
}