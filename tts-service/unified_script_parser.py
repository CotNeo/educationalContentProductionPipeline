"""
Parser for unified TTS + Video script format.
Extracts narration text from unified scripts.
"""

import re
from typing import List, Dict, Optional


def parse_unified_script(script_path: str) -> List[Dict]:
    """
    Parse unified script and extract narration sections.
    
    Returns list of scenes with narration text and TTS settings.
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
        
        # Extract TTS settings
        tts_settings = {
            'speed': 1.05,
            'tone': 'Educational and energetic',
            'pauses': []
        }
        
        tts_speed_match = re.search(r'speed:\s*([0-9.]+)', scene_content)
        if tts_speed_match:
            tts_settings['speed'] = float(tts_speed_match.group(1))
        
        tts_tone_match = re.search(r'tone:\s*"([^"]+)"', scene_content)
        if tts_tone_match:
            tts_settings['tone'] = tts_tone_match.group(1)
        
        # Extract pauses
        pauses_matches = re.findall(r'-\s*"([^"]+)"', scene_content)
        tts_pauses_match = re.search(r'pauses:\s*\n((?:\s*-\s*"[^"]+"\s*\n?)+)', scene_content)
        if tts_pauses_match:
            tts_settings['pauses'] = pauses_matches
        
        # Extract duration
        duration_match = re.search(r'duration:\s*"([^"]+)"', scene_content)
        duration = duration_match.group(1) if duration_match else "5s"
        
        scenes.append({
            'scene_number': scene_num,
            'narration': narration,
            'tts_settings': tts_settings,
            'duration': duration
        })
    
    return scenes


def extract_all_narration(script_path: str, join_scenes: bool = True) -> str:
    """
    Extract all narration text from unified script.
    
    Args:
        script_path: Path to unified script file
        join_scenes: If True, join all scenes with pauses. If False, return only first scene.
    
    Returns:
        Combined narration text ready for TTS
    """
    scenes = parse_unified_script(script_path)
    
    if not scenes:
        return ""
    
    if join_scenes:
        # Join all narrations with natural pauses
        narrations = []
        for scene in scenes:
            narration = scene['narration']
            # Add small pause between scenes (except last)
            if scene['scene_number'] < len(scenes):
                narration += "... "  # Natural pause marker
            narrations.append(narration)
        
        return "\n".join(narrations)
    else:
        # Return only first scene (for testing)
        return scenes[0]['narration']


def get_tts_settings(script_path: str, scene_number: Optional[int] = None) -> Dict:
    """
    Get TTS settings from unified script.
    If scene_number is None, returns settings from first scene.
    """
    scenes = parse_unified_script(script_path)
    
    if not scenes:
        return {'speed': 1.05, 'tone': 'Educational and energetic', 'pauses': []}
    
    if scene_number is None:
        return scenes[0]['tts_settings']
    
    # Find specific scene
    for scene in scenes:
        if scene['scene_number'] == scene_number:
            return scene['tts_settings']
    
    # Default if scene not found
    return scenes[0]['tts_settings']






