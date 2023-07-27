import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import { TextField, Button, Grid, Typography, Box } from "@mui/material";

const HarmonicExplorer = () => {
  const [fundamentalFreq, setFundamentalFreq] = useState(440);
  const [harmonics, setHarmonics] = useState([
    { harmonic: 1, amplitude: 1, phaseAngle: 0 },
  ]);
  const [cycles, setCycles] = useState(4);

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

  const removeLastHarmonic = () => {
    const updatedHarmonics = [...harmonics];
    const lastHarmonic = updatedHarmonics.length - 1;
    updatedHarmonics.splice(lastHarmonic, 1);
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
    if (fundamentalFreq != 0 && cycles > 0) {
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
    } else {
      alert("Fundamental Frequency should be a non-zero number.");
      setFundamentalFreq(440);
    }
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

  const getQueryParam = (queryParam) => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    return urlSearchParams.get(queryParam);
  };

  useEffect(() => {
    const freq = parseFloat(getQueryParam("freq")) || 440;
    setFundamentalFreq(freq);

    const cycleCount = parseFloat(getQueryParam("cycle")) || 4;
    setCycles(cycleCount);

    const harmonicCount = parseFloat(getQueryParam("harmonics")) || 1;
    if (harmonicCount > 0) {
      const updatedHarmonics = [];
      for (let i = 1; i <= harmonicCount; i++) {
        const amplitude = parseFloat(getQueryParam(`amp${i}`)) || 1;
        const phaseAngle = parseFloat(getQueryParam(`pa${i}`)) || 0;
        updatedHarmonics.push({ harmonic: i, amplitude, phaseAngle });
      }
      setHarmonics(updatedHarmonics);
    }
  }, []);

  useEffect(() => {
    const newUrlSearchParams = new URLSearchParams();

    newUrlSearchParams.set("freq", fundamentalFreq.toString());
    newUrlSearchParams.set("cycle", cycles.toString());
    newUrlSearchParams.set("harmonics", harmonics.length.toString());

    harmonics.forEach((harmonic, index) => {
      newUrlSearchParams.set(`amp${index + 1}`, harmonic.amplitude.toString());
      newUrlSearchParams.set(`pa${index + 1}`, harmonic.phaseAngle.toString());
    });

    window.history.replaceState({}, "", `?${newUrlSearchParams.toString()}`);
  }, [fundamentalFreq, harmonics, cycles]);

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const updateWindowDimensions = () => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  useEffect(() => {
    window.addEventListener("resize", updateWindowDimensions);

    return () => {
      window.removeEventListener("resize", updateWindowDimensions);
    };
  }, []);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={4}>
        <Box p={2}>
          <Typography variant="h1" fontSize="50px">
            Harmonic Explorer
          </Typography>
          <div>
            <TextField
              item
              xs={12}
              sm={6}
              md={4}
              type="number"
              label="Fundamental Frequency (Hz)"
              value={fundamentalFreq}
              onChange={changeFundamentalFrequency}
              style={{
                maxWidth: "200px",
                marginTop: "20px",
              }}
            />
            <TextField
              item
              xs={12}
              sm={6}
              md={4}
              type="number"
              label="Number of Cycles"
              value={cycles}
              onChange={changeCycles}
              style={{
                maxWidth: "200px",
                marginTop: "20px",
                marginLeft: "10px",
              }}
            />
          </div>
          <div>
            <Typography variant="h5" style={{ marginTop: "20px" }}>
              Harmonics:
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={12} style={{ marginTop: "20px" }}>
                <Button variant="contained" onClick={addHarmonic}>
                  Add Harmonic
                </Button>
                <Button
                  variant="contained"
                  style={{ marginLeft: "20px" }}
                  onClick={removeLastHarmonic}
                >
                  Remove Last Harmonic
                </Button>
              </Grid>
              {harmonics.map((harmonic, index) => (
                <Grid
                  item
                  xs={12}
                  key={harmonic.harmonic}
                  style={{ marginTop: "10px" }}
                >
                  {harmonic.harmonic % 10 === 1 &&
                  harmonic.harmonic % 100 !== 11 ? (
                    <Typography>
                      {harmonic.harmonic}st Harmonic Frequency:{" "}
                      {fundamentalFreq * harmonic.harmonic} Hz
                    </Typography>
                  ) : harmonic.harmonic % 10 === 2 &&
                    harmonic.harmonic % 100 !== 12 ? (
                    <Typography>
                      {harmonic.harmonic}nd Harmonic Frequency:{" "}
                      {fundamentalFreq * harmonic.harmonic} Hz
                    </Typography>
                  ) : harmonic.harmonic % 10 === 3 &&
                    harmonic.harmonic % 100 !== 13 ? (
                    <Typography>
                      {harmonic.harmonic}rd Harmonic Frequency:{" "}
                      {fundamentalFreq * harmonic.harmonic} Hz
                    </Typography>
                  ) : (
                    <Typography>
                      {harmonic.harmonic}th Harmonic Frequency:{" "}
                      {fundamentalFreq * harmonic.harmonic} Hz
                    </Typography>
                  )}
                  <TextField
                    type="number"
                    label="Amplitude"
                    size="small"
                    value={harmonic.amplitude}
                    inputProps={{ step: 0.01, min: 0 }}
                    onChange={(e) =>
                      changeAmplitude(index, parseFloat(e.target.value))
                    }
                    style={{ maxWidth: "150px", marginTop: "10px" }}
                  />
                  <TextField
                    type="number"
                    label="Phase Angle (degrees)"
                    size="small"
                    value={(harmonic.phaseAngle * 180) / Math.PI}
                    inputProps={{ step: 0.1, min: 0, max: 360 }}
                    onChange={(e) =>
                      changePhaseAngle(index, parseFloat(e.target.value))
                    }
                    style={{
                      minWidth: "150px",
                      marginTop: "10px",
                      marginLeft: "20px",
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </div>
        </Box>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Box p={2}>
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
              // width: windowSize.width * 0.6,
              // height: windowSize.height * 0.6,
              title: "Combined Signal",
              xaxis: {
                title: "Time (seconds)",
              },
              yaxis: {
                title: "Amplitude",
              },
              autosize: true,
            }}
          />
        </Box>
      </Grid>
    </Grid>
  );
};

export default HarmonicExplorer;
