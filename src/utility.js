import {common_words} from "./common_words";

import {figue} from "./libs/figue.js";
//import {thes} from "./data/thes.js";

export const utility = {
    pipeline: function() {
        var res = {}
        var tweets = utility.read_tweets()
        var tweets_lower = utility.lowercase(tweets)
        var tweets_clean_lower_clean = utility.remove_mentions_from_tweet(tweets_lower)
        var tweets_clean_lower_clean_nonum = utility.strip_from_existing(tweets_clean_lower_clean)
        var tweets_clean_lower_clean_nonum_nostop = utility.remove_stopwords(tweets_clean_lower_clean_nonum)
        var tweets_clean_lower_clean_nonum_trimmed = utility.trim(tweets_clean_lower_clean_nonum_nostop)
        var tweets_clean_lower_clean_nonum_trimmed_deduped = utility.dedupe_within_tweet(tweets_clean_lower_clean_nonum_trimmed)
        var tweets_clean_lower_clean_nonum_trimmed_less = utility.remove_blanks(tweets_clean_lower_clean_nonum_trimmed_deduped)
        var topics = utility.find_topics(tweets_clean_lower_clean_nonum_trimmed_less)

        console.log(topics)

        var topics_counts = utility.count_occurences(topics)
        var topics_counts_sorted = utility.sort_object_by_value(topics_counts)
        var topics_counts_sorted_sliced = topics_counts_sorted.slice(0, 16)
        res["list_data"] = utility.list_tweets_by_topic(tweets, topics_counts_sorted_sliced) // pass off to listing
        res["plot_data"] = utility.prepare_for_plotly(topics_counts_sorted_sliced)

        var synms = utility.add_synonyms_to_tweets(tweets, tweets_clean_lower_clean_nonum_trimmed_less, topics)
        console.log(synms)

        /*

        var data = utility.dtm(tweets, tweets_clean_lower_clean_nonum_trimmed_less, utility.build_vocabulary(topics))
        var kmean_results = utility.kmeans(data, 40)
        var cluster_results = utility.show_tweets_per_cluster(kmean_results, 0)
        console.log(cluster_results)
        cluster_results.forEach(function(obj) {
             document.getElementsByClassName("item")[1].innerHTML += "<div class='show_tweet'>" + obj.label.toString() + "</div>"
        })
        */

       

        return (res)
    },
    read_tweets: function() {
        var cleaned_tweets = []
        var tweets = document.getElementById("textarea").value;
        tweets = tweets.split("\n");
        return (tweets)
    },
    remove_stopwords: function(arr) {
        var stopwords = ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now']
        var res = []
        arr.forEach(function(str) {
            var temp = []
            var words = str.split(' ')
            for (var i = 0; i < words.length; i++) {
                var word_clean = words[i].split(".").join("").trim()
                if (!stopwords.includes(word_clean) && !common_words.includes(word_clean) && word_clean !== "") {
                    temp.push(word_clean)
                }
            }
            res.push(temp.join(" "))
        })
        return (res)
    },
    lowercase: function(arr) {
        var res = [];
        arr.forEach(function(elem) {
            res.push(elem.toLowerCase())
        })
        return (res)
    },
    remove_mentions_from_tweet: function(arr) {
        var res = []
        arr.forEach(function(tweet) {
            var temp = []
            tweet.split(" ").forEach(function(word) {
                if (!word.includes("@")) {
                    temp.push(word)
                }
            })
            var pieced_back_togeter = temp.join(" ")
            res.push(pieced_back_togeter)
        })
        return (res)
    },
    strip_from_existing: function(arr) {
        var res = [];
        arr.forEach(function(elem) {
            res.push(elem.split("“").join("").split("/").join(" ").split("_").join("").split('"').join("").split("*").join("").split("(").join("").split(")").join("").split("#").join("").split("?").join("").split(";").join("").split(":").join("").split(",").join("").split("’").join("'").split("1").join("").split("2").join("").split("3").join("").split("4").join("").split("5").join("").split("6").join("").split("7").join("").split("8").join("").split("9").join("").split("0").join(""))
        })
        return (res)
    },
    trim: function(arr) {
        var res = []
        arr.forEach(function(elem) {
            res.push(elem.trim())
        })
        return (res)
    },
    remove_blanks: function(arr) {
        var res = []
        arr.forEach(function(elem) {
            if (elem !== "") {
                res.push(elem)
            }
        })
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
            raw_topics.push(utility.find_longest_word(str, 3)); // can change number of words to include here
        })
        return (raw_topics)
    },
    map_topics_to_original_tweets : function() {

    },
    count_occurences: function(topics_arr) {
        var individual_words = []
        topics_arr.forEach(function(arr) {
            arr.forEach(function(word) {
                individual_words.push(word)
            })
        })
        var counts = {};
        for (var i = 0; i < individual_words.length; i++) {
            var num = individual_words[i];
            counts[num] = counts[num] ? counts[num] + 1 : 1;
        }
        return (counts)
    },
    sort_object_by_value: function(obj) {
        return (Object.entries(obj).sort(([, a], [, b]) => b - a))
    },
    dedupe_within_tweet: function(arr) {
        var res = []
        arr.forEach(function(tweet) {
            var temp = []
            tweet.split(" ").forEach(function(word) {
                if (!temp.includes(word)) {
                    temp.push(word)
                }
            })
            var pieced_back_togeter = temp.join(" ")
            res.push(pieced_back_togeter)
        })
        return (res)
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
    list_tweets_by_topic: function(tweets, topics_counts_sorted_sliced) {
        var res = {};
        tweets.forEach(function(tweet) {
            topics_counts_sorted_sliced.forEach(function(topic) {
                if (tweet.toLowerCase().includes(topic[0])) {
                    if (typeof(res[topic[0]]) === "undefined") {
                        res[topic[0]] = []
                    } else {
                        res[topic[0]].push(tweet)
                    }
                }
            })
        })
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
        /*
        var res;
        var use_thes = JSON.parse({thes});
        use_thes.forEach(function(obj) {
            if(obj.word === word) {
                res = obj
            }
        })
        return(res)
        */
    },
    add_synonyms_to_tweets : function(original_tweets, cleaned_tweets, topics) {
        var res = []
        cleaned_tweets.forEach(function(clean_tweet, i) {
            var inner = {};
            inner["original_tweet"] = original_tweets[i];
            inner["cleaned_tweet"] = clean_tweet;
            topics.forEach(function(topic_obj) {
                var inner_syn = []
                topic_obj.forEach(function(topic_word) {
                    var synonyms = utility.find_synonyms(topic_word)
                    inner_syn.push(synonyms)
                })
                inner["synonyms"] = inner_syn
            res.push(inner)
        })
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