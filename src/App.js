import React, { useState, useEffect } from 'react';

import "./App.css";
import { utility } from "./utility";

import Chart from "./Chart";
import Listing from "./Listing";

function App() {

    const pipeline = (e) => {
        utility.send_text_to_node()
         //utility.send_text_to_parse()
    }
    
    return(
        <>
        <div className="title">PASTE TWEETS</div>
        <div className="wrapper">
            <div className="item">
                <textarea id="textarea"></textarea>
            </div>
            <div>
                <button onClick={(event) => {pipeline()}}>RUN</button>
            </div>
                <div className="hold_results"></div>
        </div>
        </>
    )
}

export default App;