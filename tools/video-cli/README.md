# Unisole Video CLI

Local MacBook HLS encoder (`ffmpeg`) and Azure Blob uploader for `unisole-lms` lessons.

## Install on MacBook
```bash
brew install ffmpeg
cd unisole-engine/tools/video-cli
npm link
```

## Usage
Copy the command from the LMS Admin Video Lecture editor, replacing `<path-to-video.mp4>`:
```bash
unisole-video upload ./lecture.mp4 --lesson les_123 --token <cliToken> --api https://api.unisole.org
```

Dry run (no `ffmpeg` or network calls):
```bash
unisole-video upload ./lecture.mp4 --lesson les_123 --token dummy --dry-run
```
