import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { t } from "i18next";

const SelectLanguage = (props) => {
  return (
    <div>
      <FormControl sx={{ m: 1, minWidth: 120 }}>
        <InputLabel id="lng-label">{t("language")}</InputLabel>
        <Select
          size="small"
          labelId="lng-label"
          id="lng"
          value={props.lang}
          label={t("language")}
          onChange={props.handleChange}
        >
          <MenuItem value="en"> {t("eng")} </MenuItem>
          <MenuItem value="tr"> {t("tur")} </MenuItem>
        </Select>
      </FormControl>
    </div>
  );
};

export default SelectLanguage;
