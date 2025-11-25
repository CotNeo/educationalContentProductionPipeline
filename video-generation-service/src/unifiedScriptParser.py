"""
Unified Script Parser for TTS + Video format.
Parses the scene-by-scene unified script format.
"""

import re
from typing import List, Dict, Optional
from dataclasses import dataclass


@dataclass
class TTSSettings:
    """TTS settings for a scene."""
    speed: float = 1.05
    tone: str = "Educational and energetic"
    pauses: List[str] = None

    def __post_init__(self):
        if self.pauses is None:
            self.pauses = []


@dataclass
class VideoSettings:
    """Video settings for a scene."""
    camera: str = "static front"
    mood: str = "modern, clean, minimal"
    animation: str = ""
    background: str = "dark gradient"

    def __post_init__(self):
        pass


@dataclass
class CodeBlock:
    """Code block information."""
    read_aloud: bool = False
    content: str = ""


@dataclass
class Scene:
    """A single scene from the unified script."""
    scene_number: int
    narration: str
    visual: str
    duration: float  # in seconds
    tts_settings: TTSSettings
    video_settings: VideoSettings
    ratio: str = "16:9"
    code: Optional[CodeBlock] = None
    transitions: Optional[Dict[str, str]] = None
    assets: Optional[Dict[str, any]] = None


def parse_duration(duration_str: str) -> float:
    """
    Parse duration string like "8s", "15.5s" to float seconds.
    """
    duration_str = duration_str.strip().strip('"').strip("'")
    if duration_str.endswith('s'):
        return float(duration_str[:-1])
    return float(duration_str)


def parse_unified_script(script_path: str) -> List[Scene]:
    """
    Parse unified script format into Scene objects.
    
    Args:
        script_path: Path to the unified script file
        
    Returns:
        List of Scene objects
    """
    with open(script_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    scenes = []
    
    # Find all scene blocks
    scene_pattern = r'\[scene\s+(\d+)\](.*?)(?=\n---|\n\[scene|\Z)'
    matches = re.finditer(scene_pattern, content, re.DOTALL)
    
    for match in matches:
        scene_num = int(match.group(1))
        scene_content = match.group(2).strip()
        
        # Extract narration
        narration_match = re.search(r'narration:\s*\|\s*\n(.*?)(?=\n\w+:|$)', scene_content, re.DOTALL)
        narration = narration_match.group(1).strip() if narration_match else ""
        
        # Extract visual
        visual_match = re.search(r'visual:\s*\|\s*\n(.*?)(?=\n\w+:|$)', scene_content, re.DOTALL)
        visual = visual_match.group(1).strip() if visual_match else ""
        
        # Extract duration
        duration_match = re.search(r'duration:\s*"([^"]+)"', scene_content)
        duration_str = duration_match.group(1) if duration_match else "5s"
        duration = parse_duration(duration_str)
        
        # Extract tts_settings
        tts_settings = TTSSettings()
        tts_speed_match = re.search(r'speed:\s*([0-9.]+)', scene_content)
        if tts_speed_match:
            tts_settings.speed = float(tts_speed_match.group(1))
        
        tts_tone_match = re.search(r'tone:\s*"([^"]+)"', scene_content)
        if tts_tone_match:
            tts_settings.tone = tts_tone_match.group(1)
        
        tts_pauses_match = re.search(r'pauses:\s*\n\s*-\s*"([^"]+)"', scene_content, re.MULTILINE)
        if tts_pauses_match:
            tts_settings.pauses = [tts_pauses_match.group(1)]
        
        # Extract video_settings
        video_settings = VideoSettings()
        camera_match = re.search(r'camera:\s*"([^"]+)"', scene_content)
        if camera_match:
            video_settings.camera = camera_match.group(1)
        
        mood_match = re.search(r'mood:\s*"([^"]+)"', scene_content)
        if mood_match:
            video_settings.mood = mood_match.group(1)
        
        animation_match = re.search(r'animation:\s*"([^"]+)"', scene_content)
        if animation_match:
            video_settings.animation = animation_match.group(1)
        
        bg_match = re.search(r'background:\s*"([^"]+)"', scene_content)
        if bg_match:
            video_settings.background = bg_match.group(1)
        
        # Extract ratio
        ratio_match = re.search(r'ratio:\s*"([^"]+)"', scene_content)
        ratio = ratio_match.group(1) if ratio_match else "16:9"
        
        # Extract code block - support multiple formats
        code_block = None
        # Format 1: code:\n  read_aloud: false\n  content: |\n    ...
        code_match = re.search(r'code:\s*\n\s*read_aloud:\s*(true|false)\s*\n\s*content:\s*\|\s*\n(.*?)(?=\n---|\n\[scene|\Z)', scene_content, re.DOTALL)
        if code_match:
            read_aloud = code_match.group(1).lower() == 'true'
            code_content = code_match.group(2).strip()
            # Remove markdown code blocks if present
            code_content = re.sub(r'^```\w*\n', '', code_content, flags=re.MULTILINE)
            code_content = re.sub(r'\n```\s*$', '', code_content, flags=re.MULTILINE)
            code_block = CodeBlock(read_aloud=read_aloud, content=code_content)
        else:
            # Format 2: code.content: |\n    ```javascript\n    ...\n    ```
            code_content_match = re.search(r'code\.content:\s*\|\s*\n(.*?)(?=\n---|\n\[scene|\Z)', scene_content, re.DOTALL)
            if code_content_match:
                code_content = code_content_match.group(1).strip()
                # Remove markdown code blocks if present
                code_content = re.sub(r'^```\w*\n', '', code_content, flags=re.MULTILINE)
                code_content = re.sub(r'\n```\s*$', '', code_content, flags=re.MULTILINE)
                code_block = CodeBlock(read_aloud=False, content=code_content)
        
        # Extract transitions
        transitions = None
        trans_match = re.search(r'transitions:\s*\n\s*next:\s*"([^"]+)"', scene_content)
        if trans_match:
            transitions = {"next": trans_match.group(1)}
        
        # Extract assets
        assets = None
        assets_match = re.search(r'assets:\s*\n(.*?)(?=\n---|\n\[scene|\Z)', scene_content, re.DOTALL)
        if assets_match:
            assets = {}
            music_match = re.search(r'music:\s*"([^"]+)"', assets_match.group(1))
            if music_match:
                assets['music'] = music_match.group(1)
            icons_match = re.search(r'icons:\s*\[(.*?)\]', assets_match.group(1))
            if icons_match:
                assets['icons'] = [icon.strip().strip('"') for icon in icons_match.group(1).split(',')]
            diagram_match = re.search(r'diagram:\s*"([^"]+)"', assets_match.group(1))
            if diagram_match:
                assets['diagram'] = diagram_match.group(1)
        
        scene = Scene(
            scene_number=scene_num,
            narration=narration,
            visual=visual,
            duration=duration,
            tts_settings=tts_settings,
            video_settings=video_settings,
            ratio=ratio,
            code=code_block,
            transitions=transitions,
            assets=assets
        )
        
        scenes.append(scene)
    
    return scenes


def get_total_duration(scenes: List[Scene]) -> float:
    """Calculate total duration of all scenes."""
    return sum(scene.duration for scene in scenes)






