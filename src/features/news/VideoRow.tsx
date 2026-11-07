"use client";

import Image from "next/image";
import { useState } from "react";
import type { NewsMedia } from "@/domain/news";
import { T, useT } from "@/i18n/language";
import { formatStoryAge } from "./stories";

/**
 * The club's videos. Only a thumbnail loads until you press play, so the page stays fast
 * and YouTube sets nothing until then. The privacy-enhanced embed is used.
 */
export function VideoRow({ videos, now }: { videos: NewsMedia[]; now: Date }) {
  const t = useT();
  const [playing, setPlaying] = useState<string | null>(null);
  const playable = videos.filter((video) => video.videoId);
  if (playable.length === 0) return null;

  return (
    <section className="videos" aria-labelledby="videos-title">
      <div className="section-head">
        <h2 id="videos-title" className="nw-section-title">
          <T k="news.videos" />
        </h2>
        <p className="section-note">
          <T k="news.videosNote" />
        </p>
      </div>
      <ul className="video-row">
        {playable.map((video) => (
          <li key={video.id} className="video">
            <div className="video-frame">
              {playing === video.videoId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1`}
                  title={video.title}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : (
                <button
                  type="button"
                  className="video-poster"
                  onClick={() => setPlaying(video.videoId)}
                  aria-label={`${t("news.play")}: ${video.title}`}
                >
                  <Image
                    src={`https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 22rem, 80vw"
                    unoptimized
                  />
                  <span className="video-play" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </button>
              )}
            </div>
            <p className="video-title">{video.title}</p>
            <p className="video-age">{formatStoryAge(video.publishedAt, now)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
