import * as React from "react";

type FrameProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  /** Optional alt override */
  alt?: string;
};

/** Frame 1 */
export const Frame1: React.FC<FrameProps> = ({ alt, ...rest }) => (
  <img src="/assets/frame_0_0.svg" alt={alt ?? "Frame 1"} {...rest} />
);

/** Frame 2 */
export const Frame2: React.FC<FrameProps> = ({ alt, ...rest }) => (
  <img src="/assets/frame_0_1.svg" alt={alt ?? "Frame 2"} {...rest} />
);

/** Frame 3 */
export const Frame3: React.FC<FrameProps> = ({ alt, ...rest }) => (
  <img src="/assets/frame_0_2.svg" alt={alt ?? "Frame 3"} {...rest} />
);

/** Frame 4 */
export const Frame4: React.FC<FrameProps> = ({ alt, ...rest }) => (
  <img src="/assets/frame_0_3.svg" alt={alt ?? "Frame 4"} {...rest} />
);

/** Frame 5 */
export const Frame5: React.FC<FrameProps> = ({ alt, ...rest }) => (
  <img src="/assets/frame_1_0.svg" alt={alt ?? "Frame 5"} {...rest} />
);

/** Frame 6 */
export const Frame6: React.FC<FrameProps> = ({ alt, ...rest }) => (
  <img src="/assets/frame_1_1.svg" alt={alt ?? "Frame 6"} {...rest} />
);

/** Frame 7 */
export const Frame7: React.FC<FrameProps> = ({ alt, ...rest }) => (
  <img src="/assets/frame_1_2.svg" alt={alt ?? "Frame 7"} {...rest} />
);

/** Frame 8 */
export const Frame8: React.FC<FrameProps> = ({ alt, ...rest }) => (
  <img src="/assets/frame_1_3.svg" alt={alt ?? "Frame 8"} {...rest} />
);