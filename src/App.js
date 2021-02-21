import "./App.css";
import { utility } from "./utility";

import Chart from "./Chart";

function App() {
    return(
        <>
        <div className="title">PASTE TWEETS</div>
        <div className="wrapper">
            <div className="item"></div>
            <div className="item">
                <div></div>
                <textarea id="textarea"></textarea>
                <div></div>
            </div>
            <div className="item"></div>
        </div>
        
        <Chart/>
        </>
    )
}

export default App;