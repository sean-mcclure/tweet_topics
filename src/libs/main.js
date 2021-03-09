var tm = require("text-miner");
const skmeans = require("skmeans");
Array.prototype.diff = function(a) {
    return this.filter(function(i) {
        return a.indexOf(i) < 0;
    });
};
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
        var kmeans_results = utility.process_tweets(incoming_text);
        var cluster_numbers = kmeans_results.idxs;
        incoming_text.forEach(function(tweet, i) {
            var inner = {}
            inner["tweet"] = utility.clean_tweet(tweet);
            inner["cluster_number"] = cluster_numbers[i]
            mapped.push(inner)
        })
        var res = utility.group_tweets_by_cluster(mapped)
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
        var cleaned_text = incoming_text.map(function(x) {
            return (utility.clean_tweet(x))
        });
        var cleaned_text_longest = incoming_text.map(function(x) {
            return (utility.find_longest_word(x).join(", "))
        });
        var my_corpus = new tm.Corpus(cleaned_text_longest);
        var bobo = my_corpus.removeWords(tm.STOPWORDS.EN)
        var terms = new tm.DocumentTermMatrix(bobo);
        var vectors = terms.data;
        var kmeans_results = utility.kmeans(cleaned_text, vectors, 100)
        return (kmeans_results)
    },
    read_tweets: function(incoming_text) {
        var tweets = JSON.parse(incoming_text);
        return (tweets)
    },
    get_thesaurus: function() {
        return ([{
            "word": "a",
            "synonyms": ["A", "letter a"]
        }, {
            "word": "abandon",
            "synonyms": ["unconstraint", "wantonness"]
        }, {
            "word": "ability",
            "synonyms": ["power"]
        }, {
            "word": "able",
            "synonyms": ["able-bodied", "healthy", "fit"]
        }, {
            "word": "abortion",
            "synonyms": ["miscarriage"]
        }, {
            "word": "about",
            "synonyms": ["astir", "active"]
        }, {
            "word": "above",
            "synonyms": ["preceding"]
        }, {
            "word": "abroad",
            "synonyms": ["foreign", "overseas"]
        }, {
            "word": "absence",
            "synonyms": ["petit mal epilepsy"]
        }, {
            "word": "absolute",
            "synonyms": ["arbitrary"]
        }, {
            "word": "absolutely",
            "synonyms": ["perfectly", "dead", "utterly"]
        }, {
            "word": "absorb",
            "synonyms": ["assimilate", "take in", "ingest"]
        }, {
            "word": "abuse",
            "synonyms": ["insult", "contumely", "revilement", "vilification"]
        }, {
            "word": "academic",
            "synonyms": ["scholarly", "donnish", "pedantic"]
        }, {
            "word": "accept",
            "synonyms": ["admit", "take on", "take"]
        }, {
            "word": "access",
            "synonyms": ["access code"]
        }, {
            "word": "accident",
            "synonyms": ["fortuity", "chance event"]
        }, {
            "word": "accompany",
            "synonyms": ["go with", "attach to", "come with"]
        }, {
            "word": "accomplish",
            "synonyms": ["attain", "reach", "achieve"]
        }, {
            "word": "according",
            "synonyms": ["accordant"]
        }, {
            "word": "account",
            "synonyms": ["account statement", "accounting"]
        }, {
            "word": "accurate",
            "synonyms": ["veracious", "high-fidelity", "right", "correct", "surgical", "faithful", "precise", "exact", "true", "close", "dead on target", "hi-fi", "dead-on", "straight"]
        }, {
            "word": "accuse",
            "synonyms": ["charge"]
        }, {
            "word": "achieve",
            "synonyms": ["attain", "reach", "accomplish"]
        }, {
            "word": "achievement",
            "synonyms": ["accomplishment"]
        }, {
            "word": "acid",
            "synonyms": ["venomous", "caustic", "vitriolic", "unpleasant", "acerbic", "acrid", "sulfurous", "acerb", "virulent", "blistering", "bitter", "sulphurous"]
        }, {
            "word": "acknowledge",
            "synonyms": ["admit"]
        }, {
            "word": "acquire",
            "synonyms": ["adopt", "take on", "take", "assume"]
        }, {
            "word": "across",
            "synonyms": ["crossways", "crosswise"]
        }, {
            "word": "act",
            "synonyms": ["enactment"]
        }, {
            "word": "action",
            "synonyms": ["action mechanism"]
        }, {
            "word": "active",
            "synonyms": ["astir", "hot", "athletic", "quick", "about", "acrobatic", "nimble", "overactive", "spry", "agile", "hyperactive", "on the go", "sporty", "gymnastic", "lively", "energetic"]
        }, {
            "word": "activist",
            "synonyms": ["active", "activistic"]
        }, {
            "word": "activity",
            "synonyms": ["action", "activenes"]
        }, {
            "word": "actor",
            "synonyms": ["worker", "doer"]
        }, {
            "word": "actual",
            "synonyms": ["current"]
        }, {
            "word": "actually",
            "synonyms": ["in reality"]
        }, {
            "word": "ad",
            "synonyms": ["AD", "anno Domini", "A.D."]
        }, {
            "word": "adapt",
            "synonyms": ["accommodate"]
        }, {
            "word": "add",
            "synonyms": ["hyperkinetic syndrome", "MBD", "minimal brain dysfunction", "attention deficit hyperactivity disorder", "ADD", "minimal brain damage", "attention deficit disorder", "ADHD"]
        }, {
            "word": "addition",
            "synonyms": ["accession"]
        }, {
            "word": "additional",
            "synonyms": ["additive", "extra"]
        }, {
            "word": "address",
            "synonyms": ["computer address"]
        }, {
            "word": "adequate",
            "synonyms": ["adequate to", "satisfactory", "capable", "competent", "equal to", "up to"]
        }, {
            "word": "adjust",
            "synonyms": ["align", "line up", "aline"]
        }, {
            "word": "adjustment",
            "synonyms": ["fitting", "accommodation"]
        }, {
            "word": "administration",
            "synonyms": ["disposal"]
        }, {
            "word": "administrator",
            "synonyms": ["decision maker"]
        }, {
            "word": "admire",
            "synonyms": ["look up to"]
        }, {
            "word": "admission",
            "synonyms": ["admittance"]
        }, {
            "word": "admit",
            "synonyms": ["take on", "take", "accept"]
        }, {
            "word": "adolescent",
            "synonyms": ["immature"]
        }, {
            "word": "adopt",
            "synonyms": ["take over", "take on", "assume"]
        }, {
            "word": "adult",
            "synonyms": ["mature", "fully grown", "full-grown", "grown", "big", "grownup"]
        }, {
            "word": "advance",
            "synonyms": ["front", "in advance", "advanced"]
        }, {
            "word": "advanced",
            "synonyms": ["front", "in advance", "advance"]
        }, {
            "word": "advantage",
            "synonyms": ["reward"]
        }, {
            "word": "adventure",
            "synonyms": ["risky venture", "escapade", "dangerous undertaking"]
        }, {
            "word": "advertising",
            "synonyms": ["ad", "advert", "advertizing", "advertizement", "advertisement"]
        }, {
            "word": "advise",
            "synonyms": ["give notice", "notify", "apprise", "send word", "apprize"]
        }, {
            "word": "adviser",
            "synonyms": ["advisor", "consultant"]
        }, {
            "word": "advocate",
            "synonyms": ["advocator", "exponent", "proponent"]
        }, {
            "word": "affair",
            "synonyms": ["liaison", "affaire", "intimacy", "involvement", "amou"]
        }, {
            "word": "affect",
            "synonyms": ["pretend", "dissemble", "feign", "sham"]
        }, {
            "word": "afford",
            "synonyms": ["give", "open"]
        }, {
            "word": "afraid",
            "synonyms": ["agoraphobic", "mysophobic", "afeared", "aquaphobic", "fearful", "claustrophobic", "terrified", "panic-struck", "xenophobic", "apprehensive", "dismayed", "shocked", "bullied", "horror-stricken", "panic-stricken", "aghast", "petrified", "algophobic", "white-lipped", "frightened", "triskaidekaphobic", "panicked", "terror-stricken", "appalled", "scared", "afeard", "hunted", "hangdog", "terror-struck", "unnerved", "alarmed", "horrified", "timid", "hydrophobic", "panicky", "numb", "intimidated", "acrophobic", "browbeaten", "horror-struck", "cowardly", "cowed"]
        }, {
            "word": "african",
            "synonyms": ["African", "continent"]
        }, {
            "word": "african-american",
            "synonyms": ["Afro-American", "black", "African-American"]
        }, {
            "word": "after",
            "synonyms": ["aft"]
        }, {
            "word": "afternoon",
            "synonyms": ["good afternoon"]
        }, {
            "word": "again",
            "synonyms": ["once again", "over again", "once more"]
        }, {
            "word": "age",
            "synonyms": ["eld"]
        }, {
            "word": "agency",
            "synonyms": ["government agency", "office", "bureau", "federal agency", "authority"]
        }, {
            "word": "agenda",
            "synonyms": ["order of business", "agendum"]
        }, {
            "word": "agent",
            "synonyms": ["agentive role"]
        }, {
            "word": "aggressive",
            "synonyms": ["predatory", "ravening", "rapacious", "scrappy", "vulturine", "offensive", "raptorial", "combative", "assertive", "battleful", "bellicose", "hostile", "self-asserting", "competitive", "high-pressure", "obstreperous", "rough", "vulturous", "militant", "pugnacious", "truculent", "in-your-face", "self-assertive", "hard-hitting"]
        }, {
            "word": "ago",
            "synonyms": ["past", "agone"]
        }, {
            "word": "agree",
            "synonyms": ["harmonize", "harmonise", "concord", "fit in", "consort", "accord"]
        }, {
            "word": "agreement",
            "synonyms": ["accord"]
        }, {
            "word": "agricultural",
            "synonyms": ["rural", "agrarian", "farming"]
        }, {
            "word": "ahead",
            "synonyms": ["in the lead", "up", "leading"]
        }, {
            "word": "aid",
            "synonyms": ["assist", "assistance", "help"]
        }, {
            "word": "aide",
            "synonyms": ["adjutant", "aide-de-camp"]
        }, {
            "word": "aids",
            "synonyms": ["AIDS", "acquired immune deficiency syndrome"]
        }, {
            "word": "aim",
            "synonyms": ["bearing", "heading"]
        }, {
            "word": "air",
            "synonyms": ["flying", "free-flying", "aerial"]
        }, {
            "word": "airline",
            "synonyms": ["air hose"]
        }, {
            "word": "airport",
            "synonyms": ["aerodrome", "airdrome", "drome"]
        }, {
            "word": "album",
            "synonyms": ["record album"]
        }, {
            "word": "alcohol",
            "synonyms": ["inebriant", "alcoholic beverage", "intoxicant"]
        }, {
            "word": "alive",
            "synonyms": ["active", "existing", "existent"]
        }, {
            "word": "all",
            "synonyms": ["complete"]
        }, {
            "word": "alliance",
            "synonyms": ["bond"]
        }, {
            "word": "allow",
            "synonyms": ["admit"]
        }, {
            "word": "ally",
            "synonyms": ["friend"]
        }, {
            "word": "almost",
            "synonyms": ["all but", "most", "about", "virtually", "well-nig", "nearly", "just about", "nigh", "near"]
        }, {
            "word": "alone",
            "synonyms": ["lone", "lonely", "solitary", "unaccompanied"]
        }, {
            "word": "along",
            "synonyms": ["on"]
        }, {
            "word": "also",
            "synonyms": ["besides", "likewise", "too", "as wel"]
        }, {
            "word": "alter",
            "synonyms": ["modify", "change"]
        }, {
            "word": "alternative",
            "synonyms": ["secondary", "alternate"]
        }, {
            "word": "always",
            "synonyms": ["ever", "e'er"]
        }, {
            "word": "am",
            "synonyms": ["Am", "americium", "atomic number 95"]
        }, {
            "word": "amazing",
            "synonyms": ["surprising", "astonishing"]
        }, {
            "word": "american",
            "synonyms": ["North American nation", "North American country", "American"]
        }, {
            "word": "amount",
            "synonyms": ["quantity", "measure"]
        }, {
            "word": "analysis",
            "synonyms": ["analytic thinking"]
        }, {
            "word": "analyst",
            "synonyms": ["psychoanalyst"]
        }, {
            "word": "analyze",
            "synonyms": ["study", "examine", "canva", "analyse", "canvass"]
        }, {
            "word": "ancient",
            "synonyms": ["old"]
        }, {
            "word": "anger",
            "synonyms": ["angriness"]
        }, {
            "word": "angle",
            "synonyms": ["Angle"]
        }, {
            "word": "angry",
            "synonyms": ["smoldering", "mad", "sore", "smouldering", "indignant", "furious", "huffy", "outraged", "livid", "maddened", "ireful", "provoked", "angered", "black", "umbrageous", "infuriated", "incensed", "aggravated", "wrathful", "irate", "enraged", "hot under the collar", "irascible", "wrothful", "choleric", "wroth"]
        }, {
            "word": "animal",
            "synonyms": ["fishlike", "ameba-like", "horselike", "shrimp-like", "goat-like", "elephant-like", "ant-like", "alligator-like", "sloth-like", "snail-like", "vole-like", "scorpion-like", "amoeba-like", "mongoose-like", "perch-like", "quail-like", "snake-like", "pike-like", "siskin-like", "ostrich-like", "snake-shaped", "grub-like", "cod-like", "horse-like", "stork-like", "cricket-like", "duck-like", "sparrow-like", "hawk-like", "carp-like", "spitz-like", "beaver-like", "eaglelike", "lobster-like", "moth-like", "reptile-like", "starfish-like", "thrush-like", "animal-like", "bee-like", "insectlike", "dinosaur-like", "hawklike", "eagle-like", "troutlike", "cicada-like", "crocodile-like", "monkey-like", "cranelike", "insect-like", "dace-like", "raccoon-like", "mullet-like", "tadpole-like", "cow-like", "fox-like", "antelope-like", "lizard-like", "birdlike", "catlike", "shad-like", "whippoorwill-like", "crane-like", "foxlike", "tuna-like", "pigeon-like", "turkey-like", "deer-like", "sandpiper-like", "hare-like", "badger-like", "bird-like", "plover-like", "squirrel-like", "gull-like", "arachnid-like", "salmon-like", "cat-like", "ferret-like", "mammal-like", "herring-like", "trout-like", "finch-like", "animallike", "protozoa-like", "fish-like", "frog-like", "ray-like", "mosquito-like", "shrike-like", "pig-like", "rodent-like"]
        }, {
            "word": "anniversary",
            "synonyms": ["day of remembrance"]
        }, {
            "word": "announce",
            "synonyms": ["foretell", "harbinger", "annunciate", "herald"]
        }, {
            "word": "annual",
            "synonyms": ["one-year"]
        }, {
            "word": "another",
            "synonyms": ["some other", "other"]
        }, {
            "word": "answer",
            "synonyms": ["reply", "response"]
        }, {
            "word": "anticipate",
            "synonyms": ["expect"]
        }, {
            "word": "anxiety",
            "synonyms": ["anxiousness"]
        }, {
            "word": "any",
            "synonyms": ["whatever", "whatsoever", "some"]
        }, {
            "word": "anymore",
            "synonyms": ["any longer"]
        }, {
            "word": "anyway",
            "synonyms": ["in any case", "at any rate", "anyhow", "in any event"]
        }, {
            "word": "anywhere",
            "synonyms": ["anyplace"]
        }, {
            "word": "apart",
            "synonyms": ["unconnected", "isolated", "obscure"]
        }, {
            "word": "apartment",
            "synonyms": ["flat"]
        }, {
            "word": "apparent",
            "synonyms": ["patent", "evident", "plain", "obvious", "unmistakable", "manifest"]
        }, {
            "word": "apparently",
            "synonyms": ["evidently", "plain", "manifestly", "plainly", "patently", "obviously"]
        }, {
            "word": "appeal",
            "synonyms": ["charm", "appealingness"]
        }, {
            "word": "appear",
            "synonyms": ["come along"]
        }, {
            "word": "appearance",
            "synonyms": ["coming into court", "appearing"]
        }, {
            "word": "apple",
            "synonyms": ["Malus pumila", "orchard apple tree"]
        }, {
            "word": "application",
            "synonyms": ["applications programme", "application program"]
        }, {
            "word": "apply",
            "synonyms": ["implement", "enforce"]
        }, {
            "word": "appoint",
            "synonyms": ["charge"]
        }, {
            "word": "appointment",
            "synonyms": ["appointee"]
        }, {
            "word": "appreciate",
            "synonyms": ["apprise", "apprize", "revalue"]
        }, {
            "word": "approach",
            "synonyms": ["access"]
        }, {
            "word": "appropriate",
            "synonyms": ["advantageous", "expedient"]
        }, {
            "word": "approval",
            "synonyms": ["approving", "blessing"]
        }, {
            "word": "approve",
            "synonyms": ["O.K.", "sanction", "okay"]
        }, {
            "word": "approximately",
            "synonyms": ["about", "or s", "more or less", "some", "around", "just about", "roughly", "close to"]
        }, {
            "word": "arab",
            "synonyms": ["Arabian", "Arab"]
        }, {
            "word": "architect",
            "synonyms": ["designer"]
        }, {
            "word": "area",
            "synonyms": ["country"]
        }, {
            "word": "argue",
            "synonyms": ["fence", "debate", "contend"]
        }, {
            "word": "argument",
            "synonyms": ["argumentation", "debate"]
        }, {
            "word": "arise",
            "synonyms": ["come up", "bob up"]
        }, {
            "word": "arm",
            "synonyms": ["subdivision", "branch"]
        }, {
            "word": "armed",
            "synonyms": ["brachiate", "long-armed", "one-armed", "armlike"]
        }, {
            "word": "army",
            "synonyms": ["regular army", "ground forces"]
        }, {
            "word": "around",
            "synonyms": ["about"]
        }, {
            "word": "arrange",
            "synonyms": ["coiffur", "dress", "do", "set", "coif", "coiffe"]
        }, {
            "word": "arrangement",
            "synonyms": ["agreement"]
        }, {
            "word": "arrest",
            "synonyms": ["pinch", "collar", "catch", "taking into custody", "apprehension"]
        }, {
            "word": "arrival",
            "synonyms": ["arriver", "comer"]
        }, {
            "word": "arrive",
            "synonyms": ["come", "get"]
        }, {
            "word": "art",
            "synonyms": ["artistic creation", "artistic production"]
        }, {
            "word": "article",
            "synonyms": ["clause"]
        }, {
            "word": "artist",
            "synonyms": ["creative person"]
        }, {
            "word": "artistic",
            "synonyms": ["aesthetic", "esthetic", "pleasing", "tasteful"]
        }, {
            "word": "as",
            "synonyms": ["every bit", "equally"]
        }, {
            "word": "asian",
            "synonyms": ["Asian", "continent", "Asiatic"]
        }, {
            "word": "aside",
            "synonyms": ["apart"]
        }, {
            "word": "ask",
            "synonyms": ["enquire", "inquire"]
        }, {
            "word": "asleep",
            "synonyms": ["at peace", "at rest", "gone", "departed", "deceased", "dead"]
        }, {
            "word": "aspect",
            "synonyms": ["expression", "face", "facial expression", "look"]
        }, {
            "word": "assault",
            "synonyms": ["Assault"]
        }, {
            "word": "assert",
            "synonyms": ["aver", "avow", "swea", "affirm", "swan", "verify"]
        }, {
            "word": "assess",
            "synonyms": ["appraise", "value", "evaluate", "measure", "valuate"]
        }, {
            "word": "assessment",
            "synonyms": ["appraisal"]
        }, {
            "word": "asset",
            "synonyms": ["plus"]
        }, {
            "word": "assign",
            "synonyms": ["portion", "allot"]
        }, {
            "word": "assignment",
            "synonyms": ["appointment", "naming", "designation"]
        }, {
            "word": "assist",
            "synonyms": ["help", "aid", "assistance"]
        }, {
            "word": "assistance",
            "synonyms": ["assist", "aid", "help"]
        }, {
            "word": "assistant",
            "synonyms": ["adjunct", "subordinate", "low-level"]
        }, {
            "word": "associate",
            "synonyms": ["subordinate", "low-level"]
        }, {
            "word": "association",
            "synonyms": ["affiliation", "tie", "tie-u"]
        }, {
            "word": "assume",
            "synonyms": ["adopt", "acquire", "take", "take on"]
        }, {
            "word": "assumption",
            "synonyms": ["Assumption", "15-Aug", "Assumption of Mary"]
        }, {
            "word": "assure",
            "synonyms": ["guarantee", "secure", "insure", "ensure"]
        }, {
            "word": "at",
            "synonyms": ["astatine", "At", "atomic number 85"]
        }, {
            "word": "athlete",
            "synonyms": ["jock"]
        }, {
            "word": "athletic",
            "synonyms": ["active", "gymnastic", "acrobatic"]
        }, {
            "word": "atmosphere",
            "synonyms": ["air"]
        }, {
            "word": "attach",
            "synonyms": ["bond", "tie", "bind"]
        }, {
            "word": "attack",
            "synonyms": ["plan of attack", "approach"]
        }, {
            "word": "attempt",
            "synonyms": ["attack"]
        }, {
            "word": "attend",
            "synonyms": ["go to"]
        }, {
            "word": "attention",
            "synonyms": ["attending"]
        }, {
            "word": "attitude",
            "synonyms": ["mental attitude"]
        }, {
            "word": "attorney",
            "synonyms": ["lawyer"]
        }, {
            "word": "attract",
            "synonyms": ["appeal"]
        }, {
            "word": "attractive",
            "synonyms": ["appealing"]
        }, {
            "word": "attribute",
            "synonyms": ["dimension", "property"]
        }, {
            "word": "audience",
            "synonyms": ["interview", "consultation"]
        }, {
            "word": "author",
            "synonyms": ["generator", "source"]
        }, {
            "word": "authority",
            "synonyms": ["agency", "government agency", "office", "bureau", "federal agency"]
        }, {
            "word": "auto",
            "synonyms": ["machine", "car", "motorcar", "automobile"]
        }, {
            "word": "available",
            "synonyms": ["on tap", "acquirable", "easy", "on hand", "addressable", "in stock", "accessible", "getable", "obtainable", "open", "for sale", "ready", "procurable", "lendable", "gettable", "purchasable", "visible", "forthcoming"]
        }, {
            "word": "average",
            "synonyms": ["mediocre", "fair", "ordinary", "middling"]
        }, {
            "word": "avoid",
            "synonyms": ["head off", "deflect", "avert", "obviate", "fend off", "ward of", "stave off", "debar"]
        }, {
            "word": "award",
            "synonyms": ["accolade", "honour", "honor", "laurels"]
        }, {
            "word": "aware",
            "synonyms": ["alive", "alert", "cognizant", "awake", "sensible", "conscious", "sensitive", "cognisant"]
        }, {
            "word": "awareness",
            "synonyms": ["consciousness", "knowingness", "cognisance", "cognizance"]
        }, {
            "word": "away",
            "synonyms": ["absent", "gone", "departed"]
        }, {
            "word": "awful",
            "synonyms": ["impressive", "amazing", "awing", "awesome", "awe-inspiring"]
        }, {
            "word": "baby",
            "synonyms": ["infant", "babe"]
        }, {
            "word": "back",
            "synonyms": ["posterior", "rearward", "rear", "backmost", "aft", "hindermost", "rearmost", "hindmost"]
        }, {
            "word": "background",
            "synonyms": ["backclot", "backdrop"]
        }, {
            "word": "bad",
            "synonyms": ["pitiful", "worse", "stinky", "unsuitable", "fearful", "pretty", "sorry", "distressing", "unskilled", "atrocious", "awful", "abominable", "tough", "dreadful", "naughty", "hopeless", "deplorable", "uncool", "stinking", "poor", "corky", "lousy", "rubber", "unfavourable", "rotten", "incompetent", "unspeakable", "crappy", "swingeing", "icky", "sad", "hard", "no-good", "unfavorable", "severe", "painful", "worst", "evil", "terrible", "mediocre", "corked", "lamentable", "disobedient", "horrid", "mischievous", "negative", "frightful", "ill"]
        }, {
            "word": "badly",
            "synonyms": ["bad"]
        }, {
            "word": "bag",
            "synonyms": ["bagful"]
        }, {
            "word": "bake",
            "synonyms": ["broil"]
        }, {
            "word": "balance",
            "synonyms": ["balance wheel"]
        }, {
            "word": "ball",
            "synonyms": ["Ball", "Lucille Ball"]
        }, {
            "word": "ban",
            "synonyms": ["BAN", "Bachelor of Arts in Nursing"]
        }, {
            "word": "band",
            "synonyms": ["striation", "banding", "stria"]
        }, {
            "word": "bank",
            "synonyms": ["bank building"]
        }, {
            "word": "bar",
            "synonyms": ["saloon", "ginmill", "taproo", "barroom"]
        }, {
            "word": "barely",
            "synonyms": ["hardly", "scarcely", "scarce", "just"]
        }, {
            "word": "barrel",
            "synonyms": ["barrelful"]
        }, {
            "word": "barrier",
            "synonyms": ["roadblock"]
        }, {
            "word": "base",
            "synonyms": ["basal", "basic"]
        }, {
            "word": "baseball",
            "synonyms": ["baseball game"]
        }, {
            "word": "basic",
            "synonyms": ["alkalic", "alkaline"]
        }, {
            "word": "basically",
            "synonyms": ["essentially", "au fon", "fundamentally", "in essence"]
        }, {
            "word": "basis",
            "synonyms": ["base", "groundwork", "fundament", "cornerston", "foundation"]
        }, {
            "word": "basket",
            "synonyms": ["hoop", "basketball hoop"]
        }, {
            "word": "basketball",
            "synonyms": ["hoops", "basketball game"]
        }, {
            "word": "bathroom",
            "synonyms": ["bath"]
        }, {
            "word": "battery",
            "synonyms": ["assault and battery"]
        }, {
            "word": "battle",
            "synonyms": ["fight", "engagement", "conflict"]
        }, {
            "word": "be",
            "synonyms": ["Be", "atomic number 4", "beryllium", "glucinium"]
        }, {
            "word": "bean",
            "synonyms": ["bonce", "dome", "attic", "noodle", "noggin"]
        }, {
            "word": "bear",
            "synonyms": ["behave", "conduct", "acquit", "carry", "deport", "comport"]
        }, {
            "word": "beat",
            "synonyms": ["bushed", "dead", "all in", "tired"]
        }, {
            "word": "beautiful",
            "synonyms": ["aesthetic", "esthetic", "aesthetical", "esthetical"]
        }, {
            "word": "beauty",
            "synonyms": ["beaut"]
        }, {
            "word": "become",
            "synonyms": ["get over", "get ahead", "get along", "go", "get on", "get"]
        }, {
            "word": "bed",
            "synonyms": ["bottom"]
        }, {
            "word": "bedroom",
            "synonyms": ["chamber", "sleeping room", "bedchamber"]
        }, {
            "word": "before",
            "synonyms": ["in front", "ahead"]
        }, {
            "word": "begin",
            "synonyms": ["Begin", "Menachem Begin"]
        }, {
            "word": "beginning",
            "synonyms": ["first", "opening"]
        }, {
            "word": "behavior",
            "synonyms": ["behaviour", "conduct", "doings"]
        }, {
            "word": "behind",
            "synonyms": ["down"]
        }, {
            "word": "being",
            "synonyms": ["beingness", "existence"]
        }, {
            "word": "belief",
            "synonyms": ["impression", "notion", "feeling", "opinion"]
        }, {
            "word": "believe",
            "synonyms": ["consider", "think", "conceive"]
        }, {
            "word": "bell",
            "synonyms": ["Melville Bell", "Bell", "Alexander Melville Bell"]
        }, {
            "word": "belong",
            "synonyms": ["consist", "lie", "lie in", "dwell"]
        }, {
            "word": "below",
            "synonyms": ["at a lower place", "beneath", "to a lower place"]
        }, {
            "word": "belt",
            "synonyms": ["bang", "smash", "knock", "bash"]
        }, {
            "word": "bench",
            "synonyms": ["Bench"]
        }, {
            "word": "bend",
            "synonyms": ["Bend"]
        }, {
            "word": "beneath",
            "synonyms": ["at a lower place", "below", "to a lower place"]
        }, {
            "word": "benefit",
            "synonyms": ["welfare"]
        }, {
            "word": "besides",
            "synonyms": ["in any case"]
        }, {
            "word": "best",
            "synonyms": ["advisable", "better"]
        }, {
            "word": "bet",
            "synonyms": ["wager", "stakes", "stake"]
        }, {
            "word": "better",
            "synonyms": ["amended", "finer", "improved"]
        }, {
            "word": "between",
            "synonyms": ["betwixt"]
        }, {
            "word": "beyond",
            "synonyms": ["on the far side"]
        }, {
            "word": "bible",
            "synonyms": ["Christian Bible", "Good Book", "Word of God", "Holy Writ", "Wor", "Holy Scripture", "Book", "Scripture", "Bible"]
        }, {
            "word": "big",
            "synonyms": ["mature", "fully grown", "full-grown", "adult", "grown", "grownup"]
        }, {
            "word": "bike",
            "synonyms": ["bicycle", "wheel", "cycle"]
        }, {
            "word": "bill",
            "synonyms": ["account", "invoice"]
        }, {
            "word": "billion",
            "synonyms": ["cardinal"]
        }, {
            "word": "bind",
            "synonyms": ["bond", "adhere", "hold fast", "stick", "stick t"]
        }, {
            "word": "biological",
            "synonyms": ["begotten", "natural"]
        }, {
            "word": "bird",
            "synonyms": ["hiss", "Bronx cheer", "razz", "boo", "hoot", "razzing", "raspberry", "snor"]
        }, {
            "word": "birth",
            "synonyms": ["nascence", "nascency", "nativity"]
        }, {
            "word": "birthday",
            "synonyms": ["natal day"]
        }, {
            "word": "bit",
            "synonyms": ["tur", "number", "routine", "act"]
        }, {
            "word": "bite",
            "synonyms": ["chomp"]
        }, {
            "word": "black",
            "synonyms": ["negroid", "negro", "dark-skinned", "non-white", "Afro-American", "colored", "dark", "coloured", "African-American"]
        }, {
            "word": "blade",
            "synonyms": ["leaf blade"]
        }, {
            "word": "blame",
            "synonyms": ["infernal", "darned", "cursed", "damned", "blasted", "blessed", "goddam", "curst", "blamed", "deuced"]
        }, {
            "word": "blanket",
            "synonyms": ["all-encompassing", "extensive", "all-inclusive", "broad", "across-the-board", "wide", "all-embracing", "panoptic", "encompassing", "comprehensive"]
        }, {
            "word": "blind",
            "synonyms": ["unperceiving", "unperceptive"]
        }, {
            "word": "block",
            "synonyms": ["auction block"]
        }, {
            "word": "blood",
            "synonyms": ["bloodline", "origin", "ancestry", "stoc", "line of descent", "descent", "parentage", "line", "stemma", "blood line", "lineage", "pedigree"]
        }, {
            "word": "blow",
            "synonyms": ["bump"]
        }, {
            "word": "blue",
            "synonyms": ["aristocratical", "gentle", "noble", "aristocratic", "blue-blooded", "patrician"]
        }, {
            "word": "board",
            "synonyms": ["circuit board", "add-in", "card", "plug-in", "circuit card"]
        }, {
            "word": "boat",
            "synonyms": ["gravy holder", "gravy boat", "sauceboat"]
        }, {
            "word": "body",
            "synonyms": ["consistence", "consistency"]
        }, {
            "word": "bomb",
            "synonyms": ["bomb calorimeter"]
        }, {
            "word": "bombing",
            "synonyms": ["bombardment"]
        }, {
            "word": "bond",
            "synonyms": ["slave", "enthralled", "in bondage", "enslaved"]
        }, {
            "word": "bone",
            "synonyms": ["bony", "boney"]
        }, {
            "word": "book",
            "synonyms": ["Christian Bible", "Good Book", "Word of God", "Holy Writ", "Word", "Holy Scripture", "Book", "Scripture", "Bible"]
        }, {
            "word": "boom",
            "synonyms": ["windfall", "bunc", "manna from heaven", "gold rush", "gravy", "godsend", "bonanza"]
        }, {
            "word": "boot",
            "synonyms": ["rush", "flush", "charge", "thrill", "kick", "bang"]
        }, {
            "word": "border",
            "synonyms": ["delimitation", "boundary line", "borderline", "mete"]
        }, {
            "word": "born",
            "synonyms": ["given birth", "calved", "foaled", "dropped", "hatched", "whelped"]
        }, {
            "word": "borrow",
            "synonyms": ["adopt", "take up", "take over"]
        }, {
            "word": "boss",
            "synonyms": ["brag", "superior"]
        }, {
            "word": "both",
            "synonyms": ["some"]
        }, {
            "word": "bother",
            "synonyms": ["pain", "pain in the ass", "botheration", "annoyance", "pain in the neck", "infliction"]
        }, {
            "word": "bottle",
            "synonyms": ["bottleful"]
        }, {
            "word": "bottom",
            "synonyms": ["nethermost", "nether", "inferior", "lowermost", "bottommost"]
        }, {
            "word": "boundary",
            "synonyms": ["bounds", "bound"]
        }, {
            "word": "bowl",
            "synonyms": ["bowlful"]
        }, {
            "word": "box",
            "synonyms": ["box seat"]
        }, {
            "word": "boy",
            "synonyms": ["male child"]
        }, {
            "word": "boyfriend",
            "synonyms": ["beau", "fellow", "young ma", "swain"]
        }, {
            "word": "brain",
            "synonyms": ["mental capacity", "wi", "brainpower", "mentality", "learning ability"]
        }, {
            "word": "branch",
            "synonyms": ["limb", "arm"]
        }, {
            "word": "brand",
            "synonyms": ["firebrand"]
        }, {
            "word": "bread",
            "synonyms": ["simoleons", "lolly", "cabbage", "gelt", "lettuce", "scratch", "moolah", "kale", "boodle", "pelf", "shekels", "sugar", "wampu", "dinero", "dough", "loot", "clams", "lucre"]
        }, {
            "word": "break",
            "synonyms": ["break of serve"]
        }, {
            "word": "breast",
            "synonyms": ["tit", "boob", "knocker", "titty", "bosom"]
        }, {
            "word": "breath",
            "synonyms": ["breathing place", "breathing spell", "breathing space", "breather", "breathing tim"]
        }, {
            "word": "breathe",
            "synonyms": ["pass off", "emit"]
        }, {
            "word": "bridge",
            "synonyms": ["bridge circuit"]
        }, {
            "word": "brief",
            "synonyms": ["short", "abbreviated"]
        }, {
            "word": "briefly",
            "synonyms": ["shortly", "concisely", "in brief", "in short"]
        }, {
            "word": "bright",
            "synonyms": ["silvern", "shimmery", "glinting", "silvery", "dazzling", "blazing", "glistering", "brilliant", "fulgid", "opaline", "lambent", "beadlike", "agleam", "opalescent", "lurid", "pearlescent", "noctilucent", "buttonlike", "refulgent", "flashing", "glimmering", "lucent", "nitid", "glittery", "bright as a new penny", "beady", "iridescent", "glistening", "scintillant", "effulgent", "beamy", "shiny", "silver", "aglow", "blinding", "glossy", "buttony", "glary", "glittering", "gleaming", "lustrous", "twinkling", "aglitter", "glaring", "sheeny", "fulgent", "coruscant", "sparkly", "radiant", "glimmery", "self-luminous", "beaming", "nacreous", "luminous", "ardent", "scintillating", "shining"]
        }, {
            "word": "brilliant",
            "synonyms": ["smart as a whip", "brainy", "intelligent"]
        }, {
            "word": "bring",
            "synonyms": ["bring out", "bring together"]
        }, {
            "word": "british",
            "synonyms": ["island", "British"]
        }, {
            "word": "broad",
            "synonyms": ["blanket", "all-encompassing", "extensive", "all-inclusive", "across-the-board", "wide", "all-embracing", "panoptic", "encompassing", "comprehensive"]
        }, {
            "word": "broken",
            "synonyms": ["tamed", "broken in", "tame"]
        }, {
            "word": "brother",
            "synonyms": ["blood brother"]
        }, {
            "word": "brown",
            "synonyms": ["browned", "brunette", "brunet"]
        }, {
            "word": "brush",
            "synonyms": ["brushing"]
        }, {
            "word": "buck",
            "synonyms": ["Pearl Buck", "Pearl Sydenstricker Buck", "Buck"]
        }, {
            "word": "build",
            "synonyms": ["physique", "figure", "anatomy", "fles", "human body", "shape", "form", "soma", "material body", "bod", "chassis", "frame", "physical body"]
        }, {
            "word": "building",
            "synonyms": ["construction"]
        }, {
            "word": "bullet",
            "synonyms": ["bullet train"]
        }, {
            "word": "bunch",
            "synonyms": ["clustering", "clump", "cluster"]
        }, {
            "word": "burden",
            "synonyms": ["gist", "core", "essence", "effect"]
        }, {
            "word": "burn",
            "synonyms": ["burn mark"]
        }, {
            "word": "bury",
            "synonyms": ["inter", "entomb", "lay to rest", "inhume"]
        }, {
            "word": "bus",
            "synonyms": ["charabanc", "passenger vehicl", "motorcoach", "jitney", "autobus", "coach", "motorbus", "double-decker", "omnibus"]
        }, {
            "word": "business",
            "synonyms": ["business sector"]
        }, {
            "word": "busy",
            "synonyms": ["active"]
        }, {
            "word": "but",
            "synonyms": ["simply", "only", "merely", "just"]
        }, {
            "word": "button",
            "synonyms": ["clit", "clitoris"]
        }, {
            "word": "buy",
            "synonyms": ["bargain", "steal"]
        }, {
            "word": "buyer",
            "synonyms": ["emptor", "purchaser", "vendee"]
        }, {
            "word": "by",
            "synonyms": ["away", "aside"]
        }, {
            "word": "pace",
            "synonyms": ["step", "footstep", "stride"]
        }, {
            "word": "pack",
            "synonyms": ["battalion", "large number", "multitude", "plurality"]
        }, {
            "word": "package",
            "synonyms": ["bundle", "packet", "parcel"]
        }, {
            "word": "page",
            "synonyms": ["Page", "Sri Frederick Handley Page"]
        }, {
            "word": "pain",
            "synonyms": ["pain in the ass", "botheration", "bother", "annoyance", "pain in the neck", "infliction"]
        }, {
            "word": "painful",
            "synonyms": ["torturing", "biting", "itchy", "inhumane", "sore", "poignant", "torturesome", "achy", "stinging", "wrenching", "agonizing", "tingling", "harrowing", "galled", "racking", "saddle-sore", "burning", "torturous", "bitter", "raw", "agonising", "agonized", "chafed", "agonised", "prickling", "sensitive", "harmful", "excruciating", "tender", "aching", "traumatic"]
        }, {
            "word": "paint",
            "synonyms": ["key"]
        }, {
            "word": "painter",
            "synonyms": ["catamount", "cougar", "puma", "mountain lion", "Felis concolor", "panther"]
        }, {
            "word": "painting",
            "synonyms": ["house painting"]
        }, {
            "word": "pair",
            "synonyms": ["brace"]
        }, {
            "word": "pale",
            "synonyms": ["light", "light-colored"]
        }, {
            "word": "palestinian",
            "synonyms": ["mandatory", "mandate", "Palestinian"]
        }, {
            "word": "palm",
            "synonyms": ["decoration", "medallion", "medal", "ribbon", "laurel wreath"]
        }, {
            "word": "pan",
            "synonyms": ["cooking pan"]
        }, {
            "word": "panel",
            "synonyms": ["instrument panel", "board", "control panel", "control board"]
        }, {
            "word": "pant",
            "synonyms": ["gasp"]
        }, {
            "word": "paper",
            "synonyms": ["composition", "theme", "report"]
        }, {
            "word": "parent",
            "synonyms": ["bring up", "raise", "nurture", "rear"]
        }, {
            "word": "park",
            "synonyms": ["ballpark"]
        }, {
            "word": "part",
            "synonyms": ["partially", "partly"]
        }, {
            "word": "participant",
            "synonyms": ["player"]
        }, {
            "word": "participate",
            "synonyms": ["enter"]
        }, {
            "word": "participation",
            "synonyms": ["involvement", "engagement", "involution"]
        }, {
            "word": "particular",
            "synonyms": ["careful"]
        }, {
            "word": "particularly",
            "synonyms": ["in particular"]
        }, {
            "word": "partly",
            "synonyms": ["part", "partially"]
        }, {
            "word": "partner",
            "synonyms": ["cooperator", "collaborator", "pardner"]
        }, {
            "word": "party",
            "synonyms": ["company"]
        }, {
            "word": "pass",
            "synonyms": ["passing"]
        }, {
            "word": "passage",
            "synonyms": ["enactment"]
        }, {
            "word": "passenger",
            "synonyms": ["rider"]
        }, {
            "word": "passion",
            "synonyms": ["heat", "warmth"]
        }, {
            "word": "past",
            "synonyms": ["other", "quondam", "bypast", "gone", "ancient", "ago", "sometime", "recent", "chivalric", "historic", "then", "erstwhile", "departed", "former", "historical", "last", "knightly", "ult", "old", "foregone", "onetime", "early", "prehistorical", "ultimo", "olden", "prehistoric", "outgoing", "bygone", "agone", "noncurrent", "previous", "late", "medieval"]
        }, {
            "word": "patch",
            "synonyms": ["bandage"]
        }, {
            "word": "path",
            "synonyms": ["route", "itinerary"]
        }, {
            "word": "patient",
            "synonyms": ["tolerant", "longanimous", "patient of", "enduring", "forbearing", "diligent", "unhurried", "persevering", "uncomplaining", "long-suffering"]
        }, {
            "word": "pattern",
            "synonyms": ["blueprint", "design"]
        }, {
            "word": "pause",
            "synonyms": ["suspensio", "break", "intermission", "interruption"]
        }, {
            "word": "pay",
            "synonyms": ["remuneration", "salary", "wage", "earnings"]
        }, {
            "word": "payment",
            "synonyms": ["defrayment", "defrayal"]
        }, {
            "word": "pc",
            "synonyms": ["microcomputer", "personal computer", "PC"]
        }, {
            "word": "peace",
            "synonyms": ["peace treaty", "pacification"]
        }, {
            "word": "peak",
            "synonyms": ["acme", "elevation", "height", "summit", "superlative", "meridian", "tiptop", "to", "pinnacle"]
        }, {
            "word": "peer",
            "synonyms": ["equal", "match", "compeer"]
        }, {
            "word": "penalty",
            "synonyms": ["penalization", "penalisation", "punishment"]
        }, {
            "word": "people",
            "synonyms": ["citizenry"]
        }, {
            "word": "pepper",
            "synonyms": ["capsicum", "capsicum pepper plant"]
        }, {
            "word": "perceive",
            "synonyms": ["comprehend"]
        }, {
            "word": "percentage",
            "synonyms": ["per centum", "pct", "percent"]
        }, {
            "word": "perception",
            "synonyms": ["perceptual experience", "percept"]
        }, {
            "word": "perfect",
            "synonyms": ["stark", "unadulterated", "gross", "staring", "utter", "arrant", "unmitigated", "everlasting", "thoroughgoing", "sodding", "double-dyed", "consummate", "complete", "pure"]
        }, {
            "word": "perfectly",
            "synonyms": ["absolutely", "dead", "utterly"]
        }, {
            "word": "perform",
            "synonyms": ["do"]
        }, {
            "word": "performance",
            "synonyms": ["carrying into action", "carrying out", "execution"]
        }, {
            "word": "perhaps",
            "synonyms": ["peradventure", "maybe", "possibly", "perchance", "mayhap"]
        }, {
            "word": "period",
            "synonyms": ["geological period"]
        }, {
            "word": "permanent",
            "synonyms": ["irreversible"]
        }, {
            "word": "permission",
            "synonyms": ["license", "permit"]
        }, {
            "word": "permit",
            "synonyms": ["license", "licence"]
        }, {
            "word": "person",
            "synonyms": ["someone", "somebody", "mortal", "soul", "individual"]
        }, {
            "word": "personal",
            "synonyms": ["personalised", "individualised", "private", "ad hominem", "ain", "in the flesh", "personalized", "individualized", "person-to-person", "own", "in-person", "individual", "face-to-face"]
        }, {
            "word": "personally",
            "synonyms": ["in person"]
        }, {
            "word": "personnel",
            "synonyms": ["force"]
        }, {
            "word": "perspective",
            "synonyms": ["linear perspective"]
        }, {
            "word": "persuade",
            "synonyms": ["carry", "sway"]
        }, {
            "word": "pet",
            "synonyms": ["preferred", "favorite", "favourite", "favored", "preferent", "loved", "best-loved"]
        }, {
            "word": "phase",
            "synonyms": ["form"]
        }, {
            "word": "philosophy",
            "synonyms": ["doctrine", "philosophical system", "school of thought", "ism"]
        }, {
            "word": "phone",
            "synonyms": ["headphone", "earpiece", "earphone"]
        }, {
            "word": "photo",
            "synonyms": ["pic", "photograph", "exposure"]
        }, {
            "word": "photograph",
            "synonyms": ["pic", "exposure", "photo"]
        }, {
            "word": "photographer",
            "synonyms": ["lensman"]
        }, {
            "word": "phrase",
            "synonyms": ["idiomatic expression", "set phrase", "phrasal idiom", "idiom"]
        }, {
            "word": "physical",
            "synonyms": ["physiological", "sensual", "corporal", "physiologic", "somatogenetic", "somatogenic", "corporeal", "personal", "fleshly", "bodily", "carnal", "somatic", "material", "animal"]
        }, {
            "word": "physician",
            "synonyms": ["doc", "MD", "medic", "doctor", "Dr."]
        }, {
            "word": "piano",
            "synonyms": ["soft", "pianissimo", "pianissimo assai"]
        }, {
            "word": "pick",
            "synonyms": ["selection", "choice"]
        }, {
            "word": "picture",
            "synonyms": ["ikon", "icon", "image"]
        }, {
            "word": "pie",
            "synonyms": ["PIE", "Proto-Indo European"]
        }, {
            "word": "piece",
            "synonyms": ["bit"]
        }, {
            "word": "pile",
            "synonyms": ["chain reactor", "atomic pile", "atomic reactor"]
        }, {
            "word": "pilot",
            "synonyms": ["airplane pilot"]
        }, {
            "word": "pine",
            "synonyms": ["pine tree", "true pine"]
        }, {
            "word": "pink",
            "synonyms": ["chromatic", "pinkish"]
        }, {
            "word": "pipe",
            "synonyms": ["bagpipe"]
        }, {
            "word": "pitch",
            "synonyms": ["auction pitch"]
        }, {
            "word": "place",
            "synonyms": ["home"]
        }, {
            "word": "plan",
            "synonyms": ["architectural plan"]
        }, {
            "word": "plane",
            "synonyms": ["level", "flat", "even"]
        }, {
            "word": "planet",
            "synonyms": ["major planet"]
        }, {
            "word": "planning",
            "synonyms": ["provision", "preparation"]
        }, {
            "word": "plant",
            "synonyms": ["flora", "plant life"]
        }, {
            "word": "plastic",
            "synonyms": ["moldable", "elastic", "fictile"]
        }, {
            "word": "plate",
            "synonyms": ["collection plate"]
        }, {
            "word": "platform",
            "synonyms": ["chopine"]
        }, {
            "word": "play",
            "synonyms": ["bid"]
        }, {
            "word": "player",
            "synonyms": ["role player", "actor", "histrion", "thespian"]
        }, {
            "word": "please",
            "synonyms": ["delight"]
        }, {
            "word": "pleasure",
            "synonyms": ["delight", "joy"]
        }, {
            "word": "plenty",
            "synonyms": ["enough"]
        }, {
            "word": "plot",
            "synonyms": ["patch", "plot of ground"]
        }, {
            "word": "plus",
            "synonyms": ["positive", "nonnegative"]
        }, {
            "word": "pm",
            "synonyms": ["postmeridian", "p.m.", "post meridiem"]
        }, {
            "word": "pocket",
            "synonyms": ["air hole", "air pocket"]
        }, {
            "word": "poem",
            "synonyms": ["verse form"]
        }, {
            "word": "poetry",
            "synonyms": ["poesy", "verse"]
        }, {
            "word": "point",
            "synonyms": ["compass point"]
        }, {
            "word": "pole",
            "synonyms": ["celestial pole"]
        }, {
            "word": "police",
            "synonyms": ["law", "constabulary", "police force"]
        }, {
            "word": "policy",
            "synonyms": ["insurance policy", "insurance"]
        }, {
            "word": "political",
            "synonyms": ["governmental", "policy-making", "semipolitical"]
        }, {
            "word": "politician",
            "synonyms": ["politico", "political leader", "pol"]
        }, {
            "word": "politics",
            "synonyms": ["political relation"]
        }, {
            "word": "poll",
            "synonyms": ["public opinion poll", "opinion poll", "canvas"]
        }, {
            "word": "pollution",
            "synonyms": ["befoulment", "defilement"]
        }, {
            "word": "pool",
            "synonyms": ["consortium", "syndicate"]
        }, {
            "word": "poor",
            "synonyms": ["bad"]
        }, {
            "word": "pop",
            "synonyms": ["nonclassical", "popular"]
        }, {
            "word": "popular",
            "synonyms": ["favorite", "hot", "fashionable", "favourite", "touristy", "best-selling", "touristed"]
        }, {
            "word": "population",
            "synonyms": ["universe"]
        }, {
            "word": "port",
            "synonyms": ["left", "larboard"]
        }, {
            "word": "portion",
            "synonyms": ["dower", "dowry", "dowery"]
        }, {
            "word": "portrait",
            "synonyms": ["portrayal", "portraiture"]
        }, {
            "word": "portray",
            "synonyms": ["limn", "depict"]
        }, {
            "word": "pose",
            "synonyms": ["mannerism", "affectedness", "affectation"]
        }, {
            "word": "position",
            "synonyms": ["military position"]
        }, {
            "word": "positive",
            "synonyms": ["affirmative", "supportive", "constructive", "optimistic", "affirmatory"]
        }, {
            "word": "possess",
            "synonyms": ["own", "have"]
        }, {
            "word": "possibility",
            "synonyms": ["hypothesis", "theory"]
        }, {
            "word": "possible",
            "synonyms": ["come-at-able", "attainable", "workable", "conceivable", "thinkable", "practical", "executable", "doable", "accomplishable", "achievable", "manageable", "realizable", "affirmable", "contingent", "mathematical", "assertable", "feasible", "likely", "practicable", "realistic", "viable"]
        }, {
            "word": "possibly",
            "synonyms": ["peradventure", "maybe", "perhaps", "perchance", "mayhap"]
        }, {
            "word": "post",
            "synonyms": ["mail"]
        }, {
            "word": "pot",
            "synonyms": ["flock", "muckle", "lot", "heap", "spate", "pile", "mass", "peck", "mess", "stack", "whole lot", "great deal", "quite a little", "mint", "raft", "hatful", "whole sle", "plenty", "wad", "good deal", "tidy sum", "mickle", "batch", "slew", "sight", "deal"]
        }, {
            "word": "potato",
            "synonyms": ["white potato", "murphy", "spud", "tater", "Irish potato"]
        }, {
            "word": "potential",
            "synonyms": ["prospective", "expected", "likely"]
        }, {
            "word": "potentially",
            "synonyms": ["possibly"]
        }, {
            "word": "pound",
            "synonyms": ["quid", "pound sterling", "British pound sterling", "British pound"]
        }, {
            "word": "pour",
            "synonyms": ["decant", "pour out"]
        }, {
            "word": "poverty",
            "synonyms": ["impoverishment", "poorness"]
        }, {
            "word": "powder",
            "synonyms": ["gunpowder"]
        }, {
            "word": "power",
            "synonyms": ["ability"]
        }, {
            "word": "powerful",
            "synonyms": ["strong", "effectual", "puissant", "coercive", "all-powerful", "compelling", "mighty", "muscular", "effective", "stiff", "regent", "reigning", "omnipotent", "efficacious", "ruling", "potent", "regnant", "almighty"]
        }, {
            "word": "practical",
            "synonyms": ["interoperable", "concrete", "pragmatical", "applicatory", "functional", "applicable", "applied", "operable", "practicable", "serviceable", "matter-of-fact", "applicative", "working", "realistic", "pragmatic", "possible", "unimaginative"]
        }, {
            "word": "practice",
            "synonyms": ["exercise", "drill", "recitation", "practice session"]
        }, {
            "word": "pray",
            "synonyms": ["beg", "beg off", "implore"]
        }, {
            "word": "prayer",
            "synonyms": ["entreaty", "appeal"]
        }, {
            "word": "precisely",
            "synonyms": ["exactly", "just"]
        }, {
            "word": "predict",
            "synonyms": ["forecas", "prognosticate", "presage", "bode", "betoken", "augur", "omen", "auspicate", "prefigure", "foretell", "portend", "foreshadow"]
        }, {
            "word": "prefer",
            "synonyms": ["choose", "opt"]
        }, {
            "word": "preference",
            "synonyms": ["druthers"]
        }, {
            "word": "pregnancy",
            "synonyms": ["maternity", "gestation"]
        }, {
            "word": "pregnant",
            "synonyms": ["enceinte", "gravid", "great", "large", "heavy", "with child", "expectant", "big"]
        }, {
            "word": "preparation",
            "synonyms": ["cookery", "cooking"]
        }, {
            "word": "prepare",
            "synonyms": ["ready", "cook", "make", "fix"]
        }, {
            "word": "prescription",
            "synonyms": ["ethical drug", "prescription medicine", "prescription drug"]
        }, {
            "word": "presence",
            "synonyms": ["comportment", "bearing", "mien"]
        }, {
            "word": "present",
            "synonyms": ["on hand", "in attendance", "naturally occurring", "omnipresent", "ubiquitous", "attending", "ever-present", "existing", "attendant", "here"]
        }, {
            "word": "presentation",
            "synonyms": ["display"]
        }, {
            "word": "preserve",
            "synonyms": ["preserves", "conserve", "conserves"]
        }, {
            "word": "president",
            "synonyms": ["chair", "chairman", "chairperson", "chairwoman"]
        }, {
            "word": "presidential",
            "synonyms": ["head of state", "chief of state"]
        }, {
            "word": "press",
            "synonyms": ["crush", "jam"]
        }, {
            "word": "pressure",
            "synonyms": ["imperativeness", "insistency", "pres", "insistence"]
        }, {
            "word": "pretend",
            "synonyms": ["make-believe", "unreal"]
        }, {
            "word": "pretty",
            "synonyms": ["bad"]
        }, {
            "word": "prevent",
            "synonyms": ["forbid", "forestall", "preclude", "foreclose"]
        }, {
            "word": "previous",
            "synonyms": ["former", "past", "late"]
        }, {
            "word": "previously",
            "synonyms": ["antecedently"]
        }, {
            "word": "price",
            "synonyms": ["toll", "cost"]
        }, {
            "word": "pride",
            "synonyms": ["pridefulness"]
        }, {
            "word": "priest",
            "synonyms": ["non-Christian priest"]
        }, {
            "word": "primarily",
            "synonyms": ["in the main", "mainly", "principally", "chiefly"]
        }, {
            "word": "primary",
            "synonyms": ["basal", "essential"]
        }, {
            "word": "prime",
            "synonyms": ["superior", "select", "quality", "prize", "choice"]
        }, {
            "word": "principal",
            "synonyms": ["chief", "main", "primary", "of import", "important"]
        }, {
            "word": "principle",
            "synonyms": ["precept"]
        }, {
            "word": "print",
            "synonyms": ["black and white"]
        }, {
            "word": "prior",
            "synonyms": ["antecedent", "preceding", "anterior"]
        }, {
            "word": "priority",
            "synonyms": ["precedence", "antecedence", "precedency", "antecedency", "anteriority"]
        }, {
            "word": "prison",
            "synonyms": ["prison house"]
        }, {
            "word": "prisoner",
            "synonyms": ["captive"]
        }, {
            "word": "privacy",
            "synonyms": ["seclusion", "privateness"]
        }, {
            "word": "private",
            "synonyms": ["backstage", "confidential", "close", "nonpublic", "semiprivate", "tete-a-tete", "closed-door", "snobby", "privy", "insular", "esoteric", "one-on-one", "reclusive", "clubby", "offstage", "cliquish", "head-to-head", "secluded", "toffee-nosed", "snobbish", "sequestered", "cloistered", "personal", "secret", "clannish"]
        }, {
            "word": "probably",
            "synonyms": ["credibly", "believably", "plausibly"]
        }, {
            "word": "problem",
            "synonyms": ["job"]
        }, {
            "word": "procedure",
            "synonyms": ["operation"]
        }, {
            "word": "proceed",
            "synonyms": ["carry on", "continue", "go on"]
        }, {
            "word": "process",
            "synonyms": ["cognitive process", "cognitive operation", "mental process", "operation"]
        }, {
            "word": "produce",
            "synonyms": ["garden truck", "green goods", "green groceries"]
        }, {
            "word": "producer",
            "synonyms": ["manufacturer"]
        }, {
            "word": "product",
            "synonyms": ["cartesian product", "intersection"]
        }, {
            "word": "production",
            "synonyms": ["output", "yield"]
        }, {
            "word": "profession",
            "synonyms": ["community"]
        }, {
            "word": "professional",
            "synonyms": ["professed", "nonrecreational", "paid"]
        }, {
            "word": "professor",
            "synonyms": ["prof"]
        }, {
            "word": "profile",
            "synonyms": ["visibility"]
        }, {
            "word": "profit",
            "synonyms": ["gain"]
        }, {
            "word": "program",
            "synonyms": ["programme", "broadcast"]
        }, {
            "word": "progress",
            "synonyms": ["advancement"]
        }, {
            "word": "project",
            "synonyms": ["projection"]
        }, {
            "word": "prominent",
            "synonyms": ["conspicuous", "large", "big"]
        }, {
            "word": "promise",
            "synonyms": ["hope"]
        }, {
            "word": "promote",
            "synonyms": ["boost", "further", "encourage", "advance"]
        }, {
            "word": "prompt",
            "synonyms": ["timesaving", "efficient", "expeditious"]
        }, {
            "word": "proof",
            "synonyms": ["impervious", "imperviable"]
        }, {
            "word": "proper",
            "synonyms": ["strait-laced", "fitting", "right", "correct", "prissy", "decent", "puritanical", "comme il faut", "straitlaced", "comely", "halal", "seemly", "tight-laced", "becoming", "straightlaced", "prudish", "prim", "kosher", "victorian", "decorous", "priggish", "straight-laced", "square-toed", "appropriate"]
        }, {
            "word": "properly",
            "synonyms": ["by rights"]
        }, {
            "word": "property",
            "synonyms": ["attribute", "dimension"]
        }, {
            "word": "proportion",
            "synonyms": ["dimension"]
        }, {
            "word": "proposal",
            "synonyms": ["proposal of marriage", "marriage proposal", "marriage offer"]
        }, {
            "word": "propose",
            "synonyms": ["aim", "purpose", "purport"]
        }, {
            "word": "proposed",
            "synonyms": ["projected", "planned"]
        }, {
            "word": "prosecutor",
            "synonyms": ["prosecuting attorne", "public prosecutor", "prosecuting officer"]
        }, {
            "word": "prospect",
            "synonyms": ["candidate"]
        }, {
            "word": "protection",
            "synonyms": ["auspices", "aegis"]
        }, {
            "word": "protest",
            "synonyms": ["dissent", "objection"]
        }, {
            "word": "proud",
            "synonyms": ["prideful", "uppish", "self-respectful", "swollen-headed", "braggy", "haughty", "supercilious", "big", "persnickety", "braggart", "dignified", "respected", "self-important", "redoubtable", "vainglorious", "too big for one's breeches", "swaggering", "pleased", "swelled", "self-aggrandizing", "crowing", "egotistic", "sniffy", "self-conceited", "chesty", "purse-proud", "self-respecting", "snotty", "illustrious", "gratifying", "disdainful", "bigheaded", "self-aggrandising", "overproud", "immodest", "glorious", "stuck-up", "boastful", "swollen", "snot-nosed", "proud of", "arrogant", "bragging", "cock-a-hoop", "beaming", "shabby-genteel", "conceited", "vain", "snooty", "lordly", "egotistical", "house-proud"]
        }, {
            "word": "prove",
            "synonyms": ["shew", "establish", "demonstrate", "show"]
        }, {
            "word": "provide",
            "synonyms": ["bring home the bacon"]
        }, {
            "word": "provider",
            "synonyms": ["supplier"]
        }, {
            "word": "province",
            "synonyms": ["responsibility"]
        }, {
            "word": "provision",
            "synonyms": ["planning", "preparation"]
        }, {
            "word": "psychological",
            "synonyms": ["mental"]
        }, {
            "word": "psychology",
            "synonyms": ["psychological science"]
        }, {
            "word": "public",
            "synonyms": ["common"]
        }, {
            "word": "publication",
            "synonyms": ["issue"]
        }, {
            "word": "publicly",
            "synonyms": ["in public", "publically"]
        }, {
            "word": "publish",
            "synonyms": ["bring out", "release", "issue", "put out"]
        }, {
            "word": "publisher",
            "synonyms": ["newspaper publisher"]
        }, {
            "word": "pull",
            "synonyms": ["clout"]
        }, {
            "word": "punishment",
            "synonyms": ["penalty", "penalization", "penalisation"]
        }, {
            "word": "purchase",
            "synonyms": ["leverage"]
        }, {
            "word": "pure",
            "synonyms": ["stark", "unadulterated", "gross", "perfect", "staring", "utter", "arrant", "unmitigated", "everlasting", "thoroughgoing", "sodding", "double-dyed", "consummate", "complete"]
        }, {
            "word": "purpose",
            "synonyms": ["determination"]
        }, {
            "word": "pursue",
            "synonyms": ["follow"]
        }, {
            "word": "push",
            "synonyms": ["energy", "get-up-and-go"]
        }, {
            "word": "put",
            "synonyms": ["put option"]
        }, {
            "word": "qualify",
            "synonyms": ["characterize", "characterise"]
        }, {
            "word": "quality",
            "synonyms": ["superior", "select", "prize", "prime", "choice"]
        }, {
            "word": "quarter",
            "synonyms": ["one-fourth", "fourth", "twenty-five percent", "fourth part", "quarter"]
        }, {
            "word": "quarterback",
            "synonyms": ["signal caller", "field general"]
        }, {
            "word": "question",
            "synonyms": ["dubiousness", "doubtfulness", "doubt"]
        }, {
            "word": "quick",
            "synonyms": ["spry", "agile", "nimble", "active"]
        }, {
            "word": "quickly",
            "synonyms": ["cursorily"]
        }, {
            "word": "quiet",
            "synonyms": ["soft", "subdued", "hushed", "muted"]
        }, {
            "word": "quietly",
            "synonyms": ["quiet"]
        }, {
            "word": "quit",
            "synonyms": ["take leave", "depart"]
        }, {
            "word": "quite",
            "synonyms": ["quite a", "quite an"]
        }, {
            "word": "quote",
            "synonyms": ["citation", "quotation"]
        }, {
            "word": "race",
            "synonyms": ["raceway"]
        }, {
            "word": "racial",
            "synonyms": ["interracial", "racist", "multiracial", "biracial"]
        }, {
            "word": "radical",
            "synonyms": ["basal"]
        }, {
            "word": "radio",
            "synonyms": ["energy"]
        }, {
            "word": "rail",
            "synonyms": ["railing"]
        }, {
            "word": "rain",
            "synonyms": ["pelting"]
        }, {
            "word": "raise",
            "synonyms": ["acclivity", "rise", "ascent", "upgrade", "climb"]
        }, {
            "word": "range",
            "synonyms": ["compass", "reach", "grasp"]
        }, {
            "word": "rank",
            "synonyms": ["downright", "right-down", "out-and-out", "absolute", "complete", "sheer"]
        }, {
            "word": "rapid",
            "synonyms": ["fast"]
        }, {
            "word": "rapidly",
            "synonyms": ["chop-chop", "speedily", "apace", "quickly"]
        }, {
            "word": "rare",
            "synonyms": ["infrequent"]
        }, {
            "word": "rarely",
            "synonyms": ["seldom"]
        }, {
            "word": "rate",
            "synonyms": ["charge per unit"]
        }, {
            "word": "rather",
            "synonyms": ["instead"]
        }, {
            "word": "rating",
            "synonyms": ["evaluation", "valuation"]
        }, {
            "word": "raw",
            "synonyms": ["in the raw", "peeled", "stark naked", "unclothed", "naked as a jaybird", "in the buff", "in the altogether", "bare-ass", "bare-assed"]
        }, {
            "word": "reach",
            "synonyms": ["compass", "range", "grasp"]
        }, {
            "word": "react",
            "synonyms": ["oppose"]
        }, {
            "word": "reaction",
            "synonyms": ["chemical reaction"]
        }, {
            "word": "read",
            "synonyms": ["study", "take", "learn"]
        }, {
            "word": "reader",
            "synonyms": ["lector"]
        }, {
            "word": "reading",
            "synonyms": ["version", "interpretation"]
        }, {
            "word": "ready",
            "synonyms": ["waiting", "ripe", "prepared", "prompt", "set", "at the ready", "ready and waiting", "willing", "fit", "in order", "primed"]
        }, {
            "word": "real",
            "synonyms": ["true", "genuine", "literal", "actual"]
        }, {
            "word": "reality",
            "synonyms": ["realism", "realness"]
        }, {
            "word": "realize",
            "synonyms": ["earn", "take in", "pull in", "gain", "realise", "clear", "make", "bring i"]
        }, {
            "word": "really",
            "synonyms": ["actually"]
        }, {
            "word": "reason",
            "synonyms": ["cause", "grounds"]
        }, {
            "word": "reasonable",
            "synonyms": ["fair", "fairish", "moderate"]
        }, {
            "word": "recall",
            "synonyms": ["callback"]
        }, {
            "word": "receive",
            "synonyms": ["undergo", "experience", "get", "have"]
        }, {
            "word": "recent",
            "synonyms": ["past", "late"]
        }, {
            "word": "recently",
            "synonyms": ["of late", "latterly", "lately", "late"]
        }, {
            "word": "recipe",
            "synonyms": ["formula"]
        }, {
            "word": "recognition",
            "synonyms": ["acknowledgment", "acknowledgement"]
        }, {
            "word": "recognize",
            "synonyms": ["recognise", "accredit"]
        }, {
            "word": "recommend",
            "synonyms": ["commend"]
        }, {
            "word": "recommendation",
            "synonyms": ["passport"]
        }, {
            "word": "record",
            "synonyms": ["criminal record"]
        }, {
            "word": "recording",
            "synonyms": ["transcription"]
        }, {
            "word": "recover",
            "synonyms": ["go back", "recuperate"]
        }, {
            "word": "recovery",
            "synonyms": ["convalescence", "recuperation"]
        }, {
            "word": "recruit",
            "synonyms": ["enlistee"]
        }, {
            "word": "red",
            "synonyms": ["bloody"]
        }, {
            "word": "reduce",
            "synonyms": ["cut", "contract", "foreshorten", "abbreviate", "abridge", "shorten"]
        }, {
            "word": "reduction",
            "synonyms": ["step-dow", "decrease", "diminution"]
        }, {
            "word": "refer",
            "synonyms": ["look up", "consult"]
        }, {
            "word": "reference",
            "synonyms": ["character reference", "character"]
        }, {
            "word": "reflect",
            "synonyms": ["chew over", "think over", "muse", "mull", "mull over", "speculat", "excogitate", "meditate", "contemplate", "ruminate", "ponder"]
        }, {
            "word": "reflection",
            "synonyms": ["thoughtfulness", "rumination", "musing", "contemplation", "reflexion"]
        }, {
            "word": "reform",
            "synonyms": ["regenerate", "reclaim", "rectif"]
        }, {
            "word": "refuse",
            "synonyms": ["food waste", "scraps", "garbage"]
        }, {
            "word": "regard",
            "synonyms": ["attentiveness", "paying attention", "heed"]
        }, {
            "word": "regardless",
            "synonyms": ["unheeding", "careless", "thoughtless", "heedless"]
        }, {
            "word": "regime",
            "synonyms": ["authorities", "government"]
        }, {
            "word": "region",
            "synonyms": ["area"]
        }, {
            "word": "regional",
            "synonyms": ["location"]
        }, {
            "word": "register",
            "synonyms": ["cash register"]
        }, {
            "word": "regular",
            "synonyms": ["uniform", "rule-governed", "day-after-day", "prescribed", "weak", "well-ordered", "rhythmic", "symmetric", "stock", "lawful", "systematic", "day-to-day", "official", "nightly", "routine", "timed", "regularized", "first-string", "rhythmical", "symmetrical", "standard", "orderly", "regularised", "every day", "daily"]
        }, {
            "word": "regularly",
            "synonyms": ["on a regular basis"]
        }, {
            "word": "regulate",
            "synonyms": ["baffle"]
        }, {
            "word": "regulation",
            "synonyms": ["standard"]
        }, {
            "word": "reinforce",
            "synonyms": ["reenforce"]
        }, {
            "word": "reject",
            "synonyms": ["cull"]
        }, {
            "word": "relate",
            "synonyms": ["associate", "colligate", "connect", "link", "tie in", "link up"]
        }, {
            "word": "relation",
            "synonyms": ["relation back"]
        }, {
            "word": "relationship",
            "synonyms": ["human relationship"]
        }, {
            "word": "relative",
            "synonyms": ["relational", "comparative"]
        }, {
            "word": "relatively",
            "synonyms": ["comparatively"]
        }, {
            "word": "relax",
            "synonyms": ["loose", "loosen"]
        }, {
            "word": "release",
            "synonyms": ["acquittance"]
        }, {
            "word": "relevant",
            "synonyms": ["applicable", "pertinent", "to the point", "in dispute", "germane", "at issue", "in question", "related", "under consideration", "in hand"]
        }, {
            "word": "relief",
            "synonyms": ["alleviation", "assuagement"]
        }, {
            "word": "religion",
            "synonyms": ["faith", "religious belief"]
        }, {
            "word": "religious",
            "synonyms": ["pious", "churchly", "devout", "churchgoing", "churchlike", "god-fearing", "interfaith"]
        }, {
            "word": "rely",
            "synonyms": ["trust", "swear", "bank"]
        }, {
            "word": "remain",
            "synonyms": ["persist", "stay"]
        }, {
            "word": "remaining",
            "synonyms": ["left over", "left", "unexpended", "odd", "leftover", "unexhausted"]
        }, {
            "word": "remarkable",
            "synonyms": ["noteworthy", "important", "significant"]
        }, {
            "word": "remember",
            "synonyms": ["commemorate"]
        }, {
            "word": "remind",
            "synonyms": ["prompt", "cue"]
        }, {
            "word": "remote",
            "synonyms": ["distant", "far"]
        }, {
            "word": "remove",
            "synonyms": ["absent"]
        }, {
            "word": "repeat",
            "synonyms": ["repetition"]
        }, {
            "word": "replace",
            "synonyms": ["put back"]
        }, {
            "word": "reply",
            "synonyms": ["response", "answer"]
        }, {
            "word": "report",
            "synonyms": ["account"]
        }, {
            "word": "reporter",
            "synonyms": ["newsman", "newsperson"]
        }, {
            "word": "represent",
            "synonyms": ["play", "act"]
        }, {
            "word": "representation",
            "synonyms": ["delegacy", "agency"]
        }, {
            "word": "representative",
            "synonyms": ["emblematical", "allegoric", "symbolical", "symbolic", "allegorical", "emblematic"]
        }, {
            "word": "republican",
            "synonyms": ["democratic"]
        }, {
            "word": "reputation",
            "synonyms": ["report"]
        }, {
            "word": "request",
            "synonyms": ["asking"]
        }, {
            "word": "require",
            "synonyms": ["expect", "ask"]
        }, {
            "word": "requirement",
            "synonyms": ["demand"]
        }, {
            "word": "research",
            "synonyms": ["enquiry", "inquiry"]
        }, {
            "word": "researcher",
            "synonyms": ["investigator", "research worker"]
        }, {
            "word": "reservation",
            "synonyms": ["booking"]
        }, {
            "word": "resident",
            "synonyms": ["nonmigratory"]
        }, {
            "word": "resist",
            "synonyms": ["jib", "balk", "baulk"]
        }, {
            "word": "resistance",
            "synonyms": ["electrical resistance", "electric resistance", "resistivity", "ohmic resistanc", "impedance"]
        }, {
            "word": "resolution",
            "synonyms": ["resolve", "declaration"]
        }, {
            "word": "resolve",
            "synonyms": ["resoluteness", "firmness of purpose", "firmness", "resolution"]
        }, {
            "word": "resort",
            "synonyms": ["hangout", "repair", "haunt", "stamping ground"]
        }, {
            "word": "resource",
            "synonyms": ["resourcefulness", "imagination"]
        }, {
            "word": "respect",
            "synonyms": ["deference"]
        }, {
            "word": "respond",
            "synonyms": ["reply", "answer"]
        }, {
            "word": "respondent",
            "synonyms": ["responsive", "answering"]
        }, {
            "word": "response",
            "synonyms": ["reply", "answer"]
        }, {
            "word": "responsibility",
            "synonyms": ["duty", "obligation"]
        }, {
            "word": "responsible",
            "synonyms": ["amenable", "prudent", "liable", "accountable", "trusty", "trustworthy", "answerable", "obligated"]
        }, {
            "word": "rest",
            "synonyms": ["ease", "repose", "relaxation"]
        }, {
            "word": "restaurant",
            "synonyms": ["eating place", "eating house"]
        }, {
            "word": "restore",
            "synonyms": ["reconstruct"]
        }, {
            "word": "restriction",
            "synonyms": ["limitation"]
        }, {
            "word": "result",
            "synonyms": ["outcome", "issue", "event", "effect", "consequence", "upshot"]
        }, {
            "word": "retain",
            "synonyms": ["keep on", "keep goin", "keep", "continue"]
        }, {
            "word": "retire",
            "synonyms": ["adjourn", "withdraw"]
        }, {
            "word": "retirement",
            "synonyms": ["retreat"]
        }, {
            "word": "return",
            "synonyms": ["coming back"]
        }, {
            "word": "reveal",
            "synonyms": ["display", "show"]
        }, {
            "word": "revenue",
            "synonyms": ["gross", "receipts"]
        }, {
            "word": "review",
            "synonyms": ["brushup"]
        }, {
            "word": "revolution",
            "synonyms": ["gyration", "rotation"]
        }, {
            "word": "rhythm",
            "synonyms": ["beat", "musical rhythm"]
        }, {
            "word": "rice",
            "synonyms": ["Rice", "Sir Tim Rice", "Timothy Miles Bindon Rice"]
        }, {
            "word": "rich",
            "synonyms": ["privileged", "well-situated", "easy", "well-off", "flush", "abundant", "well-fixed", "affluent", "well-heeled", "wealthy", "moneyed", "prosperous", "loaded", "comfortable", "well-to-do"]
        }, {
            "word": "rid",
            "synonyms": ["disembarrass", "free", "rid of"]
        }, {
            "word": "ride",
            "synonyms": ["drive"]
        }, {
            "word": "rifle",
            "synonyms": ["go"]
        }, {
            "word": "right",
            "synonyms": ["reactionist", "rightist", "reactionary", "conservative", "rightish", "right-wing", "far-right"]
        }, {
            "word": "ring",
            "synonyms": ["band"]
        }, {
            "word": "rise",
            "synonyms": ["advance"]
        }, {
            "word": "risk",
            "synonyms": ["hazard", "endangerment", "jeopardy", "peril"]
        }, {
            "word": "road",
            "synonyms": ["moving", "touring", "itinerant", "traveling"]
        }, {
            "word": "rock",
            "synonyms": ["careen", "tilt", "sway"]
        }, {
            "word": "role",
            "synonyms": ["theatrical role", "persona", "part", "character"]
        }, {
            "word": "roll",
            "synonyms": ["axial motion", "axial rotation"]
        }, {
            "word": "romantic",
            "synonyms": ["amatory", "amorous", "loving"]
        }, {
            "word": "room",
            "synonyms": ["way", "elbow room"]
        }, {
            "word": "root",
            "synonyms": ["ascendant", "ancestor", "ascendent", "antecedent"]
        }, {
            "word": "rope",
            "synonyms": ["forget me drug", "circl", "Mexican valium", "R-2", "rophy", "roach", "roofy"]
        }, {
            "word": "rose",
            "synonyms": ["chromatic", "rosaceous", "roseate"]
        }, {
            "word": "rough",
            "synonyms": ["unsubdivided", "fringed", "dentate", "simple", "bidentate", "compound", "fimbriate", "biserrate", "serrated", "denticulate", "serrulate", "spinose", "lacerate", "saw-toothed", "scalloped", "notched", "crenulate", "crispate", "toothed", "ciliate", "jagged", "laciniate", "pectinate", "emarginate", "erose", "crenate", "angulate", "crenated", "runcinate", "jaggy", "serrate", "rimose", "ciliated", "crenulated", "lacerated"]
        }, {
            "word": "roughly",
            "synonyms": ["about", "or s", "more or less", "some", "approximately", "around", "just about", "close to"]
        }, {
            "word": "round",
            "synonyms": ["cumuliform", "apple-shaped", "spheric", "capitate", "discoid", "globular", "disclike", "pear-shaped", "disklike", "moon-round", "bulb-shaped", "disc-shaped", "ball-shaped", "roundish", "bulbous", "rounded", "global", "wheel-like", "nutlike", "spherical", "discoidal", "circular", "barrel-shaped", "pinwheel-shaped", "orbicular", "goblet-shaped", "ringlike", "bulblike", "pancake-like", "globose", "coccoid", "disk-shaped", "moonlike"]
        }, {
            "word": "route",
            "synonyms": ["path", "itinerary"]
        }, {
            "word": "routine",
            "synonyms": ["quotidian", "mundane", "ordinary", "everyday", "workaday", "unremarkable"]
        }, {
            "word": "row",
            "synonyms": ["course"]
        }, {
            "word": "rub",
            "synonyms": ["snag", "hitch", "hang-up"]
        }, {
            "word": "rule",
            "synonyms": ["convention", "pattern", "formula", "normal"]
        }, {
            "word": "run",
            "synonyms": ["discharge", "outpouring"]
        }, {
            "word": "running",
            "synonyms": ["continual"]
        }, {
            "word": "rural",
            "synonyms": ["country-bred", "arcadian", "pastoral", "agrestic", "countryfied", "rustic", "bucolic", "campestral", "agricultural", "homespun", "countrified", "country-style", "farming", "cracker-barrel", "hobnailed", "folksy", "agrarian"]
        }, {
            "word": "rush",
            "synonyms": ["unreserved", "first-come-first-serve"]
        }, {
            "word": "russian",
            "synonyms": ["Russian", "country", "land", "state"]
        }, {
            "word": "cabin",
            "synonyms": []
        }, {
            "word": "cabinet",
            "synonyms": []
        }, {
            "word": "cable",
            "synonyms": ["cable length", "cable's length"]
        }, {
            "word": "cake",
            "synonyms": []
        }, {
            "word": "calculate",
            "synonyms": ["account"]
        }, {
            "word": "call",
            "synonyms": ["birdsong", "birdcall", "song"]
        }, {
            "word": "camera",
            "synonyms": ["photographic camera"]
        }, {
            "word": "camp",
            "synonyms": ["campy", "tasteless"]
        }, {
            "word": "campaign",
            "synonyms": ["cause", "movement", "drive", "effort", "crusade"]
        }, {
            "word": "campus",
            "synonyms": []
        }, {
            "word": "can",
            "synonyms": ["fanny", "posterior", "bottom", "bum", "hindquarters", "rear", "ass", "nates", "tooshie", "backside", "tail end", "arse", "tail", "buttocks", "fundament", "derriere", "stern", "buns", "behind", "hind end", "prat", "butt", "keister", "seat", "tush", "rear end", "rump"]
        }, {
            "word": "canadian",
            "synonyms": ["Canadian", "North American country", "North American nation"]
        }, {
            "word": "cancer",
            "synonyms": ["Cancer", "Crab"]
        }, {
            "word": "candidate",
            "synonyms": ["campaigner", "nominee"]
        }, {
            "word": "cap",
            "synonyms": ["chapiter", "capital"]
        }, {
            "word": "capability",
            "synonyms": ["capableness"]
        }, {
            "word": "capable",
            "synonyms": ["able", "competent"]
        }, {
            "word": "capacity",
            "synonyms": ["capability"]
        }, {
            "word": "capital",
            "synonyms": ["great", "majuscule", "uppercase"]
        }, {
            "word": "captain",
            "synonyms": ["chieftain"]
        }, {
            "word": "capture",
            "synonyms": []
        }, {
            "word": "car",
            "synonyms": ["machine", "auto", "motorcar", "automobile"]
        }, {
            "word": "carbon",
            "synonyms": ["atomic number 6", "C"]
        }, {
            "word": "card",
            "synonyms": ["batting order", "lineup"]
        }, {
            "word": "care",
            "synonyms": ["tending", "aid", "attention"]
        }, {
            "word": "career",
            "synonyms": ["vocation", "calling"]
        }, {
            "word": "careful",
            "synonyms": ["blow-by-blow", "elaborated", "certain", "close", "minute", "narrow", "elaborate", "cautious", "scrupulous", "painstaking", "particular", "too-careful", "detailed", "thorough", "protective", "overcareful", "conscientious", "prudent", "studious", "sure", "diligent"]
        }, {
            "word": "carefully",
            "synonyms": ["cautiously", "with kid gloves"]
        }, {
            "word": "carrier",
            "synonyms": ["attack aircraft carrier", "flattop", "aircraft carrier"]
        }, {
            "word": "carry",
            "synonyms": []
        }, {
            "word": "case",
            "synonyms": []
        }, {
            "word": "cash",
            "synonyms": ["Johnny Cash", "Cash", "John Cash"]
        }, {
            "word": "cast",
            "synonyms": ["formed"]
        }, {
            "word": "cat",
            "synonyms": ["big cat"]
        }, {
            "word": "catch",
            "synonyms": ["pinch", "collar", "taking into custody", "arrest", "apprehension"]
        }, {
            "word": "category",
            "synonyms": ["class", "family"]
        }, {
            "word": "catholic",
            "synonyms": ["broad-minded"]
        }, {
            "word": "cause",
            "synonyms": ["movement", "drive", "campaign", "effort", "crusade"]
        }, {
            "word": "ceiling",
            "synonyms": []
        }, {
            "word": "celebrate",
            "synonyms": ["fete"]
        }, {
            "word": "celebration",
            "synonyms": ["festivity"]
        }, {
            "word": "celebrity",
            "synonyms": ["renown", "fame"]
        }, {
            "word": "cell",
            "synonyms": ["cadre"]
        }, {
            "word": "center",
            "synonyms": ["middle-of-the-road", "centrist"]
        }, {
            "word": "central",
            "synonyms": ["midway", "centrical", "bifocal", "center", "nuclear", "bicentric", "centered", "centric", "midmost", "medial", "halfway", "middle", "focal", "amidship", "middlemost", "median"]
        }, {
            "word": "century",
            "synonyms": ["100", "one C", "centred", "C", "hundred"]
        }, {
            "word": "ceo",
            "synonyms": ["CEO", "chief operating officer", "chief executive officer"]
        }, {
            "word": "ceremony",
            "synonyms": []
        }, {
            "word": "certain",
            "synonyms": ["definite"]
        }, {
            "word": "certainly",
            "synonyms": ["surely", "sure enough", "for sure", "sure", "for certain", "sure as shooting"]
        }, {
            "word": "chain",
            "synonyms": []
        }, {
            "word": "chair",
            "synonyms": ["electric chair", "death chair", "hot seat"]
        }, {
            "word": "chairman",
            "synonyms": ["chair", "chairperson", "chairwoman", "president"]
        }, {
            "word": "challenge",
            "synonyms": []
        }, {
            "word": "chamber",
            "synonyms": []
        }, {
            "word": "champion",
            "synonyms": ["prizewinning", "best"]
        }, {
            "word": "championship",
            "synonyms": ["patronage", "backup", "backing"]
        }, {
            "word": "chance",
            "synonyms": ["unplanned", "accidental", "casual"]
        }, {
            "word": "change",
            "synonyms": []
        }, {
            "word": "changing",
            "synonyms": ["dynamic", "dynamical", "ever-changing"]
        }, {
            "word": "channel",
            "synonyms": []
        }, {
            "word": "chapter",
            "synonyms": []
        }, {
            "word": "character",
            "synonyms": []
        }, {
            "word": "characteristic",
            "synonyms": ["symptomatic", "identifying", "distinctive", "peculiar", "diagnostic", "typical", "distinguishing"]
        }, {
            "word": "characterize",
            "synonyms": ["characterise"]
        }, {
            "word": "charge",
            "synonyms": ["accusation"]
        }, {
            "word": "charity",
            "synonyms": ["brotherly love"]
        }, {
            "word": "chart",
            "synonyms": []
        }, {
            "word": "chase",
            "synonyms": ["Chase", "Salmon P. Chase", "Salmon Portland Chase"]
        }, {
            "word": "cheap",
            "synonyms": ["meretricious", "tawdry", "tasteless", "gimcrack", "brassy", "gaudy", "tatty", "garish", "tacky", "flash", "flashy", "loud", "trashy"]
        }, {
            "word": "check",
            "synonyms": ["stop", "hitch", "halt", "stay", "arrest", "stoppage"]
        }, {
            "word": "cheek",
            "synonyms": ["brass", "boldness", "face", "nerve"]
        }, {
            "word": "cheese",
            "synonyms": []
        }, {
            "word": "chef",
            "synonyms": []
        }, {
            "word": "chemical",
            "synonyms": ["chemic", "natural science"]
        }, {
            "word": "chest",
            "synonyms": []
        }, {
            "word": "chicken",
            "synonyms": ["yellow", "chickenhearted", "fearful", "lily-livered", "yellow-bellied", "cowardly", "white-livered"]
        }, {
            "word": "chief",
            "synonyms": ["main", "principal", "primary", "important", "of import"]
        }, {
            "word": "child",
            "synonyms": ["baby"]
        }, {
            "word": "childhood",
            "synonyms": ["puerility"]
        }, {
            "word": "chinese",
            "synonyms": ["island", "Chinese"]
        }, {
            "word": "chip",
            "synonyms": ["fleck", "flake", "bit", "scrap"]
        }, {
            "word": "chocolate",
            "synonyms": ["drinking chocolate", "hot chocolate", "cocoa"]
        }, {
            "word": "choice",
            "synonyms": ["superior", "select", "quality", "prize", "prime"]
        }, {
            "word": "cholesterol",
            "synonyms": ["cholesterin"]
        }, {
            "word": "choose",
            "synonyms": []
        }, {
            "word": "christian",
            "synonyms": ["faith", "religion", "religious belief", "Christian"]
        }, {
            "word": "christmas",
            "synonyms": ["Christmastide", "Christmastime", "Christmas", "Yuletide", "Yule", "Noel"]
        }, {
            "word": "church",
            "synonyms": []
        }, {
            "word": "cigarette",
            "synonyms": ["cigaret", "fag", "butt", "coffin nail"]
        }, {
            "word": "circle",
            "synonyms": ["dress circle"]
        }, {
            "word": "circumstance",
            "synonyms": []
        }, {
            "word": "cite",
            "synonyms": ["credit", "reference", "acknowledgment", "citation", "mention", "quotation"]
        }, {
            "word": "citizen",
            "synonyms": []
        }, {
            "word": "city",
            "synonyms": []
        }, {
            "word": "civil",
            "synonyms": ["civic", "national", "subject"]
        }, {
            "word": "civilian",
            "synonyms": ["noncombatant", "civil"]
        }, {
            "word": "claim",
            "synonyms": []
        }, {
            "word": "class",
            "synonyms": ["family", "category"]
        }, {
            "word": "classic",
            "synonyms": ["classical"]
        }, {
            "word": "classroom",
            "synonyms": ["schoolroom"]
        }, {
            "word": "clean",
            "synonyms": ["white", "blank", "empty"]
        }, {
            "word": "clear",
            "synonyms": ["innocent", "exonerated", "absolved", "cleared", "clean-handed", "guiltless", "exculpated", "vindicated"]
        }, {
            "word": "clearly",
            "synonyms": ["clear"]
        }, {
            "word": "client",
            "synonyms": []
        }, {
            "word": "climate",
            "synonyms": ["clime"]
        }, {
            "word": "climb",
            "synonyms": ["acclivity", "rise", "raise", "ascent", "upgrade"]
        }, {
            "word": "clinic",
            "synonyms": []
        }, {
            "word": "clinical",
            "synonyms": ["medical institution"]
        }, {
            "word": "clock",
            "synonyms": []
        }, {
            "word": "close",
            "synonyms": ["surrounding", "next", "close-hauled", "impendent", "juxtaposed", "at hand", "enveloping", "circumferent", "close together", "impending", "nestled", "snuggled", "adpressed", "ambient", "close-set", "immediate", "hand-to-hand", "close set", "walking", "close at hand", "appressed", "proximate", "scalelike", "side by side", "adjacent", "contiguous", "walk-to", "imminent", "approximate", "encompassing"]
        }, {
            "word": "closely",
            "synonyms": ["tight", "close"]
        }, {
            "word": "closer",
            "synonyms": ["nearer", "nigher"]
        }, {
            "word": "clothes",
            "synonyms": ["wearing apparel", "apparel", "dress"]
        }, {
            "word": "clothing",
            "synonyms": ["wearable", "habiliment", "article of clothing", "wear", "vesture"]
        }, {
            "word": "cloud",
            "synonyms": []
        }, {
            "word": "club",
            "synonyms": ["baseball club", "nine", "ball club"]
        }, {
            "word": "clue",
            "synonyms": ["cue", "clew"]
        }, {
            "word": "cluster",
            "synonyms": ["clump", "clustering", "bunch"]
        }, {
            "word": "coach",
            "synonyms": ["charabanc", "passenger vehicle", "motorcoach", "jitney", "autobus", "motorbus", "double-decker", "omnibus", "bus"]
        }, {
            "word": "coal",
            "synonyms": ["ember"]
        }, {
            "word": "coalition",
            "synonyms": ["alinement", "alliance", "alignment"]
        }, {
            "word": "coast",
            "synonyms": ["seashore", "seacoast", "sea-coast"]
        }, {
            "word": "coat",
            "synonyms": ["coating"]
        }, {
            "word": "code",
            "synonyms": ["codification"]
        }, {
            "word": "coffee",
            "synonyms": ["deep brown", "chocolate", "burnt umber", "umber"]
        }, {
            "word": "cognitive",
            "synonyms": ["psychological feature"]
        }, {
            "word": "cold",
            "synonyms": ["refrigerant", "rimed", "cutting", "algid", "unwarmed", "bleak", "frore", "cool", "refrigerated", "glacial", "acold", "stone-cold", "polar", "frozen", "arctic", "ice-cold", "nippy", "icy", "nipping", "crisp", "rimy", "raw", "frigorific", "parky", "shivery", "unheated", "gelid", "snappy", "refrigerating", "frosty", "frigid", "heatless"]
        }, {
            "word": "collapse",
            "synonyms": ["crash"]
        }, {
            "word": "colleague",
            "synonyms": ["fellow", "confrere"]
        }, {
            "word": "collect",
            "synonyms": ["cod", "owed", "due"]
        }, {
            "word": "collection",
            "synonyms": ["accumulation", "aggregation", "assemblage"]
        }, {
            "word": "collective",
            "synonyms": ["assembled", "agglomerative", "collectivized", "aggregate", "agglomerate", "made-up", "mass", "built", "integrative", "collectivised", "joint", "united", "clustered", "aggregative", "agglomerated", "knockdown", "aggregated"]
        }, {
            "word": "college",
            "synonyms": []
        }, {
            "word": "colonial",
            "synonyms": ["animal group"]
        }, {
            "word": "color",
            "synonyms": ["colour"]
        }, {
            "word": "column",
            "synonyms": []
        }, {
            "word": "combination",
            "synonyms": []
        }, {
            "word": "combine",
            "synonyms": ["combining"]
        }, {
            "word": "come",
            "synonyms": ["seminal fluid", "semen", "ejaculate", "seed"]
        }, {
            "word": "comedy",
            "synonyms": []
        }, {
            "word": "comfort",
            "synonyms": ["comfortableness"]
        }, {
            "word": "comfortable",
            "synonyms": ["comforted", "easy", "at ease"]
        }, {
            "word": "command",
            "synonyms": []
        }, {
            "word": "commander",
            "synonyms": ["air force officer"]
        }, {
            "word": "comment",
            "synonyms": ["commentary"]
        }, {
            "word": "commercial",
            "synonyms": ["commercialised", "mercenary", "commercialized", "technical", "mercantile", "moneymaking"]
        }, {
            "word": "commission",
            "synonyms": ["direction", "charge"]
        }, {
            "word": "commit",
            "synonyms": ["intrust", "confide", "trust", "entrust"]
        }, {
            "word": "commitment",
            "synonyms": ["dedication", "allegiance", "loyalty"]
        }, {
            "word": "committee",
            "synonyms": ["citizens committee"]
        }, {
            "word": "common",
            "synonyms": ["general", "grassroots", "frequent", "ordinary", "democratic", "usual", "average", "standard", "demotic", "popular"]
        }, {
            "word": "communicate",
            "synonyms": ["commune"]
        }, {
            "word": "communication",
            "synonyms": []
        }, {
            "word": "community",
            "synonyms": ["biotic community"]
        }, {
            "word": "company",
            "synonyms": []
        }, {
            "word": "compare",
            "synonyms": ["comparison", "equivalence", "comparability"]
        }, {
            "word": "comparison",
            "synonyms": ["equivalence", "compare", "comparability"]
        }, {
            "word": "compete",
            "synonyms": ["vie", "contend"]
        }, {
            "word": "competition",
            "synonyms": []
        }, {
            "word": "competitive",
            "synonyms": ["combative", "contending", "agonistical", "rivalrous", "matched", "competing", "competitory", "agonistic", "emulous"]
        }, {
            "word": "competitor",
            "synonyms": ["challenger", "rival", "contender", "competition"]
        }, {
            "word": "complain",
            "synonyms": []
        }, {
            "word": "complaint",
            "synonyms": ["ailment", "ill"]
        }, {
            "word": "complete",
            "synonyms": ["hearty", "right-down", "full-clad", "full-dress", "self-contained", "full-scale", "total", "dead", "all-out", "accomplished", "all", "absolute", "thoroughgoing", "realized", "sound", "full-blown", "rank", "sheer", "fleshed out", "clean", "thorough", "exhaustive", "good", "realised", "downright", "all-or-nothing", "out-and-out", "completed", "whole", "stand-alone", "allover", "full", "all-or-none", "comprehensive"]
        }, {
            "word": "completely",
            "synonyms": ["altogether", "all", "wholly", "whole", "totally", "entirely"]
        }, {
            "word": "complex",
            "synonyms": ["multiplex", "convoluted", "intricate", "tortuous", "compound", "multifactorial", "labyrinthian", "tangled", "Byzantine", "interlacing", "knotty", "interwoven", "difficult", "interlinking", "hard", "thickening", "daedal", "labyrinthine", "Gordian", "colonial", "decomposable", "complicated", "involved", "interlocking", "mazy", "analyzable", "composite"]
        }, {
            "word": "complicated",
            "synonyms": ["complex"]
        }, {
            "word": "component",
            "synonyms": ["ingredient", "element", "factor", "constituent"]
        }, {
            "word": "compose",
            "synonyms": []
        }, {
            "word": "composition",
            "synonyms": ["composing"]
        }, {
            "word": "comprehensive",
            "synonyms": ["blanket", "extensive", "citywide", "worldwide", "wide", "statewide", "cosmopolitan", "super", "countywide", "all-encompassing", "all-round", "nationwide", "all-inclusive", "door-to-door", "across-the-board", "house-to-house", "ecumenical", "all-embracing", "countrywide", "general", "schoolwide", "all-around", "well-rounded", "broad", "world-wide", "panoptic", "spatiotemporal", "encyclopedic", "complete", "universal", "plenary", "encyclopaedic", "large", "spaciotemporal", "encompassing", "umbrella", "omnibus", "oecumenical"]
        }, {
            "word": "computer",
            "synonyms": ["estimator", "reckoner", "figurer", "calculator"]
        }, {
            "word": "concentrate",
            "synonyms": ["dressed ore"]
        }, {
            "word": "concentration",
            "synonyms": []
        }, {
            "word": "concept",
            "synonyms": ["conception", "construct"]
        }, {
            "word": "concern",
            "synonyms": ["business", "business organisation", "business concern", "business organization"]
        }, {
            "word": "concerned",
            "synonyms": ["afraid", "troubled", "haunted", "obsessed", "taken up", "solicitous", "attentive", "preoccupied"]
        }, {
            "word": "concert",
            "synonyms": []
        }, {
            "word": "conclude",
            "synonyms": []
        }, {
            "word": "conclusion",
            "synonyms": []
        }, {
            "word": "concrete",
            "synonyms": ["factual", "touchable", "objective", "real", "existent", "tangible", "practical"]
        }, {
            "word": "condition",
            "synonyms": ["consideration", "circumstance"]
        }, {
            "word": "conduct",
            "synonyms": ["behaviour", "behavior", "doings"]
        }, {
            "word": "conference",
            "synonyms": ["group discussion"]
        }, {
            "word": "confidence",
            "synonyms": ["self-confidence", "sureness", "assurance", "authority", "self-assurance"]
        }, {
            "word": "confident",
            "synonyms": ["self-confident", "assured", "overconfident", "positive", "self-assured", "cocksure", "reassured"]
        }, {
            "word": "confirm",
            "synonyms": []
        }, {
            "word": "conflict",
            "synonyms": []
        }, {
            "word": "confront",
            "synonyms": ["face", "face off"]
        }, {
            "word": "confusion",
            "synonyms": []
        }, {
            "word": "congress",
            "synonyms": ["US Congress", "U.S. Congress", "Congress", "United States Congress"]
        }, {
            "word": "congressional",
            "synonyms": ["legislative", "law-makers", "general assembly", "legislature", "legislative assembly"]
        }, {
            "word": "connect",
            "synonyms": ["associate", "colligate", "link", "tie in", "link up", "relate"]
        }, {
            "word": "connection",
            "synonyms": []
        }, {
            "word": "consciousness",
            "synonyms": ["knowingness", "awareness", "cognisance", "cognizance"]
        }, {
            "word": "consensus",
            "synonyms": []
        }, {
            "word": "consequence",
            "synonyms": ["aftermath"]
        }, {
            "word": "conservative",
            "synonyms": ["unprogressive", "nonprogressive", "right", "ultraconservative", "blimpish", "fusty", "traditionalist", "standpat", "orthodox", "hidebound", "buttoned-up"]
        }, {
            "word": "consider",
            "synonyms": ["weigh", "count"]
        }, {
            "word": "considerable",
            "synonyms": ["sizable", "appreciable", "tidy", "respectable", "large", "significant", "sizeable", "right smart", "hefty", "substantial", "goodly", "big", "goodish"]
        }, {
            "word": "consideration",
            "synonyms": ["circumstance", "condition"]
        }, {
            "word": "consist",
            "synonyms": []
        }, {
            "word": "consistent",
            "synonyms": ["unchanging", "invariable", "conformable", "consonant", "agreeable", "reconciled", "self-consistent", "pursuant", "concordant", "accordant"]
        }, {
            "word": "constant",
            "synonyms": ["continuous", "never-ending", "incessant", "ceaseless", "unremitting", "unceasing", "perpetual", "uninterrupted"]
        }, {
            "word": "constantly",
            "synonyms": ["perpetually"]
        }, {
            "word": "constitute",
            "synonyms": ["nominate", "appoint", "name"]
        }, {
            "word": "constitutional",
            "synonyms": ["inbuilt", "inherent", "intrinsical", "integral", "built-in", "intrinsic"]
        }, {
            "word": "construct",
            "synonyms": ["conception", "concept"]
        }, {
            "word": "construction",
            "synonyms": ["building"]
        }, {
            "word": "consultant",
            "synonyms": ["adviser", "advisor"]
        }, {
            "word": "consume",
            "synonyms": []
        }, {
            "word": "consumer",
            "synonyms": []
        }, {
            "word": "consumption",
            "synonyms": ["use", "economic consumption", "usance", "use of goods and services"]
        }, {
            "word": "contact",
            "synonyms": []
        }, {
            "word": "contain",
            "synonyms": []
        }, {
            "word": "container",
            "synonyms": []
        }, {
            "word": "contemporary",
            "synonyms": ["contemporaneous", "synchronal", "synchronic", "synchronous"]
        }, {
            "word": "content",
            "synonyms": ["satisfied", "complacent", "self-complacent", "calm", "easygoing", "happy", "pleased", "self-satisfied", "placid", "contented", "smug"]
        }, {
            "word": "contest",
            "synonyms": ["competition"]
        }, {
            "word": "context",
            "synonyms": ["circumstance"]
        }, {
            "word": "continue",
            "synonyms": []
        }, {
            "word": "continued",
            "synonyms": ["continuing"]
        }, {
            "word": "contract",
            "synonyms": ["contract bridge"]
        }, {
            "word": "contrast",
            "synonyms": []
        }, {
            "word": "contribute",
            "synonyms": ["chip in", "kick in", "give"]
        }, {
            "word": "contribution",
            "synonyms": ["donation"]
        }, {
            "word": "control",
            "synonyms": []
        }, {
            "word": "controversial",
            "synonyms": ["debatable", "contentious", "disputable", "moot", "polemical", "disputed", "arguable", "polemic"]
        }, {
            "word": "controversy",
            "synonyms": ["arguing", "contention", "disputation", "disceptation", "contestation", "tilt", "argument"]
        }, {
            "word": "convention",
            "synonyms": ["convening"]
        }, {
            "word": "conventional",
            "synonyms": ["customary", "formal", "formulaic", "accepted", "received", "unoriginal", "stuffy", "stodgy"]
        }, {
            "word": "conversation",
            "synonyms": []
        }, {
            "word": "convert",
            "synonyms": []
        }, {
            "word": "conviction",
            "synonyms": ["sentence", "condemnation", "judgment of conviction"]
        }, {
            "word": "convince",
            "synonyms": ["win over", "convert"]
        }, {
            "word": "cook",
            "synonyms": ["Captain James Cook", "Cook", "James Cook", "Captain Cook"]
        }, {
            "word": "cookie",
            "synonyms": ["cooky", "biscuit"]
        }, {
            "word": "cooking",
            "synonyms": ["cookery", "preparation"]
        }, {
            "word": "cool",
            "synonyms": ["air-cooled", "cold", "precooled", "air-conditioned", "caller", "water-cooled", "chilly", "chill"]
        }, {
            "word": "cooperation",
            "synonyms": []
        }, {
            "word": "cop",
            "synonyms": ["fuzz", "copper", "bull", "pig"]
        }, {
            "word": "cope",
            "synonyms": ["coping", "header"]
        }, {
            "word": "copy",
            "synonyms": []
        }, {
            "word": "core",
            "synonyms": []
        }, {
            "word": "corn",
            "synonyms": []
        }, {
            "word": "corner",
            "synonyms": []
        }, {
            "word": "corporate",
            "synonyms": ["corporal", "bodied", "embodied", "corporeal", "incarnate", "material"]
        }, {
            "word": "corporation",
            "synonyms": ["corp"]
        }, {
            "word": "correct",
            "synonyms": ["word-perfect", "letter-perfect", "right", "precise", "exact", "true", "accurate", "proper", "straight"]
        }, {
            "word": "correspondent",
            "synonyms": ["analogous", "similar"]
        }, {
            "word": "cost",
            "synonyms": ["monetary value", "price"]
        }, {
            "word": "cotton",
            "synonyms": ["cotton cloth"]
        }, {
            "word": "couch",
            "synonyms": []
        }, {
            "word": "council",
            "synonyms": []
        }, {
            "word": "counselor",
            "synonyms": ["counsellor", "counselor-at-law", "pleader", "counsel", "advocate"]
        }, {
            "word": "count",
            "synonyms": ["enumeration", "tally", "numeration", "reckoning", "counting"]
        }, {
            "word": "counter",
            "synonyms": ["negative", "antagonistic"]
        }, {
            "word": "country",
            "synonyms": ["area"]
        }, {
            "word": "county",
            "synonyms": []
        }, {
            "word": "couple",
            "synonyms": ["match", "mates"]
        }, {
            "word": "courage",
            "synonyms": ["bravery", "braveness", "courageousness"]
        }, {
            "word": "course",
            "synonyms": ["of course", "naturally"]
        }, {
            "word": "court",
            "synonyms": ["Margaret Court", "Court"]
        }, {
            "word": "cousin",
            "synonyms": ["full cousin", "cousin-german", "first cousin"]
        }, {
            "word": "cover",
            "synonyms": ["book binding", "binding", "back"]
        }, {
            "word": "coverage",
            "synonyms": []
        }, {
            "word": "cow",
            "synonyms": ["moo-cow"]
        }, {
            "word": "crack",
            "synonyms": ["super", "topnotch", "fantastic", "A-one", "superior", "first-rate", "tiptop", "tops", "ace"]
        }, {
            "word": "craft",
            "synonyms": ["craftiness", "wiliness", "foxiness", "guile", "cunning", "slyness"]
        }, {
            "word": "crash",
            "synonyms": ["clash", "clangor", "clank", "clangour", "clang", "clangoring"]
        }, {
            "word": "crazy",
            "synonyms": ["insane", "mad", "disturbed", "unbalanced", "distracted", "sick", "unhinged", "brainsick", "demented"]
        }, {
            "word": "cream",
            "synonyms": []
        }, {
            "word": "create",
            "synonyms": []
        }, {
            "word": "creation",
            "synonyms": []
        }, {
            "word": "creative",
            "synonyms": ["constructive"]
        }, {
            "word": "creature",
            "synonyms": ["animate being", "fauna", "beast", "brute", "animal"]
        }, {
            "word": "credit",
            "synonyms": []
        }, {
            "word": "crew",
            "synonyms": ["gang", "crowd", "bunch"]
        }, {
            "word": "crime",
            "synonyms": ["law-breaking"]
        }, {
            "word": "criminal",
            "synonyms": ["wrong", "deplorable", "reprehensible", "vicious", "condemnable"]
        }, {
            "word": "crisis",
            "synonyms": []
        }, {
            "word": "critic",
            "synonyms": []
        }, {
            "word": "critical",
            "synonyms": ["dire", "desperate", "crucial", "acute", "important", "grievous", "severe", "grave", "dangerous", "serious", "life-threatening"]
        }, {
            "word": "criticism",
            "synonyms": ["critique"]
        }, {
            "word": "criticize",
            "synonyms": ["criticise"]
        }, {
            "word": "crop",
            "synonyms": []
        }, {
            "word": "cross",
            "synonyms": ["ill-tempered", "grouchy", "bad-tempered", "fussy", "crabbed", "ill-natured", "grumpy", "crabby"]
        }, {
            "word": "crowd",
            "synonyms": ["gang", "bunch", "crew"]
        }, {
            "word": "crucial",
            "synonyms": ["essential", "all important", "important", "of import", "of the essence", "all-important"]
        }, {
            "word": "cry",
            "synonyms": []
        }, {
            "word": "cultural",
            "synonyms": ["content", "mental object", "cognitive content"]
        }, {
            "word": "culture",
            "synonyms": ["acculturation"]
        }, {
            "word": "cup",
            "synonyms": []
        }, {
            "word": "curious",
            "synonyms": ["rummy", "peculiar", "unusual", "singular", "odd", "queer", "strange", "rum", "funny"]
        }, {
            "word": "current",
            "synonyms": ["modern", "present-day", "rife", "topical", "underway", "up-to-the-minute", "actual", "circulating", "ongoing", "on-line", "incumbent", "new", "latest", "prevailing", "live", "up-to-date", "contemporary", "on-going", "prevalent", "afoot", "occurrent"]
        }, {
            "word": "currently",
            "synonyms": ["presently"]
        }, {
            "word": "curriculum",
            "synonyms": ["programme", "program", "syllabus", "course of study"]
        }, {
            "word": "custom",
            "synonyms": ["custom-made", "bespoken", "customized", "custom-built", "tailor-made", "customised", "bespoke", "made-to-order", "tailored"]
        }, {
            "word": "customer",
            "synonyms": ["client"]
        }, {
            "word": "cut",
            "synonyms": ["pierced", "chopped", "cut off", "perforate", "punctured", "perforated", "incised", "split", "severed", "sliced", "cut up", "shredded"]
        }, {
            "word": "cycle",
            "synonyms": ["bicycle", "bike", "wheel"]
        }, {
            "word": "dad",
            "synonyms": ["daddy", "pappa", "dada", "papa", "pop", "pa"]
        }, {
            "word": "daily",
            "synonyms": ["day-to-day", "every day", "regular", "day-after-day"]
        }, {
            "word": "damage",
            "synonyms": ["equipment casualty"]
        }, {
            "word": "dance",
            "synonyms": []
        }, {
            "word": "danger",
            "synonyms": []
        }, {
            "word": "dangerous",
            "synonyms": ["critical", "grievous", "severe", "grave", "serious", "life-threatening"]
        }, {
            "word": "dare",
            "synonyms": ["daring"]
        }, {
            "word": "dark",
            "synonyms": ["glooming", "lightless", "unlighted", "Cimmerian", "crepuscular", "unlit", "pitch-black", "darkening", "aphotic", "dim", "gloomy", "twilit", "pitch-dark", "sulky", "gloomful", "darkened", "black", "Acheronian", "twilight", "darkling", "caliginous", "subdued", "unilluminated", "semidark", "tenebrific", "Acherontic", "dusky", "tenebrious", "tenebrous", "Stygian"]
        }, {
            "word": "darkness",
            "synonyms": ["dark"]
        }, {
            "word": "data",
            "synonyms": ["information"]
        }, {
            "word": "date",
            "synonyms": ["appointment", "engagement"]
        }, {
            "word": "daughter",
            "synonyms": ["girl"]
        }, {
            "word": "day",
            "synonyms": []
        }, {
            "word": "dead",
            "synonyms": ["bushed", "tired", "all in", "beat"]
        }, {
            "word": "deal",
            "synonyms": []
        }, {
            "word": "dealer",
            "synonyms": []
        }, {
            "word": "dear",
            "synonyms": ["loved", "beloved", "darling"]
        }, {
            "word": "death",
            "synonyms": ["Death"]
        }, {
            "word": "debate",
            "synonyms": ["argumentation", "argument"]
        }, {
            "word": "debt",
            "synonyms": []
        }, {
            "word": "decade",
            "synonyms": ["decennium", "decennary"]
        }, {
            "word": "decide",
            "synonyms": []
        }, {
            "word": "decision",
            "synonyms": ["decisiveness"]
        }, {
            "word": "deck",
            "synonyms": ["pack of cards", "deck of cards"]
        }, {
            "word": "declare",
            "synonyms": ["hold", "adjudge"]
        }, {
            "word": "decline",
            "synonyms": ["decay"]
        }, {
            "word": "decrease",
            "synonyms": ["decrement"]
        }, {
            "word": "deep",
            "synonyms": ["abstruse", "recondite", "esoteric"]
        }, {
            "word": "deeply",
            "synonyms": ["deep"]
        }, {
            "word": "deer",
            "synonyms": ["cervid"]
        }, {
            "word": "defeat",
            "synonyms": ["frustration"]
        }, {
            "word": "defend",
            "synonyms": ["champion"]
        }, {
            "word": "defendant",
            "synonyms": ["suspect"]
        }, {
            "word": "defense",
            "synonyms": ["defending team", "defence"]
        }, {
            "word": "defensive",
            "synonyms": ["protective", "antisubmarine", "en garde", "antiaircraft", "defending", "antitank"]
        }, {
            "word": "deficit",
            "synonyms": []
        }, {
            "word": "define",
            "synonyms": []
        }, {
            "word": "definitely",
            "synonyms": ["unquestionably", "decidedly", "in spades", "emphatically", "by all odds"]
        }, {
            "word": "definition",
            "synonyms": []
        }, {
            "word": "degree",
            "synonyms": ["academic degree"]
        }, {
            "word": "delay",
            "synonyms": ["hold", "postponement", "wait", "time lag"]
        }, {
            "word": "deliver",
            "synonyms": []
        }, {
            "word": "delivery",
            "synonyms": []
        }, {
            "word": "demand",
            "synonyms": []
        }, {
            "word": "democracy",
            "synonyms": ["majority rule"]
        }, {
            "word": "democrat",
            "synonyms": ["Democrat"]
        }, {
            "word": "democratic",
            "synonyms": ["advocator", "exponent", "proponent", "advocate"]
        }, {
            "word": "demonstrate",
            "synonyms": ["manifest", "evidence", "attest", "certify"]
        }, {
            "word": "demonstration",
            "synonyms": ["demo"]
        }, {
            "word": "deny",
            "synonyms": ["abnegate"]
        }, {
            "word": "department",
            "synonyms": []
        }, {
            "word": "depend",
            "synonyms": []
        }, {
            "word": "dependent",
            "synonyms": ["symbiotic", "babelike", "unfree", "helpless", "mutualist", "myrmecophilous", "bloodsucking", "underage", "reliant", "parasitic", "interdependent", "parasitical", "leechlike", "mutually beneficial"]
        }, {
            "word": "depict",
            "synonyms": ["draw", "describe"]
        }, {
            "word": "depression",
            "synonyms": []
        }, {
            "word": "depth",
            "synonyms": []
        }, {
            "word": "deputy",
            "synonyms": ["deputy sheriff"]
        }, {
            "word": "derive",
            "synonyms": ["come", "descend"]
        }, {
            "word": "describe",
            "synonyms": ["draw", "depict"]
        }, {
            "word": "description",
            "synonyms": []
        }, {
            "word": "desert",
            "synonyms": ["inhospitable", "waste", "godforsaken", "wild"]
        }, {
            "word": "deserve",
            "synonyms": ["merit"]
        }, {
            "word": "design",
            "synonyms": ["pattern", "blueprint"]
        }, {
            "word": "designer",
            "synonyms": ["architect"]
        }, {
            "word": "desire",
            "synonyms": []
        }, {
            "word": "desk",
            "synonyms": []
        }, {
            "word": "desperate",
            "synonyms": ["dangerous", "unsafe"]
        }, {
            "word": "despite",
            "synonyms": ["contempt", "disdain", "scorn"]
        }, {
            "word": "destroy",
            "synonyms": ["demolish"]
        }, {
            "word": "destruction",
            "synonyms": ["wipeout", "demolition"]
        }, {
            "word": "detail",
            "synonyms": ["contingent"]
        }, {
            "word": "detailed",
            "synonyms": ["elaborated", "careful", "elaborate"]
        }, {
            "word": "detect",
            "synonyms": ["observe", "notice", "find", "discover"]
        }, {
            "word": "determine",
            "synonyms": ["find out", "check", "ascertain", "learn", "watch", "see"]
        }, {
            "word": "develop",
            "synonyms": ["acquire", "evolve"]
        }, {
            "word": "developing",
            "synonyms": ["nonindustrial", "underdeveloped"]
        }, {
            "word": "development",
            "synonyms": []
        }, {
            "word": "device",
            "synonyms": []
        }, {
            "word": "devote",
            "synonyms": ["consecrate", "dedicate", "commit", "give"]
        }, {
            "word": "dialogue",
            "synonyms": ["dialog", "duologue"]
        }, {
            "word": "die",
            "synonyms": []
        }, {
            "word": "diet",
            "synonyms": ["dieting"]
        }, {
            "word": "differ",
            "synonyms": ["dissent", "disagree", "take issue"]
        }, {
            "word": "difference",
            "synonyms": []
        }, {
            "word": "different",
            "synonyms": ["antithetic", "different", "contrasting", "several", "antithetical", "contrary", "disparate", "opposite", "assorted", "diverse", "contrastive", "polar", "incompatible", "variant", "varied", "diametric", "divergent", "divers", "distinguishable", "diametrical", "distinct", "unlike", "various", "dissimilar"]
        }, {
            "word": "differently",
            "synonyms": ["otherwise", "other than"]
        }, {
            "word": "difficult",
            "synonyms": ["effortful"]
        }, {
            "word": "difficulty",
            "synonyms": []
        }, {
            "word": "dig",
            "synonyms": []
        }, {
            "word": "digital",
            "synonyms": []
        }, {
            "word": "dimension",
            "synonyms": []
        }, {
            "word": "dining",
            "synonyms": []
        }, {
            "word": "dinner",
            "synonyms": ["dinner party"]
        }, {
            "word": "direct",
            "synonyms": ["absolute"]
        }, {
            "word": "direction",
            "synonyms": ["commission", "charge"]
        }, {
            "word": "directly",
            "synonyms": ["straight", "flat"]
        }, {
            "word": "director",
            "synonyms": []
        }, {
            "word": "dirt",
            "synonyms": ["ungraded", "unimproved"]
        }, {
            "word": "dirty",
            "synonyms": ["scabrous", "filthy", "obscene", "foul-mouthed", "bawdy", "blue", "ribald", "foul-spoken", "dirty-minded", "salacious", "smutty", "nasty", "scatological", "foul", "blasphemous", "indecent", "profane", "raunchy", "off-color", "lewd"]
        }, {
            "word": "disability",
            "synonyms": ["impairment", "disablement", "handicap"]
        }, {
            "word": "disagree",
            "synonyms": ["dissent", "take issue", "differ"]
        }, {
            "word": "disappear",
            "synonyms": ["melt"]
        }, {
            "word": "disaster",
            "synonyms": ["tragedy", "catastrophe", "calamity", "cataclysm"]
        }, {
            "word": "discipline",
            "synonyms": ["correction"]
        }, {
            "word": "discourse",
            "synonyms": ["discussion", "treatment"]
        }, {
            "word": "discover",
            "synonyms": ["observe", "notice", "find", "detect"]
        }, {
            "word": "discovery",
            "synonyms": ["breakthrough", "find"]
        }, {
            "word": "discrimination",
            "synonyms": ["favouritism", "favoritism"]
        }, {
            "word": "discuss",
            "synonyms": ["talk about", "discourse"]
        }, {
            "word": "discussion",
            "synonyms": ["word", "give-and-take"]
        }, {
            "word": "disease",
            "synonyms": []
        }, {
            "word": "dish",
            "synonyms": []
        }, {
            "word": "dismiss",
            "synonyms": ["brush off", "disregard", "push aside", "brush aside", "ignore", "discount"]
        }, {
            "word": "disorder",
            "synonyms": ["disorderliness"]
        }, {
            "word": "display",
            "synonyms": []
        }, {
            "word": "dispute",
            "synonyms": ["contravention"]
        }, {
            "word": "distance",
            "synonyms": ["aloofness"]
        }, {
            "word": "distant",
            "synonyms": ["reserved", "aloof", "upstage"]
        }, {
            "word": "distinct",
            "synonyms": ["outlined", "chiseled", "clean-cut", "sharp", "knifelike", "razor-sharp", "precise", "well-defined", "defined", "clear-cut", "clear", "crystalline", "definite", "crisp"]
        }, {
            "word": "distinction",
            "synonyms": []
        }, {
            "word": "distinguish",
            "synonyms": ["identify", "discover", "key out", "name", "describe", "key"]
        }, {
            "word": "distribute",
            "synonyms": ["mete out", "lot", "dispense", "administer", "parcel out", "deal out", "shell out", "dish out", "allot", "dole out", "deal"]
        }, {
            "word": "distribution",
            "synonyms": []
        }, {
            "word": "district",
            "synonyms": ["dominion", "territorial dominion", "territory"]
        }, {
            "word": "diverse",
            "synonyms": ["divers", "different"]
        }, {
            "word": "diversity",
            "synonyms": ["variety", "multifariousness", "diverseness"]
        }, {
            "word": "divide",
            "synonyms": []
        }, {
            "word": "division",
            "synonyms": []
        }, {
            "word": "divorce",
            "synonyms": ["divorcement"]
        }, {
            "word": "dna",
            "synonyms": ["desoxyribonucleic acid", "DNA", "deoxyribonucleic acid"]
        }, {
            "word": "do",
            "synonyms": ["brawl", "bash"]
        }, {
            "word": "doctor",
            "synonyms": ["physician", "doc", "MD", "medico", "Dr."]
        }, {
            "word": "document",
            "synonyms": []
        }, {
            "word": "dog",
            "synonyms": ["andiron", "dog-iron", "firedog"]
        }, {
            "word": "domestic",
            "synonyms": ["tamed", "tame", "domesticated"]
        }, {
            "word": "dominant",
            "synonyms": ["ascendant", "dominating", "preponderant", "predominant", "predominate", "ascendent", "paramount", "sovereign", "superior", "possessive", "overriding", "controlling", "supreme", "governing", "preponderating"]
        }, {
            "word": "dominate",
            "synonyms": ["command", "overlook", "overtop"]
        }, {
            "word": "door",
            "synonyms": ["threshold", "doorway", "room access"]
        }, {
            "word": "double",
            "synonyms": ["bivalent"]
        }, {
            "word": "doubt",
            "synonyms": ["question", "dubiousness", "doubtfulness"]
        }, {
            "word": "down",
            "synonyms": ["descending", "behind", "set", "downbound", "thrown", "weak", "fallen", "downward", "downfield", "downcast", "low"]
        }, {
            "word": "downtown",
            "synonyms": []
        }, {
            "word": "dozen",
            "synonyms": ["cardinal", "12", "twelve", "xii"]
        }, {
            "word": "draft",
            "synonyms": ["bill of exchange", "order of payment"]
        }, {
            "word": "drag",
            "synonyms": []
        }, {
            "word": "drama",
            "synonyms": ["dramatic event"]
        }, {
            "word": "dramatic",
            "synonyms": ["dramatic composition", "dramatic work"]
        }, {
            "word": "dramatically",
            "synonyms": []
        }, {
            "word": "draw",
            "synonyms": ["draw play"]
        }, {
            "word": "drawing",
            "synonyms": []
        }, {
            "word": "dream",
            "synonyms": ["ambition", "aspiration"]
        }, {
            "word": "dress",
            "synonyms": ["formal", "full-dress"]
        }, {
            "word": "drink",
            "synonyms": ["drinkable", "potable", "beverage"]
        }, {
            "word": "drive",
            "synonyms": ["cause", "movement", "campaign", "effort", "crusade"]
        }, {
            "word": "driver",
            "synonyms": ["device driver"]
        }, {
            "word": "drop",
            "synonyms": ["bead", "pearl"]
        }, {
            "word": "drug",
            "synonyms": []
        }, {
            "word": "dry",
            "synonyms": ["arid", "dried-out", "bone dry", "desiccated", "parched", "thirsty", "air-dry", "sear", "dry-shod", "shriveled", "bone-dry", "dried", "rainless", "semi-dry", "baked", "kiln-dried", "semiarid", "scorched", "air-dried", "waterless", "sunbaked", "sere", "shrivelled", "withered", "adust", "dried-up"]
        }, {
            "word": "due",
            "synonyms": ["expected"]
        }, {
            "word": "dust",
            "synonyms": ["junk", "rubble", "detritus", "debris"]
        }, {
            "word": "duty",
            "synonyms": ["obligation", "responsibility"]
        }, {
            "word": "each",
            "synonyms": ["all"]
        }, {
            "word": "eager",
            "synonyms": ["hot", "impatient", "anxious", "overeager", "dying", "raring"]
        }, {
            "word": "ear",
            "synonyms": []
        }, {
            "word": "early",
            "synonyms": ["first", "archean", "primaeval", "primal", "premature", "azoic", "earlyish", "earlier", "advance", "wee", "archaeozoic", "archaean", "primeval", "beforehand", "aboriginal", "archeozoic", "proto", "previous", "untimely", "primordial", "proterozoic", "earliest"]
        }, {
            "word": "earn",
            "synonyms": ["realize", "take in", "pull in", "bring in", "gain", "realise", "clear", "make"]
        }, {
            "word": "earnings",
            "synonyms": ["profit", "net profit", "net", "profits", "net income", "lucre"]
        }, {
            "word": "earth",
            "synonyms": ["world", "Earth", "globe"]
        }, {
            "word": "ease",
            "synonyms": ["comfort"]
        }, {
            "word": "easily",
            "synonyms": ["easy"]
        }, {
            "word": "east",
            "synonyms": ["eastern", "eastbound", "eastmost", "eastward", "eastside", "easternmost", "easterly"]
        }, {
            "word": "eastern",
            "synonyms": ["oriental", "Asian", "orient"]
        }, {
            "word": "easy",
            "synonyms": ["abundant"]
        }, {
            "word": "eat",
            "synonyms": ["use up", "wipe out", "run through", "eat up", "exhaust", "deplete", "consume"]
        }, {
            "word": "economic",
            "synonyms": ["economical", "system", "scheme"]
        }, {
            "word": "economics",
            "synonyms": ["economic science", "political economy"]
        }, {
            "word": "economist",
            "synonyms": ["economic expert"]
        }, {
            "word": "economy",
            "synonyms": ["economic system"]
        }, {
            "word": "edge",
            "synonyms": ["border"]
        }, {
            "word": "edition",
            "synonyms": []
        }, {
            "word": "editor",
            "synonyms": ["editor in chief"]
        }, {
            "word": "educate",
            "synonyms": []
        }, {
            "word": "education",
            "synonyms": []
        }, {
            "word": "educational",
            "synonyms": ["informative", "instructive"]
        }, {
            "word": "educator",
            "synonyms": ["pedagog", "pedagogue"]
        }, {
            "word": "effect",
            "synonyms": ["outcome", "issue", "result", "event", "consequence", "upshot"]
        }, {
            "word": "effective",
            "synonyms": ["actual", "existent"]
        }, {
            "word": "effectively",
            "synonyms": ["efficaciously"]
        }, {
            "word": "efficiency",
            "synonyms": []
        }, {
            "word": "efficient",
            "synonyms": ["effectual", "economic", "cost-effective", "prompt", "cost-efficient", "timesaving", "effective", "expeditious", "economical", "competent", "underspent", "efficacious", "high-octane", "businesslike", "streamlined"]
        }, {
            "word": "effort",
            "synonyms": ["attempt", "try", "endeavor", "endeavour"]
        }, {
            "word": "egg",
            "synonyms": ["eggs"]
        }, {
            "word": "eight",
            "synonyms": ["cardinal", "viii", "8"]
        }, {
            "word": "elderly",
            "synonyms": ["aged", "senior", "old", "older"]
        }, {
            "word": "elect",
            "synonyms": ["elite", "selected"]
        }, {
            "word": "election",
            "synonyms": []
        }, {
            "word": "electric",
            "synonyms": ["electrical", "physical phenomenon"]
        }, {
            "word": "electricity",
            "synonyms": ["electrical energy"]
        }, {
            "word": "electronic",
            "synonyms": ["lepton"]
        }, {
            "word": "element",
            "synonyms": ["chemical element"]
        }, {
            "word": "elementary",
            "synonyms": ["primary", "basic", "elemental"]
        }, {
            "word": "eliminate",
            "synonyms": ["extinguish", "wipe out", "decimate", "carry off", "annihilate", "eradicate"]
        }, {
            "word": "elite",
            "synonyms": ["elect", "selected"]
        }, {
            "word": "else",
            "synonyms": ["other"]
        }, {
            "word": "e-mail",
            "synonyms": ["electronic mail", "email"]
        }, {
            "word": "embrace",
            "synonyms": ["bosom"]
        }, {
            "word": "emerge",
            "synonyms": []
        }, {
            "word": "emergency",
            "synonyms": ["exigency", "pinch"]
        }, {
            "word": "emission",
            "synonyms": ["discharge"]
        }, {
            "word": "emotion",
            "synonyms": []
        }, {
            "word": "emotional",
            "synonyms": ["mind-blowing", "affectional", "little", "lyrical", "emotive", "maudlin", "drippy", "funky", "releasing", "soppy", "cathartic", "schmalzy", "moved", "bathetic", "affective", "charged", "overemotional", "slushy", "soulful", "warm-toned", "schmaltzy", "touched", "mawkish", "warm", "soupy", "mushy", "sloppy", "het up", "hot-blooded", "moving", "temperamental", "affected", "supercharged", "low-down", "lyric", "hokey", "moody", "passionate", "stirred", "Latin", "sentimental"]
        }, {
            "word": "emphasis",
            "synonyms": ["accent"]
        }, {
            "word": "emphasize",
            "synonyms": ["accent", "accentuate", "emphasise", "stress", "punctuate"]
        }, {
            "word": "employ",
            "synonyms": ["employment"]
        }, {
            "word": "employee",
            "synonyms": []
        }, {
            "word": "employer",
            "synonyms": []
        }, {
            "word": "employment",
            "synonyms": ["employ"]
        }, {
            "word": "empty",
            "synonyms": ["plundered", "empty-handed", "looted", "vacuous", "blank", "innocent", "clean", "stripped", "devoid", "pillaged", "destitute", "barren", "lifeless", "white", "bare", "ransacked", "void", "glassy", "vacant", "glazed"]
        }, {
            "word": "enable",
            "synonyms": []
        }, {
            "word": "encounter",
            "synonyms": ["brush", "clash", "skirmish"]
        }, {
            "word": "encourage",
            "synonyms": []
        }, {
            "word": "end",
            "synonyms": []
        }, {
            "word": "enemy",
            "synonyms": ["opposition", "foe", "foeman"]
        }, {
            "word": "energy",
            "synonyms": ["Energy", "DOE", "Energy Department", "Department of Energy"]
        }, {
            "word": "enforcement",
            "synonyms": []
        }, {
            "word": "engage",
            "synonyms": ["absorb", "occupy", "engross"]
        }, {
            "word": "engine",
            "synonyms": []
        }, {
            "word": "engineer",
            "synonyms": ["applied scientist", "technologist"]
        }, {
            "word": "engineering",
            "synonyms": ["engine room"]
        }, {
            "word": "english",
            "synonyms": ["European country", "European nation", "English"]
        }, {
            "word": "enhance",
            "synonyms": []
        }, {
            "word": "enjoy",
            "synonyms": ["bask", "savor", "relish", "savour"]
        }, {
            "word": "enormous",
            "synonyms": ["large", "big", "tremendous"]
        }, {
            "word": "enough",
            "synonyms": ["sufficient", "decent", "adequate"]
        }, {
            "word": "ensure",
            "synonyms": ["assure", "guarantee", "insure", "secure"]
        }, {
            "word": "enter",
            "synonyms": ["accede"]
        }, {
            "word": "enterprise",
            "synonyms": ["endeavor", "endeavour"]
        }, {
            "word": "entertainment",
            "synonyms": ["amusement"]
        }, {
            "word": "entire",
            "synonyms": ["full", "total", "whole"]
        }, {
            "word": "entirely",
            "synonyms": ["exclusively", "alone", "solely", "only"]
        }, {
            "word": "entrance",
            "synonyms": ["entering"]
        }, {
            "word": "entry",
            "synonyms": ["ledger entry", "accounting entry"]
        }, {
            "word": "environment",
            "synonyms": ["environs", "surroundings", "surround"]
        }, {
            "word": "environmental",
            "synonyms": ["biological science", "biology"]
        }, {
            "word": "episode",
            "synonyms": []
        }, {
            "word": "equal",
            "synonyms": ["isometrical", "level", "equalized", "close", "isochronous", "isoclinal", "tantamount", "coordinate", "balanced", "coequal", "equalised", "even", "equivalent", "isometric", "half-and-half", "isoclinic", "equidistant", "tied", "tight", "same", "equilateral", "fifty-fifty", "isochronal", "comparable", "commensurate", "quits", "isothermal"]
        }, {
            "word": "equally",
            "synonyms": ["every bit", "as"]
        }, {
            "word": "equipment",
            "synonyms": []
        }, {
            "word": "era",
            "synonyms": ["ERA", "earned run average"]
        }, {
            "word": "error",
            "synonyms": ["computer error"]
        }, {
            "word": "escape",
            "synonyms": []
        }, {
            "word": "especially",
            "synonyms": ["specially", "particularly", "peculiarly"]
        }, {
            "word": "essay",
            "synonyms": []
        }, {
            "word": "essential",
            "synonyms": ["all important", "crucial", "important", "of import", "of the essence", "all-important"]
        }, {
            "word": "essentially",
            "synonyms": ["in essence", "fundamentally", "au fond", "basically"]
        }, {
            "word": "establish",
            "synonyms": ["ground", "found", "base"]
        }, {
            "word": "establishment",
            "synonyms": ["administration", "organization", "brass", "organisation", "governance", "governing body"]
        }, {
            "word": "estate",
            "synonyms": ["estate of the realm"]
        }, {
            "word": "estimate",
            "synonyms": ["estimation", "appraisal"]
        }, {
            "word": "ethics",
            "synonyms": ["morality", "morals", "ethical motive"]
        }, {
            "word": "ethnic",
            "synonyms": ["cultural", "social", "ethnical"]
        }, {
            "word": "european",
            "synonyms": ["continent", "European"]
        }, {
            "word": "evaluate",
            "synonyms": ["appraise", "value", "assess", "measure", "valuate"]
        }, {
            "word": "evaluation",
            "synonyms": ["rating"]
        }, {
            "word": "even",
            "synonyms": ["fifty-fifty", "equal"]
        }, {
            "word": "evening",
            "synonyms": ["eve", "eventide", "even"]
        }, {
            "word": "event",
            "synonyms": ["case"]
        }, {
            "word": "eventually",
            "synonyms": ["at length", "finally"]
        }, {
            "word": "ever",
            "synonyms": ["always", "e'er"]
        }, {
            "word": "every",
            "synonyms": ["all"]
        }, {
            "word": "everyday",
            "synonyms": ["informal", "casual"]
        }, {
            "word": "everywhere",
            "synonyms": ["everyplace", "all over"]
        }, {
            "word": "evidence",
            "synonyms": ["grounds"]
        }, {
            "word": "evolution",
            "synonyms": ["development"]
        }, {
            "word": "evolve",
            "synonyms": ["acquire", "develop"]
        }, {
            "word": "exact",
            "synonyms": ["correct", "precise", "accurate", "right"]
        }, {
            "word": "exactly",
            "synonyms": ["just", "precisely"]
        }, {
            "word": "examination",
            "synonyms": ["exam", "test"]
        }, {
            "word": "examine",
            "synonyms": ["study", "canvas", "analyse", "canvass", "analyze"]
        }, {
            "word": "example",
            "synonyms": ["case", "instance"]
        }, {
            "word": "exceed",
            "synonyms": ["outperform", "surpass", "outstrip", "surmount", "outgo", "outmatch", "outdo"]
        }, {
            "word": "excellent",
            "synonyms": ["first-class", "superior", "fantabulous"]
        }, {
            "word": "except",
            "synonyms": ["demur"]
        }, {
            "word": "exception",
            "synonyms": []
        }, {
            "word": "exchange",
            "synonyms": []
        }, {
            "word": "exciting",
            "synonyms": ["tickling", "exhilarating", "electric", "stimulating", "glamourous", "tingling", "galvanizing", "intoxicating", "titillating", "galvanic", "thrilling", "galvanising", "breathtaking", "breathless", "glamorous", "elating", "electrifying", "heady", "provocative", "interesting", "sexy"]
        }, {
            "word": "executive",
            "synonyms": ["enforcement"]
        }, {
            "word": "exercise",
            "synonyms": []
        }, {
            "word": "exhibit",
            "synonyms": ["display", "showing"]
        }, {
            "word": "exhibition",
            "synonyms": ["expo", "exposition"]
        }, {
            "word": "exist",
            "synonyms": ["be"]
        }, {
            "word": "existence",
            "synonyms": ["beingness", "being"]
        }, {
            "word": "existing",
            "synonyms": ["alive", "extant", "active", "existent"]
        }, {
            "word": "expand",
            "synonyms": ["prosper", "get ahead", "boom", "thrive", "flourish"]
        }, {
            "word": "expansion",
            "synonyms": ["enlargement"]
        }, {
            "word": "expect",
            "synonyms": ["anticipate"]
        }, {
            "word": "expectation",
            "synonyms": ["anticipation"]
        }, {
            "word": "expense",
            "synonyms": []
        }, {
            "word": "expensive",
            "synonyms": ["overpriced", "pricy", "costly", "valuable", "big-ticket", "dearly-won", "high-ticket", "high-priced", "dear", "pricey"]
        }, {
            "word": "experience",
            "synonyms": []
        }, {
            "word": "experiment",
            "synonyms": ["experimentation"]
        }, {
            "word": "expert",
            "synonyms": ["skilled", "skilful", "practiced", "good", "proficient", "skillful", "adept"]
        }, {
            "word": "explain",
            "synonyms": ["excuse"]
        }, {
            "word": "explanation",
            "synonyms": ["account"]
        }, {
            "word": "explode",
            "synonyms": ["burst"]
        }, {
            "word": "explore",
            "synonyms": []
        }, {
            "word": "explosion",
            "synonyms": ["burst"]
        }, {
            "word": "expose",
            "synonyms": ["unmasking"]
        }, {
            "word": "exposure",
            "synonyms": []
        }, {
            "word": "express",
            "synonyms": ["expressed", "explicit"]
        }, {
            "word": "expression",
            "synonyms": ["grammatical construction", "construction"]
        }, {
            "word": "extend",
            "synonyms": ["carry"]
        }, {
            "word": "extension",
            "synonyms": ["annex", "wing", "annexe"]
        }, {
            "word": "extensive",
            "synonyms": ["blanket", "all-encompassing", "all-inclusive", "broad", "across-the-board", "wide", "all-embracing", "panoptic", "encompassing", "comprehensive"]
        }, {
            "word": "extent",
            "synonyms": []
        }, {
            "word": "external",
            "synonyms": ["extraneous", "extrinsic", "outside"]
        }, {
            "word": "extra",
            "synonyms": ["additional", "additive"]
        }, {
            "word": "extraordinary",
            "synonyms": ["exceeding", "preternatural", "incomparable", "rare", "special", "great", "awful", "wonderworking", "phenomenal", "grand", "singular", "wondrous", "marvellous", "pyrotechnic", "uncomparable", "extraorinaire", "unusual", "wonderful", "olympian", "marvelous", "bonzer", "uncommon", "tremendous", "surpassing", "terrible", "prodigious", "one", "exceptional", "some", "fantastic", "howling", "rattling", "uncanny", "frightful", "terrific", "remarkable"]
        }, {
            "word": "extreme",
            "synonyms": ["distant"]
        }, {
            "word": "extremely",
            "synonyms": ["passing", "exceedingly"]
        }, {
            "word": "eye",
            "synonyms": []
        }, {
            "word": "keep",
            "synonyms": ["donjon", "dungeon"]
        }, {
            "word": "key",
            "synonyms": ["fundamental", "central", "cardinal", "important", "of import", "primal"]
        }, {
            "word": "kick",
            "synonyms": ["rush", "flush", "thril", "charge", "boot", "bang"]
        }, {
            "word": "kid",
            "synonyms": ["youngster", "nipper", "tike", "shaver", "nestlin", "fry", "tyke", "child", "small fry", "minor", "tiddler"]
        }, {
            "word": "kill",
            "synonyms": ["putting to death", "killing"]
        }, {
            "word": "killer",
            "synonyms": ["cause of death"]
        }, {
            "word": "killing",
            "synonyms": ["humorous", "sidesplitting", "humourous"]
        }, {
            "word": "kind",
            "synonyms": ["large-hearted", "kind-hearted", "charitable", "benignant", "gracious", "kindly", "gentle", "good-hearted", "kindhearted", "sympathetic", "considerate", "good-natured", "soft", "merciful", "openhearted", "benign", "benevolent"]
        }, {
            "word": "king",
            "synonyms": ["mogul", "magnate", "big businessman", "tycoo", "top executive", "power", "business leader", "baron"]
        }, {
            "word": "kiss",
            "synonyms": ["osculation", "buss"]
        }, {
            "word": "knee",
            "synonyms": ["genu", "knee joint", "human knee", "articulatio genus"]
        }, {
            "word": "knife",
            "synonyms": ["tongue"]
        }, {
            "word": "knock",
            "synonyms": ["bang", "belt", "smash", "bash"]
        }, {
            "word": "know",
            "synonyms": ["acknowledge", "recognise", "recognize"]
        }, {
            "word": "knowledge",
            "synonyms": ["noesis", "cognition"]
        }, {
            "word": "lab",
            "synonyms": ["science lab", "research laboratory", "science laborator", "research lab", "laboratory"]
        }, {
            "word": "label",
            "synonyms": ["recording label"]
        }, {
            "word": "labor",
            "synonyms": ["Labor", "DoL", "Labor Department", "Department of Labor"]
        }, {
            "word": "laboratory",
            "synonyms": ["science lab", "lab", "research laboratory", "science laborator", "research lab"]
        }, {
            "word": "lack",
            "synonyms": ["want", "deficiency"]
        }, {
            "word": "lady",
            "synonyms": ["gentlewoman", "madam", "ma'am", "dame"]
        }, {
            "word": "land",
            "synonyms": ["overland", "onshore"]
        }, {
            "word": "landscape",
            "synonyms": ["landscape painting"]
        }, {
            "word": "language",
            "synonyms": ["linguistic communication"]
        }, {
            "word": "lap",
            "synonyms": ["circuit", "circle"]
        }, {
            "word": "large",
            "synonyms": ["extensive", "great", "puffy", "king-size", "jumbo", "life-sized", "monolithic", "man-sized", "epic", "immense", "gargantuan", "astronomic", "cosmic", "blown-up", "oversize", "largish", "larger-than-life", "tremendous", "rangy", "sizeable", "massive", "titanic", "enlarged", "monstrous", "mammoth", "astronomical", "too large", "double", "queen-sized", "queen-size", "large-scale", "large-mouthed", "enormous", "broad", "monumental", "overlarge", "spacious", "gigantic", "whacking", "life-size", "elephantine", "wide", "huge", "walloping", "stupendous", "super", "bouffant", "grand", "colossal", "humongous", "whopping", "capacious", "outsize", "full-size", "mountainous", "deep", "heroic", "ample", "Brobdingnagian", "prodigious", "hulky", "voluminous", "larger", "thumping", "plumping", "volumed", "medium-large", "hulking", "big", "galactic", "banging", "sizable", "biggish", "extended", "oversized", "giant", "macro", "bulky", "outsized", "wide-ranging", "lifesize", "vast", "bear-sized", "bigger", "king-sized"]
        }, {
            "word": "largely",
            "synonyms": ["mostly", "for the most part"]
        }, {
            "word": "last",
            "synonyms": ["antepenultimate", "subterminal", "sunset", "parting", "endmost", "terminal", "fourth-year", "senior", "parthian", "ultimate", "next-to-last", "penultimate"]
        }, {
            "word": "late",
            "synonyms": ["ripe", "latish", "advanced", "posthumous", "after-hours"]
        }, {
            "word": "later",
            "synonyms": ["ulterior", "subsequent", "future"]
        }, {
            "word": "latin",
            "synonyms": ["Latin", "Italic language", "Italic"]
        }, {
            "word": "latter",
            "synonyms": ["last mentioned"]
        }, {
            "word": "laugh",
            "synonyms": ["gag", "joke", "jest", "jap"]
        }, {
            "word": "launch",
            "synonyms": ["launching"]
        }, {
            "word": "law",
            "synonyms": ["jurisprudence"]
        }, {
            "word": "lawsuit",
            "synonyms": ["causa", "cause", "case", "suit"]
        }, {
            "word": "lawyer",
            "synonyms": ["attorney"]
        }, {
            "word": "lay",
            "synonyms": ["profane", "secular", "laic"]
        }, {
            "word": "layer",
            "synonyms": ["bed"]
        }, {
            "word": "lead",
            "synonyms": ["jumper lead", "booster cable", "jumper cable"]
        }, {
            "word": "leader",
            "synonyms": ["loss leader", "drawing card"]
        }, {
            "word": "leadership",
            "synonyms": ["leaders"]
        }, {
            "word": "leading",
            "synonyms": ["in the lead", "up", "ahead"]
        }, {
            "word": "leaf",
            "synonyms": ["folio"]
        }, {
            "word": "league",
            "synonyms": ["conference"]
        }, {
            "word": "lean",
            "synonyms": ["skimpy", "insufficient", "deficient"]
        }, {
            "word": "learn",
            "synonyms": ["find out", "determine", "check", "ascertain", "watch", "see"]
        }, {
            "word": "learning",
            "synonyms": ["acquisition"]
        }, {
            "word": "least",
            "synonyms": ["to the lowest degree"]
        }, {
            "word": "leave",
            "synonyms": ["farewell", "leave-taking", "parting"]
        }, {
            "word": "left",
            "synonyms": ["socialistic", "far left", "liberal", "socialist", "left-of-center", "leftist", "leftish", "left-wing"]
        }, {
            "word": "leg",
            "synonyms": ["ramification", "branch"]
        }, {
            "word": "legacy",
            "synonyms": ["bequest"]
        }, {
            "word": "legal",
            "synonyms": ["accumulation", "collection", "aggregation", "assemblage"]
        }, {
            "word": "legend",
            "synonyms": ["caption"]
        }, {
            "word": "legislation",
            "synonyms": ["lawmaking", "legislating"]
        }, {
            "word": "legitimate",
            "synonyms": ["constituted", "established"]
        }, {
            "word": "lemon",
            "synonyms": ["lemon yellow", "maize", "gamboge"]
        }, {
            "word": "length",
            "synonyms": ["distance"]
        }, {
            "word": "less",
            "synonyms": ["fewer"]
        }, {
            "word": "lesson",
            "synonyms": ["example", "deterrent example", "object lesson"]
        }, {
            "word": "let",
            "synonyms": ["Army of the Pure", "Lashkar-e-Toiba", "Lashkar-e-Taiba", "Army of the Righteou", "Lashkar-e-Tayyiba", "LET"]
        }, {
            "word": "letter",
            "synonyms": ["letter of the alphabet", "alphabetic character"]
        }, {
            "word": "level",
            "synonyms": ["even"]
        }, {
            "word": "liberal",
            "synonyms": ["bountiful", "bighearted", "bounteous", "handsome", "giving", "generous", "freehanded", "openhanded", "big"]
        }, {
            "word": "library",
            "synonyms": ["depository library"]
        }, {
            "word": "license",
            "synonyms": ["permit", "licence"]
        }, {
            "word": "lie",
            "synonyms": ["Trygve Lie", "Trygve Halvden Lie", "Lie"]
        }, {
            "word": "life",
            "synonyms": ["aliveness", "living", "animation"]
        }, {
            "word": "lifestyle",
            "synonyms": ["life style", "life-style", "modus vivendi"]
        }, {
            "word": "lifetime",
            "synonyms": ["life", "lifespan", "life-time"]
        }, {
            "word": "lift",
            "synonyms": ["aerodynamic lift"]
        }, {
            "word": "light",
            "synonyms": ["fluorescent", "floodlighted", "lamplit", "candescent", "lit", "incandescent", "lighted", "candent", "white", "lighting-up", "autofluorescent", "ablaze", "luminescent", "bioluminescent", "livid", "sunstruck", "floodlit", "well-lighted", "illuminating", "illuminated", "inflamed", "phosphorescent", "sunlit", "reddened", "bright"]
        }, {
            "word": "like",
            "synonyms": ["alike", "similar"]
        }, {
            "word": "likely",
            "synonyms": ["liable", "probable", "promising", "possible", "apt"]
        }, {
            "word": "limit",
            "synonyms": ["boundary", "bound"]
        }, {
            "word": "limitation",
            "synonyms": ["limit"]
        }, {
            "word": "limited",
            "synonyms": ["circumscribed", "restricted"]
        }, {
            "word": "line",
            "synonyms": ["agate line"]
        }, {
            "word": "link",
            "synonyms": ["connection", "connectedness"]
        }, {
            "word": "lip",
            "synonyms": ["rim", "brim"]
        }, {
            "word": "list",
            "synonyms": ["listing"]
        }, {
            "word": "listen",
            "synonyms": ["hear", "take heed"]
        }, {
            "word": "literary",
            "synonyms": ["formal"]
        }, {
            "word": "literature",
            "synonyms": ["lit"]
        }, {
            "word": "little",
            "synonyms": ["short", "brief"]
        }, {
            "word": "live",
            "synonyms": ["alive", "vital", "animate", "viable", "liveborn"]
        }, {
            "word": "living",
            "synonyms": ["absolute"]
        }, {
            "word": "load",
            "synonyms": ["onus", "incumbrance", "encumbrance", "burden"]
        }, {
            "word": "loan",
            "synonyms": ["loanword"]
        }, {
            "word": "local",
            "synonyms": ["topical", "localized", "localised"]
        }, {
            "word": "locate",
            "synonyms": ["site", "place"]
        }, {
            "word": "location",
            "synonyms": ["fix", "locating", "localization", "localisation"]
        }, {
            "word": "lock",
            "synonyms": ["ringlet", "curl", "whorl"]
        }, {
            "word": "long",
            "synonyms": ["abundant"]
        }, {
            "word": "long-term",
            "synonyms": ["semipermanent", "long", "long-run"]
        }, {
            "word": "look",
            "synonyms": ["expression", "face", "facial expression", "aspect"]
        }, {
            "word": "loose",
            "synonyms": ["escaped", "free", "on the loose", "at large"]
        }, {
            "word": "lose",
            "synonyms": ["recede", "fall behind", "drop off", "fall back"]
        }, {
            "word": "loss",
            "synonyms": ["deprivation"]
        }, {
            "word": "lost",
            "synonyms": ["perplexed", "mixed-up", "befuddled", "mazed", "bewildered", "baffled", "confounded", "confused", "at sea", "bemused"]
        }, {
            "word": "lot",
            "synonyms": ["flock", "muckle", "spate", "heap", "pile", "mass", "peck", "mess", "stack", "whole lot", "great deal", "pot", "quite a little", "mint", "raft", "hatful", "whole sle", "plenty", "wad", "good deal", "tidy sum", "mickle", "batch", "slew", "sight", "deal"]
        }, {
            "word": "lots",
            "synonyms": ["slews", "wads", "heaps", "gobs", "lashing", "oodles", "tons", "dozens", "mountain", "scores", "loads", "scads", "piles", "rafts", "stacks"]
        }, {
            "word": "loud",
            "synonyms": ["thunderous", "audible", "hearable", "loud-mouthed", "blaring", "big", "shattering", "loud-voiced", "shouted", "harsh-voiced", "clarion", "earsplitting", "thundery", "roaring", "deafening", "blasting", "trumpet-like", "yelled", "noisy", "earthshaking", "vocal"]
        }, {
            "word": "love",
            "synonyms": ["loved one", "dearest", "honey", "dear", "beloved"]
        }, {
            "word": "lovely",
            "synonyms": ["adorable", "lovable", "endearing", "loveable"]
        }, {
            "word": "lover",
            "synonyms": ["devotee", "fan", "buff"]
        }, {
            "word": "low",
            "synonyms": ["abject", "low-down", "contemptible", "scummy", "scurvy", "miserable"]
        }, {
            "word": "lower",
            "synonyms": ["lower berth"]
        }, {
            "word": "luck",
            "synonyms": ["fortune", "destiny", "lot", "fate", "circumstances", "portio"]
        }, {
            "word": "lucky",
            "synonyms": ["hot", "serendipitous", "fortunate", "apotropaic"]
        }, {
            "word": "lunch",
            "synonyms": ["dejeuner", "tiffin", "luncheon"]
        }, {
            "word": "machine",
            "synonyms": ["automobile", "car", "motorcar", "auto"]
        }, {
            "word": "mad",
            "synonyms": ["insane", "disturbed", "unbalanced", "distracted", "crazy", "sick", "unhinged", "brainsick", "demented"]
        }, {
            "word": "magazine",
            "synonyms": ["cartridge"]
        }, {
            "word": "mail",
            "synonyms": ["ring armor", "ring mail", "chain mail", "chain armor", "ring armou", "chain armour"]
        }, {
            "word": "main",
            "synonyms": ["chief", "principal", "primary", "important", "of import"]
        }, {
            "word": "mainly",
            "synonyms": ["primarily", "principally", "in the main", "chiefly"]
        }, {
            "word": "maintain",
            "synonyms": ["asseverate", "assert"]
        }, {
            "word": "maintenance",
            "synonyms": ["alimony"]
        }, {
            "word": "major",
            "synonyms": ["better"]
        }, {
            "word": "majority",
            "synonyms": ["absolute majority"]
        }, {
            "word": "make",
            "synonyms": ["brand"]
        }, {
            "word": "maker",
            "synonyms": ["Divine", "Lord", "Godhead", "Almighty", "Maker", "God Almighty", "Jehovah", "Creator"]
        }, {
            "word": "makeup",
            "synonyms": ["constitution", "composition"]
        }, {
            "word": "male",
            "synonyms": ["priapic", "masculine", "antheral", "male", "young-begetting", "phallic", "staminate"]
        }, {
            "word": "mall",
            "synonyms": ["shopping mall", "shopping center", "center", "shopping centre", "plaza"]
        }, {
            "word": "man",
            "synonyms": ["adult male"]
        }, {
            "word": "manage",
            "synonyms": ["get by", "grapple", "cope", "make out", "contend", "make do", "deal"]
        }, {
            "word": "management",
            "synonyms": ["direction"]
        }, {
            "word": "manager",
            "synonyms": ["handler", "coach"]
        }, {
            "word": "manner",
            "synonyms": ["mode", "style", "way", "fashion"]
        }, {
            "word": "manufacturer",
            "synonyms": ["maker", "manufacturing business"]
        }, {
            "word": "many",
            "synonyms": ["more", "galore", "many an", "umpteen", "some", "umteen", "numerous", "many a", "many another"]
        }, {
            "word": "map",
            "synonyms": ["mapping", "correspondenc"]
        }, {
            "word": "margin",
            "synonyms": ["leeway", "allowance", "tolerance"]
        }, {
            "word": "mark",
            "synonyms": ["bell ringer", "bull's eye", "home run"]
        }, {
            "word": "market",
            "synonyms": ["food market", "grocery store", "grocery"]
        }, {
            "word": "marketing",
            "synonyms": ["merchandising", "selling"]
        }, {
            "word": "marriage",
            "synonyms": ["man and wife", "married couple"]
        }, {
            "word": "married",
            "synonyms": ["joined", "ringed", "wed", "mated", "united", "wedded"]
        }, {
            "word": "marry",
            "synonyms": ["get married", "wed", "conjoin", "espouse", "get hitched with", "hook up with"]
        }, {
            "word": "mask",
            "synonyms": ["masquerade party", "masquerade", "masqu"]
        }, {
            "word": "mass",
            "synonyms": ["aggregated", "aggregative", "collective", "aggregate"]
        }, {
            "word": "massive",
            "synonyms": ["heavy"]
        }, {
            "word": "master",
            "synonyms": ["captain", "sea captain", "skipper"]
        }, {
            "word": "match",
            "synonyms": ["catch"]
        }, {
            "word": "material",
            "synonyms": ["reincarnate", "corporate", "corporal", "bodied", "embodied", "corporeal", "incarnate", "bodily"]
        }, {
            "word": "math",
            "synonyms": ["maths", "mathematics"]
        }, {
            "word": "matter",
            "synonyms": ["affair", "thing"]
        }, {
            "word": "may",
            "synonyms": ["May"]
        }, {
            "word": "maybe",
            "synonyms": ["possibly", "perhaps", "perchance", "mayhap", "peradventur"]
        }, {
            "word": "mayor",
            "synonyms": ["city manager"]
        }, {
            "word": "me",
            "synonyms": ["Pine Tree State", "ME", "Maine"]
        }, {
            "word": "meal",
            "synonyms": ["repast"]
        }, {
            "word": "mean",
            "synonyms": ["average", "normal"]
        }, {
            "word": "meaning",
            "synonyms": ["meaningful", "significant", "pregnant"]
        }, {
            "word": "meanwhile",
            "synonyms": ["meantime", "in the meantime"]
        }, {
            "word": "measure",
            "synonyms": ["bar"]
        }, {
            "word": "measurement",
            "synonyms": ["measure", "measuring", "mensuration"]
        }, {
            "word": "meat",
            "synonyms": ["kernel"]
        }, {
            "word": "mechanism",
            "synonyms": ["chemical mechanism"]
        }, {
            "word": "medical",
            "synonyms": ["Greco-Roman deity", "Graeco-Roman deity", "aesculapian"]
        }, {
            "word": "medication",
            "synonyms": ["medicament", "medicinal dru", "medicine"]
        }, {
            "word": "medicine",
            "synonyms": ["medical specialty"]
        }, {
            "word": "medium",
            "synonyms": ["average", "moderate", "intermediate"]
        }, {
            "word": "meet",
            "synonyms": ["just", "fitting"]
        }, {
            "word": "meeting",
            "synonyms": ["coming together"]
        }, {
            "word": "member",
            "synonyms": ["appendage", "extremity"]
        }, {
            "word": "membership",
            "synonyms": ["rank"]
        }, {
            "word": "memory",
            "synonyms": ["memory board", "computer storage", "computer memory", "storage", "store"]
        }, {
            "word": "mental",
            "synonyms": ["body part"]
        }, {
            "word": "mention",
            "synonyms": ["credit", "reference", "acknowledgment", "citation", "quotatio", "cite"]
        }, {
            "word": "menu",
            "synonyms": ["carte du jour", "bill of fare", "carte", "card"]
        }, {
            "word": "mere",
            "synonyms": ["plain", "bare", "simple"]
        }, {
            "word": "merely",
            "synonyms": ["simply", "only", "but", "just"]
        }, {
            "word": "mess",
            "synonyms": ["flock", "muckle", "lot", "heap", "spate", "pile", "mass", "peck", "stack", "whole lot", "great deal", "pot", "quite a little", "mint", "raft", "hatful", "whole sle", "plenty", "wad", "good deal", "tidy sum", "mickle", "batch", "slew", "sight", "deal"]
        }, {
            "word": "message",
            "synonyms": ["content", "subject matter", "substance"]
        }, {
            "word": "metal",
            "synonyms": ["antimonial", "gilded", "metallic", "gold-bearing", "metal-looking", "silver", "bimetal", "bimetallic", "tinny", "argentiferous", "aluminiferous", "all-metal", "auriferous", "bronze", "metallike", "golden", "gold", "metallic-looking"]
        }, {
            "word": "meter",
            "synonyms": ["metre", "m"]
        }, {
            "word": "method",
            "synonyms": ["method acting"]
        }, {
            "word": "mexican",
            "synonyms": ["North American country", "Mexican", "North American nation"]
        }, {
            "word": "middle",
            "synonyms": ["midway", "halfway", "center", "central"]
        }, {
            "word": "might",
            "synonyms": ["power", "mightiness"]
        }, {
            "word": "military",
            "synonyms": ["study", "subject area", "subject field", "bailiwick", "discipline", "field", "subject", "branch of knowledge", "field of study"]
        }, {
            "word": "milk",
            "synonyms": ["Milk River", "Milk"]
        }, {
            "word": "million",
            "synonyms": ["cardinal"]
        }, {
            "word": "mind",
            "synonyms": ["nou", "brain", "psyche", "head"]
        }, {
            "word": "minister",
            "synonyms": ["rector", "curate", "minister of religion", "parson", "pastor"]
        }, {
            "word": "minor",
            "synonyms": ["peanut", "secondary", "insignificant"]
        }, {
            "word": "minority",
            "synonyms": ["nonage"]
        }, {
            "word": "minute",
            "synonyms": ["atomlike", "microscopical", "atomic", "microscopic"]
        }, {
            "word": "miss",
            "synonyms": ["girl", "missy", "young lady", "young woman", "fille"]
        }, {
            "word": "missile",
            "synonyms": ["projectile"]
        }, {
            "word": "mission",
            "synonyms": ["commission", "charge"]
        }, {
            "word": "mistake",
            "synonyms": ["error", "fault"]
        }, {
            "word": "mix",
            "synonyms": ["mixture", "admixture", "commixture", "intermixture", "mixing"]
        }, {
            "word": "mixture",
            "synonyms": ["miscellanea", "variety", "miscellany", "potpourri", "smorgasbord", "salmagundi", "mixed bag", "assortment", "motle"]
        }, {
            "word": "mode",
            "synonyms": ["manner", "style", "way", "fashion"]
        }, {
            "word": "model",
            "synonyms": ["exemplary", "worthy"]
        }, {
            "word": "moderate",
            "synonyms": ["fairish", "middle-of-the-road", "minimalist", "intermediate", "modest", "mild", "conservative", "cautious", "average", "limited", "small", "temperate", "indifferent", "fair", "reasonable", "medium"]
        }, {
            "word": "modern",
            "synonyms": ["forward-looking", "innovative", "progressive", "advanced"]
        }, {
            "word": "modest",
            "synonyms": ["coy", "decent", "demure", "shamefaced", "overmodest"]
        }, {
            "word": "mom",
            "synonyms": ["mamma", "momma", "mama", "mammy", "ma", "mumm", "mommy", "mum"]
        }, {
            "word": "moment",
            "synonyms": ["consequence", "import"]
        }, {
            "word": "monitor",
            "synonyms": ["reminder", "admonisher"]
        }, {
            "word": "month",
            "synonyms": ["calendar month"]
        }, {
            "word": "mood",
            "synonyms": ["climate"]
        }, {
            "word": "moon",
            "synonyms": ["lunar month", "synodic month", "lunation"]
        }, {
            "word": "moral",
            "synonyms": ["honourable", "clean", "righteous", "honorable", "good", "moralistic", "incorrupt", "chaste", "virtuous", "clean-living"]
        }, {
            "word": "more",
            "synonyms": ["more", "more than", "many"]
        }, {
            "word": "moreover",
            "synonyms": ["what is more", "furthermore"]
        }, {
            "word": "morning",
            "synonyms": ["sunup", "dawn", "break of the day", "dayspring", "sunrise", "first light", "break of day", "cockcro", "aurora", "dawning", "daybreak"]
        }, {
            "word": "most",
            "synonyms": ["all but", "about", "virtually", "well-nig", "nearly", "just about", "almost", "nigh", "near"]
        }, {
            "word": "mostly",
            "synonyms": ["generally", "by and large", "more often than not"]
        }, {
            "word": "mother",
            "synonyms": ["female parent"]
        }, {
            "word": "motion",
            "synonyms": ["apparent motion", "apparent movement", "movement"]
        }, {
            "word": "motivation",
            "synonyms": ["motivating"]
        }, {
            "word": "motor",
            "synonyms": ["centrifugal", "efferent", "motorial"]
        }, {
            "word": "mount",
            "synonyms": ["backing"]
        }, {
            "word": "mountain",
            "synonyms": ["mount"]
        }, {
            "word": "mouse",
            "synonyms": ["computer mouse"]
        }, {
            "word": "mouth",
            "synonyms": ["mouthpiece"]
        }, {
            "word": "move",
            "synonyms": ["motion", "movement", "motility"]
        }, {
            "word": "movement",
            "synonyms": ["apparent motion", "motion", "apparent movement"]
        }, {
            "word": "movie",
            "synonyms": ["moving-picture show", "picture show", "flic", "moving picture", "motion-picture show", "pic", "film", "motion picture", "picture"]
        }, {
            "word": "mr",
            "synonyms": ["mister", "Mr"]
        }, {
            "word": "mrs",
            "synonyms": ["Mrs", "Mrs."]
        }, {
            "word": "ms",
            "synonyms": ["manuscript"]
        }, {
            "word": "much",
            "synonyms": ["more", "untold", "some", "more than", "overmuch", "such", "so much"]
        }, {
            "word": "multiple",
            "synonyms": ["triple", "ternary", "multiplex", "four-fold", "septuple", "sextuple", "bigeminal", "sixfold", "eight-fold", "nine-fold", "three-fold", "tenfold", "manifold", "six-fold", "double", "fivefold", "sevenfold", "duplex", "twofold", "quintuple", "triune", "doubled", "two-fold", "quadruplicate", "nonuple", "aggregate", "ninefold", "quadruplex", "fourfold", "quadruple", "duple", "quaternary", "denary", "five-fold", "threefold", "ten-fold", "seven-fold", "octuple", "treble", "eightfold", "binary", "dual", "triplex", "quaternate"]
        }, {
            "word": "murder",
            "synonyms": ["slaying", "execution"]
        }, {
            "word": "muscle",
            "synonyms": ["brawn", "sinew", "heftines", "muscularity", "brawniness"]
        }, {
            "word": "music",
            "synonyms": ["euphony"]
        }, {
            "word": "musical",
            "synonyms": ["auditory communication"]
        }, {
            "word": "musician",
            "synonyms": ["instrumentalist", "player"]
        }, {
            "word": "muslim",
            "synonyms": ["Muslim", "Moslem", "monotheism", "Islamic"]
        }, {
            "word": "must",
            "synonyms": ["essential"]
        }, {
            "word": "mutual",
            "synonyms": ["common", "shared"]
        }, {
            "word": "mystery",
            "synonyms": ["enigma", "closed book", "secret"]
        }, {
            "word": "naked",
            "synonyms": ["au naturel", "bare", "unclothed", "nude"]
        }, {
            "word": "name",
            "synonyms": ["epithet"]
        }, {
            "word": "narrative",
            "synonyms": ["communicatory", "communicative"]
        }, {
            "word": "narrow",
            "synonyms": ["marginal", "bare"]
        }, {
            "word": "nation",
            "synonyms": ["country", "land"]
        }, {
            "word": "national",
            "synonyms": ["general", "federal"]
        }, {
            "word": "native",
            "synonyms": ["aboriginal"]
        }, {
            "word": "natural",
            "synonyms": ["biological"]
        }, {
            "word": "naturally",
            "synonyms": ["by nature"]
        }, {
            "word": "near",
            "synonyms": ["approximate", "close"]
        }, {
            "word": "nearby",
            "synonyms": ["nigh", "close", "near"]
        }, {
            "word": "nearly",
            "synonyms": ["all but", "most", "well-nigh", "about", "virtually", "just about", "almost", "nigh", "near"]
        }, {
            "word": "necessarily",
            "synonyms": ["needs", "inevitably", "of necessity"]
        }, {
            "word": "necessary",
            "synonyms": ["essential", "requisite", "obligatory", "incumbent", "indispensable", "needful", "needed", "required"]
        }, {
            "word": "neck",
            "synonyms": ["cervix"]
        }, {
            "word": "need",
            "synonyms": ["demand"]
        }, {
            "word": "negative",
            "synonyms": ["destructive", "pessimistic", "counter", "perverse", "unsupportive", "antagonistic"]
        }, {
            "word": "negotiate",
            "synonyms": ["negociate", "talk terms"]
        }, {
            "word": "negotiation",
            "synonyms": ["dialogue", "talks"]
        }, {
            "word": "neighbor",
            "synonyms": ["neighbour"]
        }, {
            "word": "neighborhood",
            "synonyms": ["neighbourhood"]
        }, {
            "word": "nerve",
            "synonyms": ["brass", "boldness", "face", "cheek"]
        }, {
            "word": "nervous",
            "synonyms": ["excited", "aflutter"]
        }, {
            "word": "net",
            "synonyms": ["final", "last", "ultimate"]
        }, {
            "word": "network",
            "synonyms": ["electronic network"]
        }, {
            "word": "never",
            "synonyms": ["ne'er"]
        }, {
            "word": "nevertheless",
            "synonyms": ["still", "nonetheless", "however", "even so", "all the same", "withal", "yet", "notwithstandin"]
        }, {
            "word": "new",
            "synonyms": ["hot", "spick-and-span", "rising", "parvenu", "modern", "fresh", "untested", "newborn", "current", "recent", "red-hot", "refreshing", "brand-new", "new-sprung", "newfound", "virgin", "spic-and-span", "parvenue", "unused", "bran-new", "sunrise", "novel", "untried", "young", "revolutionary", "radical"]
        }, {
            "word": "newly",
            "synonyms": ["recently", "new", "fresh", "freshly"]
        }, {
            "word": "news",
            "synonyms": ["word", "tidings", "intelligence"]
        }, {
            "word": "newspaper",
            "synonyms": ["newsprint"]
        }, {
            "word": "next",
            "synonyms": ["close", "side by side", "adjacent"]
        }, {
            "word": "nice",
            "synonyms": ["polite", "courteous", "gracious"]
        }, {
            "word": "night",
            "synonyms": ["nighttime", "dark"]
        }, {
            "word": "nine",
            "synonyms": ["cardinal", "ix", "9"]
        }, {
            "word": "no",
            "synonyms": ["zero", "none", "nary"]
        }, {
            "word": "nobody",
            "synonyms": ["nonentity", "cipher", "cypher"]
        }, {
            "word": "noise",
            "synonyms": ["racket", "dissonance"]
        }, {
            "word": "nomination",
            "synonyms": ["nominating address", "nominating speech"]
        }, {
            "word": "none",
            "synonyms": ["no"]
        }, {
            "word": "nonetheless",
            "synonyms": ["still", "however", "even so", "withal", "all the same", "yet", "nevertheless", "notwithstandin"]
        }, {
            "word": "normal",
            "synonyms": ["sane", "typical", "modal", "average", "standard", "mean", "natural", "regular", "median"]
        }, {
            "word": "normally",
            "synonyms": ["ordinarily", "commonly", "unremarkably", "usually"]
        }, {
            "word": "north",
            "synonyms": ["northward", "northeast", "northeasterly", "northwesterly", "northerly", "north-central", "northernmost", "northbound", "northeastward", "northwestward", "northern", "northmost", "northwestern", "northeastern", "northwest"]
        }, {
            "word": "northern",
            "synonyms": ["Yankee", "blue", "Federal", "Union"]
        }, {
            "word": "nose",
            "synonyms": ["nozzle"]
        }, {
            "word": "not",
            "synonyms": ["non"]
        }, {
            "word": "note",
            "synonyms": ["notation", "annotation"]
        }, {
            "word": "nothing",
            "synonyms": ["nix", "zipp", "cipher", "aught", "null", "zip", "nil", "naught", "zilch", "zero", "nada", "cypher", "goose egg"]
        }, {
            "word": "notice",
            "synonyms": ["notification"]
        }, {
            "word": "notion",
            "synonyms": ["impression", "feeling", "opinion", "belief"]
        }, {
            "word": "novel",
            "synonyms": ["original", "new", "fresh"]
        }, {
            "word": "now",
            "synonyms": ["at present"]
        }, {
            "word": "nuclear",
            "synonyms": ["atomic", "thermonuclear"]
        }, {
            "word": "number",
            "synonyms": ["bi", "turn", "routine", "act"]
        }, {
            "word": "numerous",
            "synonyms": ["many"]
        }, {
            "word": "nurse",
            "synonyms": ["nursemaid", "nanny"]
        }, {
            "word": "nut",
            "synonyms": ["junky", "junkie", "addict", "freak"]
        }, {
            "word": "object",
            "synonyms": ["targe", "aim", "objective"]
        }, {
            "word": "objective",
            "synonyms": ["oblique", "accusative", "oblique case"]
        }, {
            "word": "obligation",
            "synonyms": ["duty", "responsibility"]
        }, {
            "word": "observation",
            "synonyms": ["notice", "observance"]
        }, {
            "word": "observe",
            "synonyms": ["keep", "celebrate"]
        }, {
            "word": "observer",
            "synonyms": ["commentator"]
        }, {
            "word": "obtain",
            "synonyms": ["hold", "prevail"]
        }, {
            "word": "obvious",
            "synonyms": ["self-explanatory", "overt", "patent", "evident", "plain", "demonstrable", "taken for granted", "apparent", "open-and-shut", "axiomatic", "self-evident", "writ large", "open", "transparent", "unmistakable", "provable", "manifest", "frank"]
        }, {
            "word": "obviously",
            "synonyms": ["evidently", "plain", "manifestly", "plainly", "patently", "apparently"]
        }, {
            "word": "occasion",
            "synonyms": ["function", "social function", "affair", "social occasion"]
        }, {
            "word": "occasionally",
            "synonyms": ["now and then", "at times", "on occasion", "from time to tim", "once in a while", "now and again"]
        }, {
            "word": "occupation",
            "synonyms": ["business", "line of work", "lin", "job"]
        }, {
            "word": "occupy",
            "synonyms": ["absorb", "engross", "engage"]
        }, {
            "word": "occur",
            "synonyms": ["come"]
        }, {
            "word": "ocean",
            "synonyms": ["sea"]
        }, {
            "word": "odd",
            "synonyms": ["rummy", "peculiar", "unusual", "singular", "queer", "strange", "rum", "curious", "funny"]
        }, {
            "word": "odds",
            "synonyms": ["betting odds"]
        }, {
            "word": "off",
            "synonyms": ["cancelled"]
        }, {
            "word": "offense",
            "synonyms": ["offence", "discourtesy", "offensive activity"]
        }, {
            "word": "offensive",
            "synonyms": ["disgusting", "repellent", "obscene", "repelling", "skanky", "horrific", "sepulchral", "ghoulish", "verminous", "distasteful", "abhorrent", "wicked", "objectionable", "repugnant", "unpleasant", "charnel", "detestable", "repellant", "rank", "loathsome", "yucky", "hideous", "creepy", "hateful", "loathly", "evil", "obnoxious", "revolting", "unpalatable", "ghastly", "repulsive", "horrid", "morbid", "foul", "outrageous", "scrimy", "disgustful"]
        }, {
            "word": "offer",
            "synonyms": ["crack", "pass", "whir", "go", "fling"]
        }, {
            "word": "office",
            "synonyms": ["agency", "government agency", "bureau", "federal agency", "authority"]
        }, {
            "word": "officer",
            "synonyms": ["military officer"]
        }, {
            "word": "official",
            "synonyms": ["administrative unit", "administrative body"]
        }, {
            "word": "often",
            "synonyms": ["oft", "frequently", "ofttimes", "oftentimes"]
        }, {
            "word": "oh",
            "synonyms": ["OH", "Ohio", "Buckeye State"]
        }, {
            "word": "oil",
            "synonyms": ["oil color", "oil colour"]
        }, {
            "word": "ok",
            "synonyms": ["satisfactory", "hunky-dory", "fine", "all right", "o.k.", "okay"]
        }, {
            "word": "okay",
            "synonyms": ["satisfactory", "hunky-dory", "fine", "all right", "o.k.", "ok"]
        }, {
            "word": "old",
            "synonyms": ["experienced", "gray-haired", "white-haired", "grey", "gaga", "venerable", "overage", "grey-headed", "ancient", "of age", "superannuated", "grey-haired", "gray-headed", "gray", "oldish", "experient", "aged", "hoary", "aging", "centenarian", "retired", "middle-aged", "over-the-hill", "grizzly", "anile", "octogenarian", "mature", "darkened", "senescent", "hoar", "elderly", "emeritus", "doddery", "senile", "sexagenarian", "nonagenarian", "senior", "overaged", "doddering", "ageing", "older"]
        }, {
            "word": "olympic",
            "synonyms": ["Olympian", "plain", "field", "Olympic", "champaign"]
        }, {
            "word": "on",
            "synonyms": ["connected"]
        }, {
            "word": "once",
            "synonyms": ["formerly", "erstwhile", "erst", "at one time"]
        }, {
            "word": "one",
            "synonyms": ["1", "cardinal", "i", "ane"]
        }, {
            "word": "ongoing",
            "synonyms": ["current", "on-going"]
        }, {
            "word": "onion",
            "synonyms": ["onion plant", "Allium cepa"]
        }, {
            "word": "only",
            "synonyms": ["alone", "exclusive"]
        }, {
            "word": "open",
            "synonyms": ["active"]
        }, {
            "word": "opening",
            "synonyms": ["first", "starting", "initiative", "maiden", "introductory", "beginning", "initiatory", "inaugural"]
        }, {
            "word": "operate",
            "synonyms": ["control"]
        }, {
            "word": "operating",
            "synonyms": ["operative", "in operation", "operational"]
        }, {
            "word": "operation",
            "synonyms": ["functioning", "performance"]
        }, {
            "word": "operator",
            "synonyms": ["hustler", "wheeler dealer"]
        }, {
            "word": "opinion",
            "synonyms": ["impression", "notion", "feeling", "belief"]
        }, {
            "word": "opponent",
            "synonyms": ["hostile", "opposing"]
        }, {
            "word": "opportunity",
            "synonyms": ["chance"]
        }, {
            "word": "oppose",
            "synonyms": ["controvert", "contradict"]
        }, {
            "word": "opposite",
            "synonyms": ["diametrical", "diametric", "different", "polar"]
        }, {
            "word": "opposition",
            "synonyms": ["confrontation"]
        }, {
            "word": "option",
            "synonyms": ["alternative", "choice"]
        }, {
            "word": "or",
            "synonyms": ["OR", "surgery", "operating theater", "operating room", "operating theatre"]
        }, {
            "word": "orange",
            "synonyms": ["chromatic", "orangish"]
        }, {
            "word": "order",
            "synonyms": ["club", "guild", "social club", "society", "gild", "lodg"]
        }, {
            "word": "ordinary",
            "synonyms": ["average", "common"]
        }, {
            "word": "organic",
            "synonyms": ["constitutional", "constitutive", "essential", "constituent"]
        }, {
            "word": "organization",
            "synonyms": ["administration", "establishment", "brass", "organisation", "governance", "governing body"]
        }, {
            "word": "organize",
            "synonyms": ["organise", "form"]
        }, {
            "word": "orientation",
            "synonyms": ["orientation course"]
        }, {
            "word": "origin",
            "synonyms": ["root", "beginning", "rootage", "source"]
        }, {
            "word": "original",
            "synonyms": ["innovational", "avant-garde", "germinal", "creative", "first", "innovative", "underivative", "primary", "unconventional", "newfangled", "new", "novel", "groundbreaking", "freehand", "daring", "fresh", "seminal", "freehanded", "originative"]
        }, {
            "word": "originally",
            "synonyms": ["earlier", "in the first place", "to begin with", "in the beginning"]
        }, {
            "word": "other",
            "synonyms": ["another", "else", "otherwise", "different", "new", "some other", "separate", "opposite"]
        }, {
            "word": "otherwise",
            "synonyms": ["other"]
        }, {
            "word": "out",
            "synonyms": ["exterior"]
        }, {
            "word": "outcome",
            "synonyms": ["issue", "result", "event", "effect", "consequence", "upshot"]
        }, {
            "word": "outside",
            "synonyms": ["external", "after-school", "extracurricular", "right"]
        }, {
            "word": "over",
            "synonyms": ["ended", "concluded", "finished", "terminated", "all over", "complete"]
        }, {
            "word": "overall",
            "synonyms": ["general"]
        }, {
            "word": "overcome",
            "synonyms": ["get over", "subdue", "master", "surmount"]
        }, {
            "word": "overlook",
            "synonyms": ["command", "dominate", "overtop"]
        }, {
            "word": "own",
            "synonyms": ["ain", "personal"]
        }, {
            "word": "owner",
            "synonyms": ["possessor"]
        }, {
            "word": "sacred",
            "synonyms": ["holy", "sanctified", "consecrated"]
        }, {
            "word": "sad",
            "synonyms": ["depressive", "wistful", "pensive", "doleful", "melancholy", "bittersweet", "depressing", "tragical", "tragicomic", "tragicomical", "mournful", "melancholic", "gloomy", "heavyhearted", "tragic", "saddening"]
        }, {
            "word": "safe",
            "synonyms": ["dependable", "good", "sound", "secure"]
        }, {
            "word": "safety",
            "synonyms": ["base hit"]
        }, {
            "word": "sake",
            "synonyms": ["interest"]
        }, {
            "word": "salary",
            "synonyms": ["remuneration", "pay", "wage", "earnings"]
        }, {
            "word": "sale",
            "synonyms": ["cut-rate sale", "sales event"]
        }, {
            "word": "sales",
            "synonyms": ["gross sales", "gross revenue"]
        }, {
            "word": "salt",
            "synonyms": ["tasty", "salty"]
        }, {
            "word": "same",
            "synonyms": ["aforesaid", "aforementioned", "said", "selfsame", "very", "identical"]
        }, {
            "word": "sample",
            "synonyms": ["sample distribution", "sampling"]
        }, {
            "word": "sanction",
            "synonyms": ["authorization", "authorisation", "authority"]
        }, {
            "word": "sand",
            "synonyms": ["backbone", "gumption", "guts", "moxie", "grit"]
        }, {
            "word": "satellite",
            "synonyms": ["outer"]
        }, {
            "word": "satisfaction",
            "synonyms": ["atonement", "expiation"]
        }, {
            "word": "satisfy",
            "synonyms": ["fulfill", "live up to", "fulfil"]
        }, {
            "word": "save",
            "synonyms": ["pull through", "bring through", "carry through"]
        }, {
            "word": "saving",
            "synonyms": ["redemptive", "redeeming", "good"]
        }, {
            "word": "say",
            "synonyms": ["aver", "allege"]
        }, {
            "word": "scale",
            "synonyms": ["musical scale"]
        }, {
            "word": "scandal",
            "synonyms": ["malicious gossip", "dirt"]
        }, {
            "word": "scared",
            "synonyms": ["frightened", "afraid"]
        }, {
            "word": "scene",
            "synonyms": ["fit", "tantrum", "conniption"]
        }, {
            "word": "schedule",
            "synonyms": ["agenda", "docket"]
        }, {
            "word": "scheme",
            "synonyms": ["dodging", "dodge"]
        }, {
            "word": "scholar",
            "synonyms": ["learner", "assimilator"]
        }, {
            "word": "scholarship",
            "synonyms": ["encyclopaedism", "encyclopedism", "erudition", "eruditeness", "learning", "learnedness"]
        }, {
            "word": "school",
            "synonyms": ["schoolhouse"]
        }, {
            "word": "science",
            "synonyms": ["scientific discipline"]
        }, {
            "word": "scientific",
            "synonyms": ["knowledge base", "knowledge domain"]
        }, {
            "word": "scientist",
            "synonyms": ["man of science"]
        }, {
            "word": "scope",
            "synonyms": ["CRO", "cathode-ray oscilloscope", "oscilloscope"]
        }, {
            "word": "score",
            "synonyms": ["account"]
        }, {
            "word": "scream",
            "synonyms": ["riot", "wow", "thigh-slapper", "howler", "belly laugh", "sidesplitter"]
        }, {
            "word": "screen",
            "synonyms": ["blind"]
        }, {
            "word": "script",
            "synonyms": ["book", "playscript"]
        }, {
            "word": "sea",
            "synonyms": ["seagoing", "suboceanic", "shipboard", "overseas", "deep-sea", "oceangoing", "seafaring", "subocean", "oceanic", "oversea", "offshore"]
        }, {
            "word": "search",
            "synonyms": ["hunt", "hunting"]
        }, {
            "word": "season",
            "synonyms": ["time of year"]
        }, {
            "word": "seat",
            "synonyms": ["fanny", "posterior", "bottom", "bum", "hindquarters", "rear", "nates", "tooshie", "backside", "tail end", "arse", "buttocks", "fundament", "tail", "derriere", "as", "stern", "can", "buns", "behind", "hind end", "prat", "butt", "keister", "tush", "rear end", "rump"]
        }, {
            "word": "second",
            "synonyms": ["2nd", "2d", "ordinal"]
        }, {
            "word": "secret",
            "synonyms": ["surreptitious", "hush-hush", "underground", "clandestine", "hole-and-corner", "cloak-and-dagger", "undercover", "hugger-mugger", "covert"]
        }, {
            "word": "secretary",
            "synonyms": ["repository"]
        }, {
            "word": "section",
            "synonyms": ["department"]
        }, {
            "word": "sector",
            "synonyms": ["sphere"]
        }, {
            "word": "secure",
            "synonyms": ["guaranteed", "assured", "firm", "invulnerable", "bonded", "certified", "established", "in safe custody", "safe", "promised", "warranted", "secured", "fail-safe", "safe-deposit", "sure", "safety-deposit", "protected", "secure"]
        }, {
            "word": "security",
            "synonyms": ["certificate"]
        }, {
            "word": "see",
            "synonyms": ["look", "take care", "attend"]
        }, {
            "word": "seed",
            "synonyms": ["seeded player"]
        }, {
            "word": "seek",
            "synonyms": ["search", "look for"]
        }, {
            "word": "seem",
            "synonyms": ["appear"]
        }, {
            "word": "segment",
            "synonyms": ["section"]
        }, {
            "word": "seize",
            "synonyms": ["capture", "appropriate", "conquer"]
        }, {
            "word": "select",
            "synonyms": ["blue-ribbon", "superior"]
        }, {
            "word": "selection",
            "synonyms": ["pick", "option", "choice"]
        }, {
            "word": "self",
            "synonyms": ["someone", "somebody", "person", "mortal", "soul", "individual"]
        }, {
            "word": "sell",
            "synonyms": ["betray"]
        }, {
            "word": "senate",
            "synonyms": ["US Senate", "United States Senate", "Senat", "U.S. Senate"]
        }, {
            "word": "send",
            "synonyms": ["air", "transmi", "broadcast", "beam"]
        }, {
            "word": "senior",
            "synonyms": ["elderly", "aged", "old", "older"]
        }, {
            "word": "sense",
            "synonyms": ["gumption", "common sense", "good sense", "mother wit", "horse sense"]
        }, {
            "word": "sensitive",
            "synonyms": ["responsive", "alive", "oversensitive", "huffy", "touchy", "thin-skinned", "feisty"]
        }, {
            "word": "sentence",
            "synonyms": ["conviction", "condemnation", "judgment of conviction"]
        }, {
            "word": "separate",
            "synonyms": ["segregated", "other", "unshared", "isolable", "single", "unaccompanied", "individual", "apart", "unintegrated", "detached", "independent", "discrete", "asunder", "abstracted", "divided", "separated", "disjoint", "disjunct", "isolated", "set-apart", "distinct", "removed"]
        }, {
            "word": "sequence",
            "synonyms": ["chronological sequence", "chronological succession", "succession", "successiveness"]
        }, {
            "word": "series",
            "synonyms": ["serial"]
        }, {
            "word": "serious",
            "synonyms": ["critical", "grievous", "severe", "grave", "dangerous", "life-threatening"]
        }, {
            "word": "seriously",
            "synonyms": ["gravely", "severely", "badly"]
        }, {
            "word": "serve",
            "synonyms": ["service"]
        }, {
            "word": "service",
            "synonyms": ["help", "avail"]
        }, {
            "word": "session",
            "synonyms": ["school term", "academic session", "academic term"]
        }, {
            "word": "set",
            "synonyms": ["determined", "settled", "dictated"]
        }, {
            "word": "setting",
            "synonyms": ["scope", "background"]
        }, {
            "word": "settle",
            "synonyms": ["settee"]
        }, {
            "word": "settlement",
            "synonyms": ["colonization", "colonisation"]
        }, {
            "word": "seven",
            "synonyms": ["vii", "cardinal", "7"]
        }, {
            "word": "several",
            "synonyms": ["different"]
        }, {
            "word": "severe",
            "synonyms": ["stern", "stark", "plain", "austere"]
        }, {
            "word": "sex",
            "synonyms": ["gender", "sexuality"]
        }, {
            "word": "sexual",
            "synonyms": ["unisexual", "intersexual", "sexed"]
        }, {
            "word": "shade",
            "synonyms": ["wraith", "spook", "spectre", "ghost", "specter"]
        }, {
            "word": "shadow",
            "synonyms": ["phantasma", "fantas", "apparition", "phantom", "phantasm"]
        }, {
            "word": "shake",
            "synonyms": ["handclas", "handshaking", "handshake"]
        }, {
            "word": "shape",
            "synonyms": ["condition"]
        }, {
            "word": "share",
            "synonyms": ["part", "contribution"]
        }, {
            "word": "sharp",
            "synonyms": ["steep", "precipitous", "abrupt"]
        }, {
            "word": "sheet",
            "synonyms": ["bed sheet"]
        }, {
            "word": "shelf",
            "synonyms": ["ledge"]
        }, {
            "word": "shell",
            "synonyms": ["carapace", "cuticle", "shield"]
        }, {
            "word": "shelter",
            "synonyms": ["protection"]
        }, {
            "word": "shift",
            "synonyms": ["teddy", "chemise", "slip", "shimmy"]
        }, {
            "word": "shine",
            "synonyms": ["radiancy", "refulgence", "radiance", "refulgenc", "effulgence"]
        }, {
            "word": "ship",
            "synonyms": ["embark"]
        }, {
            "word": "shock",
            "synonyms": ["blow"]
        }, {
            "word": "shoe",
            "synonyms": ["brake shoe", "skid"]
        }, {
            "word": "shoot",
            "synonyms": ["flash back", "scoot", "dash", "flash", "scud", "dart"]
        }, {
            "word": "shooting",
            "synonyms": ["shot"]
        }, {
            "word": "shop",
            "synonyms": ["shop class"]
        }, {
            "word": "shore",
            "synonyms": ["shoring"]
        }, {
            "word": "short",
            "synonyms": ["abbreviated", "fleeting", "short and sweet", "little", "shortened", "brief", "short-run", "clipped", "short-range", "momentaneous", "short-term", "momentary", "fugitive", "truncated", "short-dated"]
        }, {
            "word": "shortly",
            "synonyms": ["briefly", "concisely", "in brief", "in short"]
        }, {
            "word": "shot",
            "synonyms": ["changeable", "colorful", "chatoyant", "iridescent", "colourful"]
        }, {
            "word": "shoulder",
            "synonyms": ["berm"]
        }, {
            "word": "shout",
            "synonyms": ["vociferation", "outcry", "call", "yell", "cry"]
        }, {
            "word": "show",
            "synonyms": ["appearance"]
        }, {
            "word": "shower",
            "synonyms": ["cascade"]
        }, {
            "word": "shrug",
            "synonyms": ["shrug off"]
        }, {
            "word": "shut",
            "synonyms": ["compressed", "winking", "closed", "tight", "squinched", "squinting", "blinking"]
        }, {
            "word": "sick",
            "synonyms": ["insane", "disturbed", "mad", "unbalanced", "distracted", "crazy", "unhinged", "brainsick", "demented"]
        }, {
            "word": "side",
            "synonyms": ["lateral", "sidelong", "broadside"]
        }, {
            "word": "sigh",
            "synonyms": ["suspiration"]
        }, {
            "word": "sight",
            "synonyms": ["flock", "muckle", "lot", "heap", "spate", "pile", "mass", "peck", "mess", "stack", "whole lot", "great deal", "pot", "quite a little", "mint", "raft", "hatful", "whole sle", "plenty", "wad", "good deal", "tidy sum", "mickle", "batch", "slew", "deal"]
        }, {
            "word": "sign",
            "synonyms": ["communicatory", "gestural", "signed", "sign-language", "communicative"]
        }, {
            "word": "signal",
            "synonyms": ["impressive"]
        }, {
            "word": "significance",
            "synonyms": ["implication", "import"]
        }, {
            "word": "significant",
            "synonyms": ["fundamental", "meaningful", "noteworthy", "profound", "key", "portentous", "epochal", "evidentiary", "momentous", "world-shattering", "of import", "evidential", "probatory", "operative", "monumental", "probative", "world-shaking", "prodigious", "epoch-making", "large", "earthshaking", "important", "remarkable"]
        }, {
            "word": "significantly",
            "synonyms": ["importantly"]
        }, {
            "word": "silence",
            "synonyms": ["muteness"]
        }, {
            "word": "silent",
            "synonyms": ["mute", "inarticulate", "dumb", "unarticulate"]
        }, {
            "word": "silver",
            "synonyms": ["achromatic", "silverish", "argent", "silvery"]
        }, {
            "word": "similar",
            "synonyms": ["mistakable", "siamese", "analogous", "corresponding", "confusable", "twin", "quasi", "correspondent", "same", "connatural", "related", "kindred", "akin"]
        }, {
            "word": "similarly",
            "synonyms": ["likewise"]
        }, {
            "word": "simple",
            "synonyms": ["plain", "mere", "bare"]
        }, {
            "word": "simply",
            "synonyms": ["just"]
        }, {
            "word": "sin",
            "synonyms": ["hell"]
        }, {
            "word": "sing",
            "synonyms": ["spill the beans", "peach", "babble", "babble out", "talk", "tattle", "let the cat out of the bag", "blab ou", "blab"]
        }, {
            "word": "singer",
            "synonyms": ["Isaac Merrit Singer", "Isaac M. Singer", "Singer"]
        }, {
            "word": "single",
            "synonyms": ["only", "unary", "uninominal", "one-man", "one-person", "azygous", "singular", "unique", "solitary", "lonesome", "sui generis", "one-woman", "azygos", "lone", "one-member", "sole"]
        }, {
            "word": "sink",
            "synonyms": ["sump", "cesspit", "cesspool"]
        }, {
            "word": "sir",
            "synonyms": ["Sir"]
        }, {
            "word": "sister",
            "synonyms": ["baby"]
        }, {
            "word": "sit",
            "synonyms": ["baby-sit"]
        }, {
            "word": "site",
            "synonyms": ["land site"]
        }, {
            "word": "situation",
            "synonyms": ["position"]
        }, {
            "word": "six",
            "synonyms": ["cardinal", "half dozen", "vi", "6", "half-dozen"]
        }, {
            "word": "size",
            "synonyms": ["sized"]
        }, {
            "word": "skill",
            "synonyms": ["accomplishment", "acquirement", "acquisition", "attainment"]
        }, {
            "word": "skin",
            "synonyms": ["hide", "pelt"]
        }, {
            "word": "sky",
            "synonyms": ["pitch", "toss", "flip"]
        }, {
            "word": "slave",
            "synonyms": ["bond", "unfree", "servile", "enthralled", "slaveholding", "in bondage", "enslaved"]
        }, {
            "word": "sleep",
            "synonyms": ["nap"]
        }, {
            "word": "slice",
            "synonyms": ["slash", "cut", "gash"]
        }, {
            "word": "slide",
            "synonyms": ["sloping trough", "chute", "slideway"]
        }, {
            "word": "slight",
            "synonyms": ["weak", "thin", "tenuous", "flimsy"]
        }, {
            "word": "slightly",
            "synonyms": ["slenderly", "slimly"]
        }, {
            "word": "slip",
            "synonyms": ["pillowcase", "case", "pillow slip"]
        }, {
            "word": "slow",
            "synonyms": ["moderato", "largo", "andante", "lentissimo", "larghetto", "larghissimo", "lento", "adagio"]
        }, {
            "word": "slowly",
            "synonyms": ["lento"]
        }, {
            "word": "small",
            "synonyms": ["decreased", "reduced", "diminished", "belittled"]
        }, {
            "word": "smart",
            "synonyms": ["astute", "canny", "street smart", "sharp", "cagy", "with-it", "shrewd", "clever", "cagey", "intelligent", "streetwise"]
        }, {
            "word": "smell",
            "synonyms": ["olfactory perception", "olfactory sensation", "odour", "odor"]
        }, {
            "word": "smile",
            "synonyms": ["grinning", "grin", "smiling"]
        }, {
            "word": "smoke",
            "synonyms": ["hummer", "bullet", "heater", "fastball"]
        }, {
            "word": "smooth",
            "synonyms": ["flowing", "waxlike", "uncreased", "sleek", "silky", "fast", "fine", "even", "silklike", "silken", "velvet-textured", "smooth-textured", "even-textured", "satiny", "slick", "glossy", "unseamed", "velvet", "seamless", "wax-coated", "unlined", "ironed", "velvety", "aerodynamic", "slippery", "streamlined", "fine-textured", "creaseless", "waxy", "ceraceous", "slippy", "glassy"]
        }, {
            "word": "snap",
            "synonyms": ["snatch", "grab", "catch"]
        }, {
            "word": "snow",
            "synonyms": ["blow", "coke", "C", "nose candy"]
        }, {
            "word": "so",
            "synonyms": ["indeed"]
        }, {
            "word": "so-called",
            "synonyms": ["questionable", "alleged", "supposed"]
        }, {
            "word": "soccer",
            "synonyms": ["association football"]
        }, {
            "word": "social",
            "synonyms": ["ethnic", "friendly", "sociable", "ethnical", "multiethnic", "cultural", "multi-ethnic", "gregarious", "interpersonal"]
        }, {
            "word": "society",
            "synonyms": ["club", "guild", "lodge", "orde", "social club", "gild"]
        }, {
            "word": "soft",
            "synonyms": ["mild", "balmy", "clement"]
        }, {
            "word": "software",
            "synonyms": ["computer software", "software system", "package", "software package", "software program"]
        }, {
            "word": "soil",
            "synonyms": ["grunge", "dirt", "filth", "grime", "grease", "stain"]
        }, {
            "word": "solar",
            "synonyms": ["star"]
        }, {
            "word": "solid",
            "synonyms": ["congealed", "concrete", "jellied", "dry", "hard", "solidified", "jelled", "coagulated", "solid-state", "semisolid"]
        }, {
            "word": "solution",
            "synonyms": ["result", "solvent", "answer", "resolution"]
        }, {
            "word": "solve",
            "synonyms": ["clear"]
        }, {
            "word": "some",
            "synonyms": ["whatsoever", "many", "whatever", "several", "both", "few", "any"]
        }, {
            "word": "somebody",
            "synonyms": ["someone", "person", "mortal", "soul", "individual"]
        }, {
            "word": "somehow",
            "synonyms": ["for some reason"]
        }, {
            "word": "someone",
            "synonyms": ["somebody", "person", "mortal", "soul", "individual"]
        }, {
            "word": "somewhat",
            "synonyms": ["within reason", "fairly", "moderately", "reasonably", "middling", "passably"]
        }, {
            "word": "somewhere",
            "synonyms": ["someplace"]
        }, {
            "word": "son",
            "synonyms": ["boy"]
        }, {
            "word": "song",
            "synonyms": ["birdsong", "call", "birdcall"]
        }, {
            "word": "soon",
            "synonyms": ["shortly", "before long", "presently"]
        }, {
            "word": "sophisticated",
            "synonyms": ["hi-tech", "high-tech", "advanced"]
        }, {
            "word": "sorry",
            "synonyms": ["disconsolate", "drab", "depressing", "blue", "dispiriting", "dreary", "dark", "gloomy", "cheerless", "dismal", "dingy", "grim", "drear", "uncheerful"]
        }, {
            "word": "sort",
            "synonyms": ["variety", "kind", "form"]
        }, {
            "word": "soul",
            "synonyms": ["someone", "somebody", "person", "morta", "individual"]
        }, {
            "word": "sound",
            "synonyms": ["complete"]
        }, {
            "word": "source",
            "synonyms": ["root", "beginning", "rootage", "origin"]
        }, {
            "word": "south",
            "synonyms": ["south-central", "southwestern", "southerly", "southernmost", "southeast", "southward", "southeastern", "southeasterly", "southeastward", "southmost", "southwestward", "southern", "southwest", "southbound", "southwesterly"]
        }, {
            "word": "southern",
            "synonyms": ["south-central", "austral", "meridional"]
        }, {
            "word": "soviet",
            "synonyms": ["country", "Soviet", "land", "state"]
        }, {
            "word": "space",
            "synonyms": ["blank"]
        }, {
            "word": "spanish",
            "synonyms": ["European country", "European nation", "Spanish"]
        }, {
            "word": "speak",
            "synonyms": ["address"]
        }, {
            "word": "speaker",
            "synonyms": ["loudspeaker", "loudspeaker system", "speaker unit", "speaker system"]
        }, {
            "word": "special",
            "synonyms": ["particular", "exceptional", "especial", "uncommon"]
        }, {
            "word": "specialist",
            "synonyms": ["medical specialist"]
        }, {
            "word": "specific",
            "synonyms": ["ad hoc", "special", "peculiar", "particularised", "precise", "particularized", "limited", "circumstantial", "unique", "specialised", "particular", "specialized", "proper"]
        }, {
            "word": "speech",
            "synonyms": ["actor's line", "words"]
        }, {
            "word": "speed",
            "synonyms": ["upper", "pep pill", "amphetamine"]
        }, {
            "word": "spend",
            "synonyms": ["drop", "expend"]
        }, {
            "word": "spending",
            "synonyms": ["outlay", "disbursement", "disbursal"]
        }, {
            "word": "spin",
            "synonyms": ["tailspin"]
        }, {
            "word": "spirit",
            "synonyms": ["disembodied spirit"]
        }, {
            "word": "spiritual",
            "synonyms": ["phantasmal", "spectral", "ghostly", "ghostlike", "apparitional", "supernatural"]
        }, {
            "word": "split",
            "synonyms": ["cut"]
        }, {
            "word": "sport",
            "synonyms": ["athletics"]
        }, {
            "word": "spot",
            "synonyms": ["bit"]
        }, {
            "word": "spread",
            "synonyms": ["distributed", "dispersed"]
        }, {
            "word": "spring",
            "synonyms": ["natural spring", "outflow", "fountain", "outpouring"]
        }, {
            "word": "square",
            "synonyms": ["hearty", "wholesome", "solid", "satisfying", "substantial"]
        }, {
            "word": "squeeze",
            "synonyms": ["liquidity crisis", "credit crunch"]
        }, {
            "word": "stability",
            "synonyms": ["constancy"]
        }, {
            "word": "stable",
            "synonyms": ["balanced"]
        }, {
            "word": "staff",
            "synonyms": ["faculty"]
        }, {
            "word": "stage",
            "synonyms": ["degree", "level", "poin"]
        }, {
            "word": "stair",
            "synonyms": ["step"]
        }, {
            "word": "stake",
            "synonyms": ["interest"]
        }, {
            "word": "stand",
            "synonyms": ["outdoor stage", "bandstand"]
        }, {
            "word": "standard",
            "synonyms": ["classic", "criterial", "canonical", "casebook", "classical", "accepted", "criterional", "definitive", "textbook", "canonic", "basic", "orthodox", "authoritative"]
        }, {
            "word": "standing",
            "synonyms": ["still", "stagnant", "dead", "slack"]
        }, {
            "word": "star",
            "synonyms": ["prima", "starring", "leading", "major", "stellar"]
        }, {
            "word": "stare",
            "synonyms": ["gaze"]
        }, {
            "word": "start",
            "synonyms": ["first", "outset", "showtime", "get-go", "commencement", "starting time", "beginning", "kickoff", "offse"]
        }, {
            "word": "state",
            "synonyms": ["country", "land"]
        }, {
            "word": "statement",
            "synonyms": ["affirmation", "assertion"]
        }, {
            "word": "station",
            "synonyms": ["place"]
        }, {
            "word": "status",
            "synonyms": ["condition"]
        }, {
            "word": "stay",
            "synonyms": ["check", "stop", "hitch", "halt", "arrest", "stoppage"]
        }, {
            "word": "steady",
            "synonyms": ["steadied", "steady-going", "stable", "even", "firm", "level", "unagitated", "footsure", "dependable", "rock-steady", "sure", "sure-footed", "unwavering", "surefooted", "regular"]
        }, {
            "word": "steal",
            "synonyms": ["buy", "bargain"]
        }, {
            "word": "steel",
            "synonyms": ["brand", "blade", "sword"]
        }, {
            "word": "step",
            "synonyms": ["dance step"]
        }, {
            "word": "stick",
            "synonyms": ["control stick", "joystick"]
        }, {
            "word": "still",
            "synonyms": ["nonmoving", "static", "motionless", "inactive", "unmoving"]
        }, {
            "word": "stir",
            "synonyms": ["flurry", "bustle", "hustle", "ado", "fuss"]
        }, {
            "word": "stock",
            "synonyms": ["well-worn", "threadbare", "timeworn", "trite", "unoriginal", "shopworn", "old-hat", "banal", "commonplace", "hackneyed", "tired"]
        }, {
            "word": "stomach",
            "synonyms": ["belly", "abdomen", "venter"]
        }, {
            "word": "stone",
            "synonyms": ["chromatic"]
        }, {
            "word": "stop",
            "synonyms": ["check", "hitch", "halt", "stay", "stoppag", "arrest"]
        }, {
            "word": "storage",
            "synonyms": ["memory board", "computer storage", "computer memory", "memory", "store"]
        }, {
            "word": "store",
            "synonyms": ["memory boar", "computer storage", "computer memory", "memory", "storage"]
        }, {
            "word": "storm",
            "synonyms": ["tempest"]
        }, {
            "word": "story",
            "synonyms": ["tale", "fib", "tarradiddle", "taradiddle"]
        }, {
            "word": "straight",
            "synonyms": ["accurate"]
        }, {
            "word": "strange",
            "synonyms": ["exotic", "imported", "unnaturalized", "foreign", "adventive", "nonnative", "established", "naturalized", "unnaturalised", "tramontane", "foreign-born", "alien"]
        }, {
            "word": "stranger",
            "synonyms": ["unknown", "alien"]
        }, {
            "word": "strategic",
            "synonyms": ["of import", "important"]
        }, {
            "word": "strategy",
            "synonyms": ["scheme"]
        }, {
            "word": "stream",
            "synonyms": ["current"]
        }, {
            "word": "strength",
            "synonyms": ["force", "forcefulness"]
        }, {
            "word": "strengthen",
            "synonyms": ["fortify", "beef up"]
        }, {
            "word": "stress",
            "synonyms": ["emphasis", "accent"]
        }, {
            "word": "stretch",
            "synonyms": ["elastic"]
        }, {
            "word": "strike",
            "synonyms": ["hit", "smasher", "smash", "bang"]
        }, {
            "word": "string",
            "synonyms": ["bowed stringed instrument"]
        }, {
            "word": "strip",
            "synonyms": ["flight strip", "airstrip", "landing strip"]
        }, {
            "word": "stroke",
            "synonyms": ["apoplexy", "CVA", "cerebrovascular accident"]
        }, {
            "word": "strong",
            "synonyms": ["noticeable", "beardown", "beefed-up", "virile", "powerful", "stiff", "strengthened", "tough", "weapons-grade", "well-set", "fortified", "vehement", "ironlike", "bullnecked", "reinforced", "bullocky", "knockout", "well-knit", "robust", "brawny", "hard", "knock-down", "severe", "muscular", "industrial-strength", "hefty", "sinewy", "rugged", "toughened"]
        }, {
            "word": "strongly",
            "synonyms": ["powerfully"]
        }, {
            "word": "structure",
            "synonyms": ["anatomical structure", "bodily structure", "body structure", "complex body part"]
        }, {
            "word": "struggle",
            "synonyms": ["battle"]
        }, {
            "word": "student",
            "synonyms": ["pupil", "educatee"]
        }, {
            "word": "studio",
            "synonyms": ["studio apartment"]
        }, {
            "word": "study",
            "synonyms": ["cogitation"]
        }, {
            "word": "stuff",
            "synonyms": ["clobber"]
        }, {
            "word": "stupid",
            "synonyms": ["anserine", "goosey", "wooden-headed", "stupid", "cloddish", "slow", "weak", "unintelligent", "gaumless", "dumb", "dense", "unthinking", "thick", "witless", "dim", "dopey", "dull", "dopy", "soft-witted", "goosy", "loggerheaded", "lumpen", "senseless", "jerky", "doltish", "foolish", "lumpish", "nitwitted", "yokel-like", "fatheaded", "blockheaded", "boneheaded", "thick-skulled", "thickheaded", "gooselike", "gormless", "obtuse"]
        }, {
            "word": "style",
            "synonyms": ["flair", "elan", "dash", "panach"]
        }, {
            "word": "subject",
            "synonyms": ["affected"]
        }, {
            "word": "submit",
            "synonyms": ["give in", "defer", "accede", "bow"]
        }, {
            "word": "subsequent",
            "synonyms": ["later", "consequent", "ensuant", "ulterior", "succeeding", "future", "resulting", "sequent", "resultant"]
        }, {
            "word": "substance",
            "synonyms": ["meat", "sum", "heart and soul", "nitty-gritt", "center", "inwardness", "gist", "core", "pith", "nub", "heart", "essence", "marrow", "kernel"]
        }, {
            "word": "substantial",
            "synonyms": ["hearty", "square", "wholesome", "solid", "satisfying"]
        }, {
            "word": "succeed",
            "synonyms": ["follow", "come after"]
        }, {
            "word": "success",
            "synonyms": ["winner", "achiever", "succeeder"]
        }, {
            "word": "successful",
            "synonyms": ["flourishing", "productive", "self-made", "triple-crown", "fortunate", "undefeated", "booming", "prospering", "roaring", "in", "made", "victorious", "palmy", "eminent", "thriving", "prosperous", "winning", "sure-fire", "boffo", "no-hit"]
        }, {
            "word": "successfully",
            "synonyms": ["with success"]
        }, {
            "word": "such",
            "synonyms": ["much", "so much"]
        }, {
            "word": "sudden",
            "synonyms": ["fast", "fulminant", "abrupt", "sharp", "unforeseen", "jerky", "emergent", "choppy", "unexpected", "explosive"]
        }, {
            "word": "suddenly",
            "synonyms": ["short", "abruptly", "dead"]
        }, {
            "word": "sue",
            "synonyms": ["Sue", "Eugene Sue"]
        }, {
            "word": "suffer",
            "synonyms": ["endure", "put u", "support", "stand", "stick out", "brook", "tolerate", "stomach", "digest", "abide", "bear"]
        }, {
            "word": "sufficient",
            "synonyms": ["ample", "decent", "enough", "adequate", "comfortable"]
        }, {
            "word": "sugar",
            "synonyms": ["simoleons", "lolly", "cabbage", "gelt", "lettuce", "scratch", "moolah", "kale", "bread", "boodle", "pelf", "shekels", "wampu", "dinero", "dough", "loot", "clams", "lucre"]
        }, {
            "word": "suggest",
            "synonyms": ["evoke", "paint a picture"]
        }, {
            "word": "suggestion",
            "synonyms": ["mesmerism", "hypnotism"]
        }, {
            "word": "suicide",
            "synonyms": ["felo-de-se"]
        }, {
            "word": "suit",
            "synonyms": ["courtship", "courting", "wooing"]
        }, {
            "word": "summer",
            "synonyms": ["summertime"]
        }, {
            "word": "summit",
            "synonyms": ["acme", "elevation", "height", "superlative", "peak", "meridian", "tiptop", "to", "pinnacle"]
        }, {
            "word": "sun",
            "synonyms": ["Dominicus", "Sunday", "Lord's Day", "Sun"]
        }, {
            "word": "super",
            "synonyms": ["crack", "topnotch", "fantastic", "A-one", "superior", "first-rate", "tiptop", "tops", "ace"]
        }, {
            "word": "supply",
            "synonyms": ["supplying", "provision"]
        }, {
            "word": "support",
            "synonyms": ["musical accompaniment", "accompaniment", "backup"]
        }, {
            "word": "supporter",
            "synonyms": ["assistant", "helper", "help"]
        }, {
            "word": "suppose",
            "synonyms": ["presuppose"]
        }, {
            "word": "supposed",
            "synonyms": ["questionable", "alleged", "so-called"]
        }, {
            "word": "supreme",
            "synonyms": ["maximal", "maximum"]
        }, {
            "word": "sure",
            "synonyms": ["confident", "positive", "convinced", "certain"]
        }, {
            "word": "surely",
            "synonyms": ["sure enough", "for sure", "certainly", "sure as shootin", "sure", "for certain"]
        }, {
            "word": "surface",
            "synonyms": ["opencast", "aboveground", "opencut", "grade-constructed"]
        }, {
            "word": "surgery",
            "synonyms": ["OR", "operating theatr", "operating theater", "operating room"]
        }, {
            "word": "surprise",
            "synonyms": ["surprisal"]
        }, {
            "word": "surprised",
            "synonyms": ["astonied", "goggle-eyed", "dumfounded", "flabbergasted", "jiggered", "stunned", "astonished", "thunderstruck", "dumbstricken", "astounded", "openmouthed", "gobsmacked", "popeyed", "startled", "dumbstruck", "dumbfounded", "stupefied", "amazed"]
        }, {
            "word": "surprising",
            "synonyms": ["startling", "amazing", "stunning", "unexpected", "astonishing"]
        }, {
            "word": "surprisingly",
            "synonyms": ["amazingly", "astonishingly"]
        }, {
            "word": "surround",
            "synonyms": ["environment", "environs", "surroundings"]
        }, {
            "word": "survey",
            "synonyms": ["sketch", "resume"]
        }, {
            "word": "survival",
            "synonyms": ["endurance"]
        }, {
            "word": "survive",
            "synonyms": ["subsist", "exist", "live"]
        }, {
            "word": "survivor",
            "synonyms": ["subsister"]
        }, {
            "word": "suspect",
            "synonyms": ["shady", "fishy", "questionable", "suspicious", "funny"]
        }, {
            "word": "sustain",
            "synonyms": ["confirm", "corroborate", "support", "substantiate", "affirm"]
        }, {
            "word": "swear",
            "synonyms": ["aver", "avow", "swa", "assert", "affirm", "verify"]
        }, {
            "word": "sweep",
            "synonyms": ["chimneysweep", "chimneysweeper"]
        }, {
            "word": "sweet",
            "synonyms": ["angelical", "cherubic", "loveable", "angelic", "lovable", "seraphic"]
        }, {
            "word": "swim",
            "synonyms": ["swimming"]
        }, {
            "word": "swing",
            "synonyms": ["baseball swing", "cu"]
        }, {
            "word": "switch",
            "synonyms": ["electrical switch", "electric switch"]
        }, {
            "word": "symbol",
            "synonyms": ["symbolization", "symbolic representation", "symbolisation"]
        }, {
            "word": "system",
            "synonyms": ["arrangement", "organisation", "organization"]
        }, {
            "word": "table",
            "synonyms": ["board"]
        }, {
            "word": "tablespoon",
            "synonyms": ["tablespoonful"]
        }, {
            "word": "tactic",
            "synonyms": ["manoeuvre", "maneuver", "tactics"]
        }, {
            "word": "tail",
            "synonyms": ["fanny", "posterior", "bottom", "bum", "hindquarters", "rear", "nates", "tooshie", "backside", "tail end", "arse", "buttocks", "fundament", "derriere", "as", "stern", "can", "buns", "behind", "hind end", "prat", "butt", "keister", "seat", "tush", "rear end", "rump"]
        }, {
            "word": "take",
            "synonyms": ["issue", "return", "proceeds", "payoff", "yield", "takings"]
        }, {
            "word": "tale",
            "synonyms": ["fib", "story", "tarradiddle", "taradiddle"]
        }, {
            "word": "talent",
            "synonyms": ["gift", "natural endowment", "endowment"]
        }, {
            "word": "talk",
            "synonyms": ["lecture", "public lecture"]
        }, {
            "word": "tall",
            "synonyms": ["difficult", "hard"]
        }, {
            "word": "tank",
            "synonyms": ["armored combat vehicle", "armoured combat vehicle", "army tank"]
        }, {
            "word": "tap",
            "synonyms": ["rap", "pat"]
        }, {
            "word": "tape",
            "synonyms": ["mag tape", "magnetic tape"]
        }, {
            "word": "target",
            "synonyms": ["object", "aim", "objective"]
        }, {
            "word": "task",
            "synonyms": ["chore", "job"]
        }, {
            "word": "taste",
            "synonyms": ["appreciation", "perceptiveness", "discernment"]
        }, {
            "word": "tax",
            "synonyms": ["revenue enhancement", "taxation"]
        }, {
            "word": "tea",
            "synonyms": ["afternoon tea", "teatime"]
        }, {
            "word": "teach",
            "synonyms": ["Thatch", "Blackbeard", "Edward Teach", "Edward Thatch", "Teach"]
        }, {
            "word": "teacher",
            "synonyms": ["instructor"]
        }, {
            "word": "teaching",
            "synonyms": ["pedagogy", "education", "educational activity", "didactics", "instruction"]
        }, {
            "word": "team",
            "synonyms": ["squad"]
        }, {
            "word": "tear",
            "synonyms": ["bout", "bust", "binge"]
        }, {
            "word": "teaspoon",
            "synonyms": ["teaspoonful"]
        }, {
            "word": "technical",
            "synonyms": ["commercial"]
        }, {
            "word": "technique",
            "synonyms": ["proficiency"]
        }, {
            "word": "technology",
            "synonyms": ["engineering"]
        }, {
            "word": "teen",
            "synonyms": ["teenage", "young", "immature", "teenaged", "adolescent"]
        }, {
            "word": "teenager",
            "synonyms": ["adolescent", "teen", "stripling"]
        }, {
            "word": "telephone",
            "synonyms": ["telephone set", "phone"]
        }, {
            "word": "telescope",
            "synonyms": ["scope"]
        }, {
            "word": "television",
            "synonyms": ["video", "telecasting", "TV"]
        }, {
            "word": "tell",
            "synonyms": ["William Tell", "Tell"]
        }, {
            "word": "temporary",
            "synonyms": ["ephemeral", "unstable", "acting", "terminable", "impermanent", "passing", "fly-by-night", "jury-rigged", "transient", "working", "pro tem", "short-lived", "transitory", "fugacious", "improvised", "makeshift", "pro tempore", "temporal", "episodic", "evanescent", "interim"]
        }, {
            "word": "ten",
            "synonyms": ["cardinal", "10", "x"]
        }, {
            "word": "tend",
            "synonyms": ["lean", "incline", "be given", "run"]
        }, {
            "word": "tendency",
            "synonyms": ["inclination", "disposition"]
        }, {
            "word": "tennis",
            "synonyms": ["lawn tennis"]
        }, {
            "word": "tension",
            "synonyms": ["latent hostility"]
        }, {
            "word": "tent",
            "synonyms": ["collapsible shelter"]
        }, {
            "word": "term",
            "synonyms": ["condition"]
        }, {
            "word": "terms",
            "synonyms": ["footing"]
        }, {
            "word": "terrible",
            "synonyms": ["dreadful", "abominable", "bad", "painful", "awful", "atrocious", "unspeakable"]
        }, {
            "word": "territory",
            "synonyms": ["territorial dominion", "dominio", "district"]
        }, {
            "word": "terror",
            "synonyms": ["brat", "little terror", "holy terro"]
        }, {
            "word": "terrorism",
            "synonyms": ["act of terrorism", "terrorist act"]
        }, {
            "word": "terrorist",
            "synonyms": ["violent"]
        }, {
            "word": "test",
            "synonyms": ["exam", "examination"]
        }, {
            "word": "testify",
            "synonyms": ["take the stand", "bear witness", "attest"]
        }, {
            "word": "testimony",
            "synonyms": ["testimonial"]
        }, {
            "word": "testing",
            "synonyms": ["examination"]
        }, {
            "word": "text",
            "synonyms": ["text edition", "school tex", "schoolbook", "textbook"]
        }, {
            "word": "thank",
            "synonyms": ["give thanks"]
        }, {
            "word": "theater",
            "synonyms": ["dramatics", "theatre", "dramatic art", "dramaturgy"]
        }, {
            "word": "theme",
            "synonyms": ["composition", "report", "paper"]
        }, {
            "word": "then",
            "synonyms": ["past"]
        }, {
            "word": "theory",
            "synonyms": ["hypothesis", "possibility"]
        }, {
            "word": "there",
            "synonyms": ["in that location", "at that place"]
        }, {
            "word": "therefore",
            "synonyms": ["consequently"]
        }, {
            "word": "thick",
            "synonyms": ["abundant"]
        }, {
            "word": "thin",
            "synonyms": ["bladed", "filamentous", "thready", "see-through", "vapourous", "transparent", "flat", "capillary", "narrow", "gauze-like", "fine", "light", "filiform", "diaphanous", "gossamer", "hairlike", "hyperfine", "slender", "sheer", "vaporous", "filamentlike", "wafer-thin", "tenuous", "cobwebby", "depressed", "flimsy", "filmy", "ribbonlike", "paper thin", "thin", "compressed", "threadlike", "lean", "sleazy", "gauzy", "papery", "ribbony"]
        }, {
            "word": "thing",
            "synonyms": ["matter", "affair"]
        }, {
            "word": "think",
            "synonyms": ["consider", "believe", "conceive"]
        }, {
            "word": "thinking",
            "synonyms": ["reasoning", "intelligent", "rational"]
        }, {
            "word": "third",
            "synonyms": ["tertiary", "3rd", "ordinal"]
        }, {
            "word": "thirty",
            "synonyms": ["xxx", "30", "cardinal"]
        }, {
            "word": "thought",
            "synonyms": ["idea"]
        }, {
            "word": "thousand",
            "synonyms": ["1000", "m", "cardinal", "one thousand", "k"]
        }, {
            "word": "threat",
            "synonyms": ["menace"]
        }, {
            "word": "threaten",
            "synonyms": ["imperil", "jeopardise", "jeopardize", "endanger", "menace", "peril"]
        }, {
            "word": "three",
            "synonyms": ["cardinal", "iii", "3"]
        }, {
            "word": "throat",
            "synonyms": ["pharynx"]
        }, {
            "word": "through",
            "synonyms": ["direct"]
        }, {
            "word": "throughout",
            "synonyms": ["end-to-end"]
        }, {
            "word": "throw",
            "synonyms": ["stroke", "cam stroke"]
        }, {
            "word": "thus",
            "synonyms": ["hence", "thence", "therefore"]
        }, {
            "word": "ticket",
            "synonyms": ["just the ticket"]
        }, {
            "word": "tie",
            "synonyms": ["association", "affiliation", "tie-up"]
        }, {
            "word": "tight",
            "synonyms": ["leakproof", "snug", "air-tight", "hermetic", "gas-tight", "dripless", "waterproof", "tight", "rainproof", "impermeable", "watertight", "waterproofed", "seaworthy", "airtight"]
        }, {
            "word": "time",
            "synonyms": ["clip"]
        }, {
            "word": "tiny",
            "synonyms": ["diminutive", "lilliputian", "flyspeck", "petite", "little", "midget", "small", "bantam"]
        }, {
            "word": "tip",
            "synonyms": ["bakshis", "backsheesh", "bakshish", "pourboire", "baksheesh", "gratuity"]
        }, {
            "word": "tire",
            "synonyms": ["tyre"]
        }, {
            "word": "tired",
            "synonyms": ["worn out", "all in", "bored", "travel-worn", "flagging", "exhausted", "blear", "dog-tired", "ragged", "dead", "aweary", "drooping", "blear-eyed", "burned-out", "washed-out", "beat", "whacked", "unrested", "jaded", "careworn", "knackered", "raddled", "fatigued", "unrefreshed", "bleary", "world-weary", "spent", "burnt-out", "worn-out", "drained", "played out", "worn", "wearied", "bushed", "bleary-eyed", "fagged", "haggard", "drawn", "weary", "footsore"]
        }, {
            "word": "tissue",
            "synonyms": ["tissue paper"]
        }, {
            "word": "title",
            "synonyms": ["championship"]
        }, {
            "word": "tobacco",
            "synonyms": ["baccy"]
        }, {
            "word": "today",
            "synonyms": ["now", "nowadays"]
        }, {
            "word": "toe",
            "synonyms": ["two-toe", "pointy-toed", "square-toed", "two-toed", "pointed-toe", "toed", "squared-toe"]
        }, {
            "word": "together",
            "synonyms": ["unneurotic"]
        }, {
            "word": "tomato",
            "synonyms": ["Lycopersicon esculentum", "tomato plant", "love apple"]
        }, {
            "word": "tone",
            "synonyms": ["note", "musical note"]
        }, {
            "word": "tongue",
            "synonyms": ["clapper"]
        }, {
            "word": "tonight",
            "synonyms": ["this evening", "this night"]
        }, {
            "word": "too",
            "synonyms": ["besides", "likewise", "also", "as well"]
        }, {
            "word": "tool",
            "synonyms": ["creature", "puppet"]
        }, {
            "word": "top",
            "synonyms": ["upmost", "upper", "uppermost", "crowning", "high", "apical", "topmost", "best"]
        }, {
            "word": "topic",
            "synonyms": ["theme", "subject"]
        }, {
            "word": "toss",
            "synonyms": ["flip"]
        }, {
            "word": "total",
            "synonyms": ["absolute", "unconditioned", "unconditional"]
        }, {
            "word": "totally",
            "synonyms": ["altogether", "all", "wholly", "entirely", "whole", "completely"]
        }, {
            "word": "touch",
            "synonyms": ["contact"]
        }, {
            "word": "tough",
            "synonyms": ["uncomfortable", "bad"]
        }, {
            "word": "tour",
            "synonyms": ["circuit"]
        }, {
            "word": "tourist",
            "synonyms": ["holidaymaker", "tourer"]
        }, {
            "word": "tournament",
            "synonyms": ["tourney"]
        }, {
            "word": "tower",
            "synonyms": ["pillar", "column"]
        }, {
            "word": "town",
            "synonyms": ["township"]
        }, {
            "word": "toy",
            "synonyms": ["miniature"]
        }, {
            "word": "trace",
            "synonyms": ["suggestion", "hint"]
        }, {
            "word": "track",
            "synonyms": ["cartroad", "cart track"]
        }, {
            "word": "trade",
            "synonyms": ["swop", "swap", "barter"]
        }, {
            "word": "tradition",
            "synonyms": ["custom"]
        }, {
            "word": "traditional",
            "synonyms": ["long-standing", "longstanding", "handed-down", "time-honored", "time-honoured", "conventional", "tralatitious", "traditionalistic"]
        }, {
            "word": "traffic",
            "synonyms": ["dealings"]
        }, {
            "word": "tragedy",
            "synonyms": ["catastrophe", "calamity", "cataclys", "disaster"]
        }, {
            "word": "trail",
            "synonyms": ["track", "lead"]
        }, {
            "word": "train",
            "synonyms": ["wagon train", "caravan"]
        }, {
            "word": "training",
            "synonyms": ["education", "breeding"]
        }, {
            "word": "transfer",
            "synonyms": ["carry-over", "transfer of training"]
        }, {
            "word": "transform",
            "synonyms": ["translate"]
        }, {
            "word": "transformation",
            "synonyms": ["translation"]
        }, {
            "word": "transition",
            "synonyms": ["changeover", "conversion"]
        }, {
            "word": "translate",
            "synonyms": ["render", "interpret"]
        }, {
            "word": "transportation",
            "synonyms": ["Department of Transportation", "DoT", "Transportation"]
        }, {
            "word": "travel",
            "synonyms": ["change of location"]
        }, {
            "word": "treat",
            "synonyms": ["kickshaw", "goody", "dainty", "delicacy"]
        }, {
            "word": "treatment",
            "synonyms": ["discourse", "discussion"]
        }, {
            "word": "treaty",
            "synonyms": ["pact", "accord"]
        }, {
            "word": "tree",
            "synonyms": ["Tree", "Sir Herbert Beerbohm Tree"]
        }, {
            "word": "tremendous",
            "synonyms": ["enormous", "large", "big"]
        }, {
            "word": "trend",
            "synonyms": ["course"]
        }, {
            "word": "trial",
            "synonyms": ["run", "test"]
        }, {
            "word": "tribe",
            "synonyms": ["federation of tribes"]
        }, {
            "word": "trick",
            "synonyms": ["prank", "joke", "antic", "put-on", "caper"]
        }, {
            "word": "trip",
            "synonyms": ["head trip"]
        }, {
            "word": "troop",
            "synonyms": ["flock"]
        }, {
            "word": "trouble",
            "synonyms": ["difficulty"]
        }, {
            "word": "truck",
            "synonyms": ["hand truck"]
        }, {
            "word": "truly",
            "synonyms": ["genuinely", "really"]
        }, {
            "word": "trust",
            "synonyms": ["confidence"]
        }, {
            "word": "truth",
            "synonyms": ["accuracy"]
        }, {
            "word": "try",
            "synonyms": ["attempt", "endeavor", "endeavour", "effort"]
        }, {
            "word": "tube",
            "synonyms": ["subway", "metro", "underground", "subway system"]
        }, {
            "word": "tunnel",
            "synonyms": ["burrow"]
        }, {
            "word": "turn",
            "synonyms": ["bi", "number", "routine", "act"]
        }, {
            "word": "tv",
            "synonyms": ["television", "video", "telecasting", "TV"]
        }, {
            "word": "twelve",
            "synonyms": ["cardinal", "dozen", "12", "xii"]
        }, {
            "word": "twenty",
            "synonyms": ["cardinal", "xx", "20"]
        }, {
            "word": "twice",
            "synonyms": ["double", "doubly"]
        }, {
            "word": "twin",
            "synonyms": ["twinned", "matching", "duplicate", "matched"]
        }, {
            "word": "two",
            "synonyms": ["cardinal", "2", "ii"]
        }, {
            "word": "type",
            "synonyms": ["eccentric", "case", "character"]
        }, {
            "word": "typical",
            "synonyms": ["distinctive", "characteristic"]
        }, {
            "word": "TRUE",
            "synonyms": ["literal", "right", "honorable", "correct", "echt", "genuine", "real", "faithful", "apodictic", "honest", "apodeictic", "sure", "sincere", "actual", "truthful"]
        }, {
            "word": "TRUE",
            "synonyms": ["dead on target", "accurate"]
        }, {
            "word": "TRUE",
            "synonyms": ["trusty", "trustworthy", "dependable", "honest", "reliable"]
        }, {
            "word": "TRUE",
            "synonyms": ["faithful"]
        }, {
            "word": "TRUE",
            "synonyms": ["genuine", "sincere", "unfeigned"]
        }, {
            "word": "TRUE",
            "synonyms": ["geographic", "geographical"]
        }, {
            "word": "TRUE",
            "synonyms": ["legitimate", "lawful", "rightful"]
        }, {
            "word": "TRUE",
            "synonyms": ["harmonious", "on-key"]
        }, {
            "word": "TRUE",
            "synonyms": ["real"]
        }, {
            "word": "TRUE",
            "synonyms": ["straight", "even"]
        }, {
            "word": "TRUE",
            "synonyms": ["honest", "veracious", "truthful"]
        }, {
            "word": "TRUE",
            "synonyms": ["typical"]
        }, {
            "word": "TRUE",
            "synonyms": ["admittedly", "avowedly", "confessedly"]
        }, {
            "word": "TRUE",
            "synonyms": ["true up"]
        }, {
            "word": "fabric",
            "synonyms": ["material", "textile", "cloth"]
        }, {
            "word": "face",
            "synonyms": ["brass", "boldness", "nerve", "chee"]
        }, {
            "word": "facility",
            "synonyms": ["quickness", "adeptness", "deftness", "adroitness"]
        }, {
            "word": "factor",
            "synonyms": ["agent", "broker"]
        }, {
            "word": "factory",
            "synonyms": ["manufactory", "manufacturing plant", "mill"]
        }, {
            "word": "faculty",
            "synonyms": ["module", "mental faculty"]
        }, {
            "word": "fade",
            "synonyms": ["disappearance"]
        }, {
            "word": "fail",
            "synonyms": ["betray"]
        }, {
            "word": "failure",
            "synonyms": ["bankruptcy"]
        }, {
            "word": "fair",
            "synonyms": ["mediocre", "average", "ordinary", "middling"]
        }, {
            "word": "fairly",
            "synonyms": ["fair", "evenhandedly"]
        }, {
            "word": "faith",
            "synonyms": ["religion", "religious belief"]
        }, {
            "word": "fall",
            "synonyms": ["autumn"]
        }, {
            "word": "familiar",
            "synonyms": ["acquainted", "familiar with", "old", "well-known", "known", "beaten", "acquainted with", "long-familiar"]
        }, {
            "word": "family",
            "synonyms": ["class", "category"]
        }, {
            "word": "famous",
            "synonyms": ["illustrious", "celebrated", "noted", "renowned", "known", "famed", "notable", "far-famed"]
        }, {
            "word": "fan",
            "synonyms": ["devotee", "buff", "lover"]
        }, {
            "word": "fantasy",
            "synonyms": ["illusion", "fancy", "phantasy"]
        }, {
            "word": "far",
            "synonyms": ["cold", "outlying", "furthest", "furthermost", "far-off", "distant", "off the beaten track", "remote", "faraway", "farthest", "out-of-the-way", "farther", "removed", "utmost", "uttermost", "farthermost", "further"]
        }, {
            "word": "farm",
            "synonyms": ["farm out"]
        }, {
            "word": "farmer",
            "synonyms": ["Farmer", "James Leonard Farmer"]
        }, {
            "word": "fashion",
            "synonyms": ["manner", "style", "way", "mode"]
        }, {
            "word": "fast",
            "synonyms": ["hot", "rapid", "hurried", "prompt", "winged", "high-velocity", "hurrying", "instantaneous", "blistering", "fast-breaking", "meteoric", "quick", "red-hot", "straightaway", "alacritous", "expedited", "immediate", "speedy", "sudden", "accelerating", "smart", "swift", "express", "windy", "scurrying", "speeding", "instant", "high-speed", "fleet", "fast-paced", "double-quick", "accelerated"]
        }, {
            "word": "fat",
            "synonyms": ["pyknic", "stocky", "zaftig", "thickset", "obese", "porcine", "embonpoint", "fleshy", "buxom", "potbellied", "roly-poly", "gross", "compact", "abdominous", "overweight", "thick", "paunchy", "rounded", "double-chinned", "pudgy", "dumpy", "blubbery", "rotund", "portly", "heavyset", "corpulent", "podgy", "zoftig", "chubby", "weighty", "stout", "jowly", "loose-jowled", "heavy", "endomorphic", "plump", "fattish", "tubby"]
        }, {
            "word": "fate",
            "synonyms": ["destiny"]
        }, {
            "word": "father",
            "synonyms": ["Church Father", "Father of the Church", "Father"]
        }, {
            "word": "fault",
            "synonyms": ["flaw", "defect"]
        }, {
            "word": "favor",
            "synonyms": ["favour"]
        }, {
            "word": "favorite",
            "synonyms": ["preferred", "favourite", "favored", "preferent", "pet", "loved", "best-loved"]
        }, {
            "word": "fear",
            "synonyms": ["concern", "care"]
        }, {
            "word": "feature",
            "synonyms": ["characteristic"]
        }, {
            "word": "federal",
            "synonyms": ["authorities", "regime", "government"]
        }, {
            "word": "fee",
            "synonyms": ["tip", "bung"]
        }, {
            "word": "feed",
            "synonyms": ["provender"]
        }, {
            "word": "feel",
            "synonyms": ["smel", "feeling", "flavour", "spirit", "tone", "flavor", "look"]
        }, {
            "word": "feeling",
            "synonyms": ["impression", "notion", "opinion", "belief"]
        }, {
            "word": "fellow",
            "synonyms": ["boyfriend", "beau", "young man", "swain"]
        }, {
            "word": "female",
            "synonyms": ["distaff", "feminine"]
        }, {
            "word": "fence",
            "synonyms": ["fencing"]
        }, {
            "word": "few",
            "synonyms": ["a few", "some", "a couple of", "fewer", "hardly a"]
        }, {
            "word": "fewer",
            "synonyms": ["few", "less"]
        }, {
            "word": "fiber",
            "synonyms": ["fibre", "character"]
        }, {
            "word": "fiction",
            "synonyms": ["fable", "fabrication"]
        }, {
            "word": "field",
            "synonyms": ["airfield", "landing field", "flying field"]
        }, {
            "word": "fifteen",
            "synonyms": ["cardinal", "xv", "15"]
        }, {
            "word": "fifth",
            "synonyms": ["5th", "ordinal"]
        }, {
            "word": "fifty",
            "synonyms": ["cardinal", "l", "50"]
        }, {
            "word": "fight",
            "synonyms": ["engagement", "conflict", "battle"]
        }, {
            "word": "fighter",
            "synonyms": ["champion", "paladin", "hero"]
        }, {
            "word": "fighting",
            "synonyms": ["active", "combat-ready", "operational"]
        }, {
            "word": "figure",
            "synonyms": ["pattern", "design"]
        }, {
            "word": "file",
            "synonyms": ["data file"]
        }, {
            "word": "fill",
            "synonyms": ["filling"]
        }, {
            "word": "film",
            "synonyms": ["cinema", "celluloid"]
        }, {
            "word": "final",
            "synonyms": ["closing", "last", "concluding", "terminal"]
        }, {
            "word": "finally",
            "synonyms": ["eventually", "at length"]
        }, {
            "word": "financial",
            "synonyms": ["commercial enterprise", "business", "business enterprise", "fiscal"]
        }, {
            "word": "find",
            "synonyms": ["discovery", "breakthrough"]
        }, {
            "word": "finding",
            "synonyms": ["determination"]
        }, {
            "word": "fine",
            "synonyms": ["satisfactory", "hunky-dory", "all right", "o.k.", "okay", "ok"]
        }, {
            "word": "finger",
            "synonyms": ["digit", "finger's breadth", "fingerbreadth"]
        }, {
            "word": "finish",
            "synonyms": ["finishing", "coating"]
        }, {
            "word": "fire",
            "synonyms": ["fervency", "fervour", "fervor", "ardour", "fervidness", "ardor"]
        }, {
            "word": "firm",
            "synonyms": ["fresh", "crisp", "crunchy"]
        }, {
            "word": "first",
            "synonyms": ["1st", "ordinal"]
        }, {
            "word": "fish",
            "synonyms": ["Pisces", "Fish"]
        }, {
            "word": "fishing",
            "synonyms": ["sportfishing"]
        }, {
            "word": "fit",
            "synonyms": ["acceptable", "suitable", "suited", "appropriate"]
        }, {
            "word": "fitness",
            "synonyms": ["fittingness"]
        }, {
            "word": "five",
            "synonyms": ["5", "cardinal", "v"]
        }, {
            "word": "fix",
            "synonyms": ["pickle", "muddle", "kettle of fish", "mess", "hole", "jam"]
        }, {
            "word": "flag",
            "synonyms": ["flagstone"]
        }, {
            "word": "flame",
            "synonyms": ["fire", "flaming"]
        }, {
            "word": "flat",
            "synonyms": ["savourless", "tasteless", "vapid", "savorless", "bland", "insipid", "flavorless", "flavourless"]
        }, {
            "word": "flavor",
            "synonyms": ["flavour"]
        }, {
            "word": "flee",
            "synonyms": ["take flight", "fly"]
        }, {
            "word": "flesh",
            "synonyms": ["physique", "figure", "anatomy", "human body", "shape", "soma", "material body", "bod", "build", "for", "chassis", "frame", "physical body"]
        }, {
            "word": "flight",
            "synonyms": ["escape"]
        }, {
            "word": "float",
            "synonyms": ["ice-cream float", "ice-cream soda"]
        }, {
            "word": "floor",
            "synonyms": ["base"]
        }, {
            "word": "flow",
            "synonyms": ["flow rate", "rate of flow"]
        }, {
            "word": "flower",
            "synonyms": ["bloom", "blossom"]
        }, {
            "word": "fly",
            "synonyms": ["alert"]
        }, {
            "word": "focus",
            "synonyms": ["focal point", "nidus"]
        }, {
            "word": "folk",
            "synonyms": ["family", "family line", "kinfolk", "kinsfolk", "phratr", "sept"]
        }, {
            "word": "follow",
            "synonyms": ["adopt", "espouse"]
        }, {
            "word": "following",
            "synonyms": ["favourable", "favorable"]
        }, {
            "word": "food",
            "synonyms": ["intellectual nourishment", "food for thought"]
        }, {
            "word": "foot",
            "synonyms": ["animal foot"]
        }, {
            "word": "football",
            "synonyms": ["football game"]
        }, {
            "word": "force",
            "synonyms": ["effect"]
        }, {
            "word": "foreign",
            "synonyms": ["international", "abroad", "overseas", "outside", "external"]
        }, {
            "word": "forest",
            "synonyms": ["woods", "wood"]
        }, {
            "word": "forever",
            "synonyms": ["always"]
        }, {
            "word": "forget",
            "synonyms": ["draw a blank", "blank out", "block"]
        }, {
            "word": "form",
            "synonyms": ["class", "grade"]
        }, {
            "word": "formal",
            "synonyms": ["starchy", "nominal", "black-tie", "formal", "ceremonious", "dress", "positive", "semi-formal", "titular", "pro forma", "full-dress", "prescribed", "semiformal", "white-tie", "ceremonial", "buckram", "conventional", "form-only", "stiff", "perfunctory"]
        }, {
            "word": "formation",
            "synonyms": ["constitution", "establishment", "organisation", "organization"]
        }, {
            "word": "former",
            "synonyms": ["early", "other", "past"]
        }, {
            "word": "formula",
            "synonyms": ["chemical formula"]
        }, {
            "word": "forth",
            "synonyms": ["away", "off"]
        }, {
            "word": "fortune",
            "synonyms": ["destiny", "lot", "fate", "circumstances", "luck", "portion"]
        }, {
            "word": "forward",
            "synonyms": ["advancing", "progressive", "forward-moving"]
        }, {
            "word": "found",
            "synonyms": ["recovered", "saved"]
        }, {
            "word": "foundation",
            "synonyms": ["foot", "base", "groundwork", "fundament", "substructure", "understructure"]
        }, {
            "word": "founder",
            "synonyms": ["beginner", "founding father", "father"]
        }, {
            "word": "four",
            "synonyms": ["4", "cardinal", "iv"]
        }, {
            "word": "fourth",
            "synonyms": ["4th", "ordinal", "quaternary"]
        }, {
            "word": "frame",
            "synonyms": ["framework", "framing"]
        }, {
            "word": "framework",
            "synonyms": ["fabric"]
        }, {
            "word": "free",
            "synonyms": ["atrip", "discharged", "liberated", "self-governing", "free of", "unconstrained", "footloose", "clear", "unhampered", "unrestricted", "free", "disentangled", "unbound", "extricated", "aweigh", "sovereign", "available", "independent", "freed", "loose", "autonomous", "unconfined", "out-of-school", "emancipated", "released", "unimprisoned", "at large", "uncommitted", "unrestrained", "escaped", "on the loose"]
        }, {
            "word": "freedom",
            "synonyms": ["exemption"]
        }, {
            "word": "freeze",
            "synonyms": ["freezing"]
        }, {
            "word": "french",
            "synonyms": ["Gallic", "European nation", "French", "European country"]
        }, {
            "word": "frequency",
            "synonyms": ["absolute frequency"]
        }, {
            "word": "frequent",
            "synonyms": ["common"]
        }, {
            "word": "frequently",
            "synonyms": ["oft", "often", "ofttimes", "oftentimes"]
        }, {
            "word": "fresh",
            "synonyms": ["brisk", "energising", "refreshing", "refreshful", "energizing", "invigorating", "tonic", "bracing"]
        }, {
            "word": "friend",
            "synonyms": ["acquaintance"]
        }, {
            "word": "friendly",
            "synonyms": ["favorable", "amicable", "matey", "sociable", "social", "companionate", "cordial", "cozy", "informal", "couthie", "chummy", "couthy", "amiable", "intimate", "warm", "congenial", "palsy-walsy", "affable", "neighborly", "well-disposed", "hospitable", "neighbourly", "hail-fellow-well-met", "hail-fellow", "genial", "gracious", "pally", "comradely"]
        }, {
            "word": "friendship",
            "synonyms": ["friendly relationship"]
        }, {
            "word": "front",
            "synonyms": ["first", "in advance", "frontmost", "foremost", "advanced", "advance", "fore", "frontal", "head-on", "anterior"]
        }, {
            "word": "fruit",
            "synonyms": ["yield"]
        }, {
            "word": "frustration",
            "synonyms": ["defeat"]
        }, {
            "word": "fuel",
            "synonyms": ["fire"]
        }, {
            "word": "full",
            "synonyms": ["awash", "inundated", "gas-filled", "chockful", "air-filled", "overflowing", "untasted", "cram full", "brimful", "instinct", "flooded", "glutted", "afloat", "brimfull", "congested", "filled", "chock-full", "ladened", "choke-full", "chockablock", "overfull", "chuck-full", "weighed down", "riddled", "sperm-filled", "stuffed", "overladen", "untouched", "brimming", "laden", "egg-filled", "fraught", "pregnant", "heavy", "well-lined", "loaded", "overloaded", "replete", "engorged"]
        }, {
            "word": "fully",
            "synonyms": ["amply"]
        }, {
            "word": "fun",
            "synonyms": ["entertaining", "amusing", "amusive", "diverting"]
        }, {
            "word": "function",
            "synonyms": ["social function", "occasion", "affair", "social occasion"]
        }, {
            "word": "fund",
            "synonyms": ["investment trust", "investment firm", "investment company"]
        }, {
            "word": "fundamental",
            "synonyms": ["central", "cardinal", "important", "of import", "primal", "key"]
        }, {
            "word": "funding",
            "synonyms": ["financing"]
        }, {
            "word": "funny",
            "synonyms": ["mirthful", "risible", "humorous", "amusing", "comical", "comic", "laughable", "humourous"]
        }, {
            "word": "furniture",
            "synonyms": ["piece of furniture", "article of furniture"]
        }, {
            "word": "furthermore",
            "synonyms": ["what is more", "moreover"]
        }, {
            "word": "future",
            "synonyms": ["proximo", "rising", "prospective", "upcoming", "prox", "coming", "early", "approaching", "incoming", "emerging", "future day", "in store", "forthcoming"]
        }, {
            "word": "gain",
            "synonyms": ["addition", "increase"]
        }, {
            "word": "galaxy",
            "synonyms": ["extragalactic nebula"]
        }, {
            "word": "gallery",
            "synonyms": ["art gallery", "picture gallery"]
        }, {
            "word": "game",
            "synonyms": ["crippled", "lame", "halt", "gimpy", "halting", "unfit"]
        }, {
            "word": "gang",
            "synonyms": ["work party", "crew"]
        }, {
            "word": "gap",
            "synonyms": ["break", "disruption", "interruption"]
        }, {
            "word": "garage",
            "synonyms": ["service department"]
        }, {
            "word": "garlic",
            "synonyms": ["ail"]
        }, {
            "word": "gas",
            "synonyms": ["gun", "gas pedal", "accelerator pedal", "throttle", "accelerator"]
        }, {
            "word": "gate",
            "synonyms": ["logic gate"]
        }, {
            "word": "gather",
            "synonyms": ["gathering"]
        }, {
            "word": "gay",
            "synonyms": ["colorful", "braw", "colourful", "brave"]
        }, {
            "word": "gaze",
            "synonyms": ["regard"]
        }, {
            "word": "gear",
            "synonyms": ["gear mechanism"]
        }, {
            "word": "gender",
            "synonyms": ["grammatical gender"]
        }, {
            "word": "gene",
            "synonyms": ["factor", "cistron"]
        }, {
            "word": "general",
            "synonyms": ["universal", "pandemic", "unspecific", "imprecise", "unspecialized", "all-purpose", "broad", "unspecialised", "indiscriminate", "general-purpose", "miscellaneous", "gross", "generic", "widespread", "comprehensive", "overall"]
        }, {
            "word": "generally",
            "synonyms": ["broadly", "loosely", "broadly speaking"]
        }, {
            "word": "generate",
            "synonyms": ["bring fort", "beget", "father", "engender", "sire", "mother", "get"]
        }, {
            "word": "generation",
            "synonyms": ["coevals", "contemporaries"]
        }, {
            "word": "genetic",
            "synonyms": ["beginning"]
        }, {
            "word": "gentleman",
            "synonyms": ["gentleman's gentleman", "valet de chambre", "valet", "man"]
        }, {
            "word": "gently",
            "synonyms": ["softly", "lightly"]
        }, {
            "word": "german",
            "synonyms": ["European country", "European nation", "German"]
        }, {
            "word": "gesture",
            "synonyms": ["motion"]
        }, {
            "word": "get",
            "synonyms": ["acquire"]
        }, {
            "word": "ghost",
            "synonyms": ["ghostwriter"]
        }, {
            "word": "giant",
            "synonyms": ["gargantuan", "large", "jumbo", "elephantine", "big"]
        }, {
            "word": "gift",
            "synonyms": ["natural endowment", "talent", "endowment"]
        }, {
            "word": "gifted",
            "synonyms": ["talented"]
        }, {
            "word": "girl",
            "synonyms": ["daughter"]
        }, {
            "word": "girlfriend",
            "synonyms": ["girl", "lady friend"]
        }, {
            "word": "give",
            "synonyms": ["springiness", "spring"]
        }, {
            "word": "given",
            "synonyms": ["tending", "inclined", "minded", "disposed", "apt"]
        }, {
            "word": "glad",
            "synonyms": ["cheerful", "beaming"]
        }, {
            "word": "glance",
            "synonyms": ["coup d'oeil", "glimpse"]
        }, {
            "word": "glass",
            "synonyms": ["drinking glass"]
        }, {
            "word": "global",
            "synonyms": ["spherical", "spheric", "circular", "globose", "ball-shaped", "globular", "round", "orbicular"]
        }, {
            "word": "glove",
            "synonyms": ["baseball glove", "mit", "baseball mitt"]
        }, {
            "word": "go",
            "synonyms": ["a-okay", "a-ok"]
        }, {
            "word": "goal",
            "synonyms": ["end"]
        }, {
            "word": "god",
            "synonyms": ["immortal", "deity", "divinity"]
        }, {
            "word": "gold",
            "synonyms": ["gilded", "chromatic", "gilt", "aureate", "golden"]
        }, {
            "word": "golden",
            "synonyms": ["gilded", "chromatic", "gilt", "aureate", "gold"]
        }, {
            "word": "golf",
            "synonyms": ["golf game"]
        }, {
            "word": "good",
            "synonyms": ["skilled", "skilful", "practiced", "skillful", "expert", "adept", "proficient"]
        }, {
            "word": "government",
            "synonyms": ["authorities", "regime"]
        }, {
            "word": "governor",
            "synonyms": ["regulator"]
        }, {
            "word": "grab",
            "synonyms": ["snatch", "snap", "catch"]
        }, {
            "word": "grade",
            "synonyms": ["class", "form"]
        }, {
            "word": "gradually",
            "synonyms": ["step by step", "bit by bit"]
        }, {
            "word": "graduate",
            "synonyms": ["postgraduate", "high"]
        }, {
            "word": "grain",
            "synonyms": ["caryopsis"]
        }, {
            "word": "grand",
            "synonyms": ["noble", "august", "lordly"]
        }, {
            "word": "grandfather",
            "synonyms": ["grandad", "granddad", "granddaddy", "gramps", "grandp"]
        }, {
            "word": "grandmother",
            "synonyms": ["granny", "grandma", "gran", "grannie"]
        }, {
            "word": "grant",
            "synonyms": ["assignment"]
        }, {
            "word": "grass",
            "synonyms": ["pasture", "eatage", "pasturage", "forage"]
        }, {
            "word": "grave",
            "synonyms": ["critical", "grievous", "severe", "dangerous", "serious", "life-threatening"]
        }, {
            "word": "gray",
            "synonyms": ["cloudy", "grey", "dull", "leaden"]
        }, {
            "word": "great",
            "synonyms": ["avid", "zealous", "eager", "enthusiastic"]
        }, {
            "word": "greatest",
            "synonyms": ["sterling", "superior", "superlative"]
        }, {
            "word": "green",
            "synonyms": ["naive", "gullible", "fleeceable", "naif"]
        }, {
            "word": "grocery",
            "synonyms": ["foodstuff"]
        }, {
            "word": "ground",
            "synonyms": ["background"]
        }, {
            "word": "group",
            "synonyms": ["grouping"]
        }, {
            "word": "grow",
            "synonyms": ["acquire", "produce", "get", "develop"]
        }, {
            "word": "growing",
            "synonyms": ["flourishing", "thriving", "healthy"]
        }, {
            "word": "growth",
            "synonyms": ["emergence", "outgrowth"]
        }, {
            "word": "guarantee",
            "synonyms": ["guaranty"]
        }, {
            "word": "guard",
            "synonyms": ["bodyguard"]
        }, {
            "word": "guess",
            "synonyms": ["conjecture", "surmise", "supposition", "speculation", "hypothesi", "surmisal"]
        }, {
            "word": "guest",
            "synonyms": ["Guest", "Edgar Guest", "Edgar Albert Guest"]
        }, {
            "word": "guide",
            "synonyms": ["guidebook"]
        }, {
            "word": "guideline",
            "synonyms": ["guidepost", "rule of thumb"]
        }, {
            "word": "guilty",
            "synonyms": ["red-handed", "conscience-smitten", "indictable", "guilt-ridden", "chargeable", "blameworthy", "culpable", "condemned", "censurable", "inculpatory", "convicted", "delinquent", "unrighteous", "punishable", "blamable", "at fault", "fineable", "blameful", "blameable", "criminal", "bloodguilty", "inculpative", "finable"]
        }, {
            "word": "gun",
            "synonyms": ["gas", "gas pedal", "accelerator pedal", "throttle", "accelerator"]
        }, {
            "word": "guy",
            "synonyms": ["cat", "hombre", "bozo"]
        }, {
            "word": "habit",
            "synonyms": ["drug abuse", "substance abuse"]
        }, {
            "word": "habitat",
            "synonyms": ["home ground"]
        }, {
            "word": "hair",
            "synonyms": ["fuzz", "tomentum"]
        }, {
            "word": "half",
            "synonyms": ["fractional"]
        }, {
            "word": "hall",
            "synonyms": ["foyer", "antechamber", "lobby", "anteroom", "vestibul", "entrance hall"]
        }, {
            "word": "hand",
            "synonyms": ["bridge player"]
        }, {
            "word": "handful",
            "synonyms": ["fistful"]
        }, {
            "word": "handle",
            "synonyms": ["hold", "handgrip", "grip"]
        }, {
            "word": "hang",
            "synonyms": ["bent", "knack"]
        }, {
            "word": "happen",
            "synonyms": ["befall", "bechance"]
        }, {
            "word": "happy",
            "synonyms": ["riant", "cheerful", "content", "felicitous", "joyous", "glad", "blessed", "joyful", "contented", "laughing", "prosperous", "halcyon", "elated", "blissful", "euphoric", "golden", "bright"]
        }, {
            "word": "hard",
            "synonyms": ["corneous", "lignified", "hornlike", "hardened", "unyielding", "stonelike", "petrified", "semihard", "steely", "granitic", "solid", "al dente", "ossified", "rocklike", "firm", "stony", "set", "petrous", "horny", "tumid", "adamantine", "granitelike", "woody", "erect"]
        }, {
            "word": "hardly",
            "synonyms": ["just", "scarcely", "scarce", "barely"]
        }, {
            "word": "hat",
            "synonyms": ["lid", "chapeau"]
        }, {
            "word": "hate",
            "synonyms": ["hatred"]
        }, {
            "word": "have",
            "synonyms": ["rich person", "wealthy person"]
        }, {
            "word": "he",
            "synonyms": ["helium", "He", "atomic number 2"]
        }, {
            "word": "head",
            "synonyms": ["capitulum"]
        }, {
            "word": "headline",
            "synonyms": ["newspaper headline"]
        }, {
            "word": "headquarters",
            "synonyms": ["home office", "home bas", "central office", "main office"]
        }, {
            "word": "health",
            "synonyms": ["wellness"]
        }, {
            "word": "healthy",
            "synonyms": ["able", "conditioned", "fit", "able-bodied", "healthy", "sound", "well", "in condition"]
        }, {
            "word": "hear",
            "synonyms": ["find out", "get a line", "discover", "pick up", "learn", "get wind", "get word", "see"]
        }, {
            "word": "hearing",
            "synonyms": ["sharp-eared", "quick-eared"]
        }, {
            "word": "heart",
            "synonyms": ["fondness", "philia", "affection", "affectionateness", "warmness", "warmheartedness", "tenderness"]
        }, {
            "word": "heat",
            "synonyms": ["rut", "estrus", "oestrus"]
        }, {
            "word": "heaven",
            "synonyms": ["Eden", "Nirvana", "Shangri-la", "paradise", "promised land"]
        }, {
            "word": "heavily",
            "synonyms": ["heavy"]
        }, {
            "word": "heavy",
            "synonyms": ["punishing", "gruelling", "toilsome", "grueling", "hard", "arduous", "effortful", "operose", "backbreaking", "laborious"]
        }, {
            "word": "heel",
            "synonyms": ["blackguard", "houn", "dog", "bounder", "cad"]
        }, {
            "word": "height",
            "synonyms": ["acme", "elevation", "summit", "superlative", "peak", "meridian", "tiptop", "to", "pinnacle"]
        }, {
            "word": "helicopter",
            "synonyms": ["whirlybird", "eggbeater", "chopper"]
        }, {
            "word": "hell",
            "synonyms": ["blaze"]
        }, {
            "word": "hello",
            "synonyms": ["hullo", "how-do-you-do", "hi", "howdy"]
        }, {
            "word": "help",
            "synonyms": ["assist", "aid", "assistanc"]
        }, {
            "word": "helpful",
            "synonyms": ["ministrant", "implemental", "attending", "steadying", "laborsaving", "stabilising", "useful", "right-hand", "accommodative", "encouraging", "face-saving", "reformatory", "reformative", "assistive", "laboursaving", "facilitative", "stabilizing", "subservient", "facilitatory", "instrumental", "adjuvant", "ministering", "utile", "accommodating", "cooperative"]
        }, {
            "word": "here",
            "synonyms": ["present"]
        }, {
            "word": "heritage",
            "synonyms": ["inheritance"]
        }, {
            "word": "hero",
            "synonyms": ["ze", "hero sandwich", "hoagy", "Italian sandwich", "hoagie", "Cuban sandwich", "bomber", "submarine sandwich", "submarine", "torpedo", "poor boy", "grinder", "wedge", "sub"]
        }, {
            "word": "hi",
            "synonyms": ["HI", "Hawaii", "Hawai'i", "Aloha State"]
        }, {
            "word": "hide",
            "synonyms": ["fell"]
        }, {
            "word": "high",
            "synonyms": ["overflowing", "soaring", "utmost", "broad", "advanced", "superior", "flooding", "full", "in flood", "graduate", "swollen", "postgraduate", "last", "higher"]
        }, {
            "word": "highlight",
            "synonyms": ["high spot"]
        }, {
            "word": "highly",
            "synonyms": ["extremely"]
        }, {
            "word": "highway",
            "synonyms": ["main road"]
        }, {
            "word": "hill",
            "synonyms": ["James Jerome Hill", "Hill", "J. J. Hill"]
        }, {
            "word": "hip",
            "synonyms": ["informed", "hep", "hip to"]
        }, {
            "word": "hire",
            "synonyms": ["engage", "employ"]
        }, {
            "word": "historian",
            "synonyms": ["historiographer"]
        }, {
            "word": "historic",
            "synonyms": ["historical", "past"]
        }, {
            "word": "historical",
            "synonyms": ["diachronic"]
        }, {
            "word": "history",
            "synonyms": ["chronicle", "story", "account"]
        }, {
            "word": "hit",
            "synonyms": ["collision"]
        }, {
            "word": "hold",
            "synonyms": ["appreciation", "grasp"]
        }, {
            "word": "hole",
            "synonyms": ["muddle", "pickle", "kettle of fish", "mess", "jam", "fix"]
        }, {
            "word": "holiday",
            "synonyms": ["vacation"]
        }, {
            "word": "holy",
            "synonyms": ["sanctified", "Blessed", "sacred", "consecrate", "blessed", "hallowed", "consecrated", "dedicated", "beatified"]
        }, {
            "word": "home",
            "synonyms": ["interior", "domestic", "national", "internal"]
        }, {
            "word": "homeless",
            "synonyms": ["dispossessed", "unfortunate", "roofless"]
        }, {
            "word": "honest",
            "synonyms": ["trusty", "trustworthy", "reliable", "dependable", "TRUE"]
        }, {
            "word": "honey",
            "synonyms": ["chromatic"]
        }, {
            "word": "honor",
            "synonyms": ["award", "accolade", "honour", "laurel"]
        }, {
            "word": "hope",
            "synonyms": ["Hope", "Leslie Townes Hope", "Bob Hope"]
        }, {
            "word": "horizon",
            "synonyms": ["apparent horizon", "visible horizon", "skyline", "sensible horizon"]
        }, {
            "word": "horror",
            "synonyms": ["revulsion", "repulsion", "repugnance"]
        }, {
            "word": "horse",
            "synonyms": ["cavalry", "horse cavalry"]
        }, {
            "word": "hospital",
            "synonyms": ["infirmary"]
        }, {
            "word": "host",
            "synonyms": ["horde", "legion"]
        }, {
            "word": "hot",
            "synonyms": ["active"]
        }, {
            "word": "hour",
            "synonyms": ["60 minutes", "hr"]
        }, {
            "word": "house",
            "synonyms": ["home", "household", "menage", "family"]
        }, {
            "word": "household",
            "synonyms": ["menag", "house", "home", "family"]
        }, {
            "word": "housing",
            "synonyms": ["trapping", "caparison"]
        }, {
            "word": "however",
            "synonyms": ["still", "nonetheless", "even so", "all the same", "withal", "yet", "nevertheless", "notwithstandin"]
        }, {
            "word": "huge",
            "synonyms": ["Brobdingnagian", "immense", "vast", "large", "big"]
        }, {
            "word": "human",
            "synonyms": ["manlike", "imperfect", "frail", "anthropoid", "earthborn", "hominal", "hominine", "weak", "hominian", "anthropomorphous", "anthropomorphic", "hominid", "fallible", "humanlike"]
        }, {
            "word": "humor",
            "synonyms": ["sense of humor", "humour", "sense of humour"]
        }, {
            "word": "hundred",
            "synonyms": ["c", "cardinal", "one hundred", "100"]
        }, {
            "word": "hungry",
            "synonyms": ["wishful", "athirst", "desirous", "thirsty"]
        }, {
            "word": "hunter",
            "synonyms": ["hunting watch"]
        }, {
            "word": "hunting",
            "synonyms": ["hunt"]
        }, {
            "word": "hurt",
            "synonyms": ["damaged", "weakened"]
        }, {
            "word": "husband",
            "synonyms": ["married man", "hubby"]
        }, {
            "word": "hypothesis",
            "synonyms": ["conjecture", "surmise", "supposition", "speculation", "guess", "surmisal"]
        }, {
            "word": "i",
            "synonyms": ["one", "1", "cardinal", "ane"]
        }, {
            "word": "ice",
            "synonyms": ["frappe"]
        }, {
            "word": "idea",
            "synonyms": ["approximation", "estimate", "estimation"]
        }, {
            "word": "ideal",
            "synonyms": ["abstract"]
        }, {
            "word": "identification",
            "synonyms": ["designation"]
        }, {
            "word": "identify",
            "synonyms": ["distinguish", "discover", "nam", "key out", "describe", "key"]
        }, {
            "word": "identity",
            "synonyms": ["indistinguishability", "identicalness"]
        }, {
            "word": "ie",
            "synonyms": ["i.e.", "id est"]
        }, {
            "word": "ignore",
            "synonyms": ["brush off", "disregard", "dismiss", "brush aside", "push asid", "discount"]
        }, {
            "word": "ill",
            "synonyms": ["bad"]
        }, {
            "word": "illegal",
            "synonyms": ["hot", "outlawed", "extralegal", "irregular", "misbranded", "bootleg", "black-market", "outlaw", "felonious", "under-the-counter", "smuggled", "nonlegal", "ill-gotten", "unratified", "contraband", "unlawful", "misappropriated", "penal", "dirty", "amerciable", "extrajudicial", "punishable", "illegitimate", "black", "ineligible", "mislabeled", "banned", "prohibited", "embezzled", "illicit", "criminal"]
        }, {
            "word": "illness",
            "synonyms": ["unwellness", "sickness", "malady"]
        }, {
            "word": "illustrate",
            "synonyms": ["exemplify", "instance"]
        }, {
            "word": "image",
            "synonyms": ["look-alike", "double"]
        }, {
            "word": "imagination",
            "synonyms": ["imaginativeness", "vision"]
        }, {
            "word": "imagine",
            "synonyms": ["ideate", "conceive of", "envisage"]
        }, {
            "word": "immediate",
            "synonyms": ["close", "contiguous"]
        }, {
            "word": "immediately",
            "synonyms": ["in real time", "at once", "straightaway", "directly", "instantly", "right away", "now", "forthwith", "straight off", "like a sho"]
        }, {
            "word": "immigration",
            "synonyms": ["in-migration"]
        }, {
            "word": "impact",
            "synonyms": ["impingement", "encroachment"]
        }, {
            "word": "implement",
            "synonyms": ["apply", "enforce"]
        }, {
            "word": "implication",
            "synonyms": ["entailment", "deduction"]
        }, {
            "word": "imply",
            "synonyms": ["connote"]
        }, {
            "word": "importance",
            "synonyms": ["grandness"]
        }, {
            "word": "important",
            "synonyms": ["authoritative", "influential"]
        }, {
            "word": "impose",
            "synonyms": ["enforce"]
        }, {
            "word": "impossible",
            "synonyms": ["undoable", "hopeless", "unattainable", "unrealizable", "impractical", "insurmountable", "unfeasible", "unachievable", "unsurmountable", "infeasible", "unrealistic", "unthinkable", "impracticable", "out", "unworkable"]
        }, {
            "word": "impress",
            "synonyms": ["impressment"]
        }, {
            "word": "impression",
            "synonyms": ["imprint", "depression"]
        }, {
            "word": "impressive",
            "synonyms": ["thundering", "dazzling", "brilliant", "amazing", "stunning", "noble", "grandiose", "gallant", "sensational", "astounding", "awful", "eye-popping", "formidable", "staggering", "striking", "fulgurant", "awe-inspiring", "proud", "majestic", "astonishing", "arresting", "grand", "fulgurous", "magnificent", "signal", "awesome", "expansive", "lofty", "stately", "dramatic", "spectacular", "stupefying", "moving", "glorious", "palatial", "heroic", "awing", "mind-boggling", "imposing", "splendid", "baronial", "important-looking"]
        }, {
            "word": "improve",
            "synonyms": ["meliorate", "amend", "better", "ameliorate"]
        }, {
            "word": "improvement",
            "synonyms": ["betterment", "advance"]
        }, {
            "word": "in",
            "synonyms": ["fashionable", "stylish"]
        }, {
            "word": "incentive",
            "synonyms": ["bonus"]
        }, {
            "word": "incident",
            "synonyms": ["peripheral", "omissible", "incidental", "parenthetic", "secondary", "parenthetical"]
        }, {
            "word": "include",
            "synonyms": ["admit", "let in"]
        }, {
            "word": "incorporate",
            "synonyms": ["integrated", "united", "incorporated", "unified", "merged"]
        }, {
            "word": "increase",
            "synonyms": ["addition", "gain"]
        }, {
            "word": "increased",
            "synonyms": ["magnified", "redoubled", "accrued", "enhanced", "multiplied", "augmented", "accumulated", "inflated", "raised", "hyperbolic", "exaggerated", "enlarged"]
        }, {
            "word": "increasing",
            "synonyms": ["crescendo", "accelerando"]
        }, {
            "word": "increasingly",
            "synonyms": ["progressively", "more and more"]
        }, {
            "word": "incredible",
            "synonyms": ["undreamt of", "undreamed of", "implausible", "tall", "marvelous", "incredulous", "unconvincing", "undreamt", "unthinkable", "astounding", "fabulous", "dumbfounding", "undreamed", "unimagined", "marvellous", "improbable", "unbelievable", "dumfounding"]
        }, {
            "word": "indeed",
            "synonyms": ["so"]
        }, {
            "word": "independence",
            "synonyms": ["Independence"]
        }, {
            "word": "independent",
            "synonyms": ["absolute"]
        }, {
            "word": "index",
            "synonyms": ["exponent", "power"]
        }, {
            "word": "indian",
            "synonyms": ["Asian country", "Asian nation", "Indian"]
        }, {
            "word": "indicate",
            "synonyms": ["argue"]
        }, {
            "word": "indication",
            "synonyms": ["denotation"]
        }, {
            "word": "individual",
            "synonyms": ["case-by-case", "item-by-item", "independent"]
        }, {
            "word": "industrial",
            "synonyms": ["blue-collar"]
        }, {
            "word": "industry",
            "synonyms": ["diligence", "industriousness"]
        }, {
            "word": "infant",
            "synonyms": ["baby", "babe"]
        }, {
            "word": "infection",
            "synonyms": ["contagion", "transmission"]
        }, {
            "word": "inflation",
            "synonyms": ["ostentation", "pompousness", "pretentiousness", "splashines", "ostentatiousness", "pomposity", "puffiness"]
        }, {
            "word": "influence",
            "synonyms": ["work", "act upon"]
        }, {
            "word": "information",
            "synonyms": ["data"]
        }, {
            "word": "ingredient",
            "synonyms": ["component", "element", "factor", "constituent"]
        }, {
            "word": "initial",
            "synonyms": ["first"]
        }, {
            "word": "initially",
            "synonyms": ["at the start", "ab initio", "at first"]
        }, {
            "word": "initiative",
            "synonyms": ["first", "maiden", "opening", "initiatory", "inaugural"]
        }, {
            "word": "injury",
            "synonyms": ["accidental injury"]
        }, {
            "word": "inner",
            "synonyms": ["inmost", "inside", "innermost", "central"]
        }, {
            "word": "innocent",
            "synonyms": ["destitute", "barren", "devoid", "empty"]
        }, {
            "word": "inquiry",
            "synonyms": ["enquiry", "research"]
        }, {
            "word": "inside",
            "synonyms": ["privileged", "inner", "exclusive"]
        }, {
            "word": "insight",
            "synonyms": ["brainstorm", "brainwave"]
        }, {
            "word": "insist",
            "synonyms": ["assert"]
        }, {
            "word": "inspire",
            "synonyms": ["exalt", "enliven", "animate", "invigorate"]
        }, {
            "word": "install",
            "synonyms": ["put in", "set u", "instal"]
        }, {
            "word": "instance",
            "synonyms": ["example", "case"]
        }, {
            "word": "instead",
            "synonyms": ["alternatively", "or else", "as an alternative"]
        }, {
            "word": "institution",
            "synonyms": ["establishment"]
        }, {
            "word": "institutional",
            "synonyms": ["institutionalised", "institutionalized", "uninteresting"]
        }, {
            "word": "instruction",
            "synonyms": ["command", "program line", "statement"]
        }, {
            "word": "instructor",
            "synonyms": ["teacher"]
        }, {
            "word": "instrument",
            "synonyms": ["instrumental role"]
        }, {
            "word": "insurance",
            "synonyms": ["indemnity"]
        }, {
            "word": "intellectual",
            "synonyms": ["cerebral"]
        }, {
            "word": "intelligence",
            "synonyms": ["intelligence activity", "intelligence operation"]
        }, {
            "word": "intend",
            "synonyms": ["specify", "designate", "destine"]
        }, {
            "word": "intense",
            "synonyms": ["sharp", "acute"]
        }, {
            "word": "intensity",
            "synonyms": ["intensiveness"]
        }, {
            "word": "intention",
            "synonyms": ["intent", "aim", "purpose", "design"]
        }, {
            "word": "interaction",
            "synonyms": ["fundamental interaction"]
        }, {
            "word": "interest",
            "synonyms": ["interest group"]
        }, {
            "word": "interested",
            "synonyms": ["concerned", "involved"]
        }, {
            "word": "interesting",
            "synonyms": ["exciting", "riveting", "absorbing", "newsworthy", "intriguing", "stimulating", "gripping", "fascinating", "engrossing", "unputdownable"]
        }, {
            "word": "internal",
            "synonyms": ["interior", "domestic", "home", "national"]
        }, {
            "word": "international",
            "synonyms": ["external", "foreign", "outside"]
        }, {
            "word": "internet",
            "synonyms": ["cyberspace", "net"]
        }, {
            "word": "interpret",
            "synonyms": ["construe", "see", "construe with"]
        }, {
            "word": "interpretation",
            "synonyms": ["interpreting", "rendition", "rendering"]
        }, {
            "word": "intervention",
            "synonyms": ["intercession"]
        }, {
            "word": "interview",
            "synonyms": ["audience", "consultation"]
        }, {
            "word": "introduce",
            "synonyms": ["bring in"]
        }, {
            "word": "introduction",
            "synonyms": ["unveiling", "launching", "first appearance", "debut", "entry"]
        }, {
            "word": "invasion",
            "synonyms": ["intrusion", "encroachment"]
        }, {
            "word": "invest",
            "synonyms": ["adorn", "clothe"]
        }, {
            "word": "investigate",
            "synonyms": ["enquire", "inquire"]
        }, {
            "word": "investigation",
            "synonyms": ["investigating"]
        }, {
            "word": "investigator",
            "synonyms": ["tec", "police detective", "detective"]
        }, {
            "word": "investment",
            "synonyms": ["investing"]
        }, {
            "word": "invite",
            "synonyms": ["ask for"]
        }, {
            "word": "involve",
            "synonyms": ["regard", "affect"]
        }, {
            "word": "involved",
            "synonyms": ["up to our necks", "up to her neck", "up to your neck", "up to their necks", "up to my neck", "entangled", "implicated", "caught up", "participating", "engaged", "concerned", "up to his neck", "active", "interested", "embroiled", "neck-deep"]
        }, {
            "word": "involvement",
            "synonyms": ["liaison", "affair", "affaire", "intimacy", "amour"]
        }, {
            "word": "iraqi",
            "synonyms": ["Iraki", "Asian country", "Iraqi", "Asian nation"]
        }, {
            "word": "irish",
            "synonyms": ["island", "Irish"]
        }, {
            "word": "iron",
            "synonyms": ["robust", "cast-iron"]
        }, {
            "word": "islamic",
            "synonyms": ["Muslim", "Moslem", "monotheism", "Islamic"]
        }, {
            "word": "israeli",
            "synonyms": ["country", "Israeli", "land", "state"]
        }, {
            "word": "issue",
            "synonyms": ["upsho", "outcome", "result", "effect", "event", "consequence"]
        }, {
            "word": "it",
            "synonyms": ["information technology", "IT"]
        }, {
            "word": "italian",
            "synonyms": ["European country", "European nation", "Italian"]
        }, {
            "word": "item",
            "synonyms": ["particular", "detail"]
        }, {
            "word": "jacket",
            "synonyms": ["jacket crown"]
        }, {
            "word": "jail",
            "synonyms": ["slammer", "jailhouse", "clink", "poky", "pokey", "gaol"]
        }, {
            "word": "japanese",
            "synonyms": ["Asian country", "Japanese", "Nipponese", "Asian nation"]
        }, {
            "word": "jet",
            "synonyms": ["pitchy", "coal-black", "sooty", "jet-black", "achromatic"]
        }, {
            "word": "jew",
            "synonyms": ["Hebrew", "Jew", "Israelite"]
        }, {
            "word": "jewish",
            "synonyms": ["someone", "somebody", "Judaic", "person", "Jewish", "mortal", "soul", "individual"]
        }, {
            "word": "job",
            "synonyms": ["caper"]
        }, {
            "word": "join",
            "synonyms": ["joint", "articulation", "junction", "juncture"]
        }, {
            "word": "joint",
            "synonyms": ["conjunct", "corporate", "shared", "integrated", "combined", "conjoined", "common", "associated", "united", "conjoint", "sharing", "conjunctive", "clannish", "concerted", "collective", "cosignatory", "cooperative"]
        }, {
            "word": "joke",
            "synonyms": ["prank", "trick", "put-o", "antic", "caper"]
        }, {
            "word": "journal",
            "synonyms": ["daybook"]
        }, {
            "word": "journalist",
            "synonyms": ["diary keeper", "diarist"]
        }, {
            "word": "journey",
            "synonyms": ["journeying"]
        }, {
            "word": "joy",
            "synonyms": ["delight", "pleasure"]
        }, {
            "word": "judge",
            "synonyms": ["evaluator"]
        }, {
            "word": "judgment",
            "synonyms": ["judgement", "mind"]
        }, {
            "word": "juice",
            "synonyms": ["succus"]
        }, {
            "word": "jump",
            "synonyms": ["jumping"]
        }, {
            "word": "junior",
            "synonyms": ["lowly", "lower-ranking", "younger", "subaltern", "junior-grade", "secondary", "young", "immature", "subordinate", "inferior", "petty", "minor", "jr."]
        }, {
            "word": "jury",
            "synonyms": ["panel"]
        }, {
            "word": "just",
            "synonyms": ["fitting", "honorable", "right", "righteous", "retributive", "conscionable", "just", "meet", "vindicatory", "fair", "honourable", "retributory", "rightful"]
        }, {
            "word": "justice",
            "synonyms": ["Do", "Justice Department", "Department of Justice", "Justice"]
        }, {
            "word": "justify",
            "synonyms": ["absolve", "free"]
        }, {
            "word": "FALSE",
            "synonyms": ["pretended", "imitative", "fictitious", "sham", "counterfeit", "put on", "assumed", "fictive"]
        }, {
            "word": "FALSE",
            "synonyms": ["unrealistic", "delusive"]
        }, {
            "word": "FALSE",
            "synonyms": ["dishonorable", "dishonest"]
        }, {
            "word": "FALSE",
            "synonyms": ["artificial", "unreal", "faux", "simulated", "imitation", "fake"]
        }, {
            "word": "FALSE",
            "synonyms": ["hollow", "insincere"]
        }, {
            "word": "FALSE",
            "synonyms": ["invalid"]
        }, {
            "word": "FALSE",
            "synonyms": ["wrong", "incorrect", "imitative", "mendacious", "specious", "spurious", "insincere", "counterfeit", "untrue", "trumped-up", "dishonorable", "dishonest"]
        }, {
            "word": "FALSE",
            "synonyms": ["incorrect", "wrong", "mistaken"]
        }, {
            "word": "FALSE",
            "synonyms": ["unharmonious", "inharmonious", "sour", "off-key"]
        }, {
            "word": "FALSE",
            "synonyms": ["untrue", "inconstant"]
        }, {
            "word": "FALSE",
            "synonyms": ["traitorously", "treasonably", "treacherously", "faithlessly"]
        }, {
            "word": "ugly",
            "synonyms": ["frightful", "alarming", "horrible", "horrifying", "atrocious"]
        }, {
            "word": "ultimate",
            "synonyms": ["last-ditch", "net", "eventual", "final", "crowning", "supreme", "last"]
        }, {
            "word": "ultimately",
            "synonyms": ["at last", "in the end", "at long las", "finally"]
        }, {
            "word": "unable",
            "synonyms": ["incapable"]
        }, {
            "word": "under",
            "synonyms": ["low", "nether"]
        }, {
            "word": "undergo",
            "synonyms": ["experience", "get", "receive", "have"]
        }, {
            "word": "understand",
            "synonyms": ["infer"]
        }, {
            "word": "understanding",
            "synonyms": ["perceptive"]
        }, {
            "word": "unfortunately",
            "synonyms": ["regrettably", "unluckily", "alas"]
        }, {
            "word": "uniform",
            "synonyms": ["homogeneous", "consistent", "homogenous"]
        }, {
            "word": "union",
            "synonyms": ["unionized", "closed", "organised", "organized", "unionised"]
        }, {
            "word": "unique",
            "synonyms": ["incomparable", "unequaled", "alone", "unequalled", "unparalleled", "uncomparable"]
        }, {
            "word": "unit",
            "synonyms": ["building block"]
        }, {
            "word": "united",
            "synonyms": ["amalgamate", "federate", "integrated", "confederate", "unpartitioned", "in agreement", "conjugated", "undivided", "fused", "coupled", "unified", "unsegmented", "collective", "merged", "coalescent", "suprasegmental", "incorporated", "incorporate", "coalescing", "allied", "agreed", "confederative", "tied", "unitary", "conjugate", "nonsegmental", "amalgamated", "in league", "cohesive", "conjunct", "one", "consolidated", "joint", "coalesced", "federated"]
        }, {
            "word": "universal",
            "synonyms": ["adaptable"]
        }, {
            "word": "universe",
            "synonyms": ["cosmos", "existence", "macrocos", "creation", "world"]
        }, {
            "word": "unknown",
            "synonyms": ["unbeknownst", "chartless", "unbeknown", "unidentified", "inglorious", "unheard-of", "unexplored", "transcendent", "unacknowledged", "undiagnosed", "uncharted", "unfamiliar", "little-known", "undiscovered", "dishonorable", "unmapped"]
        }, {
            "word": "unlike",
            "synonyms": ["dissimilar", "different"]
        }, {
            "word": "unlikely",
            "synonyms": ["farfetched", "remote", "outside", "implausible", "last"]
        }, {
            "word": "unusual",
            "synonyms": ["different", "peculiar", "extraordinary", "out-of-the-way", "unique", "odd", "uncommon", "unaccustomed"]
        }, {
            "word": "up",
            "synonyms": ["heavenward", "skyward", "aweigh", "dormie", "leading", "ahead", "risen", "sprouted", "upbound", "upfield", "upward", "high", "in the lead", "ascending", "dormy"]
        }, {
            "word": "upper",
            "synonyms": ["high"]
        }, {
            "word": "urban",
            "synonyms": ["city-born", "city-bred", "city-like", "urbanised", "cityfied", "urbanized", "citified"]
        }, {
            "word": "urge",
            "synonyms": ["impulse"]
        }, {
            "word": "us",
            "synonyms": ["U.S.", "the States", "America", "US", "United States of America", "U.S.A", "United States", "USA"]
        }, {
            "word": "use",
            "synonyms": ["economic consumption", "consumption", "usance", "use of goods and services"]
        }, {
            "word": "used",
            "synonyms": ["victimised", "ill-used", "misused", "exploited", "put-upon", "victimized"]
        }, {
            "word": "useful",
            "synonyms": ["effectual", "utilizable", "profitable", "recyclable", "reclaimable", "helpful", "usable", "effective", "serviceable", "efficacious", "reusable", "utilitarian", "useable", "multipurpose", "utile", "expedient"]
        }, {
            "word": "user",
            "synonyms": ["substance abuser", "drug user"]
        }, {
            "word": "usual",
            "synonyms": ["customary", "wonted", "habitual", "common", "accustomed", "regular"]
        }, {
            "word": "usually",
            "synonyms": ["ordinarily", "normally", "unremarkably", "commonly"]
        }, {
            "word": "utility",
            "synonyms": ["secondary", "substitute"]
        }, {
            "word": "vacation",
            "synonyms": ["holiday"]
        }, {
            "word": "valley",
            "synonyms": ["vale"]
        }, {
            "word": "valuable",
            "synonyms": ["invaluable", "rich", "worth", "precious", "important", "expensive", "of import", "priceless", "valued", "semiprecious", "blue-chip", "worthy"]
        }, {
            "word": "value",
            "synonyms": ["economic value"]
        }, {
            "word": "variable",
            "synonyms": ["adaptable"]
        }, {
            "word": "variation",
            "synonyms": ["fluctuation"]
        }, {
            "word": "variety",
            "synonyms": ["miscellanea", "mixture", "miscellany", "potpourri", "smorgasbord", "salmagundi", "mixed bag", "assortment", "motle"]
        }, {
            "word": "various",
            "synonyms": ["different", "assorted"]
        }, {
            "word": "vary",
            "synonyms": ["change", "alter"]
        }, {
            "word": "vast",
            "synonyms": ["Brobdingnagian", "immense", "large", "huge", "big"]
        }, {
            "word": "vegetable",
            "synonyms": ["blackberry-like", "seed-like", "onion-like", "melon-like", "bean-like", "parsley-like", "vegetative", "stemlike", "gooseberry-like", "stem-like", "rooted", "banana-like", "moss-like", "branch-like", "gourd-like", "stalk-like", "mushroom-shaped", "seedlike", "cherry-like", "stalklike", "vegetal", "crabapple-like", "plant-like", "rootlike", "root-like", "seed-producing", "tomato-like", "garlic-like", "branchlike", "cabbage-like", "mosslike", "vegetational", "plum-shaped"]
        }, {
            "word": "vehicle",
            "synonyms": ["fomite"]
        }, {
            "word": "venture",
            "synonyms": ["speculation"]
        }, {
            "word": "version",
            "synonyms": ["adaptation"]
        }, {
            "word": "very",
            "synonyms": ["selfsame", "identical", "same"]
        }, {
            "word": "vessel",
            "synonyms": ["vas"]
        }, {
            "word": "veteran",
            "synonyms": ["experienced", "seasoned", "experient"]
        }, {
            "word": "victim",
            "synonyms": ["dupe"]
        }, {
            "word": "victory",
            "synonyms": ["triumph"]
        }, {
            "word": "video",
            "synonyms": ["picture"]
        }, {
            "word": "view",
            "synonyms": ["prospect", "panoram", "vista", "scene", "aspect"]
        }, {
            "word": "viewer",
            "synonyms": ["spectator", "watcher", "looke", "witness"]
        }, {
            "word": "village",
            "synonyms": ["Greenwich Village", "Village"]
        }, {
            "word": "violate",
            "synonyms": ["profane", "desecrate", "outrage"]
        }, {
            "word": "violation",
            "synonyms": ["infringement"]
        }, {
            "word": "violence",
            "synonyms": ["vehemence", "furiousness", "fierceness", "ferocity", "wildness", "fury"]
        }, {
            "word": "violent",
            "synonyms": ["hot", "unpeaceful", "terrorist", "convulsive", "furious", "knockdown-dragout", "lashing", "raging", "rampageous", "ruffianly", "knock-down-and-drag-out", "hostile", "slam-bang", "lurid", "tough", "fierce", "ferocious", "savage"]
        }, {
            "word": "virtually",
            "synonyms": ["all but", "most", "well-nigh", "about", "just about", "nearly", "almost", "nigh", "near"]
        }, {
            "word": "virtue",
            "synonyms": ["chastity", "sexual morality"]
        }, {
            "word": "virus",
            "synonyms": ["computer virus"]
        }, {
            "word": "visible",
            "synonyms": ["available"]
        }, {
            "word": "vision",
            "synonyms": ["imagination", "imaginativeness"]
        }, {
            "word": "visit",
            "synonyms": ["sojourn"]
        }, {
            "word": "visitor",
            "synonyms": ["visitant"]
        }, {
            "word": "visual",
            "synonyms": ["ocular", "optic", "optical", "exteroception", "sensory system", "sense modality", "modality"]
        }, {
            "word": "vital",
            "synonyms": ["alive", "live"]
        }, {
            "word": "voice",
            "synonyms": ["articulation"]
        }, {
            "word": "volume",
            "synonyms": ["book"]
        }, {
            "word": "volunteer",
            "synonyms": ["voluntary", "unpaid"]
        }, {
            "word": "vote",
            "synonyms": ["balloting", "voting", "ballot"]
        }, {
            "word": "voter",
            "synonyms": ["elector"]
        }, {
            "word": "vulnerable",
            "synonyms": ["unguarded", "endangered", "indefensible", "unsafe", "under attack", "undefended", "dangerous", "defenceless", "susceptible", "unprotected", "open", "conquerable", "undefendable", "compromising", "penetrable", "assailable", "under fire", "insecure", "defenseless", "threatened"]
        }, {
            "word": "wage",
            "synonyms": ["remuneration", "pay", "earnings", "salary"]
        }, {
            "word": "wait",
            "synonyms": ["hold", "delay", "postponemen", "time lag"]
        }, {
            "word": "wake",
            "synonyms": ["aftermath", "backwash"]
        }, {
            "word": "walk",
            "synonyms": ["base on balls", "pass"]
        }, {
            "word": "wall",
            "synonyms": ["paries"]
        }, {
            "word": "wander",
            "synonyms": ["betray", "cuckold", "cheat on", "cheat"]
        }, {
            "word": "want",
            "synonyms": ["lack", "deficiency"]
        }, {
            "word": "war",
            "synonyms": ["state of war"]
        }, {
            "word": "warm",
            "synonyms": ["fond", "lovesome", "affectionate", "caring", "tender", "loving"]
        }, {
            "word": "warn",
            "synonyms": ["monish", "discourage", "admonish"]
        }, {
            "word": "warning",
            "synonyms": ["exemplary", "dissuasive", "admonitory", "cautionary", "monitory"]
        }, {
            "word": "wash",
            "synonyms": ["dry wash"]
        }, {
            "word": "waste",
            "synonyms": ["inhospitable", "desert", "godforsaken", "wild"]
        }, {
            "word": "watch",
            "synonyms": ["lookout", "picke", "lookout man", "sentinel", "spotter", "sentry", "scout"]
        }, {
            "word": "water",
            "synonyms": ["body of water"]
        }, {
            "word": "wave",
            "synonyms": ["moving ridge"]
        }, {
            "word": "way",
            "synonyms": ["right smart"]
        }, {
            "word": "weak",
            "synonyms": ["pallid", "spineless", "wan", "slack", "anemic", "wishy-washy", "jerry-built", "vulnerable", "untoughened", "lame", "feeble", "fragile", "gutless", "pale", "flaccid", "anaemic", "slight", "adynamic", "tenuous", "delicate", "flimsy", "powerless", "weakened", "shoddy", "limp", "thin", "puny", "namby-pamby", "enervated", "lax", "debilitated", "sick", "faint", "tender", "asthenic"]
        }, {
            "word": "wealth",
            "synonyms": ["riches"]
        }, {
            "word": "wealthy",
            "synonyms": ["flush", "rich", "affluent", "moneyed", "loaded"]
        }, {
            "word": "weapon",
            "synonyms": ["arm", "weapon system"]
        }, {
            "word": "wear",
            "synonyms": ["wearable", "article of clothing", "habiliment", "clothing", "vesture"]
        }, {
            "word": "weather",
            "synonyms": ["windward", "upwind"]
        }, {
            "word": "wedding",
            "synonyms": ["marriage ceremony", "marriage"]
        }, {
            "word": "week",
            "synonyms": ["calendar week"]
        }, {
            "word": "weekly",
            "synonyms": ["period of time", "period", "time period"]
        }, {
            "word": "weigh",
            "synonyms": ["consider", "count"]
        }, {
            "word": "weight",
            "synonyms": ["exercising weight", "free weight"]
        }, {
            "word": "welcome",
            "synonyms": ["wanted"]
        }, {
            "word": "welfare",
            "synonyms": ["benefit"]
        }, {
            "word": "well",
            "synonyms": ["advisable"]
        }, {
            "word": "west",
            "synonyms": ["westerly", "westmost", "western", "westernmost", "westward", "westbound", "westside"]
        }, {
            "word": "western",
            "synonyms": ["occidental", "Hesperian"]
        }, {
            "word": "wet",
            "synonyms": ["alcoholic"]
        }, {
            "word": "whatever",
            "synonyms": ["any", "whatsoever", "some"]
        }, {
            "word": "wheel",
            "synonyms": ["bicycle", "bike", "cycle"]
        }, {
            "word": "while",
            "synonyms": ["spell", "piece", "patc"]
        }, {
            "word": "whisper",
            "synonyms": ["rustling", "rustle", "whispering"]
        }, {
            "word": "white",
            "synonyms": ["albescent", "light", "light-colored"]
        }, {
            "word": "who",
            "synonyms": ["WHO", "World Health Organization"]
        }, {
            "word": "whole",
            "synonyms": ["full-page", "intact", "complete", "full-length", "entire", "integral", "undivided", "full", "total", "livelong"]
        }, {
            "word": "why",
            "synonyms": ["wherefore"]
        }, {
            "word": "wide",
            "synonyms": ["blanket", "all-encompassing", "extensive", "all-inclusive", "broad", "across-the-board", "all-embracing", "panoptic", "encompassing", "comprehensive"]
        }, {
            "word": "widely",
            "synonyms": ["wide"]
        }, {
            "word": "widespread",
            "synonyms": ["far-flung", "distributed"]
        }, {
            "word": "wife",
            "synonyms": ["married woman"]
        }, {
            "word": "wild",
            "synonyms": ["stormy", "furious", "raging", "tempestuous", "angry"]
        }, {
            "word": "will",
            "synonyms": ["testament"]
        }, {
            "word": "willing",
            "synonyms": ["compliant", "prepared", "fain", "happy", "glad", "volitional", "ready", "willing and able", "inclined", "voluntary", "consenting", "disposed"]
        }, {
            "word": "win",
            "synonyms": ["profits", "winnings"]
        }, {
            "word": "wind",
            "synonyms": ["air current", "current of air"]
        }, {
            "word": "window",
            "synonyms": ["windowpane"]
        }, {
            "word": "wine",
            "synonyms": ["vino"]
        }, {
            "word": "wing",
            "synonyms": ["annex", "annexe", "extension"]
        }, {
            "word": "winner",
            "synonyms": ["success", "achiever", "succeeder"]
        }, {
            "word": "winter",
            "synonyms": ["wintertime"]
        }, {
            "word": "wipe",
            "synonyms": ["rub"]
        }, {
            "word": "wire",
            "synonyms": ["conducting wire"]
        }, {
            "word": "wisdom",
            "synonyms": ["sapience"]
        }, {
            "word": "wise",
            "synonyms": ["sapient", "omniscient", "sage", "advisable", "politic", "prudent", "perspicacious", "owlish", "advised", "sagacious", "all-knowing", "sapiential", "well-advised"]
        }, {
            "word": "wish",
            "synonyms": ["indirect request"]
        }, {
            "word": "withdraw",
            "synonyms": ["adjourn", "retire"]
        }, {
            "word": "within",
            "synonyms": ["inside"]
        }, {
            "word": "witness",
            "synonyms": ["attestator", "attestant", "attestor"]
        }, {
            "word": "woman",
            "synonyms": ["adult female"]
        }, {
            "word": "wonder",
            "synonyms": ["curiosity"]
        }, {
            "word": "wonderful",
            "synonyms": ["grand", "fantastic", "marvelous", "extraordinary", "wondrous", "howling", "rattling", "tremendous", "marvellous", "terrific"]
        }, {
            "word": "wood",
            "synonyms": ["woods", "forest"]
        }, {
            "word": "wooden",
            "synonyms": ["awkward"]
        }, {
            "word": "word",
            "synonyms": ["Christian Bible", "Good Book", "Word of God", "Holy Writ", "Wor", "Holy Scripture", "Book", "Scripture", "Bible"]
        }, {
            "word": "work",
            "synonyms": ["employment"]
        }, {
            "word": "worker",
            "synonyms": ["doer", "actor"]
        }, {
            "word": "working",
            "synonyms": ["impermanent", "temporary"]
        }, {
            "word": "works",
            "synonyms": ["deeds"]
        }, {
            "word": "workshop",
            "synonyms": ["shop"]
        }, {
            "word": "world",
            "synonyms": ["international", "planetary", "worldwide", "global", "world-wide"]
        }, {
            "word": "worried",
            "synonyms": ["uneasy", "apprehensive"]
        }, {
            "word": "worry",
            "synonyms": ["vexation", "concern", "headache"]
        }, {
            "word": "worth",
            "synonyms": ["meriting", "worthy", "deserving"]
        }, {
            "word": "wound",
            "synonyms": ["coiled"]
        }, {
            "word": "wrap",
            "synonyms": ["wrapper"]
        }, {
            "word": "write",
            "synonyms": ["compose", "write out", "pen", "indite"]
        }, {
            "word": "writer",
            "synonyms": ["author"]
        }, {
            "word": "writing",
            "synonyms": ["composition", "authorship", "penning"]
        }, {
            "word": "wrong",
            "synonyms": ["amiss", "malfunctioning", "haywire", "nonfunctional", "awry"]
        }, {
            "word": "yard",
            "synonyms": ["cubic yard"]
        }, {
            "word": "yeah",
            "synonyms": ["yea"]
        }, {
            "word": "year",
            "synonyms": ["class"]
        }, {
            "word": "yell",
            "synonyms": ["shout", "vociferation", "outcry", "call", "cry"]
        }, {
            "word": "yellow",
            "synonyms": ["chicken", "chickenhearted", "fearful", "yellow-bellied", "lily-livered", "cowardly", "white-livered"]
        }, {
            "word": "yet",
            "synonyms": ["still", "even"]
        }, {
            "word": "yield",
            "synonyms": ["fruit"]
        }, {
            "word": "young",
            "synonyms": ["girlish", "little", "teenaged", "two-year-old", "boyish", "formative", "newborn", "five-year-old", "preadolescent", "youngish", "four-year-old", "childly", "one-year-old", "immature", "junior", "adolescent", "teen", "vernal", "teenage", "puppyish", "early", "schoolgirlish", "new", "puppylike", "youthful", "three-year-old", "boylike", "preteen", "childlike", "schoolboyish", "small", "young", "infantile", "tender"]
        }, {
            "word": "youth",
            "synonyms": ["early days"]
        }, {
            "word": "zone",
            "synonyms": ["geographical zone"]
        }])
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
    find_synonyms: function(word) {
        var res = {};
        utility.get_thesaurus().forEach(function(obj) {
            if (stemmer(obj.word.toLowerCase()) === stemmer(word.toLowerCase())) {
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
    },
    add_synonyms_to_tweets: function(original_tweets) {
        var res = []
        original_tweets.forEach(function(tweet, i) {
            var inner = {};
            if (tweet !== "") {
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
            }
        })
        return (res)
    },
    distance_between_all_vectors: function(synms) {
        var res = []
        var all_distances = []
        synms.forEach(function(obj, i) {
            var inner = {}
            if (obj.original_tweet !== "") {
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
            }
        })
        return (res)
    },
    find_closest_tweets: function(arr) {
        var res = []
        arr.forEach(function(obj) {
            var all_tweets = []
            var inner = {}
            inner.original_tweet = obj.original_tweet
            all_tweets.push(obj.original_tweet)
            inner.closest_tweets = []
            var other_tweet_distances = []
            obj.other_tweets.forEach(function(obj_b) {
                other_tweet_distances.push(obj_b.distance_to_original_tweet)
            })
            var smallest_distance = Math.min.apply(Math, other_tweet_distances);
            obj.other_tweets.forEach(function(obj_b) {
                if (obj_b.distance_to_original_tweet === smallest_distance) {
                    inner.closest_tweets.push(obj_b.tweet)
                    all_tweets.push(obj_b.tweet)
                }
            })
            var topic_arr = utility.find_topics(all_tweets);
            var these_synonyms = [];
            topic_arr.forEach(function(obj) {
                these_synonyms.push(obj.synonym.reduce(function(a, b) {
                    return a.concat(b)
                }, []))
            })
            var flattened_synonyms = these_synonyms.reduce(function(a, b) {
                return a.concat(b)
            }, [])
            var all_topics = flattened_synonyms.filter(function(element) {
                return element !== undefined
            });
            inner.topic = utility.find_longest_word(all_topics.join(" "), 8)
            res.push(inner)
        })
        return (res)
    },
    kmeans: function(original_docs, vectors, k) {
        var res = skmeans(vectors, k, "kmpp");
        return (res)
    }
}
/*
Parse.Cloud.define("topic_analysis", async (req) => { 
    incoming_text = req.params.text;
    results = utility.pipeline(incoming_text)
    return(results)
})
*/