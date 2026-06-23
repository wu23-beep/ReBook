import os
import sys
import glob
import time
import asyncio
import urllib.request
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from gtts import gTTS

# Create directories
scratch_dir = r"C:\Users\tingl\.gemini\antigravity\brain\80c92507-1316-440a-8307-f4a8405e44a2\scratch"
temp_video_dir = os.path.join(scratch_dir, "raw_recordings")
os.makedirs(temp_video_dir, exist_ok=True)

output_video_path = r"C:\Users\tingl\Downloads\rebook-續頁\rebook_app_intro.mp4"

# Timeline specifications for the 55-second demo
timeline = [
    {
        "start": 0.0,
        "end": 7.0,
        "subtitle": "ReBook 首頁 - 大學生專屬的校園二手教科書共享平台",
        "narration": "這是 ReBook 的首頁，我們可以流暢地探索各個校園中上架的二手教科書。"
    },
    {
        "start": 7.0,
        "end": 13.0,
        "subtitle": "快捷系所篩選與搜尋，一鍵鎖定熱門指定課本",
        "narration": "平台支援快捷系所分類，輕輕一點，就能精準鎖定各系熱門教材。"
    },
    {
        "start": 13.0,
        "end": 20.0,
        "subtitle": "透明書況、校園面交地點與書主信譽評等",
        "narration": "詳情頁標註了透明書況、校園面交地點以及書主評價，讓借閱面交更安心。"
    },
    {
        "start": 20.0,
        "end": 28.0,
        "subtitle": "內建聊聊對話與預約卡片，輕鬆約定面交時間",
        "narration": "內建即時通訊，能直接發送快捷語與書況照片，雙方隨時敲定面交時間。"
    },
    {
        "start": 28.0,
        "end": 34.0,
        "subtitle": "個人書架，輕鬆管理上架、借入與借出圖書",
        "narration": "在個人書櫃中，你可以輕鬆管理所有已上架、借入與借出的書籍資產。"
    },
    {
        "start": 34.0,
        "end": 48.0,
        "subtitle": "獨家 AI 學術小助手 - 大綱比對與智慧書籍推薦",
        "narration": "獨家的 AI 學術小助手，結合了語意搜尋，直接詢問教授與課程，一鍵為你推薦最新版本教科書。"
    },
    {
        "start": 48.0,
        "end": 55.0,
        "subtitle": "讓二手原文書在同校間循環傳承，開啟你的 ReBook 體驗！",
        "narration": "快來註冊 ReBook，開啟你的共享新體驗，讓知識在校園間永續流傳！"
    }
]

async def record_browser_session():
    print("Initializing Playwright browser in background...")
    from playwright.async_api import async_playwright
    
    async with async_playwright() as p:
        # Launch Chromium, using recordVideo setting in context
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1280, "height": 720},
            record_video_dir=temp_video_dir,
            record_video_size={"width": 1280, "height": 720}
        )
        
        page = await context.new_page()
        url = "https://re-book-wheat.vercel.app/"
        print(f"Loading target web application: {url}...")
        
        # Step 1: Home View Navigation (0.0s - 7.0s)
        await page.goto(url)
        await page.wait_for_timeout(2000)
        
        print("Scrolling Home Page to view textbooks...")
        # Scroll down to show books
        await page.mouse.wheel(0, 350)
        await page.wait_for_timeout(1500)
        await page.mouse.wheel(0, 350)
        await page.wait_for_timeout(1500)
        # Scroll back up
        await page.mouse.wheel(0, -700)
        await page.wait_for_timeout(2000) # Ends at 7.0s
        
        # Step 2: Department Filter & Click Book (7.0s - 13.0s)
        print("Filtering by Computer Science department using select option...")
        try:
            await page.select_option('div.space-y-1:has-text("學門系所") select', value="Computer Science", timeout=3000)
            await page.wait_for_timeout(500)
            await page.click('button:has-text("套用篩選")', timeout=3000)
        except Exception as e:
            print("Could not apply department filter, continuing...", e)
        await page.wait_for_timeout(1500)
        
        print("Clicking 'Operating System Concepts' book to view details...")
        try:
            await page.locator('text=Operating System Concepts').first.click(timeout=3000)
        except Exception as e:
            # Fallback click the first card using shadow class
            try:
                await page.locator('.book-card-shadow').first.click(timeout=3000)
            except Exception as fe:
                print("Could not click book card, continuing...", fe)
        await page.wait_for_timeout(4000) # Ends at 13.0s
        
        # Step 3: Book Details & Contact Owner (13.0s - 20.0s)
        print("Scrolling through book details page...")
        await page.mouse.wheel(0, 450)
        await page.wait_for_timeout(2500)
        
        print("Clicking contact button to start chat...")
        try:
            await page.click('button:has-text("傳送交換訊息")', timeout=3000)
        except Exception as e:
            print("Could not click contact button, continuing...", e)
        await page.wait_for_timeout(4500) # Ends at 20.0s (13 + 2.5 + 4.5)
        
        # Step 4: Chat Room (20.0s - 28.0s)
        print("Interacting inside the Chat Room...")
        try:
            # Type message
            await page.click('input[placeholder="輸入訊息對話..."]', timeout=3000)
            await page.type('input[placeholder="輸入訊息對話..."]', '請問這本書目前還在嗎？', delay=80)
            await page.wait_for_timeout(1000)
            await page.press('input[placeholder="輸入訊息對話..."]', 'Enter')
        except Exception as e:
            print("Could not type in chat input, continuing...", e)
        await page.wait_for_timeout(7000) # Ends at 28.0s (20 + 1 + 7)
        
        # Step 5: My Shelf (28.0s - 34.0s)
        print("Navigating to 'My Shelf' tab...")
        try:
            await page.click('text="我的書架"', timeout=3000)
        except Exception as e:
            print("Could not click My Shelf tab, continuing...", e)
        await page.wait_for_timeout(3000)
        try:
            await page.click('text="我借出的書"', timeout=3000)
        except Exception as e:
            pass
        await page.wait_for_timeout(3000) # Ends at 34.0s (28 + 3 + 3)
        
        # Step 6: Summon AI Assistant (34.0s - 48.0s)
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
        # Wait for AI response
        await page.wait_for_timeout(5500)
        
        print("Clicking AI recommendation card...")
        try:
            await page.locator('text=Computer Organization and Design').first.click(timeout=3000)
        except Exception as e:
            print("Could not click AI recommendation card, continuing...", e)
        await page.wait_for_timeout(5000) # Ends at 48.0s (34 + 2.5 + 1 + 5.5 + 5)
        
        # Step 7: Profile View & Outro (48.0s - 55.0s)
        print("Navigating to Profile Account View...")
        try:
            await page.click('text="帳號檔案"', timeout=3000)
        except Exception as e:
            print("Could not click Profile tab, continuing...", e)
        await page.wait_for_timeout(7000) # Ends at 55.0s (48 + 7)
        
        print("Closing Playwright context...")
        await context.close()
        await browser.close()
        
    print("Browser recording complete!")

def apply_subtitles_and_audio():
    print("Locating the recorded WebM file...")
    # Playwright saves video as random filename under the folder
    video_files = glob.glob(os.path.join(temp_video_dir, "*.webm"))
    if not video_files:
        print("Error: No recorded webm file found!")
        sys.exit(1)
        
    # Get the latest webm file
    webm_file = max(video_files, key=os.path.getmtime)
    print(f"Found recording file: {webm_file}")
    
    # Generate narration audio files
    print("Generating TTS voiceover tracks...")
    audio_tracks = []
    for idx, scene in enumerate(timeline):
        audio_path = os.path.join(scratch_dir, f"scene_audio_{idx}.mp3")
        tts = gTTS(text=scene["narration"], lang='zh-tw')
        tts.save(audio_path)
        audio_tracks.append((scene["start"], audio_path))
        
    # Download background music
    bgm_path = os.path.join(scratch_dir, "intro_bgm.mp3")
    bgm_downloaded = False
    try:
        # Acoustic corporate upbeat loop
        bgm_url = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
        print("Downloading BGM...")
        urllib.request.urlretrieve(bgm_url, bgm_path)
        bgm_downloaded = True
        print("BGM downloaded successfully.")
    except Exception as e:
        print(f"BGM download failed: {e}. Video will only have narration.")
        
    # Delay imports to avoid early failures
    from moviepy import VideoFileClip, AudioFileClip, CompositeAudioClip
    
    print("Loading video recording clip...")
    raw_video = VideoFileClip(webm_file)
    # Ensure video is exactly 55 seconds (trim/extend if needed)
    raw_video = raw_video.with_duration(55.0)
    
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
            # Bottom subtitle bar (semi-transparent black)
            draw.rectangle([(0, 620), (1280, 710)], fill=(0, 0, 0, 175))
            
            # Load font
            try:
                font = ImageFont.truetype("C:\\Windows\\Fonts\\msjhbd.ttc", 26) # Bold
            except:
                try:
                    font = ImageFont.truetype("C:\\Windows\\Fonts\\msjh.ttc", 26)
                except:
                    font = ImageFont.load_default()
                    
            # Center alignment
            try:
                text_bbox = draw.textbbox((0, 0), current_sub, font=font)
                text_width = text_bbox[2] - text_bbox[0]
                text_height = text_bbox[3] - text_bbox[1]
            except:
                text_width = draw.textlength(current_sub, font=font)
                text_height = 26
                
            text_x = (1280 - text_width) // 2
            text_y = 620 + (90 - text_height) // 2
            draw.text((text_x, text_y), current_sub, fill=(255, 255, 255, 255), font=font)
            
        return np.array(img)
        
    # Apply Pillow transformation on video frames using transform to ensure compatibility
    print("Applying subtitle overlays to video...")
    processed_video = raw_video.transform(lambda get_frame, t: draw_subtitle_frame(get_frame(t), t))
    
    # Load and position audio tracks
    print("Assembling audio tracks...")
    audio_clips = []
    for start_time, audio_file in audio_tracks:
        clip = AudioFileClip(audio_file)
        clip = clip.with_start(start_time)
        audio_clips.append(clip)
        
    # BGM mixing
    if bgm_downloaded:
        try:
            bgm = AudioFileClip(bgm_path)
            # Loop/trim BGM to match final duration and set low volume
            bgm = bgm.with_duration(55.0)
            bgm = bgm.multiply_volume(0.12)
            audio_clips.append(bgm)
        except Exception as e:
            print("Could not mix BGM:", e)
            
    # Mix all audio clips together
    mixed_audio = CompositeAudioClip(audio_clips)
    processed_video = processed_video.with_audio(mixed_audio)
    
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
    await record_browser_session()
    apply_subtitles_and_audio()

if __name__ == "__main__":
    asyncio.run(main())
