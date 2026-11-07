#!/bin/sh
# Scroll ile ileri/geri oynayan video için hazırlık.
# Kullanım: sh scripts/prep-scrub-video.sh girdi.mp4 public/videos/akdeniz.mp4
# Her karede keyframe: geri sarma pürüzsüz olur. Ses yok, 1280px, 4 sn'ye kırpılır.
ffmpeg -y -i "$1" -t 4 -an -vf "scale=1280:-2,fps=24" -c:v libx264 -preset veryfast -crf 31 -g 1 -pix_fmt yuv420p -movflags +faststart "$2"
