import { spawn, ChildProcess } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import { AudioConversionError } from '../../modules/speech-to-text/errors/speech-to-text.error';

export class AudioConverterUtil {
  /**
   * Converts M4A audio buffer to WAV format using FFmpeg.
   * Processes entirely in memory — no temporary files written to disk.
   * Returns WAV buffer ready for Speech-to-Text API consumption.
   */
  static async convertM4aToWav(m4aBuffer: Buffer): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      if (!ffmpegPath) {
        reject(new AudioConversionError('FFmpeg binary path not found'));
        return;
      }

      const ffmpegProcess: ChildProcess = spawn(ffmpegPath, [
        '-i',
        'pipe:0',
        '-acodec',
        'pcm_s16le',
        '-ar',
        '16000',
        '-ac',
        '1',
        '-f',
        'wav',
        'pipe:1',
      ]);

      const wavChunks: Buffer[] = [];
      const errorChunks: Buffer[] = [];

      ffmpegProcess.stdout?.on('data', (chunk: Buffer) => {
        wavChunks.push(chunk);
      });

      ffmpegProcess.stderr?.on('data', (chunk: Buffer) => {
        errorChunks.push(chunk);
      });

      ffmpegProcess.on('close', (code) => {
        if (code !== 0) {
          const errorOutput = Buffer.concat(errorChunks).toString('utf8');
          reject(
            new AudioConversionError(
              `FFmpeg exited with code ${code}: ${errorOutput}`,
            ),
          );
          return;
        }
        resolve(Buffer.concat(wavChunks));
      });

      ffmpegProcess.on('error', (err: Error) => {
        reject(
          new AudioConversionError(`FFmpeg process error: ${err.message}`),
        );
      });

      ffmpegProcess.stdin?.write(m4aBuffer);
      ffmpegProcess.stdin?.end();
    });
  }

  static async convertWavToM4a(wavBuffer: Buffer): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      if (!ffmpegPath) {
        reject(new AudioConversionError('FFmpeg binary path not found'));
        return;
      }

      const ffmpegProcess: ChildProcess = spawn(ffmpegPath, [
        '-i',
        'pipe:0',
        '-acodec',
        'aac',
        '-b:a',
        '128k',
        '-f',
        'ipod',
        'pipe:1',
      ]);

      const m4aChunks: Buffer[] = [];
      const errorChunks: Buffer[] = [];

      ffmpegProcess.stdout?.on('data', (chunk: Buffer) => {
        m4aChunks.push(chunk);
      });

      ffmpegProcess.stderr?.on('data', (chunk: Buffer) => {
        errorChunks.push(chunk);
      });

      ffmpegProcess.on('close', (code) => {
        if (code !== 0) {
          const errorOutput = Buffer.concat(errorChunks).toString('utf8');
          reject(
            new AudioConversionError(
              `FFmpeg exited with code ${code}: ${errorOutput}`,
            ),
          );
          return;
        }
        resolve(Buffer.concat(m4aChunks));
      });

      ffmpegProcess.on('error', (err: Error) => {
        reject(
          new AudioConversionError(`FFmpeg process error: ${err.message}`),
        );
      });

      ffmpegProcess.stdin?.write(wavBuffer);
      ffmpegProcess.stdin?.end();
    });
  }
}
