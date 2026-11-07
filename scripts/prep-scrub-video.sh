#!/bin/sh
# Scroll ile ileri/geri oynayan video için hazırlık.
# Kullanım: sh scripts/prep-scrub-video.sh girdi.mp4 public/videos/akdeniz.mp4
# Her 4 karede keyframe: geri sarma pürüzsüz olur. Ses yok, 960px, 4 sn'ye kırpılır.
ffmpeg -y -i "$1" -t 4 -an -vf "scale=960:-2,fps=20" -c:v libx264 -preset veryfast -crf 30 -g 4 -pix_fmt yuv420p -movflags +faststart "$2"
