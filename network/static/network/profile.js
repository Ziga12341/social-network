// if profile page loaded than listen to the event if follow or unfollow button was pressed
// if true increase the number of followers else decrease the number of followers

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('#follow-form').forEach(button => {
        button.addEventListener('click', () => {
            // add event log to print the event to console
            console.log('Unfollow button was clicked');
        })
    })
    // get the user id from the url and save it to a variable
    document.querySelector('#follow-button').addEventListener('click', () => {
        // add event log to print the event to console
        console.log('Follow button was clicked');
    })

    const follow_button = document.querySelector('#follow-button')
    const unfollow_button = document.querySelector('#unfollow-button')
    follow_button.addEventListener("click", () => {
        console.log("Follow button was clicked")
    })

    unfollow_button.addEventListener("click", () => {
        unfollow_button.addEventListener("click", () => {
            console.log("Unfollow button was clicked")
        })
    })
})