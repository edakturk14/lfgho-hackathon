import { blo } from "blo";
import { Types } from "connectkit";

// Custom Avatar for ConnectKit
export const BlockieAvatar = ({ address, ensImage, size }: Types.CustomAvatarProps) => (
  // Don't want to use nextJS Image here (and adding remote patterns for the URL)
  // eslint-disable-next-line @next/next/no-img-element
  <img
    className="rounded-md"
    src={ensImage || blo(address as `0x${string}`)}
    width={size}
    height={size}
    alt={`${address} avatar`}
  />
);
