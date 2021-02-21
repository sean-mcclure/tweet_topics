import "./App.css";
import { utility } from "./utility";

import Chart from "./Chart";
import Listing from "./Listing";

function App() {
    return(
        <>
        <div className="title">PASTE TWEETS</div>
        <div className="wrapper">
            <div className="item">
                <textarea id="textarea"></textarea>
            </div>
            <div className="item">
                <Listing/>
            </div>
            <div className="item">
                <Chart/>
            </div>
        </div>
        </>
    )
}

export default App;