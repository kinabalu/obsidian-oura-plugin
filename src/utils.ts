import numeral from "numeral";
import {moment} from "obsidian";

export const getToday = () => {
  return moment().format('YYYY-MM-DD')
}
export const iso8601ToTime = (theString: string): string => {
  return moment(theString).format('HH:mm:ss')
}
export const secondsToHMS = (seconds: number): string => {
  const hours = Math.floor(seconds / 60 / 60)
  const minutes = Math.floor(seconds / 60) % 60
  const secondsRemainder = (seconds % 60)
  return `${numeral(hours).format('00')}:${numeral(minutes).format('00')}:${numeral(secondsRemainder).format('00')}`
}

export function autoResizeTextArea(textarea: HTMLTextAreaElement): void {
  window.requestAnimationFrame(() => {
    textarea.setCssStyles({height: 'auto'});
    textarea.setCssStyles({height: `${textarea.scrollHeight}px`});
  });
}
