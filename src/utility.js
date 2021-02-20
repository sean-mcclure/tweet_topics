export const utility = {
    pipeline : function() {
        var tweets = utility.read_tweets()
        var tweets_clean = utility.remove_stopwords(tweets)
        var tweets_clean_lower = utility.lowercase(tweets_clean)
        var tweets_clean_lower_clean = utility.remove_mentions_from_tweet(tweets_clean_lower)
        var tweets_clean_lower_clean_nonum = utility.strip_from_existing(tweets_clean_lower_clean)
        var tweets_clean_lower_clean_nonum_trimmed = utility.trim(tweets_clean_lower_clean_nonum)
        var tweets_clean_lower_clean_nonum_trimmed_deduped = utility.dedupe_within_tweet(tweets_clean_lower_clean_nonum_trimmed)
        var tweets_clean_lower_clean_nonum_trimmed_less = utility.remove_blanks(tweets_clean_lower_clean_nonum_trimmed_deduped)

        var topics = utility.find_topics(tweets_clean_lower_clean_nonum_trimmed_less)

        var fin = utility.text_distances(topics, tweets)




        //var topics_occurences = utility.count_occurences(topics)
        //var topics_occurences_sorted = utility.sort_object_by_value(topics_occurences)


        console.log(fin)
    },
    read_tweets: function() {
        var cleaned_tweets = []
        var tweets = document.getElementById("textarea").value;
        tweets = tweets.split("\n");
        return(tweets)
    },
    remove_stopwords: function(arr) {
        var stopwords = ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now']
        var res = []
        arr.forEach(function(str) {
            var temp = []
            var words = str.split(' ')
            for (var i = 0; i < words.length; i++) {
                var word_clean = words[i].split(".").join("")
                if (!stopwords.includes(word_clean)) {
                    temp.push(word_clean)
                }
            }
            res.push(temp.join(" "))
            })
        return (res)
    },
    lowercase : function(arr) {
        var res = [];
        arr.forEach(function(elem) {
            res.push(elem.toLowerCase())
        })
        return(res)
    },
    remove_mentions_from_tweet: function(arr) {
        var res = []
        arr.forEach(function(tweet) {
            var temp = []
            tweet.split(" ").forEach(function(word) {
                if(!word.includes("@")) {
                    temp.push(word)
                }
            })
            var pieced_back_togeter = temp.join(" ")
            res.push(pieced_back_togeter)
        })
        return(res)
    },
    strip_from_existing : function(arr) {
        var res = [];
        arr.forEach(function(elem) {
            res.push(elem.split("“").join("")
                .split("/").join(" ")
                .split("_").join("")
                .split('"').join("")
                .split("*").join("")
                .split("(").join("")
                .split(")").join("")
                .split("#").join("")
                .split("?").join("")
                .split(";").join("")
                .split(":").join("")
                .split(",").join("")
                .split("1").join("")
                .split("2").join("")
                .split("3").join("")
                .split("4").join("")
                .split("5").join("")
                .split("6").join("")
                .split("7").join("")
                .split("8").join("")
                .split("9").join("")
                .split("0").join("")
                )
        })
        return(res)
    },
    trim : function(arr) {
        var res = []
        arr.forEach(function(elem) {
            res.push(elem.trim())
        })
        return(res)
    },
    remove_blanks :  function(arr) {
        var res = []
        arr.forEach(function(elem) {
            if(elem !== "") {
                res.push(elem)
            }
        })
        return(res)
    },
    find_longest_word: function(str) {
        var longest = str.split(" ").sort(function(a, b) {return b.length - a.length}).slice(0,3)
        return (longest)
    },
    find_topics : function(arr) {
        var raw_topics = [];
        arr.forEach(function(str) {
            raw_topics.push(utility.find_longest_word(str));
        })
        return(raw_topics)
    },
    count_occurences : function(arr) {
        var counts = {};
        for (var i = 0; i < arr.length; i++) {
            var num = arr[i];
            counts[num] = counts[num] ? counts[num] + 1 : 1;
        }
        return(counts)
    },
    sort_object_by_value : function(obj) {
        return(Object.entries(obj).sort(([,a],[,b]) => a-b))
    },
    dedupe_within_tweet: function(arr) {
        var res = []
        arr.forEach(function(tweet) {
            var temp = []
            tweet.split(" ").forEach(function(word) {
                if(!temp.includes(word)) {
                    temp.push(word)
                }
            })
            var pieced_back_togeter = temp.join(" ")
            res.push(pieced_back_togeter)
        })
        return(res)
    },
    termFreqMap : function(str) {
        var words = str.split(' ');
        var termFreq = {};
        words.forEach(function(w) {
            termFreq[w] = (termFreq[w] || 0) + 1;
        });
        return termFreq;
    },
    addKeysToDict : function(map, dict) {
        for (var key in map) {
            dict[key] = true;
        }
    },
    termFreqMapToVector : function (map, dict) {
        var termFreqVector = [];
        for (var term in dict) {
            termFreqVector.push(map[term] || 0);
        }
        return termFreqVector;
    },
    vecDotProduct : function (vecA, vecB) {
        var product = 0;
        for (var i = 0; i < vecA.length; i++) {
            product += vecA[i] * vecB[i];
        }
        return product;
    },
    vecMagnitude : function(vec) {
        var sum = 0;
        for (var i = 0; i < vec.length; i++) {
            sum += vec[i] * vec[i];
        }
        return Math.sqrt(sum);
    },
    cosineSimilarity : function (vecA, vecB) {
        return utility.vecDotProduct(vecA, vecB) / (utility.vecMagnitude(vecA) * utility.vecMagnitude(vecB));
    },
    textCosineSimilarity : function (strA, strB) {
        var termFreqA = utility.termFreqMap(strA);
        var termFreqB = utility.termFreqMap(strB);
        var dict = {};
        utility.addKeysToDict(termFreqA, dict);
        utility.addKeysToDict(termFreqB, dict);
        var termFreqVecA = utility.termFreqMapToVector(termFreqA, dict);
        var termFreqVecB = utility.termFreqMapToVector(termFreqB, dict);
        return utility.cosineSimilarity(termFreqVecA, termFreqVecB);
    },
    text_distances :  function(topics, original_tweets) {
        var res = []
        original_tweets.forEach(function(tweet) {
            topics.forEach(function(topics_arr) {
                var topic_str = topics_arr.join(" ")
                var dist = utility.textCosineSimilarity(topic_str, tweet)
                var inner = {}
                inner["topic"] = topic_str;
                inner["original_tweet"] = tweet;
                inner["cosine_distance"] = dist;
                res.push(inner)
            })
        })
        return(res)
    }
}