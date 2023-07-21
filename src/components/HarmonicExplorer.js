import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";

const HarmonicExplorer = () => {
  const [fundamentalFreq, setFundamentalFreq] = useState(440);
  const [harmonics, setHarmonics] = useState([
    { harmonic: 1, amplitude: 1, phaseAngle: 0 },
  ]);
  const [cycles, setCycles] = useState(5);

  const changeFundamentalFrequency = (e) => {
    setFundamentalFreq(e.target.value);
  };

  const changeAmplitude = (index, value) => {
    const updatedHarmonics = [...harmonics];
    updatedHarmonics[index].amplitude = value;
    setHarmonics(updatedHarmonics);
  };

  const changePhaseAngle = (index, value) => {
    const updatedHarmonics = [...harmonics];
    updatedHarmonics[index].phaseAngle = (value * Math.PI) / 180;
    setHarmonics(updatedHarmonics);
  };

  const removeHarmonic = (index) => {
    const updatedHarmonics = [...harmonics];
    updatedHarmonics.splice(index, 1);
    setHarmonics(updatedHarmonics);
  };

  const addHarmonic = () => {
    const nextHarmonic = harmonics.length + 1;
    setHarmonics([
      ...harmonics,
      { harmonic: nextHarmonic, amplitude: 1, phaseAngle: 0 },
    ]);
  };

  const changeCycles = (e) => {
    setCycles(e.target.value);
  };

  const combinedSignal = () => {
    const time = [];
    const signal = [];

    const sampleRate = 50000;
    const duration = cycles / fundamentalFreq;
    const numSamples = sampleRate * duration;

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let y = 0;

      harmonics.forEach((harmonic) => {
        const frequency = fundamentalFreq * harmonic.harmonic;
        const amplitude = harmonic.amplitude;
        const phase = harmonic.phaseAngle;
        y += amplitude * Math.sin(2 * Math.PI * frequency * t + phase);
      });

      time.push(t);
      signal.push(y);
    }

    return { time, signal };
  };

  useEffect(() => {
    const combined = combinedSignal();
    setCombinedSignalData(combined);

    const maxSignalValue = Math.max(...combined.signal);
    const minSignalValue = Math.min(...combined.signal);

    setLayout({
      ...layout,
      yaxis: {
        range: [minSignalValue - 1, maxSignalValue + 1],
      },
    });
  }, [fundamentalFreq, harmonics, cycles]);

  const [combinedSignalData, setCombinedSignalData] = useState({
    time: [],
    signal: [],
  });
  const [layout, setLayout] = useState({
    width: 600,
    height: 300,
    title: "Combined Signal",
    yaxis: {},
  });

  return (
    <div>
      <h1>Harmonic Explorer</h1>
      <div>
        <label htmlFor="fundamentalFreq">Fundamental Frequency (Hz):</label>
        <input
          type="number"
          id="fundamentalFreq"
          value={fundamentalFreq}
          onChange={changeFundamentalFrequency}
        />
      </div>
      <div>
        <h2>Harmonics:</h2>
        <button onClick={addHarmonic}>Add Harmonic</button>
        <ul>
          {harmonics.map((harmonic, index) => (
            <li key={harmonic.harmonic}>
              <div>{`Harmonic ${harmonic.harmonic}: ${fundamentalFreq * harmonic.harmonic} Hz`} </div>
              <div>
                <label htmlFor={`amplitude-${harmonic.harmonic}`}>
                  Amplitude (0-1):
                </label>
                <input
                  type="number"
                  id={`amplitude-${harmonic.harmonic}`}
                  value={harmonic.amplitude}
                  step={0.01}
                  min={0}
                  max={1}
                  onChange={(e) =>
                    changeAmplitude(index, parseFloat(e.target.value))
                  }
                />
              </div>
              <div>
                <label htmlFor={`phase-${harmonic.harmonic}`}>
                  Phase Angle (degrees):
                </label>
                <input
                  type="number"
                  id={`phase-${harmonic.harmonic}`}
                  value={(harmonic.phaseAngle * 180) / Math.PI}
                  step={0.1}
                  onChange={(e) =>
                    changePhaseAngle(index, parseFloat(e.target.value))
                  }
                />
              </div>
              <button onClick={() => removeHarmonic(index)}>
                Remove Harmonic
              </button>
            </li>
          ))}
        </ul>
      </div>
      
      <div>
        <h2>Combined Signal:</h2>
        <div>
          <label htmlFor="cycles">Number of Cycles:</label>
          <input
            type="number"
            id="cycles"
            value={cycles}
            onChange={changeCycles}
          />
        </div>
        <Plot
          data={[
            {
              type: "scatter",
              mode: "line",
              x: combinedSignalData.time,
              y: combinedSignalData.signal,
            },
          ]}
          layout={{
            ...layout,
            xaxis: {
              title: "Time (seconds)", 
            },
            yaxis: {
              title: "Amplitude",
            },
          }}
        />
      </div>
    </div>
  );
};

export default HarmonicExplorer;
