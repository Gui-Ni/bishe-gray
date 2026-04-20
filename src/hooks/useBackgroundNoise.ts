import { useEffect, useRef } from 'react';
import { BackgroundNoiseOptions } from '../types';

/**
 * Custom hook for generating immersive background noise using Web Audio API
 * Generates brown noise (deeper, more immersive than white noise) with lowpass filter
 */
export function useBackgroundNoise(
  isPlaying: boolean,
  options: BackgroundNoiseOptions = {}
) {
  const {
    volume = 0.2,
    fadeDuration = 3,
    noiseType = 'brown',
  } = options;

  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const isCleanedUpRef = useRef(false);

  useEffect(() => {
    if (!isPlaying || isCleanedUpRef.current) return;

    let audioCtx: AudioContext;
    let gainNode: GainNode;
    let noiseSource: AudioBufferSourceNode;

    try {
      // @ts-expect-error - AudioContext may be webkit prefixed
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
      const bufferSize = audioCtx.sampleRate * 2;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate noise based on type
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (noiseType === 'brown') {
          // Brown noise - deeper, more immersive
          data[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5; // Volume compensation
        } else if (noiseType === 'pink') {
          // Pink noise - softer, more natural
          data[i] = (lastOut + (0.1 * white)) / 1.1;
          lastOut = data[i];
          data[i] *= 2;
        } else {
          // White noise - standard
          data[i] = white * 0.5;
        }
      }

      noiseSource = audioCtx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      // Lowpass filter to remove harsh high frequencies
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 600;

      // Volume control with fade in/out
      gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + fadeDuration);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      noiseSource.start();

      // Store references for cleanup
      audioContextRef.current = audioCtx;
      gainNodeRef.current = gainNode;
      noiseSourceRef.current = noiseSource;
    } catch (e) {
      console.error('Audio Context failed:', e);
    }

    // Cleanup function
    return () => {
      isCleanedUpRef.current = true;
      if (gainNode && audioCtx) {
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);
        setTimeout(() => {
          if (noiseSource) {
            try {
              noiseSource.stop();
            } catch {
              // Already stopped
            }
          }
          if (audioCtx && audioCtx.state !== 'closed') {
            audioCtx.close();
          }
        }, 1500);
      }
    };
  }, [isPlaying, volume, fadeDuration, noiseType]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isCleanedUpRef.current = true;
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);
}
