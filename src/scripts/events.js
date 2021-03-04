import Parse from "parse";
import {utility} from "../libs/main.js";

Parse.initialize("guqXnUDa7N2YT7mQuGvMZvgW1KPIc4Owb81Ylz71", "fkyx82YotlRrQHe9iBe0AzB2fqWrmC8o9B9wNgdp");
Parse.serverURL = "https://parseapi.back4app.com/";

export const events = {
    read_tweets: function() {
        var tweets = document.getElementById("textarea").value;
        tweets = tweets.split("\n");
        return (tweets)
    },
    process_text_locally : function() {
        var res = utility.pipeline(events.read_tweets())
        console.log(res)
        events.show_results(res)
    },
    send_text_to_parse : function() {
        Parse.Cloud.run('topic_analysis', { 
            text: JSON.stringify(events.read_tweets())
        }).then(function(res) {
            events.show_results(res)
        });
    },
    show_results: function(arr) {
       document.getElementsByClassName("hold_results")[0].innerHTML = "";
        arr.forEach(function(obj) {
            document.getElementsByClassName("hold_results")[0].innerHTML += "<h3>Topic</h3><h4>" + obj.topic.join(", ") + "</h4><br>"
            obj.closest_tweets.forEach(function(closest_tweet) {
                document.getElementsByClassName("hold_results")[0].innerHTML += "<div class='hold_closest_tweet'>" + closest_tweet + "</div><br>"
            })
        })
    }
}