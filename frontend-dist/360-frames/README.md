# 360° Image Frames

This directory should contain the frames for the 360° image viewer. The frames should be named sequentially as `frame00.jpg` through `frame35.jpg` (36 frames total).

## Required Files

- `frame00.jpg` - First frame (0°)
- `frame01.jpg` - 10°
- `frame02.jpg` - 20°
- ...
- `frame35.jpg` - 350°

## How to Generate Frames

1. Take a 360° photo of your hotel space
2. Use a tool like [Pano2VR](https://ggnome.com/pano2vr/) or [Krpano](https://krpano.com/) to convert it to individual frames
3. Save the frames in this directory with the naming convention above

## Fallback Images

If the 360° viewer fails to load, the following fallback images will be used:
- `/images/hotel-exterior.jpg`
- `/images/hotel-lobby.jpg`
- `/images/luxury-suite.jpg`

Make sure these images exist in the `public/images/` directory.
