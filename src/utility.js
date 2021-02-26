import {common_words} from "./common_words";

import {figue} from "./libs/figue.js";

var thesaurus = require('./data/thes.json');

export const utility = {
    pipeline: function() {
        var res = {}
        var tweets = utility.read_tweets()
        var synms = utility.add_synonyms_to_tweets(tweets)
        console.log(synms)
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
        return(res.join(" "))
    },
    remove_special_chars: function(tweet) {
        var res = tweet.split("“").join("").split("/").join(" ").split("_").join("").split('"').join("").split("*").join("").split("(").join("").split(")").join("").split("#").join("").split("?").join("").split(";").join("").split(":").join("").split(",").join("").split("’").join("'").split("1").join("").split("2").join("").split("3").join("").split("4").join("").split("5").join("").split("6").join("").split("7").join("").split("8").join("").split("9").join("").split("0").join("")
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
        return(res.join(" "))
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
    build_vocabulary : function(topics) {
        var vocab = [];
        topics.forEach(function(topic_arr) {
            topic_arr.forEach(function(word) {
                vocab.push(word);
            })
        })
        return(vocab)
    },
    find_synonyms : function(word) {
        var res = {};
        thesaurus.forEach(function(obj) {
            if(obj.word.toLowerCase() === word.toLowerCase()) {
                res.word = obj.word
                res.synonyms = obj.synonyms
            }
        })
        return(res)
    },
    strip_names : function(tweet) {
        var res = [];
        tweet.split(" ").forEach(function(word) {
            if(!word.includes("@")) {
                res.push(word)
            }
        })
        return(res.join(" "))
    },
    clean_tweet : function(tweet) {
        var str = tweet.toLowerCase()
        str = utility.strip_names(str)
        str = utility.remove_special_chars(str)
        str = utility.remove_stopwords(str)
        str = str.trim()
        str = utility.dedupe_tweet(str)
        return(str)
    },
    add_synonyms_to_tweets : function(original_tweets) {
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
                if(Object.keys(syn_obj).length !== 0) {
                    inner["synonyms"].push(syn_obj)
                }
            })
            inner["synonym_vector"] = [];
            var all_syms = [];
            inner["synonyms"].forEach(function(obj, i) {
                all_syms.push(obj.synonyms)
            })
            inner["synonym_vector"].push(all_syms.join(",") + keep_words.join(","))
        res.push(inner)
    })
        return(res)
    },
    fetch_vector : function(dtm, index) {
        var props_only = Object.fromEntries(Object.entries(dtm[index]).filter(([key, value]) => key !== "original_tweet" && key !== "cleaned_tweet") )
        var res = Object.values(props_only)
        return(res)
    },
    kmeans: function(data, k) {
        var labels = new Array;
        var vectors = new Array;
        for (var i = 0; i < data.length; i++) {
            labels[i] = data[i]['original_tweet'];
            vectors[i] = utility.fetch_vector(data, i)
        }
        var clusters = figue.kmeans(k, vectors);
        var kmeans_results = []
        for (var i = 0 ; i < vectors.length ; i++) {
            var inner = {}
            inner["label"] = labels[i]
            inner["cluster"]= clusters.assignments[i]
            kmeans_results.push(inner)
        }
        return(kmeans_results)
    },
    show_tweets_per_cluster : function(kmeans_results, cluster_number) {
        var res = [];
        kmeans_results.forEach(function(obj) {
            if(obj.cluster === cluster_number) {
                res.push(obj)
            }
        })
        return(res)
    }
}