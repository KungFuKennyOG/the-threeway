# Game-ready seamless loops of the rendered themes -> assets/music/loop/*.ogg (Ogg Opus, 48 kHz).
#
#   python3 loops.py                 # the four sector themes (each in its own process: the engine's RNG is seeded at import)
#   python3 loops.py krasnovia       # just one (columbia_swing, the swing draft, only when asked for)
#   python3 loops.py --check         # verify the files already written (no rendering)
#
# Each song is rebuilt by its own script and rendered with the engine's own loop path, Song.render(loop_bars=S.bars):
# the whole song, trimmed to an exact bar count with the tail (the last hit's ring-out) folded onto the head. Nothing
# about the notes, arrangement or mix changes. Then, for the game:
#   * resampled to 48 kHz with an FFT resample, which treats the loop as periodic, so the wrap stays continuous;
#   * padded with PAD seconds of the loop's own wrap on both sides: [end of loop | loop | start of loop]. The game plays
#     it with AudioBufferSourceNode loopStart = PAD, loopEnd = PAD + loop length, so neither loop point sits on a codec
#     edge (Opus pre-skip, end trimming, or an MP3-style encoder delay if a browser ignored them: a constant shift of
#     both points by less than PAD still loops seamlessly, since the content around them is the same);
#   * encoded as Ogg Opus. The loop points are printed (and written to loops.json); src/music.js has them in MUSIC.songs.
import sys, os, json, subprocess, tempfile
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'assets', 'music', 'loop')
ORIG = os.path.join(HERE, '..', '..', 'assets', 'music')
SONGS = {   # module -> (loop file, the full render it comes from)
    'threeway': ('1-the-threeway.ogg', '1-the-threeway.mp3'),
    'krasnovia': ('2-krasnovia.ogg', '2-krasnovia.mp3'),
    'columbia': ('3-columbia.ogg', '3-columbia.mp3'),
    'columbia_swing': ('3b-columbia-swing.ogg', '3b-columbia-swing.mp3'),
    'hinomoto': ('4-hinomoto.ogg', '4-hinomoto.mp3'),
}
GAME_SR = 48000
PAD = 0.25          # seconds of wrap on each side of the loop
BITRATE = '96k'

def decode(path, sr=GAME_SR):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(sr), '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).T

def render_one(name):
    sys.path.insert(0, HERE)
    from scipy.io import wavfile
    from scipy.signal import resample
    import importlib
    mod = importlib.import_module(name)
    from engine import SR
    S = mod.build()
    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, name + '.wav')
        S.render(wav, loop_bars=S.bars)          # the engine's own seamless-loop path
        sr, pcm = wavfile.read(wav)
    x = pcm.T.astype(np.float64) / 32768.0
    n44 = x.shape[1]
    n48 = int(round(n44 * GAME_SR / sr))
    y = resample(x, n48, axis=1)                  # FFT: periodic, so sample n48-1 runs on into sample 0
    pk = np.abs(y).max()
    if pk > 0.98: y *= 0.98 / pk                  # (resampling can overshoot the engine's 0.9 peak a hair)
    p = int(PAD * GAME_SR)
    padded = np.concatenate([y[:, -p:], y, y[:, :p]], axis=1).astype(np.float32)
    out = os.path.join(OUT, SONGS[name][0])
    os.makedirs(OUT, exist_ok=True)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'f32le', '-ar', str(GAME_SR), '-ac', '2', '-i', '-',
                    '-c:a', 'libopus', '-b:a', BITRATE, '-vbr', 'on', '-application', 'audio', out],
                   input=padded.T.tobytes(), check=True)
    meta = dict(file=SONGS[name][0], bpm=S.bpm, bars=S.bars, sampleRate=GAME_SR, loopSamples=n48,
                loopStart=PAD, loopEnd=round(PAD + n48 / GAME_SR, 6))
    print(json.dumps({name: meta}))

def check_one(name, meta):
    """The seam (last second, then the first second) of the decoded file: no click, no gap. And the notes are the
    original render's (the loop's body correlates with the original MP3)."""
    path = os.path.join(OUT, meta['file'])
    d = decode(path)
    p, n = int(round(meta['loopStart'] * GAME_SR)), meta['loopSamples']
    s, e = p, p + n
    one = GAME_SR
    length_ok = d.shape[1] == n + 2 * p
    # what the game plays at the loop point: the last second, then the first second
    seam = np.concatenate([d[:, e - one:e], d[:, s:s + one]], axis=1)
    # the reference: the file runs on past loopEnd into a copy of the loop's start, encoded in one piece, so
    # d[e - one : e + one] is what the seam should sound like (the music's own attacks included)
    ref = d[:, e - one:e + one]
    st = lambda a: np.abs(np.diff(a.mean(axis=0)))
    jump, ref_jump = st(seam)[one - 1], st(ref)[one - 1]   # the sample step across the loop point
    p999 = np.percentile(st(seam), 99.9)                   # vs the steps the music makes anyway
    # click: high-frequency energy (2nd difference) in the 2 ms around the seam, played vs reference
    hf = lambda a: np.sqrt((np.diff(a.mean(axis=0), 2) ** 2)[one - 49:one + 47].mean())
    click_db = 20 * np.log10(hf(seam) / max(1e-9, hf(ref)))
    # gap: 10 ms RMS windows over the 100 ms either side, played vs reference (the largest drop, in dB)
    w = GAME_SR // 100
    rms = lambda a: float(np.sqrt((a ** 2).mean()))
    dev = [20 * np.log10(max(1e-6, rms(seam[:, i:i + w])) / max(1e-6, rms(ref[:, i:i + w]))) for i in range(one - 10 * w, one + 10 * w, w)]
    drop = -min(dev)
    gap = drop > 1.5
    # notes unchanged: the loop's body vs the original render
    o = decode(os.path.join(ORIG, SONGS[name][1]))
    a0, L = s + 20 * GAME_SR, 10 * GAME_SR
    from scipy.signal import correlate
    A = d[:, a0:a0 + L].mean(axis=0).astype(np.float64)
    M = 3000
    B = o[:, a0 - p - M:a0 - p + L + M].mean(axis=0).astype(np.float64)
    xc = correlate(B, A, mode='valid', method='fft')                  # lag -M..M
    cs = np.concatenate([[0.0], np.cumsum(B ** 2)])
    en = np.sqrt((cs[L:] - cs[:-L]) * np.dot(A, A))
    r = xc / np.maximum(en, 1e-12); i = int(np.argmax(r)); best, blag = float(r[i]), i - M
    # the step at the seam is the downbeat's own attack: no bigger than the full render's opening from silence
    om = o.mean(axis=0); attack = float(np.abs(np.diff(om[:int(np.argmax(np.abs(om) > 1e-3)) + 96])).max())
    ok = length_ok and jump <= max(p999, 1e-3) and jump <= max(attack, 1e-3) and click_db < 3 and not gap and best > 0.95
    kb = os.path.getsize(path) / 1024
    print(f"{name:15s} {'OK  ' if ok else 'FAIL'} {kb:5.0f} KB  loop {n / GAME_SR:6.3f} s  decoded length "
          f"{'exact' if length_ok else 'OFF by %d' % (d.shape[1] - n - 2 * p)}  seam step {jump:.4f} (run-on {ref_jump:.4f}, "
          f"p99.9 {p999:.4f}, opening attack {attack:.4f})  HF at seam {click_db:+.1f} dB  worst 10ms drop {drop:.2f} dB  body vs original r={best:.4f} @{blag:+d}")
    return ok, d[:, e - one:e], d[:, s:s + one]

if __name__ == '__main__':
    args = sys.argv[1:]
    manifest = os.path.join(OUT, 'loops.json')
    if '--one' in args:
        render_one(args[args.index('--one') + 1]); sys.exit(0)
    if '--check' in args:
        meta = json.load(open(manifest))
        want = [a for a in args if not a.startswith('--')] or list(meta)
        seams = os.environ.get('SEAM_DIR')
        good = True
        for k in want:
            ok, tail, head = check_one(k, meta[k]); good &= ok
            if seams:   # the seam as a wav to listen to: the last second, then the first second
                from scipy.io import wavfile
                wavfile.write(os.path.join(seams, k + '-seam.wav'), GAME_SR, np.concatenate([tail, head], axis=1).T)
        sys.exit(0 if good else 1)
    names = args or [k for k in SONGS if k != 'columbia_swing']
    meta = json.load(open(manifest)) if os.path.exists(manifest) else {}
    for k in names:   # one process per song: the engine seeds its RNG at import, like a fresh `python3 <song>.py`
        r = subprocess.run([sys.executable, os.path.abspath(__file__), '--one', k], capture_output=True, text=True, cwd=HERE)
        if r.returncode: sys.exit(r.stderr)
        line = [l for l in r.stdout.splitlines() if l.startswith('{')][-1]
        meta.update(json.loads(line)); print(line)
    json.dump(meta, open(manifest, 'w'), indent=1)
