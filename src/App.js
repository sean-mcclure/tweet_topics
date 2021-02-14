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
            utility.read_tweets()
        }}>GO</button>
        </>
    )
}

export default App;