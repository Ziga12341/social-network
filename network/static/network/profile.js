// if profile page loaded than listen to the event if follow or unfollow button was pressed
// if true increase the number of followers else decrease the number of followers

document.addEventListener('DOMContentLoaded', function() {
    // get the user id from the url and save it to a variable
    document.querySelector('#follow-form input:nth-child(3)').addEventListener('click', () => {
        // add event log to print the event to console
        console.log('Follow button was clicked');
    })
})