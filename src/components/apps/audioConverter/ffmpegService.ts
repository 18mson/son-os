export const runAudioConversion = async (
  audioFile: File,
  targetFormat: string,
  bitrate: string,
  enableTrim: boolean,
  startTime: string,
  endTime: string,
  onProgress: (p: number) => void
) => {
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const { toBlobURL, fetchFile } = await import("@ffmpeg/util");

  const ffmpeg = new FFmpeg();
  ffmpeg.on("progress", ({ progress }) => {
    onProgress(Math.min(100, Math.round(progress * 100)));
  });

  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  const inputName = `input_${Date.now()}.${audioFile.name.split(".").pop()}`;
  const outputName = `converted_${Date.now()}.${targetFormat}`;

  await ffmpeg.writeFile(inputName, await fetchFile(audioFile));

  const args = ["-i", inputName];
  if (enableTrim) {
    args.push("-ss", startTime, "-to", endTime);
  }

  if (targetFormat === "mp3") {
    args.push("-b:a", bitrate);
  } else if (targetFormat === "aac") {
    args.push("-c:a", "aac", "-b:a", bitrate);
  } else if (targetFormat === "ogg") {
    args.push("-c:a", "libvorbis", "-b:a", bitrate);
  }

  args.push(outputName);
  await ffmpeg.exec(args);

  const data = await ffmpeg.readFile(outputName);
  const mimeTypes: Record<string, string> = {
    mp3: "audio/mp3",
    wav: "audio/wav",
    ogg: "audio/ogg",
    aac: "audio/aac",
    m4a: "audio/m4a",
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blob = new Blob([data as any], { type: mimeTypes[targetFormat] || "audio/mpeg" });
  const convertedBlobUrl = URL.createObjectURL(blob);
  const originalBaseName = audioFile.name.substring(0, audioFile.name.lastIndexOf(".")) || audioFile.name;
  const fileName = `${originalBaseName}.${targetFormat}`;

  return { url: convertedBlobUrl, fileName };
};
