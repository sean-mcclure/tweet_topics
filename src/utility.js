export const utility = {
    pipeline : function() {
        var tweets = utility.read_tweets()
        var tweets_clean = utility.remove_stopwords(tweets)
        var tweets_clean_lower = utility.lowercase(tweets_clean)
        var tweets_clean_lower_clean = utility.remove_special(tweets_clean_lower)
        var tweets_clean_lower_clean_nonum = utility.strip_from_existing(tweets_clean_lower_clean)
        var tweets_clean_lower_clean_nonum_trimmed = utility.trim(tweets_clean_lower_clean_nonum)
        var topics = utility.find_topics(tweets_clean_lower_clean_nonum_trimmed)


        console.log(topics)
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
    remove_special: function(arr) {
        var res = arr.filter(function(x) {
            return (!x.includes("@") && !x.includes("http") && !x.includes("’"));
        });
        return (res)
    },
    strip_from_existing : function(arr) {
        var res = [];
        arr.forEach(function(elem) {
            res.push(elem.split("“").join("")
                .split("/").join("")
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
     find_topics : function(arr) {
        var raw_topics = [];
        arr.forEach(function(str) {
            raw_topics.push(utility.find_longest_word(str));
        })
        return(raw_topics)
    },
    dedupe: function(arr) {
        var res = arr.filter(function(item, pos, self) {
            return self.indexOf(item) == pos;
        })
        return(res)
    },
    find_longest_word: function(str) {
        var longest = str.split(" ").sort(function(a, b) {
            return b.length - a.length;
        })[0];
        return (longest)
    },
    get_all_hashes : function(arr) {
        var res = [];
        arr.forEach(function(elem) {
            if(elem.includes("#")) {
                res.push(elem.toLowerCase())
            }
        })
        return(res)
    },
    map_topics_to_original_text : function(arr, labels) {
        var res = [];
        arr.forEach(function(txt, i) {
            labels.forEach(function(label, i) {
                var inner = {};
                if(txt.includes(label)) {
                    inner["label"] = label;
                    inner["text"] = txt;
                    res.push(inner);
                }
            })
        })
        return(res)
    }
}