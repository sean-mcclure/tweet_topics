import React, {useState} from 'react';
import Highlighter from "react-highlight-words";

import "../styles/Listing.css";

import {utility} from "../scripts/utility.js";

function Listing() {
    
    const [use_data, setData] = useState();

    const handleClick = (e) => {
        const list_data = utility.pipeline()["list_data"] // comes in as array
            Object.keys(list_data).forEach(function(elem) {
                var butt = document.createElement("button");
                butt.innerText = elem;
                butt.id = Math.round(Math.random()*10000000000)
                butt.style.margin = "5px";
                butt.style.outline = "0";
                butt.style.width = "auto";
                butt.addEventListener("click", function(e) {
                    var button_title = document.getElementById(e.target.id).innerText;
                    var formatted = list_data[button_title].map(function(line) { // map the array to individual p tags
                        return (<div className="show_tweet">{line}</div>);
                    });
                    setData((use_data) => [use_data, formatted]);
                    setTimeout(function() {
                        utility.highlight_words(button_title)
                    }, 1000)
                })
                document.body.append(butt)
            })
    };   

    return(
        <>
        <button id="button" onClick={handleClick}>GO</button>
        <div>{use_data}</div>
        </>
    )
}

export default Listing;