"""
Animated scene renderer with professional animations matching script descriptions.
Creates frame-by-frame animations for logos, geometric shapes, and transitions.
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math
from typing import Tuple, Optional
from sceneRenderer import VIDEO_WIDTH, VIDEO_HEIGHT, COLORS, get_font, create_gradient_background
from unifiedScriptParser import Scene


def create_glow_effect(
    img: Image.Image,
    glow_intensity: float = 1.0,
    glow_color: Tuple[int, int, int] = (59, 130, 246)
) -> Image.Image:
    """Create a glow effect around an image."""
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Simpler glow: draw colored circles around text
    glow_img = Image.new('RGBA', img.size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    
    # Draw glow circles (simpler and faster)
    center_x, center_y = img.width // 2, img.height // 2
    for radius in range(50, 5, -5):
        alpha = int(30 * glow_intensity * (1 - radius/50))
        glow_color_alpha = glow_color + (alpha,)
        glow_draw.ellipse(
            [(center_x - radius, center_y - radius),
             (center_x + radius, center_y + radius)],
            fill=glow_color_alpha,
            outline=glow_color_alpha
        )
    
    # Composite glow with original
    result = Image.alpha_composite(glow_img, img)
    return result


def render_animated_js_logo(
    frame_time: float,
    width: int = VIDEO_WIDTH,
    height: int = VIDEO_HEIGHT
) -> Image.Image:
    """
    Render animated JavaScript logo with glow effect.
    Logo spins slowly with pulsing glow.
    """
    # Dark gradient background
    bg = create_gradient_background(
        width, height,
        COLORS['bg_dark_gradient_start'],
        COLORS['bg_dark_gradient_end']
    )
    
    draw = ImageDraw.Draw(bg)
    
    # Calculate rotation based on frame time (slow spin: 360 degrees over 8 seconds)
    rotation = (frame_time / 8.0) * 360 % 360
    rotation_rad = math.radians(rotation)
    
    # Calculate glow intensity (pulsing: 0.5 to 1.0)
    glow_intensity = 0.5 + 0.5 * (math.sin(frame_time * 2) + 1) / 2
    
    # Logo center position
    center_x, center_y = width // 2, height // 2 - 100
    
    # Create JS logo as text (styled)
    logo_size = 180
    font = get_font(logo_size, bold=True)
    
    # Create JS text on transparent background for rotation
    logo_img = Image.new('RGBA', (300, 300), (0, 0, 0, 0))
    logo_draw = ImageDraw.Draw(logo_img)
    
    # Draw JS text
    text = "JS"
    logo_draw.text((50, 50), text, fill=(255, 220, 0, 255), font=font)  # Yellow JS
    
    # Apply glow to logo
    logo_glowed = create_glow_effect(logo_img.convert('RGB'), glow_intensity, COLORS['primary'])
    logo_glowed = logo_glowed.convert('RGBA')
    
    # Rotate logo
    logo_rotated = logo_glowed.rotate(-rotation, expand=False, fillcolor=(0, 0, 0, 0))
    
    # Paste rotated logo onto background
    logo_x = center_x - logo_rotated.width // 2
    logo_y = center_y - logo_rotated.height // 2
    
    # Create overlay for glow blending
    overlay = Image.new('RGBA', bg.size, (0, 0, 0, 0))
    overlay.paste(logo_rotated, (logo_x, logo_y), logo_rotated)
    
    # Composite with background
    bg_rgba = bg.convert('RGBA')
    result = Image.alpha_composite(bg_rgba, overlay)
    
    return result.convert('RGB')


def render_title_text_animation(
    text: str,
    frame_time: float,
    bg: Image.Image,
    animation_type: str = "from_bottom"
) -> Image.Image:
    """
    Render animated title text that appears from below.
    """
    draw = ImageDraw.Draw(bg)
    
    # Font for title
    title_font = get_font(72, bold=True)
    
    # Calculate animation progress (0 to 1 over 1.5 seconds)
    anim_progress = min(1.0, frame_time / 1.5)
    anim_progress = 1 - (1 - anim_progress) ** 3  # Ease-out cubic
    
    # Calculate text position (starts below screen, moves to center)
    text_bbox = draw.textbbox((0, 0), text, font=title_font)
    text_height = text_bbox[3] - text_bbox[1]
    
    target_y = VIDEO_HEIGHT // 2 - text_height // 2
    
    if animation_type == "from_bottom":
        start_y = VIDEO_HEIGHT + 100
        current_y = start_y - (start_y - target_y) * anim_progress
    else:
        current_y = target_y
    
    # Calculate opacity (fade in)
    opacity = min(255, int(255 * anim_progress))
    
    # Draw text with glow and opacity
    text_x = (VIDEO_WIDTH - (text_bbox[2] - text_bbox[0])) // 2
    
    # Shadow/glow layers
    for offset, alpha in [((3, 3), 100), ((2, 2), 150), ((1, 1), 200)]:
        shadow_overlay = Image.new('RGBA', bg.size, (0, 0, 0, 0))
        shadow_draw = ImageDraw.Draw(shadow_overlay)
        shadow_draw.text(
            (text_x + offset[0], int(current_y + offset[1])),
            text,
            fill=(59, 130, 246, int(alpha * opacity / 255)),
            font=title_font
        )
        bg = Image.alpha_composite(bg.convert('RGBA'), shadow_overlay)
    
    # Main text
    text_overlay = Image.new('RGBA', bg.size, (0, 0, 0, 0))
    text_draw = ImageDraw.Draw(text_overlay)
    text_draw.text(
        (text_x, int(current_y)),
        text,
        fill=(255, 255, 255, opacity),
        font=title_font
    )
    
    result = Image.alpha_composite(bg.convert('RGBA'), text_overlay)
    return result.convert('RGB')


def extract_title_from_scene(scene: Scene) -> str:
    """
    Extract title text from scene narration or visual description.
    """
    import re
    
    # Try to extract from visual description first (e.g., "animated 'MERN' text")
    visual = scene.visual
    quoted_match = re.search(r"'([A-Z][^']+)'", visual)
    if quoted_match:
        return quoted_match.group(1)
    
    # Try to extract capitalized words from visual
    caps_match = re.search(r'\b([A-Z]{2,})\b', visual)
    if caps_match:
        return caps_match.group(1)
    
    # Extract from narration - first few key words
    if scene.narration:
        # Remove quotes and clean
        narration_clean = scene.narration.replace('"', '').replace("'", "")
        # Get first sentence
        first_sentence = narration_clean.split('.')[0].strip()
        # Extract key capitalized words
        words = [w for w in first_sentence.split() if w[0].isupper() and len(w) > 2]
        if words:
            # Take first 2-3 words
            return ' '.join(words[:3])
    
    # Default fallback
    return "Topic"


def render_animated_logo_scene(
    scene: Scene,
    frame_time: float
) -> Image.Image:
    """
    Render Scene 1: Animated logo with glowing effects.
    Text appears from below as per script description.
    Extracts title from scene content dynamically.
    """
    # Render animated logo (generic, not JS-specific)
    bg = render_animated_js_logo(frame_time)
    
    # Extract title from scene content
    title_text = extract_title_from_scene(scene)
    
    # Only show text after 0.5 seconds
    if frame_time > 0.5:
        bg = render_title_text_animation(
            title_text,
            frame_time - 0.5,  # Offset animation start
            bg,
            animation_type="from_bottom"
        )
    
    return bg


def render_geometric_shapes_animation(
    scene: Scene,
    frame_time: float,
    width: int = VIDEO_WIDTH,
    height: int = VIDEO_HEIGHT
) -> Image.Image:
    """
    Render animated geometric shapes coming from corners with title text (Scene 2).
    """
    # Light gradient background
    bg = create_gradient_background(
        width, height,
        COLORS['bg_light_gradient_start'],
        COLORS['bg_light_gradient_end']
    )
    
    draw = ImageDraw.Draw(bg)
    
    # Shapes animation progress
    shapes_progress = min(1.0, frame_time / 2.0)
    shapes_progress = 1 - (1 - shapes_progress) ** 2  # Ease-out
    
    # Define shapes coming from corners
    shapes = [
        {"type": "circle", "center": (width // 4, height // 4), "radius": 80, "color": COLORS['primary']},
        {"type": "square", "center": (width * 3 // 4, height // 4), "size": 120, "color": COLORS['accent']},
        {"type": "triangle", "center": (width // 4, height * 3 // 4), "size": 100, "color": COLORS['primary_light']},
        {"type": "hexagon", "center": (width * 3 // 4, height * 3 // 4), "radius": 70, "color": COLORS['accent_light']},
    ]
    
    for shape in shapes:
        opacity = int(200 * shapes_progress)  # Slightly transparent
        center = shape["center"]
        
        start_positions = {
            (width // 4, height // 4): (-100, -100),
            (width * 3 // 4, height // 4): (width + 100, -100),
            (width // 4, height * 3 // 4): (-100, height + 100),
            (width * 3 // 4, height * 3 // 4): (width + 100, height + 100),
        }
        
        start = start_positions.get(center, (0, 0))
        current_x = start[0] + (center[0] - start[0]) * shapes_progress
        current_y = start[1] + (center[1] - start[1]) * shapes_progress
        
        shape_overlay = Image.new('RGBA', bg.size, (0, 0, 0, 0))
        shape_draw = ImageDraw.Draw(shape_overlay)
        color_with_alpha = shape["color"] + (opacity,)
        
        if shape["type"] == "circle":
            shape_draw.ellipse(
                [(current_x - shape["radius"], current_y - shape["radius"]),
                 (current_x + shape["radius"], current_y + shape["radius"])],
                fill=color_with_alpha
            )
        elif shape["type"] == "square":
            size = shape["size"]
            shape_draw.rectangle(
                [(current_x - size // 2, current_y - size // 2),
                 (current_x + size // 2, current_y + size // 2)],
                fill=color_with_alpha
            )
        elif shape["type"] == "triangle":
            size = shape["size"]
            points = [
                (current_x, current_y - size),
                (current_x - size, current_y + size),
                (current_x + size, current_y + size)
            ]
            shape_draw.polygon(points, fill=color_with_alpha)
        
        bg = Image.alpha_composite(bg.convert('RGBA'), shape_overlay)
    
    # Add title text that fades in one by one (as per script)
    if frame_time > 1.0:
        # Extract title from scene - use same function as logo scene
        title_text = extract_title_from_scene(scene)
        
        # If title is too long, truncate
        if len(title_text) > 30:
            title_text = title_text[:27] + "..."
        
        # Fade in text word by word
        text_progress = min(1.0, (frame_time - 1.0) / 3.0)
        
        # Split title into words and show progressively
        title_words = title_text.split()
        words_to_show = int(len(title_words) * text_progress)
        display_text = " ".join(title_words[:words_to_show])
        
        if display_text:
            title_font = get_font(64, bold=True)
            text_bbox = draw.textbbox((0, 0), display_text, font=title_font)
            text_w = text_bbox[2] - text_bbox[0]
            text_x = (width - text_w) // 2
            text_y = height // 2 - 50
            
            opacity = int(255 * min(1.0, text_progress * 2))
            text_overlay = Image.new('RGBA', bg.size, (0, 0, 0, 0))
            text_draw = ImageDraw.Draw(text_overlay)
            text_draw.text((text_x, text_y), display_text, fill=(59, 130, 246, opacity), font=title_font)
            bg = Image.alpha_composite(bg.convert('RGBA'), text_overlay)
    
    return bg.convert('RGB')


def render_animated_scene(
    scene: Scene,
    frame_time: float
) -> Image.Image:
    """
    Render scene with animations based on visual description.
    Returns animated frame for given frame_time.
    """
    visual_lower = scene.visual.lower()
    
    # Scene 1: Animated logo (any topic, not just JavaScript)
    if "logo" in visual_lower or ("animated" in visual_lower and "text" in visual_lower):
        return render_animated_logo_scene(scene, frame_time)
    
    # Scene 2: Geometric shapes animation with title
    if "geometric shapes" in visual_lower or ("title card" in visual_lower and "shapes" in visual_lower):
        return render_geometric_shapes_animation(scene, frame_time)
    
    # Default: static scene base
    from sceneRenderer import render_scene_base
    return render_scene_base(scene, frame_time)

