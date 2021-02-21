import React, {useState} from 'react';

import "./Listing.css";

import {utility} from "./utility";

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
                    var formatted = list_data[document.getElementById(e.target.id).innerText].map(function(line) { // map the array to individual p tags
                        return (<p>{line}</p>);
                    });
                    setData((use_data) => [use_data, formatted]);
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