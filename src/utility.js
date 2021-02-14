export const utility = {
    read_tweets : function() {
        var cleaned_tweets = []
        var tweets = document.getElementById("textarea").value;
        tweets = tweets.split("\n")
        tweets.forEach(function(elem) {
            cleaned_tweets.push(utility.remove_stopwords(elem))
        });
        //alert(cleaned_tweets.length)
        var topics = utility.find_text_clusters(cleaned_tweets)
        console.log(topics)
    },
    remove_stopwords : function(str) {
    var stopwords = ['i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','hers','herself','it','its','itself','they','them','their','theirs','themselves','what','which','who','whom','this','that','these','those','am','is','are','was','were','be','been','being','have','has','had','having','do','does','did','doing','a','an','the','and','but','if','or','because','as','until','while','of','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','s','t','can','will','just','don','should','now']
    var res = []
    var words = str.split(' ')
    for(var i=0;i<words.length;i++) {
       var word_clean = words[i].split(".").join("")
       if(!stopwords.includes(word_clean)) {
           res.push(word_clean)
       }
    }
    return(res.join(' '))
},
remove_from_array_if : function(arr) {
    var res = arr.filter(function(x){
        return(!x.includes("@") && !x.includes("http") && !x.includes("’") );
    });
    return(res)
},
find_longest_word : function(str) {
    var longest = str.split(" ").sort(function (a, b) {
                    return b.length - a.length;
                })[0];
    return(longest)
},
find_text_clusters : function(arr) {
    var raw_topics = [];
    arr.forEach(function(str) {
        raw_topics.push(utility.find_longest_word(str));
    })
    var longest_clean = utility.remove_from_array_if(raw_topics);
    console.log(longest_clean);
}
}