document.addEventListener('DOMContentLoaded', function() {

    const all_posts_button = document.querySelector('#all-posts')

    // add event listener to the all posts button
    // if all post button is clicked than console log the event

    all_posts_button.addEventListener("click", () => {
        console.log("All posts button was clicked")
    })
})