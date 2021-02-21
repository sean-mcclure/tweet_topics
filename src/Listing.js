import React, {useState} from 'react';

import "./Listing.css";

import {utility} from "./utility";

function Listing() {
    
    const [use_data, setData] = useState();

    const handleClick = () => {
        var list_data = utility.pipeline()["list_data"]
        setData((use_data) => [use_data, list_data]);
    };

    return(
        <div className="wrapper">
            <div className="item">
                <button onClick={handleClick}>GO</button>
            </div>
            <div className="item">
                {use_data}.map(function() {
                    document.body.append(Element)
                });
            </div>
        </div>
    )
}

export default Listing;