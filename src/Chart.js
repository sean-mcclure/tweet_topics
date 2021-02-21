import React, {useState} from 'react';
import Plot from 'react-plotly.js';

import {utility} from "./utility";

function Chart(props) {

    const [use_data, setData] = useState();

    const handleClick = () => {
        var plot_data = utility.pipeline()["plot_data"]
        setData((use_data) => [use_data, plot_data]);
    };

    return (
        <>
        <button onClick={handleClick}>GO</button>
        <Plot
            var data = {use_data}
            var config = {{responsive: true, "displayModeBar": false}}
            var layout={ {width: 1000, height: 400, title: "Top 100 Topics"} }
        />
        </>
    );
  }

  export default Chart;