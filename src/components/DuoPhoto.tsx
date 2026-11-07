"use client";

import Image from "next/image";
import { useState } from "react";
import type { SquadPlayer } from "@/domain/home";
import { getInitials } from "@/features/squad/squad-stats";

type DuoPhotoProps = {
  player: SquadPlayer;
  /** Tells the browser how wide the photo is drawn, so it picks a sensible size. */
  sizes: string;
  className?: string;
  priority?: boolean;
};

/**
 * A player's photo tinted in blaugrana, so pictures taken in many different kits look like
 * one set. Without a photo, or if it fails to load, the player's initials stand in.
 * The name is always written nearby, so the picture itself is decorative.
 */
export function DuoPhoto({ player, sizes, className, priority = false }: DuoPhotoProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const photo = player.photo;
  const hasPhoto = photo !== null && failedUrl !== photo.url;

  return (
    <span aria-hidden="true" className={`duo ${className ?? ""}`} data-photo={hasPhoto}>
      {hasPhoto ? (
        <Image
          src={photo.url}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          // Wikimedia already serves a resized copy, so there is nothing to gain by resizing again.
          unoptimized
          onError={() => setFailedUrl(photo.url)}
        />
      ) : (
        <span className="duo-initials">{getInitials(player.name)}</span>
      )}
    </span>
  );
}
