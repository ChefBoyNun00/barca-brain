"use client";

import Image from "next/image";
import { useState } from "react";
import type { SquadPlayer } from "@/domain/home";
import { getInitials } from "./squad-stats";

type PlayerFaceProps = { player: SquadPlayer; size: number };

/** The name is always written nearby, so the face itself is decorative. */
export function PlayerFace({ player, size }: PlayerFaceProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const photo = player.photo;

  if (!photo || failedUrl === photo.url) {
    return (
      <span
        aria-hidden="true"
        className="face face-initials"
        style={{ width: size, height: size, fontSize: size * 0.38 }}
      >
        {getInitials(player.name)}
      </span>
    );
  }
  return (
    <Image
      className="face"
      src={photo.url}
      alt=""
      width={size}
      height={size}
      // The page's image reset sets height to auto, which would stretch the circle.
      style={{ width: size, height: size }}
      unoptimized
      onError={() => setFailedUrl(photo.url)}
    />
  );
}
