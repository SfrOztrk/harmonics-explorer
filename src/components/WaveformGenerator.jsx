import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import { TextField, Button, Grid, Typography, Box, Card } from "@mui/material";
import { AddBoxOutlined, ContentCopy, FileDownloadOutlined} from "@mui/icons-material";
import CopyButton from "./CopyButton";
import DomToImage from "dom-to-image";
import { saveAs } from "file-saver";

const WaveformGenerator = () => {
  const [fundamentalFreq, setFundamentalFreq] = useState(50);
  const [harmonics, setHarmonics] = useState([
    { harmonic: 1, amplitudePeak: 0, amplitudeRMS: 0, phaseAngle: 0 },
  ]);
  const [cycles, setCycles] = useState(5);

  const [isAmplPeakChange, setIsAmplPeakChange] = useState([{ isChange: false }]);
  const [isAmplRmsChange, setIsAmplRmsChange] = useState([{ isChange: false }]);

  const changeFundamentalFrequency = (e) => {
    setFundamentalFreq(e.target.value);
  };

  const changeAmplitudePeak = (index, value) => {
    const updatedHarmonics = [...harmonics];
    updatedHarmonics[index].amplitudePeak = value;
    updatedHarmonics[index].amplitudeRMS = value / Math.sqrt(2);
    setHarmonics(updatedHarmonics);
    
    const peakChange = [...isAmplPeakChange];
    peakChange[index].isChange = true;
    setIsAmplPeakChange(peakChange);

    const rmsChange = [...isAmplRmsChange];
    rmsChange[index].isChange = false;
    setIsAmplRmsChange(rmsChange);
  };

  const changeAmplitudeRMS = (index, value) => {
    const updatedHarmonics = [...harmonics];
    updatedHarmonics[index].amplitudeRMS = value;
    updatedHarmonics[index].amplitudePeak = value * Math.sqrt(2);
    setHarmonics(updatedHarmonics);

    const peakChange = [...isAmplPeakChange];
    peakChange[index].isChange = false;
    setIsAmplPeakChange(peakChange);

    const rmsChange = [...isAmplRmsChange];
    rmsChange[index].isChange = true;
    setIsAmplRmsChange(rmsChange);
  };

  const changePhaseAngle = (index, value) => {
    const updatedHarmonics = [...harmonics];
    updatedHarmonics[index].phaseAngle = value;
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
        amplitudePeak: 0,
        amplitudeRMS: 0,
        phaseAngle: 0,
      },
    ]);

    setIsAmplPeakChange([
      ...isAmplPeakChange,
      {
        isChange: false,
      }
    ]);

    setIsAmplRmsChange([
      ...isAmplRmsChange,
      {
        isChange: false,
      }
    ]);
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
        const amplitude = harmonic.amplitudePeak;
        const phase = harmonic.phaseAngle * Math.PI / 180;
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

  const calculatePeaks = (signal) => {
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
  const [peakToPeak, setPeakToPeak] = useState(0);
  const [zeroCross, setZeroCross] = useState(0);

  const calculateRMS = (signal) => {
    const length = signal.length / cycles;
    let sum = 0;

    signal.forEach((value) => {
      sum += Math.pow(value, 2);
    });

    const rms = Math.sqrt(sum / length);

    return rms;
  };

  const calculatePeakToPeak = (signal) => {
    const peaks = calculatePeaks(signal);

    const min = peaks.minSignalValue;
    const max = peaks.maxSignalValue;

    const pp = max - min;

    return pp;
  };

  const findZeroCrossings = (signal, time) => {
    const zeroCrossings = [];

    if (signal[0] == 0) {
      zeroCrossings.push(time[0].toFixed(4))
    }
    for (let i = 1; i < signal.length / cycles; i++) {
      if ((signal[i - 1] < 0 && signal[i] > 0) || (signal[i - 1] > 0 && signal[i] < 0)) {
        zeroCrossings.push(time[i].toFixed(4));
      }
    }
    if (signal[0] == 0 && zeroCrossings[zeroCrossings.length - 1] != (time[signal.length - 1] / cycles).toFixed(4)) {
      zeroCrossings.push((time[signal.length - 1] / cycles).toFixed(4));
    }

    let zcText = "";

    for (let j = 0; j < zeroCrossings.length; j++) {
      if (j == zeroCrossings.length - 1) {
        zcText += `${zeroCrossings[j]}`
      } else {
        zcText += `${zeroCrossings[j]}, `
      }
    }
    
    return zcText;
  };

  const [combinedSignalData, setCombinedSignalData] = useState({
    time: [],
    signal: [],
  });

  const [layout, setLayout] = useState({
    title: "Waveform",
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

      const ppValue = calculatePeakToPeak(combined.signal);
      setPeakToPeak(ppValue);

      const peaks = calculatePeaks(combined.signal);

      const zcLengthValue = findZeroCrossings(combined.signal, combined.time);
      setZeroCross(zcLengthValue);

      setLayout({
        ...layout,
        yaxis: {
          title: "Amplitude",
          range: [peaks.minSignalValue - 0.5, peaks.maxSignalValue + 0.5],
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
    const freqFromUrl = parseFloat(getQueryParam("f")) || 50;
    setFundamentalFreq(freqFromUrl);

    const cycleFromUrl = parseInt(getQueryParam("nc")) || 5;
    setCycles(cycleFromUrl);

    const updatedHarmonics = [];
    const peakChange = [];
    const rmsChange = [];
    const harmonicLimit = 200;

    for (let i = 1; i <= harmonicLimit; i++) {
      const amplitudePeak = parseFloat(getQueryParam(`a${i}`)) || parseFloat(getQueryParam(`ar${i}`)) * Math.sqrt(2) || 0;
      const amplitudeRMS = parseFloat(getQueryParam(`ar${i}`)) || parseFloat(getQueryParam(`a${i}`)) / Math.sqrt(2) || 0;
      const phaseAngle = parseFloat(getQueryParam(`p${i}`)) || 0;

      updatedHarmonics.push({
          harmonic: i,
          amplitudePeak: amplitudePeak,
          amplitudeRMS,
          phaseAngle,
      });

      const ampPeak = parseFloat(getQueryParam(`a${i}`)) || 0;
      const ampRms = parseFloat(getQueryParam(`ar${i}`)) || 0;

      peakChange.push({
        isChange: (ampPeak != 0) ? true : false,
      });

      rmsChange.push({
        isChange: (ampRms != 0) ? true: false,
      })

    }

    for (let a = harmonicLimit; a > 0; a--) {
      const ap =
        parseFloat(getQueryParam(`a${a}`)) ||
        parseFloat(getQueryParam(`ar${a}`)) * Math.sqrt(2) ||
        0;
      const ar =
        parseFloat(getQueryParam(`ar${a}`)) ||
        parseFloat(getQueryParam(`a${a}`)) / Math.sqrt(2) ||
        0;

      if (ap != ar * Math.sqrt(2)) {
        const harmonicIndex = updatedHarmonics.findIndex(
          (item) => item.harmonic === a
        );
        updatedHarmonics[harmonicIndex].amplitudeRMS = updatedHarmonics[harmonicIndex].amplitudePeak * Math.sqrt(2);
        peakChange[harmonicIndex].isChange = true;
        rmsChange[harmonicIndex].isChange = false;
      }
    }

    for (let a = harmonicLimit; a > 0; a--) {
      const ap =
        parseFloat(getQueryParam(`a${a}`)) ||
        parseFloat(getQueryParam(`ar${a}`)) * Math.sqrt(2) ||
        0;
      const ar =
        parseFloat(getQueryParam(`ar${a}`)) ||
        parseFloat(getQueryParam(`a${a}`)) / Math.sqrt(2) ||
        0;
      const pa = (parseFloat(getQueryParam(`p${a}`)) * Math.PI) / 180 || 0;

      if (ap === 0 && ar === 0 && pa === 0) {
        updatedHarmonics.splice(a - 1, 1);
        peakChange.splice(a-1, 1);
        rmsChange.splice(a-1, 1);
      } else {
        break;
      }
    }
    setHarmonics(updatedHarmonics);
    setIsAmplPeakChange(peakChange);
    setIsAmplRmsChange(rmsChange);
  }, []);

  useEffect(() => {
    const newUrlSearchParams = new URLSearchParams();

    newUrlSearchParams.set("f", fundamentalFreq.toString());
    newUrlSearchParams.set("nc", cycles.toString());

    harmonics.forEach((harmonic, index) => {
      const a = harmonic.amplitudePeak;
      const ar = harmonic.amplitudeRMS;
      const p = harmonic.phaseAngle;

      const isPeakChange = isAmplPeakChange[index].isChange;
      const isRmsChange = isAmplRmsChange[index].isChange;

      if (a != 0 && isPeakChange) {
        newUrlSearchParams.set(`a${index + 1}`, a.toString());
      }
      if (ar != 0 && isRmsChange) {
        newUrlSearchParams.set(`ar${index + 1}`, ar.toString());
      }
      if (p != 0) {
        newUrlSearchParams.set(`p${index + 1}`, p.toString());
      }     
    });
    
    window.history.replaceState({}, "", `?${newUrlSearchParams.toString()}`);
  }, [fundamentalFreq, harmonics, cycles, isAmplPeakChange, isAmplRmsChange]);

  const countDecimalPart = (number) => {
    let decimalPart = (number.toString().split('.')[1] || '').length;
    return decimalPart;
  }

  const calculateStep = (number) => {
    let decimalPart = countDecimalPart(number);
    if (decimalPart > 3) {
      decimalPart = 3
    }
    const step = 1 / Math.pow(10, decimalPart);
    return step;
  };

  const ordinalNumberSuffix = (number) => {
    if (number % 10 === 1 && number % 100 !== 11)
      return 'st';
    if (number % 10 === 2 && number % 100 !== 12)
      return 'nd';
    if (number % 10 === 3 && number % 100 !== 13)
      return 'rd';
    else
      return 'th';
  
  }

  const countUrlAmpl = () => {
    let count = 0;

    for (let i = 1; i <= 200; i++) {
      const a = parseFloat(getQueryParam(`a${i}`)) || 0;
      const ar = parseFloat(getQueryParam(`ar${i}`)) || 0;

      if (a != 0 || ar != 0) {
        count++;
      }
    }

    return count;
  }

  const engineeringNotation = (number, precision) => {
    const exp = Math.floor(Math.log10(Math.abs(number)));
    const base = number / Math.pow(10, exp);

    if (exp > 0)
      return base.toFixed(precision) + "e+" + exp;
    return base.toFixed(precision) + "e" + exp;
  }


  const downloadPlotAsPNG = () => {
    const chartNode = document.querySelector('.js-plotly-plot');
    DomToImage.toPng(chartNode).then((dataUrl) => {
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {

        let lineHeight = 20;
        const attrHeight = (countUrlAmpl() + 3) * lineHeight;
        
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height + attrHeight;

        const context = canvas.getContext('2d');

        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.drawImage(img, 0, 0);

        // Wavefrom Attributes
        let text = "";

        text += `Fundamental Frequency: ${parseFloat(getQueryParam("f"))} Hz  `;
        text += `Number of Cycles: ${parseFloat(getQueryParam("nc"))}  `;

        const angleSymbol = '\u2220';
        const degreeSymbol = '\u00B0';

        for (let i = 1; i <= 200; i++) {
          const a = parseFloat(getQueryParam(`a${i}`)) || 0;
          const ar = parseFloat(getQueryParam(`ar${i}`)) || 0;
          const p = parseFloat(getQueryParam(`p${i}`)) || 0;

          if (a != 0 || ar != 0) {
            text += `Harmonic ${i}: `
          }
          if (a != 0) {
            text += `${engineeringNotation(a / Math.sqrt(2), 2)} ${angleSymbol} ${p}${degreeSymbol}  `;
          }
          if (ar != 0) {
            text += `${engineeringNotation(ar, 2)} ${angleSymbol} ${p}${degreeSymbol}  `;
          }
        }

        const lines = text.split('  ');
        context.font = '16px Arial';
        let y = img.height + lineHeight;

        lines.forEach((line) => {
          context.fillStyle = 'black';
          context.fillText(line, 10, y);
          y += lineHeight;
        });


        const blob = canvas.toDataURL('image/png');
        saveAs(blob, 'waveform.png')
      }

    }).catch((error) => {
      console.log('Error: ', error);
    });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6} lg={4}>
          <Box p={2}>
            <Typography variant="h1" fontSize="32px">
              Waveform Generator
            </Typography>
            <Grid style={{display: 'flex', flexDirection: 'column'}}>
              <TextField
                type="number"
                label="Fundamental Frequency (Hz)"
                size='small'
                step='1'
                value={fundamentalFreq}
                onChange={changeFundamentalFrequency}
                style={{
                  maxWidth: "200px",
                  marginTop: "20px",
                  marginRight: '10px',
                }}
              />
              <TextField
                type="number"
                label="Number of Cycles"
                size="small"
                value={cycles}
                onChange={changeCycles}
                style={{
                  maxWidth: "200px",
                  marginTop: "20px",
                }}
              />
            </Grid>
            <Typography variant="h6" style={{ marginTop: "20px" }}>
              Root Mean Square: {rms.toFixed(3)}
            </Typography>
            <Typography variant="h6" style={{ marginTop: "10px" }}>
              Peak-to-Peak: {peakToPeak.toFixed(2)}
            </Typography>
            <Typography variant="h6" style={{ marginTop: "10px" }}>
              Zero Crossing Points (seconds): {zeroCross} 
            </Typography>
            <div>
              <Typography variant="h5" style={{ marginTop: "20px" }}>
                Harmonics:
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={12} style={{ marginTop: "20px" }}>
                  <Button variant="outlined" style={{borderColor: 'black', color: 'black'}} startIcon={<AddBoxOutlined />} onClick={addHarmonic}>
                    Add Harmonic
                  </Button>
                </Grid>
                {harmonics.map((harmonic, index) => (
                  <Grid
                    item
                    xs={12}
                    key={harmonic.harmonic}
                    style={{ marginTop: "10px" }}
                  >
                    <Typography>
                      {harmonic.harmonic}{ordinalNumberSuffix(harmonic.harmonic)} Harmonic Frequency:{" "}
                      {fundamentalFreq * harmonic.harmonic} Hz
                    </Typography>
                     
                    <TextField
                      type="number"
                      label="Amplitude (Peak)"
                      size="small"
                      value={harmonic.amplitudePeak}
                      inputProps={{ step: calculateStep(harmonic.amplitudePeak), min: 0 }}
                      onChange={(e) =>
                        changeAmplitudePeak(index, parseFloat(e.target.value))
                      }
                      style={{ maxWidth: "120px", marginTop: "10px", marginRight: '10px' }}
                    />
                    <TextField
                      type="number"
                      label="Amplitude (RMS)"
                      size="small"
                      value={harmonic.amplitudeRMS}
                      inputProps={{ step: calculateStep(harmonic.amplitudeRMS), min: 0 }}
                      onChange={(e) =>
                        changeAmplitudeRMS(index, parseFloat(e.target.value))
                      }
                      style={{
                        maxWidth: '120px',
                        marginTop: "10px",
                        marginRight: '10px',
                      }}
                    />
                    <TextField
                      type="number"
                      label="Phase Angle (Degree)"
                      size="small"
                      value={harmonic.phaseAngle}
                      inputProps={{ step: calculateStep(harmonic.phaseAngle), min: 0, max: 360 }}
                      onChange={(e) =>
                        changePhaseAngle(index, parseFloat(e.target.value))
                      }
                      style={{
                        minWidth: '150px',
                        marginTop: "10px",
                        marginRight: '10px',
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </div>
          </Box>
      </Grid>

      <Grid item xs={12} md={6} lg={8}>
        
            <Grid style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginRight: '10px', }} >
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
                  config={{displayModeBar: false, staticPlot: true}}
                />
                <Grid display='flex' flexDirection='row' justifyContent='space-between'>
                  <CopyButton text={window.location.href} startIcon={<ContentCopy/>} style={{marginLeft: '10px'}}/>
                  <Button variant="outlined" startIcon={<FileDownloadOutlined/>}
                  style={{color: 'black', borderColor: 'black', maxWidth: '150px', marginBottom: '10px', alignSelf: 'end'}} onClick={downloadPlotAsPNG}>
                  Export
                  </Button>
                </Grid>  
                  <Typography justifyContent='center' style={{wordWrap: 'break-word', marginLeft: '10px'}}>
                  URL: {window.location.href}
                  </Typography>
            </Grid>
        </Grid>
      </Grid>
  );
};

export default WaveformGenerator;
