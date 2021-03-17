

Array.prototype.diff = function(a) {
    return this.filter(function(i) {
        return a.indexOf(i) < 0;
    });
};
var common_words = ["a", "ability", "able", "about", "above", "accept", "according", "account", "across", "act", "action", "activity", "actually", "add", "address", "administration", "admit", "adult", "affect", "after", "again", "against", "age", "agency", "agent", "ago", "agree", "agreement", "ahead", "air", "all", "allow", "almost", "alone", "along", "already", "also", "although", "always", "American", "among", "amount", "analysis", "and", "animal", "another", "answer", "any", "anyone", "anything", "appear", "apply", "approach", "area", "argue", "arm", "around", "arrive", "art", "article", "artist", "as", "ask", "assume", "at", "attack", "attention", "attorney", "audience", "author", "authority", "available", "avoid", "away", "baby", "back", "bad", "bag", "ball", "bank", "bar", "base", "be", "beat", "beautiful", "because", "become", "bed", "before", "begin", "behavior", "behind", "believe", "benefit", "best", "better", "between", "beyond", "big", "bill", "billion", "bit", "black", "blood", "blue", "board", "body", "book", "born", "both", "box", "boy", "break", "bring", "brother", "budget", "build", "building", "business", "but", "buy", "by", "call", "camera", "campaign", "can", "cancer", "candidate", "capital", "car", "card", "care", "career", "carry", "case", "catch", "cause", "cell", "center", "central", "century", "certain", "certainly", "chair", "challenge", "chance", "change", "character", "charge", "check", "child", "choice", "choose", "church", "citizen", "city", "civil", "claim", "class", "clear", "clearly", "close", "coach", "cold", "collection", "college", "color", "come", "commercial", "common", "community", "company", "compare", "computer", "concern", "condition", "conference", "Congress", "consider", "consumer", "contain", "continue", "control", "cost", "could", "country", "couple", "course", "court", "cover", "create", "crime", "cultural", "culture", "cup", "current", "customer", "cut", "dark", "data", "daughter", "day", "dead", "deal", "death", "debate", "decade", "decide", "decision", "deep", "defense", "degree", "Democrat", "democratic", "describe", "design", "despite", "detail", "determine", "develop", "development", "die", "difference", "different", "difficult", "dinner", "direction", "director", "discover", "discuss", "discussion", "disease", "do", "doctor", "dog", "door", "down", "draw", "dream", "drive", "drop", "drug", "during", "each", "early", "east", "easy", "eat", "economic", "economy", "edge", "education", "effect", "effort", "eight", "either", "election", "else", "employee", "end", "energy", "enjoy", "enough", "enter", "entire", "environment", "environmental", "especially", "establish", "even", "evening", "event", "ever", "every", "everybody", "everyone", "everything", "evidence", "exactly", "example", "executive", "exist", "expect", "experience", "expert", "explain", "eye", "face", "fact", "factor", "fail", "fall", "family", "far", "fast", "father", "fear", "federal", "feel", "feeling", "few", "field", "fight", "figure", "fill", "film", "final", "finally", "financial", "find", "fine", "finger", "finish", "fire", "firm", "first", "fish", "five", "floor", "fly", "focus", "follow", "food", "foot", "for", "force", "foreign", "forget", "form", "former", "forward", "four", "free", "friend", "from", "front", "full", "fund", "future", "game", "garden", "gas", "general", "generation", "get", "girl", "give", "glass", "go", "goal", "good", "government", "great", "green", "ground", "group", "grow", "growth", "guess", "gun", "guy", "hair", "half", "hand", "hang", "happen", "happy", "hard", "have", "he", "head", "health", "hear", "heart", "heat", "heavy", "help", "her", "here", "herself", "high", "him", "himself", "his", "history", "hit", "hold", "home", "hope", "hospital", "hot", "hotel", "hour", "house", "how", "however", "huge", "human", "hundred", "husband", "I", "idea", "identify", "if", "image", "imagine", "impact", "important", "improve", "in", "include", "including", "increase", "indeed", "indicate", "individual", "industry", "information", "inside", "instead", "institution", "interest", "interesting", "international", "interview", "into", "investment", "involve", "issue", "it", "item", "its", "itself", "job", "join", "just", "keep", "key", "kid", "kill", "kind", "kitchen", "know", "knowledge", "land", "language", "large", "last", "late", "later", "laugh", "law", "lawyer", "lay", "lead", "leader", "learn", "least", "leave", "left", "leg", "legal", "less", "let", "letter", "level", "lie", "life", "light", "like", "likely", "line", "list", "listen", "little", "live", "local", "long", "look", "lose", "loss", "lot", "love", "low", "machine", "magazine", "main", "maintain", "major", "majority", "make", "man", "manage", "management", "manager", "many", "market", "marriage", "material", "matter", "may", "maybe", "me", "mean", "measure", "media", "medical", "meet", "meeting", "member", "memory", "mention", "message", "method", "middle", "might", "military", "million", "mind", "minute", "miss", "mission", "model", "modern", "moment", "money", "month", "more", "morning", "most", "mother", "mouth", "move", "movement", "movie", "Mr", "Mrs", "much", "music", "must", "my", "myself", "name", "nation", "national", "natural", "nature", "near", "nearly", "necessary", "need", "network", "never", "new", "news", "newspaper", "next", "nice", "night", "no", "none", "nor", "north", "not", "note", "nothing", "notice", "now", "n't", "number", "occur", "of", "off", "offer", "office", "officer", "official", "often", "oh", "oil", "ok", "old", "on", "once", "one", "only", "onto", "open", "operation", "opportunity", "option", "or", "order", "organization", "other", "others", "our", "out", "outside", "over", "own", "owner", "page", "pain", "painting", "paper", "parent", "part", "participant", "particular", "particularly", "partner", "party", "pass", "past", "patient", "pattern", "pay", "peace", "people", "per", "perform", "performance", "perhaps", "period", "person", "personal", "phone", "physical", "pick", "picture", "piece", "place", "plan", "plant", "play", "player", "PM", "point", "police", "policy", "political", "politics", "poor", "popular", "population", "position", "positive", "possible", "power", "practice", "prepare", "present", "president", "pressure", "pretty", "prevent", "price", "private", "probably", "problem", "process", "produce", "product", "production", "professional", "professor", "program", "project", "property", "protect", "prove", "provide", "public", "pull", "purpose", "push", "put", "quality", "question", "quickly", "quite", "race", "radio", "raise", "range", "rate", "rather", "reach", "read", "ready", "real", "reality", "realize", "really", "reason", "receive", "recent", "recently", "recognize", "record", "red", "reduce", "reflect", "region", "relate", "relationship", "religious", "remain", "remember", "remove", "report", "represent", "Republican", "require", "research", "resource", "respond", "response", "responsibility", "rest", "result", "return", "reveal", "rich", "right", "rise", "risk", "road", "rock", "role", "room", "rule", "run", "safe", "same", "save", "say", "scene", "school", "science", "scientist", "score", "sea", "season", "seat", "second", "section", "security", "see", "seek", "seem", "sell", "send", "senior", "sense", "series", "serious", "serve", "service", "set", "seven", "several", "sex", "sexual", "shake", "share", "she", "shoot", "short", "shot", "should", "shoulder", "show", "side", "sign", "significant", "similar", "simple", "simply", "since", "sing", "single", "sister", "sit", "site", "situation", "six", "size", "skill", "skin", "small", "smile", "so", "social", "society", "soldier", "some", "somebody", "someone", "something", "sometimes", "son", "song", "soon", "sort", "sound", "source", "south", "southern", "space", "speak", "special", "specific", "speech", "spend", "sport", "spring", "staff", "stage", "stand", "standard", "star", "start", "state", "statement", "station", "stay", "step", "still", "stock", "stop", "store", "story", "strategy", "street", "strong", "structure", "student", "study", "stuff", "style", "subject", "success", "successful", "such", "suddenly", "suffer", "suggest", "summer", "support", "sure", "surface", "system", "table", "take", "talk", "task", "tax", "teach", "teacher", "team", "technology", "television", "tell", "ten", "tend", "term", "test", "than", "thank", "that", "the", "their", "them", "themselves", "then", "theory", "there", "these", "they", "thing", "think", "third", "this", "those", "though", "thought", "thousand", "threat", "three", "through", "throughout", "throw", "thus", "time", "to", "today", "together", "tonight", "too", "top", "total", "tough", "toward", "town", "trade", "traditional", "training", "travel", "treat", "treatment", "tree", "trial", "trip", "trouble", "true", "truth", "try", "turn", "TV", "two", "type", "under", "understand", "unit", "until", "up", "upon", "us", "use", "usually", "value", "various", "very", "victim", "view", "violence", "visit", "voice", "vote", "wait", "walk", "wall", "want", "war", "watch", "water", "way", "we", "weapon", "wear", "week", "weight", "well", "west", "western", "what", "whatever", "when", "where", "whether", "which", "while", "white", "who", "whole", "whom", "whose", "why", "wide", "wife", "will", "win", "wind", "window", "wish", "with", "within", "without", "woman", "wonder", "word", "work", "worker", "world", "worry", "would", "write", "writer", "wrong", "yard", "yeah", "year", "yes", "yet", "you", "young", "your", "yourself"]
var months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
var stemmer = (function() {
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
    function dummyDebug() {}

    function realDebug() {
        console.log(Array.prototype.slice.call(arguments).join(' '));
    }
    return function(w, debug) {
        var stem,
            suffix,
            firstch,
            re,
            re2,
            re3,
            re4,
            debugFunction,
            origword = w;
        if (debug) {
            debugFunction = realDebug;
        } else {
            debugFunction = dummyDebug;
        }
        if (w.length < 3) {
            return w;
        }
        firstch = w.substr(0, 1);
        if (firstch == "y") {
            w = firstch.toUpperCase() + w.substr(1);
        }
        // Step 1a
        re = /^(.+?)(ss|i)es$/;
        re2 = /^(.+?)([^s])s$/;
        if (re.test(w)) {
            w = w.replace(re, "$1$2");
            debugFunction('1a', re, w);
        } else if (re2.test(w)) {
            w = w.replace(re2, "$1$2");
            debugFunction('1a', re2, w);
        }
        // Step 1b
        re = /^(.+?)eed$/;
        re2 = /^(.+?)(ed|ing)$/;
        if (re.test(w)) {
            var fp = re.exec(w);
            re = new RegExp(mgr0);
            if (re.test(fp[1])) {
                re = /.$/;
                w = w.replace(re, "");
                debugFunction('1b', re, w);
            }
        } else if (re2.test(w)) {
            var fp = re2.exec(w);
            stem = fp[1];
            re2 = new RegExp(s_v);
            if (re2.test(stem)) {
                w = stem;
                debugFunction('1b', re2, w);
                re2 = /(at|bl|iz)$/;
                re3 = new RegExp("([^aeiouylsz])\\1$");
                re4 = new RegExp("^" + C + v + "[^aeiouwxy]$");
                if (re2.test(w)) {
                    w = w + "e";
                    debugFunction('1b', re2, w);
                } else if (re3.test(w)) {
                    re = /.$/;
                    w = w.replace(re, "");
                    debugFunction('1b', re3, w);
                } else if (re4.test(w)) {
                    w = w + "e";
                    debugFunction('1b', re4, w);
                }
            }
        }
        // Step 1c
        re = new RegExp("^(.*" + v + ".*)y$");
        if (re.test(w)) {
            var fp = re.exec(w);
            stem = fp[1];
            w = stem + "i";
            debugFunction('1c', re, w);
        }
        // Step 2
        re = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
        if (re.test(w)) {
            var fp = re.exec(w);
            stem = fp[1];
            suffix = fp[2];
            re = new RegExp(mgr0);
            if (re.test(stem)) {
                w = stem + step2list[suffix];
                debugFunction('2', re, w);
            }
        }
        // Step 3
        re = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
        if (re.test(w)) {
            var fp = re.exec(w);
            stem = fp[1];
            suffix = fp[2];
            re = new RegExp(mgr0);
            if (re.test(stem)) {
                w = stem + step3list[suffix];
                debugFunction('3', re, w);
            }
        }
        // Step 4
        re = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
        re2 = /^(.+?)(s|t)(ion)$/;
        if (re.test(w)) {
            var fp = re.exec(w);
            stem = fp[1];
            re = new RegExp(mgr1);
            if (re.test(stem)) {
                w = stem;
                debugFunction('4', re, w);
            }
        } else if (re2.test(w)) {
            var fp = re2.exec(w);
            stem = fp[1] + fp[2];
            re2 = new RegExp(mgr1);
            if (re2.test(stem)) {
                w = stem;
                debugFunction('4', re2, w);
            }
        }
        // Step 5
        re = /^(.+?)e$/;
        if (re.test(w)) {
            var fp = re.exec(w);
            stem = fp[1];
            re = new RegExp(mgr1);
            re2 = new RegExp(meq1);
            re3 = new RegExp("^" + C + v + "[^aeiouwxy]$");
            if (re.test(stem) || (re2.test(stem) && !(re3.test(stem)))) {
                w = stem;
                debugFunction('5', re, re2, re3, w);
            }
        }
        re = /ll$/;
        re2 = new RegExp(mgr1);
        if (re.test(w) && re2.test(w)) {
            re = /.$/;
            w = w.replace(re, "");
            debugFunction('5', re, re2, w);
        }
        // and turn initial Y back to y
        if (firstch == "y") {
            w = firstch.toLowerCase() + w.substr(1);
        }
        return w;
    }
})();
export const utility = {
    pipeline: function(incoming_text) {
        var mapped = []
        var res = utility.process_tweets(incoming_text);
        /*
        var cluster_numbers = kmeans_results.idxs;
        incoming_text.forEach(function(tweet, i) {
            var inner = {}
            inner["tweet"] = utility.clean_tweet(tweet);
            inner["cluster_number"] = cluster_numbers[i]
            mapped.push(inner)
        })
        var res = utility.group_tweets_by_cluster(mapped)
        */
        return (res)
    },
    group_tweets_by_cluster: function(mapped) {
        var groupBy = function(xs, key) {
            return xs.reduce(function(rv, x) {
                (rv[x[key]] = rv[x[key]] || []).push(x);
                return rv;
            }, {});
        };
        return (groupBy(mapped, "cluster_number"));
    },
    process_tweets: function(incoming_text) {
        var cleaned_text_arr = incoming_text.map(function(x) {
            return (utility.clean_tweet(x))
        });
        var a = cleaned_text_arr.map(function(x) {
            return (utility.find_longest_word(x).join(", "))
        });
        var b = a.map(function(x) {
            return (utility.remove_stopwords(x))
        });
        var c = b.map(function(x) {
            return (utility.clean_tweet(x))
        });
        var d = c.map(function(x) {
            return (utility.strip_names(x))
        });
        var e = d.map(function(x) {
            return (utility.remove_special_chars(x))
        });
        var f = e.map(function(x) {
            return (utility.remove_common_words(x))
        });   
        var g = f.map(function(x) {
            return (utility.remove_months(x))
        });
        var h = g.map(function(x) {
            return (utility.stem_words(x))
        });
        return(h)
    },
    read_tweets: function(incoming_text) {
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
    remove_common_words : function(tweet) {
        var res = [];
        tweet.split(" ").forEach(function(word) {
            if(!common_words.includes(word)) {
                res.push(word)
            }
        })
        return(res.join(" "))
    },
    remove_months : function(tweet) {
        var res = [];
        tweet.split(" ").forEach(function(word) {
            if(!months.includes(word)) {
                res.push(word)
            }
        })
        return(res.join(" "))
    },
    stem_words : function(tweet) {
        var stems = [];
        tweet.split(" ").forEach(function(word) {
            stems.push(stemmer(word))
        })
        var res = {
            original_tweeet : tweet,
            stemmed_tweet : stems.join(" ")
        }
        return(res)
    },
    find_topics: function(arr) {
        var res = [];
        var raw_topics = [];
        arr.forEach(function(str) {
            var cleaned = utility.clean_tweet(str);
            var top_3 = utility.find_longest_word(cleaned, 3);
            var top_synonyms = [];
            top_3.forEach(function(long_word) {
                top_synonyms.push(utility.find_synonyms(long_word).synonyms);
            })
            var inner = {};
            inner["tweet"] = str;
            inner["synonym"] = top_synonyms;
            res.push(inner)
        })
        return (res);
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
    chunk_array: function(arr, chunk_size) {
        var res = arr.reduce((resultArray, item, index) => {
            const chunkIndex = Math.floor(index / chunk_size)
            if (!resultArray[chunkIndex]) {
                resultArray[chunkIndex] = []
            }
            resultArray[chunkIndex].push(item)
            return resultArray
        }, [])
        return (res)
    },
    delay_loop: function(fn, delay) {
        return (name, i) => {
            setTimeout(() => {
                fn(name);
            }, i * delay);
        }
    }
}
/*
Parse.Cloud.define("topic_analysis", async (req) => { 
    incoming_text = req.params.text;
    results = utility.pipeline(incoming_text)
    return(results)
})
*/