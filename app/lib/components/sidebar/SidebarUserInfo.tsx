"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type SidebarUserProfile =
  | undefined
  | null
  | {
      id: string;
      name: string | null;
      email: string | null;
      bio: string | null;
      image: string | null;
    };

type SidebarUserInfoProps = {
  profile: SidebarUserProfile;
  compact?: boolean;
};

function getDisplayName(
  profile: Exclude<SidebarUserProfile, undefined | null>,
) {
  const trimmedName = profile.name?.trim();
  if (trimmedName) {
    return trimmedName;
  }

  const emailLocalPart = profile.email?.split("@")[0]?.trim();
  if (emailLocalPart) {
    return emailLocalPart;
  }

  return "Account";
}

function getInitials(name: string) {
  const parts = name
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return "A";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function Avatar({
  profile,
  compact = false,
}: {
  profile: SidebarUserProfile;
  compact?: boolean;
}) {
  const sizeClass = compact ? "w-6 h-6" : "w-8 h-8";
  const imageSrc = useMemo(
    () => profile?.image?.trim() || null,
    [profile?.image],
  );

  if (profile === undefined) {
    return (
      <div className={`aspect-square ${sizeClass} bg-(--dim) rounded-full`} />
    );
  }

  const displayName = profile ? getDisplayName(profile) : "Account";

  if (imageSrc) {
    return (
      <AvatarImage
        key={imageSrc}
        src={imageSrc}
        alt={`${displayName} avatar`}
        sizeClass={sizeClass}
      />
    );
  }

  return (
    <div
      className={`aspect-square ${sizeClass} bg-(--dim) rounded-full flex items-center justify-center text-xs font-medium text-(--gray-page)`}
    >
      {getInitials(displayName)}
    </div>
  );
}

function AvatarImage({
  src,
  alt,
  sizeClass,
}: {
  src: string;
  alt: string;
  sizeClass: string;
}) {
  const [hasImageError, setHasImageError] = useState(false);

  if (hasImageError) {
    return (
      <div className={`aspect-square ${sizeClass} bg-(--dim) rounded-full`} />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={`aspect-square ${sizeClass} rounded-full object-cover bg-(--dim)`}
      referrerPolicy="no-referrer"
      onError={() => setHasImageError(true)}
    />
  );
}

export const SidebarUserInfo = ({
  profile,
  compact = false,
}: SidebarUserInfoProps) => {
  const displayName =
    profile === undefined
      ? "Loading..."
      : profile
        ? getDisplayName(profile)
        : "Account";
  const sharedClassName =
    "rounded-lg hover:bg-(--darkest-hover) transition-colors";

  if (compact) {
    return (
      <Link
        className={`${sharedClassName} p-1 w-full flex items-center justify-center`}
        href="/settings?section=account"
        aria-label={displayName}
        title={displayName}
      >
        <Avatar profile={profile} compact={true} />
      </Link>
    );
  }

  return (
    <Link
      className={`${sharedClassName} w-max gap-2 flex items-center justify-start py-1 pl-2 pr-3`}
      href="/settings?section=account"
    >
      <Avatar profile={profile} />
      <span className="font-light text-base">
        {displayName.length > 20
          ? displayName.slice(0, 20) + "..."
          : displayName}
      </span>
    </Link>
  );
};
