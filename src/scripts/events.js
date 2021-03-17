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
        events.show_results(res)
    },
    send_text_to_parse : function() {
        Parse.Cloud.run('topic_analysis', { 
            text: JSON.stringify(events.read_tweets())
        }).then(function(res) {
            events.show_results(res)
        });
    },
    shared_words : function(str_1, str_2) {
    var res = [];
    str_1.split(" ").forEach(function(word) {
        if(str_2.split(" ").includes(word)) {
            res.push(word)
        }
    })
    return(res)
},
    show_results: function(arr) {
       document.getElementsByClassName("hold_results")[0].innerHTML = "";
        arr.forEach(function(obj) {
            //document.getElementsByClassName("hold_results")[0].innerHTML += "<h3>Topic</h3><h4>" + obj.topic.join(", ") + "</h4><br>"
            /*
            obj.closest_tweets.forEach(function(closest_tweet) {
                var searched = shared_words[0]
                let re = new RegExp(searched,"g"); 
                document.getElementsByClassName("hold_results")[0].innerHTML += "<div class='hold_closest_tweet'>" + closest_tweet.replace(re, `<mark>${searched}</mark>`) + "</div><br>"
            })
            */
        document.getElementsByClassName("hold_results")[0].innerHTML += "<h3>Original Tweet</h3><h4>" + obj.original_tweet + "</h4><br>"
        document.getElementsByClassName("hold_results")[0].innerHTML += "<h3>Related Tweets</h3><h4></h4><br>"
        obj.closest_tweets.forEach(function(closest_tweet) {
                
               if(obj.original_tweet !== closest_tweet.original_tweet) {
                   var shared_words = events.shared_words(obj.original_tweet, closest_tweet.original_tweet)
                   var longest_shared_word = utility.find_longest_word(shared_words.join(" "), 1)[0]
                   console.log(longest_shared_word)
                   //document.getElementsByClassName("hold_results")[0].innerHTML += "<div class='hold_closest_tweet'>" + closest_tweet.original_tweet + "</div><br>"
                    var searched = longest_shared_word
                    let re = new RegExp(searched,"g"); 
                    document.getElementsByClassName("hold_results")[0].innerHTML += "<div class='hold_closest_tweet'>" + closest_tweet.original_tweet.replace(re, `<mark>${searched}</mark>`) + "</div><br>"
                }
           })
        })
    }
}