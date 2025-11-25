"""
Professional Video Generator for cinematic educational videos.
Creates high-quality videos from unified scripts with smooth transitions.
"""

from moviepy.editor import (
    AudioFileClip,
    ImageClip,
    CompositeVideoClip,
    concatenate_videoclips,
    VideoClip,
    ImageSequenceClip
)
# fadein/fadeout can be used later if needed
# from moviepy.video.fx import fadein, fadeout
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import os
import sys
import glob
from typing import List, Tuple, Optional
import math

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from unifiedScriptParser import parse_unified_script, Scene
from sceneRenderer import render_scene_base, VIDEO_WIDTH, VIDEO_HEIGHT, FPS, COLORS
from animatedRenderer import render_animated_scene, render_animated_logo_scene, render_geometric_shapes_animation


def create_transition_frames(
    scene1_img: Image.Image,
    scene2_img: Image.Image,
    transition_type: str = "fade",
    duration: float = 0.5,
    fps: int = FPS
) -> List[Image.Image]:
    """
    Create transition frames between two scenes.
    """
    frames = []
    num_frames = int(duration * fps)
    
    for i in range(num_frames):
        alpha = i / num_frames
        
        if transition_type == "fade":
            # Simple cross-fade
            frame = Image.blend(scene1_img, scene2_img, alpha)
        elif transition_type == "slide_left":
            # Slide left transition
            offset = int(VIDEO_WIDTH * alpha)
            frame = Image.new('RGB', (VIDEO_WIDTH, VIDEO_HEIGHT))
            frame.paste(scene2_img, (-offset, 0))
            overlay = scene1_img.copy()
            overlay.putalpha(int(255 * (1 - alpha)))
            frame.paste(overlay, (offset, 0), overlay)
        else:
            # Default: fade
            frame = Image.blend(scene1_img, scene2_img, alpha)
        
        frames.append(frame)
    
    return frames


def apply_camera_movement(
    img: Image.Image,
    camera_type: str,
    frame_num: int,
    total_frames: int
) -> Image.Image:
    """
    Apply camera movement effects (zoom, pan, tilt).
    """
    width, height = img.size
    zoom_factor = 1.0
    
    if "zoom" in camera_type.lower() or "push" in camera_type.lower():
        # Slow zoom in
        zoom_factor = 1.0 + (frame_num / total_frames) * 0.1
    elif "zoom out" in camera_type.lower():
        # Zoom out
        zoom_factor = 1.1 - (frame_num / total_frames) * 0.1
    
    if zoom_factor != 1.0:
        # Crop and resize for zoom effect
        new_width = int(width / zoom_factor)
        new_height = int(height / zoom_factor)
        x_offset = (width - new_width) // 2
        y_offset = (height - new_height) // 2
        
        cropped = img.crop((x_offset, y_offset, x_offset + new_width, y_offset + new_height))
        img = cropped.resize((width, height), Image.Resampling.LANCZOS)
    
    # Pan effect
    if "pan" in camera_type.lower():
        pan_amount = int((frame_num / total_frames) * 50)
        if "right" in camera_type.lower():
            # Pan right
            img = img.transform((width, height), Image.Transform.AFFINE,
                              (1, 0, -pan_amount, 0, 1, 0))
        elif "left" in camera_type.lower():
            # Pan left
            img = img.transform((width, height), Image.Transform.AFFINE,
                              (1, 0, pan_amount, 0, 1, 0))
    
    return img


def render_scene_frames(
    scene: Scene,
    start_time: float,
    audio_duration: Optional[float] = None,
    fps: int = FPS,
    prev_scene: Optional[Scene] = None
) -> List[Tuple[Image.Image, float]]:
    """
    Render all frames for a scene with professional animations.
    Returns list of (image, timestamp) tuples.
    Frame-by-frame animations for rich visual content.
    """
    frames = []
    scene_duration = audio_duration if audio_duration else scene.duration
    num_frames = max(1, int(scene_duration * fps))
    
    visual_lower = scene.visual.lower()
    
    # Check if this scene needs animated rendering (Scene 1, 2)
    is_animated_scene = (
        ("logo" in visual_lower and "javascript" in visual_lower) or
        ("geometric shapes" in visual_lower) or
        (scene.scene_number <= 2 and "animated" in visual_lower)
    )
    
    # Add transition from previous scene (if any)
    transition_frames_count = 0
    if prev_scene and int(0.5 * fps) > 0:
        transition_frames_count = int(0.5 * fps)
        prev_img = render_scene_base(prev_scene, 0.0) if not is_animated_scene else render_scene_base(prev_scene, 0.0)
        
        # Get first frame of current scene for transition
        if is_animated_scene:
            first_frame = render_animated_scene(scene, 0.0)
        else:
            first_frame = render_scene_base(scene, 0.0)
        
        transition_frames = create_transition_frames(
            prev_img, first_frame, "fade", 0.5, fps
        )
        frames.extend([(frame, start_time + i/fps) for i, frame in enumerate(transition_frames)])
        start_time += 0.5
        del prev_img
    
    # Render ALL frames with animations
    scene_frames_needed = num_frames - transition_frames_count
    
    for i in range(scene_frames_needed):
        frame_time = i / fps
        scene_time = frame_time  # Time within this scene
        
        # Render animated frame for animated scenes
        if is_animated_scene:
            frame_img = render_animated_scene(scene, scene_time)
        else:
            # Static or code/diagram scenes
            frame_img = render_scene_base(scene, scene_time)
            
            # Apply camera movement if specified
            camera_type = scene.video_settings.camera.lower()
            if "zoom" in camera_type or "pan" in camera_type:
                frame_img = apply_camera_movement(
                    frame_img,
                    scene.video_settings.camera,
                    i,
                    scene_frames_needed
                )
            
            # Add fade-in animation for code/diagram scenes
            anim_type = scene.video_settings.animation.lower()
            if "fade" in anim_type and scene_time < 1.0:
                fade_progress = scene_time / 1.0
                overlay = Image.new('RGBA', (VIDEO_WIDTH, VIDEO_HEIGHT), 
                                  (0, 0, 0, int(255 * (1 - fade_progress))))
                frame_img_rgba = frame_img.convert('RGBA')
                frame_img = Image.alpha_composite(frame_img_rgba, overlay).convert('RGB')
        
        frames.append((frame_img, start_time + frame_time))
    
    return frames


def generate_professional_video(
    script_path: str,
    audio_path: str,
    output_path: str,
    fps: int = FPS
):
    """
    Generate professional cinematic video from unified script.
    
    Args:
        script_path: Path to unified script file
        audio_path: Path to audio file (WAV/MP3)
        output_path: Output video path
        fps: Frames per second (default 30)
    """
    print(f"[VideoGenerator] Starting professional video generation...")
    print(f"[VideoGenerator] Script: {script_path}")
    print(f"[VideoGenerator] Audio: {audio_path}")
    print(f"[VideoGenerator] Output: {output_path}")
    
    # 1. Parse unified script
    print(f"[VideoGenerator] Parsing unified script...")
    scenes = parse_unified_script(script_path)
    print(f"[VideoGenerator] Found {len(scenes)} scenes")
    
    # 2. Load audio
    print(f"[VideoGenerator] Loading audio...")
    audio_clip = AudioFileClip(audio_path)
    total_audio_duration = audio_clip.duration
    print(f"[VideoGenerator] Audio duration: {total_audio_duration:.2f}s")
    
    # 3. Calculate scene durations from audio timing
    # Match audio duration exactly - distribute proportionally but ensure exact match
    script_total_duration = sum(scene.duration for scene in scenes)
    
    if script_total_duration > 0:
        time_scale = total_audio_duration / script_total_duration
    else:
        time_scale = 1.0
        print("[VideoGenerator] ⚠️ Warning: Script has zero total duration")
    
    print(f"[VideoGenerator] Script duration: {script_total_duration:.2f}s")
    print(f"[VideoGenerator] Audio duration: {total_audio_duration:.2f}s")
    print(f"[VideoGenerator] Time scale: {time_scale:.4f}")
    
    # 4. Render frames and save directly to disk (memory-efficient)
    print(f"[VideoGenerator] Rendering scenes and saving frames to disk...")
    temp_dir = "/tmp/video_frames"
    os.makedirs(temp_dir, exist_ok=True)
    
    video_clips = []
    frame_counter = 0
    current_time = 0.0
    
    for i, scene in enumerate(scenes):
        print(f"[VideoGenerator] Rendering scene {scene.scene_number} ({scene.duration:.2f}s)...")
        
        # Adjust scene duration based on audio
        adjusted_duration = scene.duration * time_scale
        
        prev_scene = scenes[i - 1] if i > 0 else None
        scene_frames = render_scene_frames(
            scene,
            current_time,
            adjusted_duration,
            fps,
            prev_scene
        )
        
        # Save frames to disk immediately and free memory
        scene_frame_paths = []
        for frame_img, timestamp in scene_frames:
            frame_path = os.path.join(temp_dir, f"frame_{frame_counter:06d}.png")
            frame_img.save(frame_path, optimize=True, compress_level=1)
            scene_frame_paths.append(frame_path)
            frame_counter += 1
            # Free memory
            del frame_img
        
        # Create clip from scene frames immediately
        if scene_frame_paths:
            # Calculate exact duration per frame for perfect sync
            expected_frames = int(adjusted_duration * fps)
            actual_frames = len(scene_frame_paths)
            
            # Create clip with explicit duration per frame
            frame_duration = adjusted_duration / actual_frames if actual_frames > 0 else (1.0 / fps)
            durations = [frame_duration] * actual_frames
            
            clip = ImageSequenceClip(
                scene_frame_paths,
                fps=fps,
                durations=durations
            )
            
            # Ensure exact duration match
            if abs(clip.duration - adjusted_duration) > 0.05:  # 50ms tolerance
                clip = clip.set_duration(adjusted_duration)
            
            if actual_frames != expected_frames:
                # Adjust clip duration to match expected
                clip = clip.set_duration(adjusted_duration)
            
            video_clips.append(clip)
            print(f"[VideoGenerator] Scene {scene.scene_number} clip: {len(scene_frame_paths)} frames, duration={clip.duration:.2f}s")
        
        # Free scene frames from memory
        del scene_frames
        current_time += adjusted_duration
    
    # 5. Concatenate all clips
    print(f"[VideoGenerator] Concatenating {len(video_clips)} video clips...")
    if video_clips:
        final_video = concatenate_videoclips(video_clips, method="compose")
        # Free individual clips from memory
        for clip in video_clips:
            clip.close()
        del video_clips
    else:
        print("[VideoGenerator] ⚠️ No video clips created!")
        return
    
    # 6. Set audio
    print(f"[VideoGenerator] Adding audio track...")
    final_video = final_video.set_audio(audio_clip)
    
    # 7. Ensure video matches audio duration exactly (critical for sync)
    video_duration = final_video.duration
    duration_diff = abs(video_duration - total_audio_duration)
    
    print(f"[VideoGenerator] Duration mismatch: video={video_duration:.2f}s, audio={total_audio_duration:.2f}s")
    
    if duration_diff > 0.05:  # More than 50ms difference
        if video_duration > total_audio_duration:
            # Cut video to match audio exactly
            final_video = final_video.subclip(0, total_audio_duration)
        else:
            # Extend video with last frame to match audio exactly
            last_frame_duration = total_audio_duration - video_duration
            # Get last frame (slightly before end to ensure frame exists)
            last_frame_time = max(0, video_duration - 0.05)
            last_frame = final_video.to_ImageClip(last_frame_time)
            last_frame = last_frame.set_duration(last_frame_duration)
            final_video = concatenate_videoclips([final_video, last_frame], method="compose")
    
    # Verify final sync
    final_video_duration = final_video.duration
    final_diff = abs(final_video_duration - total_audio_duration)
    if final_diff <= 0.05:
        print(f"[VideoGenerator] ✅ Perfect sync: {final_diff:.3f}s difference")
    else:
        print(f"[VideoGenerator] ⚠️ Sync warning: {final_diff:.3f}s difference")
    
    # 8. Write video (optimized settings for lower memory usage)
    print(f"[VideoGenerator] Writing video to {output_path}...")
    final_video.write_videofile(
        output_path,
        fps=fps,
        codec='libx264',
        audio_codec='aac',
        bitrate='5000k',  # Lower bitrate to save memory
        preset='fast',    # Faster preset uses less memory
        threads=2,        # Reduce threads to save memory
        logger=None       # Disable verbose logging
    )
    
    # 9. Cleanup
    print(f"[VideoGenerator] Cleaning up temporary files...")
    final_video.close()
    audio_clip.close()
    
    # Remove all frame files
    frame_files = glob.glob(os.path.join(temp_dir, "frame_*.png"))
    for frame_file in frame_files:
        if os.path.exists(frame_file):
            os.remove(frame_file)
    if os.path.exists(temp_dir):
        try:
            os.rmdir(temp_dir)
        except:
            pass
    
    print(f"[VideoGenerator] ✅ Video generation complete: {output_path}")


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python professionalVideoGenerator.py <script_path> <audio_path> <output_path>")
        sys.exit(1)
    
    script_path = sys.argv[1]
    audio_path = sys.argv[2]
    output_path = sys.argv[3]
    
    generate_professional_video(script_path, audio_path, output_path)
