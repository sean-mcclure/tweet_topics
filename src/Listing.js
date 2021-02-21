import React, {useState} from 'react';

import "./Listing.css";

import {utility} from "./utility";

function Listing() {
    
    const [use_data, setData] = useState();

    const handleClick = () => {
        var list_data = utility.pipeline()["list_data"]["complexity"] // comes in as array
        var formatted = list_data.map(function(line) { // map the array to individual p tags
            return (<p>{line}</p>);
        });
        setTimeout(function() {
            setData((use_data) => [use_data, formatted]); // pass the formatted data into setData
        }, 2000)
    };   

    return(
        <>
        <button onClick={handleClick}>GO</button>
        <div>{use_data}</div>
        </>
    )
}

export default Listing;