import wave
import math
import struct
import subprocess
import os

sample_rate = 44100

def get_note_freq(note_name):
    # Base octave 4
    notes = {'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
             'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
             'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88}
    base = note_name[:-1]
    octave = int(note_name[-1])
    freq = notes[base] * (2 ** (octave - 4))
    return freq

# Romantic sequence of notes: (note_name, start_time_sec, duration_sec, volume, is_bass)
notes_data = []

tempo = 0.45 # time per beat

# Pattern: 4 romantic bars repeated / developed, then Happy Birthday sweet motif
progression = [
    # Bar 1: C Major (C3 bass + C4, E4, G4, C5, E5 arpeggio)
    [('C3', 0.0, 3.2, 0.45, True), ('C4', 0.0, 1.8, 0.28, False), ('E4', 0.45, 1.6, 0.26, False), 
     ('G4', 0.9, 1.8, 0.28, False), ('C5', 1.35, 2.2, 0.35, False), ('E5', 1.8, 1.8, 0.30, False),
     ('D5', 2.25, 1.2, 0.25, False), ('C5', 2.7, 1.4, 0.28, False)],
    
    # Bar 2: G Major / B (G2 bass + G4, B4, D5, G5 arpeggio)
    [('G2', 0.0, 3.2, 0.45, True), ('B3', 0.0, 1.8, 0.26, False), ('D4', 0.45, 1.6, 0.26, False),
     ('G4', 0.9, 1.8, 0.28, False), ('B4', 1.35, 2.2, 0.32, False), ('D5', 1.8, 1.8, 0.30, False),
     ('C5', 2.25, 1.2, 0.25, False), ('B4', 2.7, 1.4, 0.28, False)],

    # Bar 3: Am (A2 bass + A4, C5, E5, A5 arpeggio)
    [('A2', 0.0, 3.2, 0.45, True), ('C4', 0.0, 1.8, 0.28, False), ('E4', 0.45, 1.6, 0.26, False),
     ('A4', 0.9, 1.8, 0.30, False), ('C5', 1.35, 2.2, 0.35, False), ('E5', 1.8, 1.8, 0.32, False),
     ('G5', 2.25, 1.2, 0.28, False), ('E5', 2.7, 1.4, 0.30, False)],

    # Bar 4: F Major (F2 bass + F4, A4, C5, F5 arpeggio)
    [('F2', 0.0, 3.2, 0.45, True), ('A3', 0.0, 1.8, 0.26, False), ('C4', 0.45, 1.6, 0.26, False),
     ('F4', 0.9, 1.8, 0.28, False), ('A4', 1.35, 2.2, 0.32, False), ('C5', 1.8, 1.8, 0.35, False),
     ('E5', 2.25, 1.2, 0.28, False), ('D5', 2.7, 1.6, 0.30, False)],

    # Bar 5: Em7 -> Am (Em / G)
    [('E2', 0.0, 3.2, 0.42, True), ('G3', 0.0, 1.8, 0.25, False), ('B3', 0.45, 1.6, 0.25, False),
     ('E4', 0.9, 1.8, 0.28, False), ('G4', 1.35, 2.2, 0.32, False), ('B4', 1.8, 1.8, 0.32, False),
     ('A4', 2.25, 1.2, 0.28, False), ('G4', 2.7, 1.4, 0.28, False)],

    # Bar 6: F -> G (Build up to Birthday theme)
    [('F2', 0.0, 1.8, 0.42, True), ('C4', 0.0, 1.4, 0.26, False), ('F4', 0.45, 1.4, 0.28, False), ('A4', 0.9, 1.4, 0.32, False),
     ('G2', 1.6, 1.8, 0.42, True), ('D4', 1.6, 1.4, 0.26, False), ('G4', 2.05, 1.4, 0.28, False), ('B4', 2.5, 1.6, 0.34, False)],
]

# Assemble romantic intro / verse
current_time = 0.5
for bar in progression:
    for n, st, dur, vol, is_b in bar:
        notes_data.append((n, current_time + st, dur, vol, is_b))
    current_time += 3.2

# Now Section B: Gentle Happy Birthday in Music Box Bells (harmonized with warm piano)
bday_motifs = [
    # "Happy Birthday to you" (C4 C4 D4 C4 F4 E4) - over C and G
    [('C3', 0.0, 3.2, 0.42, True), ('C4', 0.0, 0.6, 0.32, False), ('C4', 0.45, 0.6, 0.32, False),
     ('D4', 0.9, 1.0, 0.36, False), ('C4', 1.5, 1.0, 0.34, False), ('F4', 2.1, 1.2, 0.38, False), ('E4', 2.7, 2.0, 0.38, False)],
    
    # "Happy Birthday to you" (C4 C4 D4 C4 G4 F4) - over G and C
    [('G2', 0.0, 3.2, 0.42, True), ('C4', 0.0, 0.6, 0.32, False), ('C4', 0.45, 0.6, 0.32, False),
     ('D4', 0.9, 1.0, 0.36, False), ('C4', 1.5, 1.0, 0.34, False), ('G4', 2.1, 1.2, 0.38, False), ('F4', 2.7, 2.0, 0.38, False)],

    # "Happy Birthday dear Princess" (C4 C4 C5 A4 F4 E4 D4) - over F, Am, G
    [('F2', 0.0, 3.6, 0.45, True), ('C4', 0.0, 0.6, 0.32, False), ('C4', 0.45, 0.6, 0.32, False),
     ('C5', 0.9, 1.4, 0.42, False), ('A4', 1.6, 1.2, 0.38, False), ('F4', 2.2, 1.2, 0.36, False), 
     ('E4', 2.8, 1.2, 0.34, False), ('D4', 3.4, 1.8, 0.34, False)],

    # "Happy Birthday to you" (A#4 A#4 A4 F4 G4 F4) - over Bb / C
    [('A#2', 0.0, 3.6, 0.45, True), ('A#4', 0.0, 0.6, 0.34, False), ('A#4', 0.45, 0.6, 0.34, False),
     ('A4', 0.9, 1.2, 0.38, False), ('F4', 1.5, 1.2, 0.36, False), ('G4', 2.1, 1.4, 0.38, False), ('F4', 2.7, 2.8, 0.42, False)],
]

for bar in bday_motifs:
    for n, st, dur, vol, is_b in bar:
        notes_data.append((n, current_time + st, dur, vol, is_b))
    current_time += 3.8

total_duration = current_time + 2.5
total_samples = int(total_duration * sample_rate)

left_channel = [0.0] * total_samples
right_channel = [0.0] * total_samples

# Synthesize delicate acoustic piano / bell timbre
for note_name, start_t, dur, vol, is_bass in notes_data:
    freq = get_note_freq(note_name)
    start_sample = int(start_t * sample_rate)
    num_samples = int(dur * sample_rate)
    
    # Slight stereo panning based on pitch
    pan = 0.5 + 0.35 * ((math.log2(freq / 261.63)) / 3.0)
    pan = max(0.15, min(0.85, pan))
    pan_l = math.cos(pan * math.pi / 2)
    pan_r = math.sin(pan * math.pi / 2)
    
    for i in range(num_samples):
        idx = start_sample + i
        if idx >= total_samples:
            break
        t = i / sample_rate
        
        # Envelope: very soft attack, warm exponential decay
        attack = 0.015 if is_bass else 0.025
        if t < attack:
            env = (t / attack)
        else:
            decay_rate = 1.2 if is_bass else (2.4 if freq > 500 else 1.8)
            env = math.exp(-decay_rate * (t - attack))
            
        # Rich acoustic harmonic synthesis:
        # Fundamental (warm sine) + 2nd harmonic (octave) + 3rd (warm 5th) + delicate sparkle
        s1 = math.sin(2 * math.pi * freq * t)
        s2 = 0.45 * math.sin(2 * math.pi * (freq * 2) * t) * math.exp(-2.5 * t)
        s3 = 0.20 * math.sin(2 * math.pi * (freq * 3) * t) * math.exp(-3.5 * t)
        s4 = 0.08 * math.sin(2 * math.pi * (freq * 4) * t) * math.exp(-5.0 * t)
        
        val = (s1 + s2 + s3 + s4) * env * vol
        
        left_channel[idx] += val * pan_l
        right_channel[idx] += val * pan_r

# Subtle simple stereo delay / acoustic reverb
delay_samples = int(0.24 * sample_rate)
feedback = 0.28
for i in range(delay_samples, total_samples):
    left_channel[i] += right_channel[i - delay_samples] * feedback
    right_channel[i] += left_channel[i - delay_samples] * feedback

# Normalize
max_val = max(max(abs(x) for x in left_channel), max(abs(x) for x in right_channel), 0.001)
scale = 0.88 / max_val

# Write to WAV
wav_path = '/tmp/romantic_bday.wav'
with wave.open(wav_path, 'w') as wav:
    wav.setnchannels(2)
    wav.setsampwidth(2)
    wav.setframerate(sample_rate)
    
    frames = bytearray()
    for l, r in zip(left_channel, right_channel):
        il = int(max(-32767, min(32767, l * scale * 32767)))
        ir = int(max(-32767, min(32767, r * scale * 32767)))
        frames.extend(struct.pack('<hh', il, ir))
    wav.writeframes(frames)

# Convert to high-quality MP3 using ffmpeg
os.makedirs('/public/music', exist_ok=True)
mp3_out = '/public/music/the-gioi-cua-anh.mp3'

cmd = ['ffmpeg', '-y', '-i', wav_path, '-b:a', '192k', mp3_out]
subprocess.run(cmd, check=True)
print(f"Generated {mp3_out} successfully! Size: {os.path.getsize(mp3_out)} bytes")
