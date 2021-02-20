import "./App.css";
import { utility } from "./utility";

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
        <button onClick={(event) => {
            console.log(utility.pipeline())
        }}>GO</button>
        </>
    )
}

export default App;