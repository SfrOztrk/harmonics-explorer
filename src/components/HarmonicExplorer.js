import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import { TextField, Button, Grid, Typography, Box } from "@mui/material";

const HarmonicExplorer = () => {
  const [fundamentalFreq, setFundamentalFreq] = useState(50);
  const [harmonics, setHarmonics] = useState([
    { harmonic: 1, amplitudePeek: 0, amplitudeRMS: 0, phaseAngle: 0 },
  ]);
  const [cycles, setCycles] = useState(5);

  const changeFundamentalFrequency = (e) => {
    setFundamentalFreq(e.target.value);
  };

  const changeAmplitudePeek = (index, value) => {
    const updatedHarmonics = [...harmonics];
    updatedHarmonics[index].amplitudePeek = value;
    updatedHarmonics[index].amplitudeRMS = value / Math.sqrt(2);
    setHarmonics(updatedHarmonics);
  };

  const changeAmplitudeRMS = (index, value) => {
    const updatedHarmonics = [...harmonics];
    updatedHarmonics[index].amplitudeRMS = value;
    updatedHarmonics[index].amplitudePeek = value * Math.sqrt(2);
    setHarmonics(updatedHarmonics);
  };

  const changePhaseAngle = (index, value) => {
    const updatedHarmonics = [...harmonics];
    updatedHarmonics[index].phaseAngle = (value * Math.PI) / 180;
    setHarmonics(updatedHarmonics);
  };

  const changeCycles = (e) => {
    setCycles(e.target.value);
  };

  const addHarmonic = () => {
    const nextHarmonic = harmonics.length + 1;
    setHarmonics([
      ...harmonics,
      {
        harmonic: nextHarmonic,
        amplitudePeek: 0,
        amplitudeRMS: 0,
        phaseAngle: 0,
      },
    ]);
  };

  const removeLastHarmonic = () => {
    const updatedHarmonics = [...harmonics];
    const lastHarmonic = updatedHarmonics.length - 1;
    updatedHarmonics.splice(lastHarmonic, 1);
    setHarmonics(updatedHarmonics);
  };

  const combinedSignal = () => {
    const time = [];
    const signal = [];

    const sampleRate = 50000;
    const duration = cycles / fundamentalFreq;

    const numSamples = sampleRate * duration;

    for (let i = 0; i <= numSamples; i++) {
      const t = i / sampleRate;
      let y = 0;

      harmonics.forEach((harmonic) => {
        const frequency = fundamentalFreq * harmonic.harmonic;
        const amplitude = harmonic.amplitudePeek;
        const phase = harmonic.phaseAngle;
        y += amplitude * Math.sin(2 * Math.PI * frequency * t + phase);
      });

      time.push(t);
      signal.push(y);
    }

    return { time, signal };
  };

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

  const calculatePeeks = (signal) => {
    let maxSignalValue = -Infinity;
    let minSignalValue = Infinity;

    signal.forEach((value) => {
      if (value > maxSignalValue) {
        maxSignalValue = value;
      }
      if (value < minSignalValue) {
        minSignalValue = value;
      }
    });

    return { minSignalValue, maxSignalValue };
  };

  const [rms, setRms] = useState(0);
  const [peekToPeek, setPeekToPeek] = useState(0);

  const calculateRMS = (signal) => {
    const length = signal.length;
    let sum = 0;

    signal.forEach((value) => {
      sum += Math.pow(value, 2);
    });

    const rms = Math.sqrt(sum / length);

    return rms;
  };

  const calculatePeekToPeek = (signal) => {
    const peeks = calculatePeeks(signal);

    const min = peeks.minSignalValue;
    const max = peeks.maxSignalValue;

    const pp = max - min;

    return pp;
  };

  const [combinedSignalData, setCombinedSignalData] = useState({
    time: [],
    signal: [],
  });

  const [layout, setLayout] = useState({
    width: windowSize.width * 0.6,
    height: windowSize.height * 0.8,
    title: "Combined Signal",
    xaxis: {
      title: "Time (seconds)",
    },
    yaxis: {
      title: "Amplitude",
      range: [0, 0],
    },
    autosize: true,
  });

  useEffect(() => {
    if (fundamentalFreq != 0 && cycles > 0) {
      const combined = combinedSignal();
      setCombinedSignalData(combined);

      const rmsValue = calculateRMS(combined.signal);
      setRms(rmsValue);

      const ppValue = calculatePeekToPeek(combined.signal);
      setPeekToPeek(ppValue);

      const peeks = calculatePeeks(combined.signal);

      setLayout({
        ...layout,
        yaxis: {
          title: "Amplitude",
          range: [peeks.minSignalValue - 0.5, peeks.maxSignalValue + 0.5],
        },
      });
    } else {
      if (fundamentalFreq == 0) {
        alert("Fundamental Frequency should be a positive number.");
        setFundamentalFreq(50);
      }
      if (cycles <= 0) {
        alert("Number of Cycles should be a positive number.");
        setCycles(5);
      }
    }
  }, [fundamentalFreq, harmonics, cycles]);

  const getQueryParam = (queryParam) => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    return urlSearchParams.get(queryParam);
  };

  useEffect(() => {
    const freqFromUrl = parseFloat(getQueryParam("freq")) || 50;
    setFundamentalFreq(freqFromUrl);

    const cycleFromUrl = parseInt(getQueryParam("nc")) || 5;
    setCycles(cycleFromUrl);

    const updatedHarmonics = [];
    for (let i = 1; i <= 200; i++) {
      const amplitudePeek =
        parseFloat(getQueryParam(`a${i}`)) ||
        parseFloat(getQueryParam(`ar${i}`)) * Math.sqrt(2) ||
        0;
      const amplitudeRMS =
        parseFloat(getQueryParam(`ar${i}`)) ||
        parseFloat(getQueryParam(`a${i}`)) / Math.sqrt(2) ||
        0;
      const phaseAngle =
        (parseFloat(getQueryParam(`p${i}`)) * Math.PI) / 180 || 0;
      updatedHarmonics.push({
        harmonic: i,
        amplitude: amplitudePeek,
        amplitudeRMS: amplitudeRMS,
        phaseAngle,
      });
    }

    for (let a = 200; a > 0; a--) {
      const amp = parseFloat(getQueryParam(`a${a}`)) || 0;
      const pa = parseFloat(getQueryParam(`p${a}`)) || 0;

      if (amp == 0 && pa == 0) {
        updatedHarmonics.splice(a - 1, 1);
      } else {
        break;
      }
    }
    setHarmonics(updatedHarmonics);
  }, []);

  useEffect(() => {
    const newUrlSearchParams = new URLSearchParams();

    newUrlSearchParams.set("freq", fundamentalFreq.toString());
    newUrlSearchParams.set("nc", cycles.toString());

    harmonics.forEach((harmonic, index) => {
      newUrlSearchParams.set(
        `a${index + 1}`,
        harmonic.amplitudePeek.toString()
      );
      newUrlSearchParams.set(
        `ar${index + 1}`,
        harmonic.amplitudeRMS.toString()
      );
      newUrlSearchParams.set(
        `p${index + 1}`,
        ((harmonic.phaseAngle * 180) / Math.PI).toString()
      );
    });

    window.history.replaceState({}, "", `?${newUrlSearchParams.toString()}`);
  }, [fundamentalFreq, harmonics, cycles]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={4}>
        <Box p={2}>
          <Typography variant="h1" fontSize="40px">
            Waveform Generator
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
          <Typography variant="h6" style={{ marginTop: "20px" }}>
            Root Mean Square: {rms.toFixed(3)}
          </Typography>
          <Typography variant="h6" style={{ marginTop: "10px" }}>
            Peek to Peek: {peekToPeek.toFixed(2)}
          </Typography>
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
                    label="Amplitude (Peek)"
                    size="small"
                    value={harmonic.amplitudePeek}
                    inputProps={{ step: 0.01, min: 0 }}
                    onChange={(e) =>
                      changeAmplitudePeek(index, parseFloat(e.target.value))
                    }
                    style={{ maxWidth: "120px", marginTop: "10px" }}
                  />
                  <TextField
                    type="number"
                    label="Amplitude (RMS)"
                    size="small"
                    value={harmonic.amplitudeRMS}
                    inputProps={{ step: 0.01, min: 0 }}
                    onChange={(e) =>
                      changeAmplitudeRMS(index, parseFloat(e.target.value))
                    }
                    style={{
                      maxWidth: "120px",
                      marginTop: "10px",
                      marginLeft: "10px",
                    }}
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
                      marginLeft: "10px",
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
            layout={layout}
          />
        </Box>
      </Grid>
    </Grid>
  );
};

export default HarmonicExplorer;
