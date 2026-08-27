import { BaseExtractor, Track, Util, QueryType } from "discord-player";
import { spawn } from "child_process";

const YOUTUBE_URL_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?|shorts\/|playlist\?)|youtu\.be\/)/;

function runYtDlp(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn("yt-dlp", args);
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d) => (stdout += d));
    proc.stderr.on("data", (d) => (stderr += d));
    proc.on("close", (code) => {
      if (code !== 0) reject(new Error(stderr.trim() || `yt-dlp exited with code ${code}`));
      else resolve(stdout.trim());
    });
    proc.on("error", reject);
  });
}

export class YtDlpExtractor extends BaseExtractor {
  static identifier = "com.vibebot.ytdlp";

  async activate() {}
  async deactivate() {}

  async validate(query, type) {
    if (YOUTUBE_URL_REGEX.test(query)) return true;
    if (
      type === QueryType.YOUTUBE_SEARCH ||
      type === QueryType.AUTO ||
      type === QueryType.AUTO_SEARCH ||
      type == null
    )
      return true;
    return false;
  }

  async handle(query, context) {
    const isUrl = /^https?:\/\//.test(query);
    const ytQuery = isUrl ? query : `ytsearch:${query}`;

    let raw;
    try {
      const json = await runYtDlp([
        "--dump-json",
        "--no-playlist",
        "--no-warnings",
        ytQuery,
      ]);
      // ytsearch may return multiple lines; take the first result
      raw = JSON.parse(json.split("\n")[0]);
    } catch (err) {
      console.error(`[YtDlpExtractor] handle failed for "${ytQuery}": ${err.message}`);
      throw err;
    }

    const durationMs = (raw.duration ?? 0) * 1000;
    const duration = Util.buildTimeCode(Util.parseMS(durationMs));

    const track = new Track(this.context.player, {
      title: raw.title ?? "Unknown Title",
      author: raw.uploader ?? raw.channel ?? "Unknown",
      url: raw.webpage_url ?? (isUrl ? query : `https://youtube.com/watch?v=${raw.id}`),
      thumbnail: raw.thumbnail ?? "",
      description: raw.description ?? "",
      duration,
      views: raw.view_count ?? 0,
      source: "youtube",
      queryType: "youtubeVideo",
      requestedBy: context.requestedBy,
      raw: { duration_ms: durationMs, live: raw.is_live ?? false },
      metadata: { duration_ms: durationMs, live: raw.is_live ?? false },
      live: raw.is_live ?? false,
    });

    track.extractor = this;

    return { playlist: null, tracks: [track] };
  }

  async stream(track) {
    const url = track.url;

    if (!YOUTUBE_URL_REGEX.test(url)) {
      throw new Error(`[YtDlpExtractor] Not a YouTube URL: ${url}`);
    }

    const proc = spawn("yt-dlp", [
      "-f",
      "bestaudio[ext=webm]/bestaudio/best",
      "--no-playlist",
      "--no-warnings",
      "--no-progress",
      "-o",
      "-",
      url,
    ]);

    let stderr = "";
    proc.stderr.on("data", (d) => {
      const msg = d.toString();
      stderr += msg;
      if (msg.includes("ERROR")) {
        console.error(`[YtDlpExtractor] ${msg.trim()}`);
      }
    });

    // Wait for the first audio bytes before handing the stream over. When yt-dlp
    // fails (403, geo-block, removed video) it exits without ever writing to
    // stdout, and an empty stream looks to discord-player like a track that
    // played for zero seconds -- silent playback with no error anywhere.
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        proc.kill();
        reject(new Error("yt-dlp produced no audio within 30s"));
      }, 30_000);

      const done = (fn) => (arg) => {
        clearTimeout(timer);
        proc.stdout.off("readable", onReadable);
        proc.off("close", onClose);
        proc.off("error", onError);
        fn(arg);
      };
      const onReadable = done(resolve);
      const onClose = done((code) =>
        reject(
          new Error(
            stderr.trim() || `yt-dlp exited with code ${code} before sending audio`,
          ),
        ),
      );
      const onError = done((err) => {
        proc.kill();
        reject(err);
      });

      proc.stdout.once("readable", onReadable);
      proc.once("close", onClose);
      proc.once("error", onError);
    });

    return proc.stdout;
  }

  async getRelatedTracks() {
    return { playlist: null, tracks: [] };
  }
}
