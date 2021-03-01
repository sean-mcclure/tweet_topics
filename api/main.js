const fs = require("fs");
require("./config.js")

var file = fs.readFileSync(config.path_to_thesaurus);
thesaurus = JSON.parse(file);

Array.prototype.diff = function(a) {
    return this.filter(function(i) {
        return a.indexOf(i) < 0;
    });
};
utility = {
    pipeline: function(incoming_text, thesaurus) {
        var res = {}
        var tweets = utility.read_tweets()
        var synms = utility.add_synonyms_to_tweets(tweets)
        var tweets_and_distances = utility.distance_between_all_vectors(synms)
        var closest_tweets = utility.find_closest_tweets(tweets_and_distances)
        return (closest_tweets)
    },
    read_tweets: function() {
        var tweets = JSON.parse(incoming_text);
        return (tweets)
    },
    remove_stopwords: function(tweet) {
        var stopwords = ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now']
        var res = []
        tweet.split(" ").forEach(function(word) {
            var temp = []
            if (!stopwords.includes(word) && word !== "") {
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
    stem_tweet: function(tweet) {
        var res = [];
        tweet.split(" ").forEach(function(word) {
            res.push(utility.stemmer(word))
        })
        return (res.join(","))
    },
    stemmer: function() {
        var step2list = {
                "ational": "ate",
                "tional": "tion",
                "enci": "ence",
                "anci": "ance",
                "izer": "ize",
                "bli": "ble",
                "alli": "al",
                "entli": "ent",
                "eli": "e",
                "ousli": "ous",
                "ization": "ize",
                "ation": "ate",
                "ator": "ate",
                "alism": "al",
                "iveness": "ive",
                "fulness": "ful",
                "ousness": "ous",
                "aliti": "al",
                "iviti": "ive",
                "biliti": "ble",
                "logi": "log"
            },
            step3list = {
                "icate": "ic",
                "ative": "",
                "alize": "al",
                "iciti": "ic",
                "ical": "ic",
                "ful": "",
                "ness": ""
            },
            c = "[^aeiou]", // consonant
            v = "[aeiouy]", // vowel
            C = c + "[^aeiouy]*", // consonant sequence
            V = v + "[aeiou]*", // vowel sequence
            mgr0 = "^(" + C + ")?" + V + C, // [C]VC... is m>0
            meq1 = "^(" + C + ")?" + V + C + "(" + V + ")?$", // [C]VC[V] is m=1
            mgr1 = "^(" + C + ")?" + V + C + V + C, // [C]VCVC... is m>1
            s_v = "^(" + C + ")?" + v; // vowel in stem
        return function(w) {
            var stem,
                suffix,
                firstch,
                re,
                re2,
                re3,
                re4,
                origword = w;
            if (w.length < 3) {
                return w;
            }
            firstch = w.substr(0, 1);
            if (firstch == "y") {
                w = firstch.toUpperCase() + w.substr(1);
            }
            re = /^(.+?)(ss|i)es$/;
            re2 = /^(.+?)([^s])s$/;
            if (re.test(w)) {
                w = w.replace(re, "$1$2");
            } else if (re2.test(w)) {
                w = w.replace(re2, "$1$2");
            }
            re = /^(.+?)eed$/;
            re2 = /^(.+?)(ed|ing)$/;
            if (re.test(w)) {
                var fp = re.exec(w);
                re = new RegExp(mgr0);
                if (re.test(fp[1])) {
                    re = /.$/;
                    w = w.replace(re, "");
                }
            } else if (re2.test(w)) {
                fp = re2.exec(w);
                stem = fp[1];
                re2 = new RegExp(s_v);
                if (re2.test(stem)) {
                    w = stem;
                    re2 = /(at|bl|iz)$/;
                    re3 = new RegExp("([^aeiouylsz])\\1$");
                    re4 = new RegExp("^" + C + v + "[^aeiouwxy]$");
                    if (re2.test(w)) {
                        w = w + "e";
                    } else if (re3.test(w)) {
                        re = /.$/;
                        w = w.replace(re, "");
                    } else if (re4.test(w)) {
                        w = w + "e";
                    }
                }
            }
            re = /^(.+?)y$/;
            if (re.test(w)) {
                fp = re.exec(w);
                stem = fp[1];
                re = new RegExp(s_v);
                if (re.test(stem)) {
                    w = stem + "i";
                }
            }
            re = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
            if (re.test(w)) {
                fp = re.exec(w);
                stem = fp[1];
                suffix = fp[2];
                re = new RegExp(mgr0);
                if (re.test(stem)) {
                    w = stem + step2list[suffix];
                }
            }
            re = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
            if (re.test(w)) {
                fp = re.exec(w);
                stem = fp[1];
                suffix = fp[2];
                re = new RegExp(mgr0);
                if (re.test(stem)) {
                    w = stem + step3list[suffix];
                }
            }
            re = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
            re2 = /^(.+?)(s|t)(ion)$/;
            if (re.test(w)) {
                fp = re.exec(w);
                stem = fp[1];
                re = new RegExp(mgr1);
                if (re.test(stem)) {
                    w = stem;
                }
            } else if (re2.test(w)) {
                fp = re2.exec(w);
                stem = fp[1] + fp[2];
                re2 = new RegExp(mgr1);
                if (re2.test(stem)) {
                    w = stem;
                }
            }
            re = /^(.+?)e$/;
            if (re.test(w)) {
                fp = re.exec(w);
                stem = fp[1];
                re = new RegExp(mgr1);
                re2 = new RegExp(meq1);
                re3 = new RegExp("^" + C + v + "[^aeiouwxy]$");
                if (re.test(stem) || (re2.test(stem) && !(re3.test(stem)))) {
                    w = stem;
                }
            }
            re = /ll$/;
            re2 = new RegExp(mgr1);
            if (re.test(w) && re2.test(w)) {
                re = /.$/;
                w = w.replace(re, "");
            }
            if (firstch == "y") {
                w = firstch.toLowerCase() + w.substr(1);
            }
            return w;
        }
    },
    add_synonyms_to_tweets: function(original_tweets) {
        var res = []
        original_tweets.forEach(function(tweet, i) {
            var inner = {};
            inner["original_tweet"] = tweet;
            var clean_tweet = utility.clean_tweet(tweet);
            //var stemmed_tweet = utility.stem_tweet(clean_tweet)
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

/*
Parse.Cloud.define("topic_analysis", async (req) => {
    incoming_text = req.params.text;
    results = utility.pipeline(incoming_text, thesaurus)
    return (results)
})
*/