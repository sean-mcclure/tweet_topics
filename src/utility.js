import {
    common_words
} from "./common_words";

var thesaurus = require('./data/thes.json');


Array.prototype.diff = function(a) {
    return this.filter(function(i) {
        return a.indexOf(i) < 0;
    });
};

export const utility = {
    pipeline: function() {
        var res = {}
        var tweets = utility.read_tweets()
        var synms = utility.add_synonyms_to_tweets(tweets)
        var tweets_and_distances = utility.distance_between_all_vectors(synms)
        var closest_tweets = utility.find_closest_tweets(tweets_and_distances)
        utility.show_results(closest_tweets)
        //console.log(closest_tweets)
    },
    read_tweets: function() {
        var cleaned_tweets = []
        var tweets = document.getElementById("textarea").value;
        tweets = tweets.split("\n");
        return (tweets)
    },
    remove_stopwords: function(tweet) {
        var stopwords = ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now']
        var res = []
        tweet.split(" ").forEach(function(word) {
            var temp = []
            if (!stopwords.includes(word) && !common_words.includes(word) && word !== "") {
                res.push(word)
            }
        })
        return (res.join(" "))
    },
    remove_special_chars: function(tweet) {
        var res = tweet.split("“").join("").split("/").join(" ").split("_").join("").split('"').join("").split("*").join("").split("(").join("").split(")").join("").split("#").join("").split("?").join("").split(";").join("").split(":").join("").split(",").join("").split("’").join("'").split("1").join("").split("2").join("").split("3").join("").split("4").join("").split("5").join("").split("6").join("").split("7").join("").split("8").join("").split("9").join("").split("0").join("").split(".").join("")
        return (res)
    },
    find_longest_word: function(str, num_words) {
        var longest = str.split(" ").sort(function(a, b) {
            return b.length - a.length
        }).slice(0, num_words)
        return (longest)
    },
    find_topics: function(arr) {
        var raw_topics = [];
        arr.forEach(function(str) {
            raw_topics.push(utility.find_longest_word(str, 3));
        })
        return (raw_topics)
    },
    dedupe_tweet: function(tweet) {
        var res = []
        tweet.split(" ").forEach(function(word) {
            if (!res.includes(word)) {
                res.push(word)
            }
        })
        return (res.join(" "))
    },
    prepare_for_plotly: function(data) {
        var res = {}
        var x_values = []
        var y_values = []
        data.forEach(function(arr) {
            x_values.push(arr[0])
            y_values.push(arr[1])
        })
        res["x"] = x_values
        res["y"] = y_values
        res["type"] = "bar"
        return (res)
    },
    highlight_words: function(word) {
        const page = document.body.innerHTML;
        document.body.innerHTML = page.replace(new RegExp(word, "gi"), (match) => `<mark>${match}</mark>`);
    },
    find_synonyms: function(word) {
        var res = {};
        thesaurus.forEach(function(obj) {
            if (obj.word.toLowerCase() === word.toLowerCase()) {
                res.word = obj.word
                res.synonyms = obj.synonyms
            }
        })
        return (res)
    },
    strip_names: function(tweet) {
        var res = [];
        tweet.split(" ").forEach(function(word) {
            if (!word.includes("@")) {
                res.push(word)
            }
        })
        return (res.join(" "))
    },
    clean_tweet: function(tweet) {
        var str = tweet.toLowerCase()
        str = utility.strip_names(str)
        str = utility.remove_special_chars(str)
        str = utility.remove_stopwords(str)
        str = str.trim()
        str = utility.dedupe_tweet(str)
        return (str)
    },
    add_synonyms_to_tweets: function(original_tweets) {
        var res = []
        original_tweets.forEach(function(tweet, i) {
            var inner = {};
            inner["original_tweet"] = tweet;
            var clean_tweet = utility.clean_tweet(tweet);
            inner["cleaned_tweet"] = clean_tweet;
            inner["synonyms"] = [];
            var keep_words = [];
            clean_tweet.split(" ").forEach(function(word) {
                keep_words.push(word)
                var syn_obj = utility.find_synonyms(word)
                if (Object.keys(syn_obj).length !== 0) {
                    inner["synonyms"].push(syn_obj)
                }
            })
            inner["synonym_vector"] = [];
            var all_syms = [];
            inner["synonyms"].forEach(function(obj, i) {
                all_syms.push(obj.synonyms)
            })
            var all_words = all_syms.join(",") + keep_words.join(",");
            all_words.split(",").forEach(function(word) {
                inner["synonym_vector"].push(word)
            })
            res.push(inner)
        })
        return (res)
    },
    distance_between_all_vectors: function(synms) {
        var res = []
        var all_distances = []
        synms.forEach(function(obj, i) {
            var inner = {}
            inner["original_tweet"] = obj.original_tweet
            inner["other_tweets"] = []
            synms.forEach(function(obj_b, i) {
                if (obj_b.original_tweet !== obj.original_tweet) {
                    var inner_b = {}
                    inner_b["tweet"] = obj_b.original_tweet
                    var this_distance = obj.synonym_vector.diff(obj_b.synonym_vector).length;
                    inner_b["distance_to_original_tweet"] = this_distance;
                    all_distances.push(this_distance);
                    inner["other_tweets"].push(inner_b);
                }
            })
            res.push(inner)
        })
        return (res)
    },
    find_closest_tweets: function(arr) {
        var res = []
        arr.forEach(function(obj) {
            var inner = {}
            inner.original_tweet = obj.original_tweet
            inner.closest_tweets = []
            var other_tweet_distances = []
            obj.other_tweets.forEach(function(obj_b) {
                other_tweet_distances.push(obj_b.distance_to_original_tweet)
            })
            var smallest_distance = Math.min.apply(Math, other_tweet_distances);
            obj.other_tweets.forEach(function(obj_b) {
                if (obj_b.distance_to_original_tweet === smallest_distance) {
                    inner.closest_tweets.push(obj_b.tweet)
                }
            })
            res.push(inner)
        })
        return (res)
    },
    show_results : function(arr) {
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