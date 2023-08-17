import React, { useState } from "react";
import copy from "clipboard-copy";
import { Button } from "@mui/material";

const CopyButton = ({text, style, startIcon}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        copy(text);
        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    return (
        <div>
            <Button color="inherit" variant="outlined" onClick={handleCopy} startIcon={startIcon} style={style}>
                {copied ? 'Copied' : 'Copy URL'}
            </Button>
        </div>
    );
};

export default CopyButton;