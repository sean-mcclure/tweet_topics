import Parse from "parse";
Parse.initialize("guqXnUDa7N2YT7mQuGvMZvgW1KPIc4Owb81Ylz71", "fkyx82YotlRrQHe9iBe0AzB2fqWrmC8o9B9wNgdp");
Parse.serverURL = "https://parseapi.back4app.com/";

export const events = {
    read_tweets: function() {
        var tweets = document.getElementById("textarea").value;
        tweets = tweets.split("\n");
        return (tweets)
    },
    send_text_to_parse : function() {
        Parse.Cloud.run('topic_analysis', { 
            text: JSON.stringify(events.read_tweets())
        }).then(function(res) {
            events.show_results(res)
        });
    },
    clean_tweet: function(tweet) {
        var str = tweet.toLowerCase()
        str = events.strip_names(str)
        str = events.remove_special_chars(str)
        str = events.remove_stopwords(str)
        str = str.trim()
        str = events.dedupe_tweet(str)
        return (str)
    },
    show_results: function(arr) {
       // document.getElementsByClassName("hold_results")[0].innerHTML = "";
        /*
        arr.forEach(function(obj) {
            var clean_tweet = events.clean_tweet(obj.original_tweet);
            var use_title = events.find_longest_word(clean_tweet, 3);
            document.getElementsByClassName("hold_results")[0].innerHTML += "<h3>Topic</h3><h4>" + use_title.join(", ") + "</h4><br>"
            obj.closest_tweets.forEach(function(closest_tweet) {
                document.getElementsByClassName("hold_results")[0].innerHTML += "<div class='hold_closest_tweet'>" + closest_tweet + "</div><br>"
            })
        })
        */
       console.log(arr)
    }
}