import Parse from "parse";

Parse.initialize("guqXnUDa7N2YT7mQuGvMZvgW1KPIc4Owb81Ylz71", "fkyx82YotlRrQHe9iBe0AzB2fqWrmC8o9B9wNgdp");
Parse.serverURL = "https://parseapi.back4app.com/";

export const utility = {
    read_tweets: function() {
        var cleaned_tweets = []
        var tweets = document.getElementById("textarea").value;
        tweets = tweets.split("\n");
        return (tweets)
    },
    send_text_to_node : function() {
        console.log(utility.read_tweets())
        /*
        fetch("https://8000-amaranth-jay-uz4wqvjk.ws-us03.gitpod.io/api/", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
        text: JSON.stringify(utility.read_tweets())
        })
        .then(res => res.json())
        .then((result) => {
            utility.show_results(result)
        })
        */
    },
    send_text_to_parse : function() {
        Parse.Cloud.run('topic_analysis', { 
            text: JSON.stringify(utility.read_tweets())
        }).then(function(res) {
            utility.show_results(res)
        });
    },
    show_results: function(arr) {
        document.getElementsByClassName("hold_results")[0].innerHTML = "";
        arr.forEach(function(obj) {
            var clean_tweet = utility.clean_tweet(obj.original_tweet);
            var use_title = utility.find_longest_word(clean_tweet, 3);
            document.getElementsByClassName("hold_results")[0].innerHTML += "<h3>Topic</h3><h4>" + use_title.join(", ") + "</h4><br>"
            obj.closest_tweets.forEach(function(closest_tweet) {
                document.getElementsByClassName("hold_results")[0].innerHTML += "<div class='hold_closest_tweet'>" + closest_tweet + "</div><br>"
            })
        })
    }
}