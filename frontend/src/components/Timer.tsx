import { Typography } from "@mui/material";
import dayjs from "dayjs";
import { padStart } from "lodash";
import { useEffect, useState } from "react";

function Timer(props: { until: dayjs.Dayjs; frozen_at?: dayjs.Dayjs }) {
  const { until, frozen_at } = props;

  const [now, setNow] = useState(frozen_at ?? dayjs());
  const diff = until.diff(now, "seconds");

  const minutes = Math.floor(diff / 60);
  const seconds = diff - minutes * 60;

  useEffect(() => {
    const id = setInterval(() => {
      if (frozen_at == undefined) {
        setNow(dayjs());
      }
    });

    return () => {
      clearInterval(id);
    };
  }, [frozen_at]);

  const fmtMins = padStart(minutes.toString(), 2, "0");
  const fmtSecs = padStart(seconds.toString(), 2, "0");

  if (diff <= 0) {
    return <Typography color="error">SELESAI</Typography>;
  }

  return (
    <Typography fontWeight={"bold"} color={frozen_at != undefined ? "success" : undefined}>
      {fmtMins}:{fmtSecs}
    </Typography>
  );
}
export default Timer;
