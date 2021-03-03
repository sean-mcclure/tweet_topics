import React, { useState, useEffect } from 'react';

import "../styles/App.css";
import { events } from "../scripts/events.js";

function App() {

    const pipeline = (e) => {
         events.process_text_locally()
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