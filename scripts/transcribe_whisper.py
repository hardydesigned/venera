#!/usr/bin/env python3
"""
Transkribiert OGG- und andere Audiodateien mit OpenAI Whisper (Modell large-v3).
Benötigt: pip install openai-whisper
Optional: ffmpeg im PATH für OGG/andere Formate (meist schon vorhanden).
"""

import argparse
import sys
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Transkribiert OGG-/Audio-Dateien mit OpenAI Whisper (large-v3)."
    )
    parser.add_argument(
        "input",
        type=Path,
        help="OGG-Datei oder Ordner mit OGG-Dateien",
    )
    parser.add_argument(
        "-o",
        "--output-dir",
        type=Path,
        default=None,
        help="Ausgabeordner für TXT-Dateien (Standard: neben der Eingabedatei)",
    )
    parser.add_argument(
        "-m",
        "--model",
        choices=["tiny", "base", "small", "medium", "large", "large-v2", "large-v3"],
        default="large-v3",
        help="Whisper-Modell (Standard: large-v3, beste Qualität)",
    )
    parser.add_argument(
        "--language",
        type=str,
        default=None,
        help="Sprache (z.B. de, en). Leer = Auto-Erkennung.",
    )
    parser.add_argument(
        "--srt",
        action="store_true",
        help="Zusätzlich SRT-Untertiteldateien erzeugen",
    )
    args = parser.parse_args()

    try:
        import whisper
    except ImportError:
        print("Fehler: openai-whisper nicht installiert.", file=sys.stderr)
        print("Installation: pip install openai-whisper", file=sys.stderr)
        sys.exit(1)

    input_path: Path = args.input.resolve()
    if not input_path.exists():
        print(f"Fehler: Pfad existiert nicht: {input_path}", file=sys.stderr)
        sys.exit(1)

    # Dateien sammeln
    ogg_extensions = {".ogg", ".oga", ".ogx"}
    audio_extensions = ogg_extensions | {".mp3", ".wav", ".m4a", ".flac", ".webm", ".mp4"}

    if input_path.is_file():
        files = [input_path] if input_path.suffix.lower() in audio_extensions else []
        if not files:
            print(f"Fehler: Keine unterstützte Audiodatei: {input_path}", file=sys.stderr)
            sys.exit(1)
    else:
        files = [
            p
            for p in input_path.rglob("*")
            if p.is_file() and p.suffix.lower() in audio_extensions
        ]
        if not files:
            print(f"Fehler: Keine Audiodateien in: {input_path}", file=sys.stderr)
            sys.exit(1)

    output_dir = args.output_dir.resolve() if args.output_dir else None
    model_name = args.model

    print(f"Lade Whisper-Modell '{model_name}' (kann beim ersten Mal dauern)...")
    model = whisper.load_model(model_name)

    for i, audio_path in enumerate(files, 1):
        print(f"[{i}/{len(files)}] {audio_path.name}")
        try:
            result = model.transcribe(
                str(audio_path),
                language=args.language,
                verbose=False,
            )
            text = result["text"].strip()

            out_dir = output_dir or audio_path.parent
            out_dir.mkdir(parents=True, exist_ok=True)
            base = audio_path.stem

            txt_path = out_dir / f"{base}.txt"
            txt_path.write_text(text, encoding="utf-8")
            print(f"  -> {txt_path}")

            if args.srt:
                srt_path = out_dir / f"{base}.srt"
                srt_content = segments_to_srt(result.get("segments", []))
                srt_path.write_text(srt_content, encoding="utf-8")
                print(f"  -> {srt_path}")
        except Exception as e:
            print(f"  Fehler: {e}", file=sys.stderr)

    print("Fertig.")


def segments_to_srt(segments: list) -> str:
    """Erzeugt SRT-Text aus Whisper-Segmenten."""
    lines = []
    for i, seg in enumerate(segments, 1):
        start = seg.get("start", 0)
        end = seg.get("end", 0)
        text = seg.get("text", "").strip()
        lines.append(f"{i}")
        lines.append(f"{_ts(start)} --> {_ts(end)}")
        lines.append(text)
        lines.append("")
    return "\n".join(lines)


def _ts(seconds: float) -> str:
    """Sekunden in SRT-Zeitstempel HH:MM:SS,mmm."""
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds % 1) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


if __name__ == "__main__":
    main()
