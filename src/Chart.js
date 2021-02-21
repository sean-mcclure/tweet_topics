import React, {useState} from 'react';
import Plot from 'react-plotly.js';

import {utility} from "./utility";

function Chart() {
    const [use_data, setData] = useState([]);

    const handleClick = () => {
        const newData = {
            x: ['giraffes', 'orangutans', 'monkeys'],
            y: [20, 14, 23],
            type: 'bar'
        }
        setData((use_data) => [...use_data, newData]);
    };

    return (
        <>
        <button onClick={handleClick}>GO</button>
        <Plot
            var data = {use_data}
            var config = {{responsive: true,"displayModeBar": false}}
            var layout={ {width: 1000, height: 400, title: "Top 100 Topics"} }
        />
        </>
    );
  }

  export default Chart;