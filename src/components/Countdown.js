import { useState, useEffect } from "react";
import { Text,  } from "react-native";
import {  StyleSheet } from "react-native";
import moment from 'dayjs'
 
const styles = StyleSheet.create({
  textStyle: {
    color: "red",
    fontSize: 18,
    marginRight: 16,
    textAlign: "right",
  },
}); 
 

const Countdown  = ({
  style,
  textStyle,
  start,
  end,
  format = "hh:mm:ss",
  onCountdownOver,
  defaultCountdown = "- : - : -",
  ...rest
}) => {
  let interval;

  const [hours, setHours] = useState();
  const [minutes, setMinutes] = useState();
  const [seconds, setSeconds] = useState();
  const [countdown, setCountdown] = useState();
  const [timer, setTimer] = useState();

  useEffect(() => {
    interval = setInterval(() => {
      const countDownStart = start.add(1, "second");
      const then = moment(countDownStart).format("DD/MM/YYYY HH:mm:ss");
      const now = moment(end).format("DD/MM/YYYY HH:mm:ss");
      const ms = moment(now, "DD/MM/YYYY HH:mm:ss").diff(
        moment(then, "DD/MM/YYYY HH:mm:ss"),
      );
      const _countdown = moment.duration(ms).format(format);

      if (ms <= 0) {
        setHours("00");
        setMinutes("00");
        setSeconds("00");
        clearInterval(interval);
      } else {
        setCountdown(_countdown);
      }
    }, 1000);
  }, []);

  useEffect(() => {
    if (timer === 1) {
      clearInterval(interval);
      onCountdownOver?.(); 
    }
  }, [timer]);

  return (
    <Text style={[styles.textStyle, textStyle]} {...rest}>
      {countdown}
    </Text>
  );
};

export default Countdown;