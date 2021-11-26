function realPWM(arr: number[], time: number, intensity: number) {
  const vibrate = Math.round(time * intensity / 100);
  arr.push(vibrate, time - vibrate);
}

function applyPWM(
  arr: number[], restTime: number, restIntensity: number, time: number,
  intensity: number, stepTime: number, stepPulseFn: Function
) {
  if (restTime <= stepTime && 1 < restTime) {
    restIntensity = (restIntensity * restTime + intensity * (stepTime - restTime)) / stepTime;
    time -= (stepTime - restTime);
    stepPulseFn(arr, stepTime, restIntensity);
  }

  const stepPulse: number[] = [];
  if (time > stepTime) {
    stepPulseFn(stepPulse, stepTime, intensity);
  }
  while (time > stepTime) {
    arr.push(...stepPulse);
    time -= stepTime;
  }
  return time;
}

export default function vibrationToPattern(signal: any[], stepTime = 40) {
  const arr: number[] = [];
  let restTime = 0;
  let prevIntensity = 0;
  for (let i = 0; i < signal.length; i++) {
    const item = signal[i];
    restTime = applyPWM(arr, restTime, prevIntensity, item.duration, item.intensity, stepTime, realPWM);
    prevIntensity = item.intensity;
  }
  return arr;
}
