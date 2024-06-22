import numeral from "numeral";
import {moment} from "obsidian";

export const getToday = () => {
  return moment().format('YYYY-MM-DD')
}
export const iso8601ToTime = (theString: string): string => {
  return moment(theString).format('HH:mm:ss')
}
const minutesToHMS = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const minutesRemainder = minutes % 60

  return `${numeral(hours).format('00')}:${numeral(minutesRemainder).format('00')}:00`
}
export const secondsToHMS = (seconds: number): string => {
  const hours = Math.floor(seconds / 60 / 60)
  const minutes = Math.floor(seconds / 60) % 60
  const secondsRemainder = (seconds % 60)
  return `${numeral(hours).format('00')}:${numeral(minutes).format('00')}:${numeral(secondsRemainder).format('00')}`
}