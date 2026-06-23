import os
import sys
import glob
import time
import json
import asyncio
import subprocess
import urllib.request
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from gtts import gTTS
from imageio_ffmpeg import get_ffmpeg_exe

# Create directories
scratch_dir = r"C:\Users\tingl\.gemini\antigravity\brain\80c92507-1316-440a-8307-f4a8405e44a2\scratch"
temp_video_dir = os.path.join(scratch_dir, "raw_recordings")
os.makedirs(temp_video_dir, exist_ok=True)

output_video_path = r"C:\Users\tingl\Downloads\rebook-續頁\rebook_app_intro.mp4"
timeline_cache_path = os.path.join(scratch_dir, "timeline_cache.json")

# Define the scene narration scripts (which will be both narration AND subtitles)
scene_contents = [
    {
        "narration": "這是 ReBook 的首頁，我們可以流暢地探索各個校園中上架的二手教科書。"
    },
    {
        "narration": "平台支援快捷系所分類，輕輕一點，就能精準鎖定各系熱門教材。"
    },
    {
        "narration": "詳情頁標註了透明書況、校園面交地點以及書主評價，讓借閱面交更安心。"
    },
    {
        "narration": "內建即時通訊，能直接發送快捷語與書況照片，雙方隨時敲定面交時間。"
    },
    {
        "narration": "在個人書櫃中，你可以輕鬆管理所有已上架、借入與借出的書籍資產。"
    },
    {
        "narration": "獨家的 AI 學術小助手，結合了語意搜尋，直接詢問教授與課程，一鍵為你推薦最新版本教科書。"
    },
    {
        "narration": "快來註冊 ReBook，開啟你的共享新體驗，讓知識在校園間永續流傳！"
    }
]

async def record_browser_session():
    print("Initializing Playwright browser in background...")
    from playwright.async_api import async_playwright
    
    measured_timeline = []
    script_start_time = time.time()
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1280, "height": 720},
            record_video_dir=temp_video_dir,
            record_video_size={"width": 1280, "height": 720}
        )
        
        page = await context.new_page()
        url = "https://re-book-wheat.vercel.app/"
        print(f"Loading target web application: {url}...")
        
        # --- Step 1: Home View Navigation ---
        t_start = time.time() - script_start_time
        await page.goto(url)
        # Wait for book cards to load first (ensure database connections are ready)
        print("Waiting for book cards to load...")
        await page.wait_for_selector('.book-card-shadow', timeout=10000)
        await page.wait_for_timeout(1000)
        
        print("Scrolling Home Page to view textbooks...")
        await page.mouse.wheel(0, 350)
        await page.wait_for_timeout(1500)
        await page.mouse.wheel(0, 350)
        await page.wait_for_timeout(1500)
        await page.mouse.wheel(0, -700)
        await page.wait_for_timeout(2000)
        t_end = time.time() - script_start_time
        measured_timeline.append({
            "start": t_start,
            "end": t_end,
            "subtitle": scene_contents[0]["narration"],
            "narration": scene_contents[0]["narration"]
        })
        
        # --- Step 2: Department Filter & Click Book ---
        t_start = time.time() - script_start_time
        print("Filtering by Computer Science department using select option...")
        try:
            # Locate the 2nd select element (department) inside aside
            await page.select_option('aside select:nth-of-type(2)', value="Computer Science", timeout=3000)
            await page.wait_for_timeout(500)
            await page.click('button:has-text("套用篩選")', timeout=3000)
        except Exception as e:
            print("Could not apply department filter, trying fallback select...", e)
            try:
                await page.select_option('select >> xpath=ancestor::div[contains(., "學門系所")]', value="Computer Science", timeout=3000)
                await page.click('button:has-text("套用篩選")', timeout=3000)
            except Exception as fe:
                print("Fallback filter failed too, continuing...", fe)
        await page.wait_for_timeout(2000)
        
        print("Clicking first book card to view details...")
        try:
            # Click first book card shadow which is 100% stable
            await page.locator('.book-card-shadow').first.click(timeout=5000)
        except Exception as e:
            print("Could not click first book card, continuing...", e)
        # Wait for details view to fully mount
        await page.wait_for_selector('button:has-text("傳送交換訊息")', timeout=6000)
        await page.wait_for_timeout(1500)
        t_end = time.time() - script_start_time
        measured_timeline.append({
            "start": t_start,
            "end": t_end,
            "subtitle": scene_contents[1]["narration"],
            "narration": scene_contents[1]["narration"]
        })
        
        # --- Step 3: Book Details & Contact Owner ---
        t_start = time.time() - script_start_time
        print("Scrolling through book details page...")
        await page.mouse.wheel(0, 450)
        await page.wait_for_timeout(2500)
        
        print("Clicking contact button to start chat...")
        try:
            await page.click('button:has-text("傳送交換訊息")', timeout=3000)
        except Exception as e:
            print("Could not click contact button, continuing...", e)
        # Wait for chat view input to load
        try:
            await page.wait_for_selector('input[placeholder="輸入訊息對話..."]', timeout=6000)
        except:
            pass
        await page.wait_for_timeout(2500)
        t_end = time.time() - script_start_time
        measured_timeline.append({
            "start": t_start,
            "end": t_end,
            "subtitle": scene_contents[2]["narration"],
            "narration": scene_contents[2]["narration"]
        })
        
        # --- Step 4: Chat Room ---
        t_start = time.time() - script_start_time
        print("Interacting inside the Chat Room...")
        try:
            await page.click('input[placeholder="輸入訊息對話..."]', timeout=3000)
            await page.type('input[placeholder="輸入訊息對話..."]', '請問這本書目前還在嗎？', delay=80)
            await page.wait_for_timeout(1000)
            await page.press('input[placeholder="輸入訊息對話..."]', 'Enter')
        except Exception as e:
            print("Could not type in chat input, continuing...", e)
        await page.wait_for_timeout(7000)
        t_end = time.time() - script_start_time
        measured_timeline.append({
            "start": t_start,
            "end": t_end,
            "subtitle": scene_contents[3]["narration"],
            "narration": scene_contents[3]["narration"]
        })
        
        # --- Step 5: My Shelf ---
        t_start = time.time() - script_start_time
        print("Navigating to 'My Shelf' tab...")
        try:
            await page.click('text="我的書架"', timeout=4000)
        except Exception as e:
            print("Could not click My Shelf tab, continuing...", e)
        await page.wait_for_timeout(3000)
        try:
            await page.click('text="我借出的書"', timeout=3000)
        except Exception as e:
            pass
        await page.wait_for_timeout(3000)
        t_end = time.time() - script_start_time
        measured_timeline.append({
            "start": t_start,
            "end": t_end,
            "subtitle": scene_contents[4]["narration"],
            "narration": scene_contents[4]["narration"]
        })
        
        # --- Step 6: Summon AI Assistant ---
        t_start = time.time() - script_start_time
        print("Summoning AI Academic Assistant sidebar...")
        try:
            await page.click('button[title="AI 學術小助手"]', timeout=3000)
        except Exception as e:
            print("Could not open AI Assistant, continuing...", e)
        await page.wait_for_timeout(2500)
        
        print("Asking AI assistant for 'Computer Organization' book...")
        try:
            await page.click('input[placeholder="問問 AI 課本助理..."]', timeout=3000)
            await page.type('input[placeholder="問問 AI 課本助理..."]', '有沒有雷欽隆教授的計算機組織？', delay=80)
            await page.wait_for_timeout(1000)
            await page.press('input[placeholder="問問 AI 課本助理..."]', 'Enter')
        except Exception as e:
            print("Could not type in AI chat, continuing...", e)
        # Wait for AI response cards to load
        try:
            await page.wait_for_selector('button:has-text("規格細節")', timeout=8000)
        except:
            pass
        await page.wait_for_timeout(2500)
        
        print("Clicking AI recommendation card details...")
        try:
            # Click details button inside AI result card
            await page.locator('button:has-text("規格細節")').first.click(timeout=3000)
        except Exception as e:
            print("Could not click AI details button, continuing...", e)
        await page.wait_for_timeout(5000)
        t_end = time.time() - script_start_time
        measured_timeline.append({
            "start": t_start,
            "end": t_end,
            "subtitle": scene_contents[5]["narration"],
            "narration": scene_contents[5]["narration"]
        })
        
        # --- Step 7: Profile View & Outro ---
        t_start = time.time() - script_start_time
        print("Navigating to Profile Account View...")
        try:
            await page.click('text="帳號檔案"', timeout=4000)
        except Exception as e:
            print("Could not click Profile tab, continuing...", e)
        await page.wait_for_timeout(7000)
        t_end = time.time() - script_start_time
        measured_timeline.append({
            "start": t_start,
            "end": t_end,
            "subtitle": scene_contents[6]["narration"],
            "narration": scene_contents[6]["narration"]
        })
        
        print("Closing Playwright context...")
        await context.close()
        browser.close()
        
    print("Browser recording complete!")
    
    # Save the measured timeline to cache
    with open(timeline_cache_path, "w", encoding="utf-8") as f:
        json.dump(measured_timeline, f, ensure_ascii=False, indent=2)
    print("Measured timeline saved to cache.")

def wrap_text(text, max_len=22):
    """Wrap subtitle text into multiline if it exceeds max_len characters."""
    if len(text) <= max_len:
        return text
    lines = []
    for i in range(0, len(text), max_len):
        lines.append(text[i:i+max_len])
    return "\n".join(lines)

def generate_voiceover(text, output_path, speed=1.24):
    """Generate TTS MP3 file and stretch/speed it up using ffmpeg atempo."""
    print(f"Generating TTS voiceover (speed={speed}): '{text[:15]}...'")
    temp_tts = output_path + ".temp.mp3"
    
    # Generate original slow TTS
    tts = gTTS(text=text, lang='zh-tw')
    tts.save(temp_tts)
    
    # Speed it up using FFmpeg atempo filter
    ffmpeg_exe = get_ffmpeg_exe()
    cmd = [
        ffmpeg_exe,
        "-y",
        "-i", temp_tts,
        "-filter:a", f"atempo={speed}",
        output_path
    ]
    subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    
    try:
        os.remove(temp_tts)
    except:
        pass

def apply_subtitles_and_audio():
    print("Locating the recorded WebM file...")
    video_files = glob.glob(os.path.join(temp_video_dir, "*.webm"))
    if not video_files:
        print("Error: No recorded webm file found!")
        sys.exit(1)
        
    webm_file = max(video_files, key=os.path.getmtime)
    print(f"Found recording file: {webm_file}")
    
    # Load timeline from cache
    if not os.path.exists(timeline_cache_path):
        print("Error: Timeline cache file missing. Please record again.")
        sys.exit(1)
        
    with open(timeline_cache_path, "r", encoding="utf-8") as f:
        timeline = json.load(f)
    print("Timeline successfully loaded from cache.")
    
    # Generate narration audio files with FASTER speed
    print("Generating TTS voiceover tracks (speed = 1.24)...")
    audio_tracks = []
    for idx, scene in enumerate(timeline):
        audio_path = os.path.join(scratch_dir, f"scene_audio_{idx}.mp3")
        generate_voiceover(scene["narration"], audio_path, speed=1.24)
        audio_tracks.append((scene["start"], audio_path))
        
    # Download background music
    bgm_path = os.path.join(scratch_dir, "intro_bgm.mp3")
    bgm_downloaded = False
    try:
        bgm_url = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
        print("Downloading BGM...")
        urllib.request.urlretrieve(bgm_url, bgm_path)
        bgm_downloaded = True
        print("BGM downloaded successfully.")
    except Exception as e:
        print(f"BGM download failed: {e}. Video will only have narration.")
        
    # Delay imports to avoid early failures
    from moviepy import VideoFileClip, AudioFileClip, CompositeAudioClip, concatenate_audioclips, AudioClip
    
    print("Loading video recording clip...")
    raw_video = VideoFileClip(webm_file)
    final_duration = timeline[-1]["end"]
    print(f"Trimming video clip to measured duration: {final_duration:.2f}s")
    raw_video = raw_video.with_duration(final_duration)
    
    # Image frame processor to draw custom subtitles
    print("Compiling Pillow subtitle processor...")
    
    def draw_subtitle_frame(image_array, t):
        img = Image.fromarray(image_array)
        current_sub = ""
        
        # Find matching subtitle for current time t
        for scene in timeline:
            if scene["start"] <= t < scene["end"]:
                current_sub = scene["subtitle"]
                break
                
        if current_sub:
            draw = ImageDraw.Draw(img, "RGBA")
            
            # Wrap text to support multiple lines
            wrapped_text = wrap_text(current_sub, max_len=24)
            lines_count = len(wrapped_text.split("\n"))
            
            # Calculate dynamic box height based on lines count
            box_height = 80 if lines_count == 1 else 115
            box_top = 720 - box_height - 15
            
            # Bottom subtitle bar (semi-transparent black)
            draw.rectangle([(0, box_top), (1280, 705)], fill=(0, 0, 0, 185))
            
            # Load font
            try:
                font = ImageFont.truetype("C:\\Windows\\Fonts\\msjhbd.ttc", 26) # Bold
            except:
                try:
                    font = ImageFont.truetype("C:\\Windows\\Fonts\\msjh.ttc", 26)
                except:
                    font = ImageFont.load_default()
                    
            # Draw multi-line text centered
            try:
                text_bbox = draw.multiline_textbbox((0, 0), wrapped_text, font=font)
                text_width = text_bbox[2] - text_bbox[0]
                text_height = text_bbox[3] - text_bbox[1]
            except:
                text_width = draw.textlength(wrapped_text.split("\n")[0], font=font)
                text_height = 26 * lines_count
                
            text_x = (1280 - text_width) // 2
            text_y = box_top + (box_height - text_height) // 2 - 5
            
            draw.multiline_text((text_x, text_y), wrapped_text, fill=(255, 255, 255, 255), font=font, align="center")
            
        return np.array(img)
        
    # Apply Pillow transformation on video frames
    print("Applying subtitle overlays to video...")
    processed_video = raw_video.transform(lambda get_frame, t: draw_subtitle_frame(get_frame(t), t))
    
    # Load and position audio tracks sequentially with silence clips
    print("Assembling audio tracks with silence padding...")
    narration_clips = []
    for idx, scene in enumerate(timeline):
        audio_file = audio_tracks[idx][1]
        tts_clip = AudioFileClip(audio_file)
        tts_len = tts_clip.duration
        scene_duration = scene["end"] - scene["start"]
        
        # Add the narration segment
        narration_clips.append(tts_clip)
        
        # Add silence padding to fill the scene duration
        silence_len = scene_duration - tts_len
        if silence_len > 0:
            # Create silence clip
            silence_clip = AudioClip(lambda t: 0.0, duration=silence_len, fps=44100)
            narration_clips.append(silence_clip)
        else:
            print(f"Warning: Scene {idx} narration ({tts_len:.2f}s) is longer than scene duration ({scene_duration:.2f}s)!")
            
    # Concatenate all to make a single non-overlapping narration track
    narration_audio = concatenate_audioclips(narration_clips)
    
    # BGM mixing
    if bgm_downloaded:
        try:
            bgm = AudioFileClip(bgm_path)
            bgm = bgm.with_duration(final_duration)
            bgm = bgm.multiply_volume(0.12)
            
            # Mix BGM with the clean narration track
            mixed_audio = CompositeAudioClip([narration_audio, bgm])
            processed_video = processed_video.with_audio(mixed_audio)
            print("BGM mixed with narration successfully.")
        except Exception as e:
            print("Could not mix BGM:", e)
            processed_video = processed_video.with_audio(narration_audio)
    else:
        processed_video = processed_video.with_audio(narration_audio)
    
    # Write the compiled output file
    print(f"Compiling and writing final video to {output_video_path}...")
    processed_video.write_videofile(
        output_video_path,
        fps=24,
        codec="libx264",
        audio_codec="aac",
        temp_audiofile=os.path.join(scratch_dir, "temp-audio-intro.m4a"),
        remove_temp=True
    )
    
    print("\n[SUCCESS] Interactive intro video generated successfully!")
    print(f"Video saved at: {output_video_path}")

async def main():
    print("Forcing browser re-record to sync text and actions with robust selectors...")
    await record_browser_session()
    apply_subtitles_and_audio()

if __name__ == "__main__":
    asyncio.run(main())
