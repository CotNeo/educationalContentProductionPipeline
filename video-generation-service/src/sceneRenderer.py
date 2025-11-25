"""
Professional Scene Renderer for cinematic educational videos.
Creates high-quality visual elements for each scene.
"""

from PIL import Image, ImageDraw, ImageFont
import math
import os
from typing import Tuple, Optional, List, Dict
from unifiedScriptParser import Scene, CodeBlock


# Professional color palette (blue/teal tech tones)
COLORS = {
    'bg_dark': (15, 23, 42),        # Deep navy
    'bg_dark_gradient_start': (15, 23, 42),
    'bg_dark_gradient_end': (30, 41, 59),
    'bg_light': (241, 245, 249),    # Light gray
    'bg_light_gradient_start': (241, 245, 249),
    'bg_light_gradient_end': (226, 232, 240),
    'primary': (59, 130, 246),      # Blue
    'primary_light': (96, 165, 250),
    'primary_dark': (37, 99, 235),
    'accent': (20, 184, 166),       # Teal
    'accent_light': (94, 234, 212),
    'text_light': (248, 250, 252),  # Almost white
    'text_dark': (15, 23, 42),      # Dark navy
    'code_bg': (30, 41, 59),        # Code editor dark
    'code_bg_light': (255, 255, 255),
    'code_text': (203, 213, 225),   # Light gray for code
    'code_keyword': (139, 92, 246), # Purple
    'code_string': (34, 197, 94),   # Green
    'code_comment': (107, 114, 128), # Gray
    'shadow': (0, 0, 0, 180),       # Semi-transparent black
}

VIDEO_WIDTH = 1920
VIDEO_HEIGHT = 1080
FPS = 30


def create_gradient_background(
    width: int,
    height: int,
    start_color: Tuple[int, int, int],
    end_color: Tuple[int, int, int],
    direction: str = "vertical"
) -> Image.Image:
    """Create a smooth gradient background."""
    img = Image.new('RGB', (width, height))
    pixels = img.load()
    
    if direction == "vertical":
        for y in range(height):
            ratio = y / height
            r = int(start_color[0] * (1 - ratio) + end_color[0] * ratio)
            g = int(start_color[1] * (1 - ratio) + end_color[1] * ratio)
            b = int(start_color[2] * (1 - ratio) + end_color[2] * ratio)
            for x in range(width):
                pixels[x, y] = (r, g, b)
    else:  # horizontal
        for x in range(width):
            ratio = x / width
            r = int(start_color[0] * (1 - ratio) + end_color[0] * ratio)
            g = int(start_color[1] * (1 - ratio) + end_color[1] * ratio)
            b = int(start_color[2] * (1 - ratio) + end_color[2] * ratio)
            for y in range(height):
                pixels[x, y] = (r, g, b)
    
    return img


def get_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    """Get font with fallback."""
    try:
        if bold:
            return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size)
        return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", size)
    except:
        try:
            if bold:
                return ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", size)
            return ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", size)
        except:
            return ImageFont.load_default()


def render_code_editor(
    code: str,
    width: int = VIDEO_WIDTH,
    height: int = VIDEO_HEIGHT,
    dark_mode: bool = True,
    highlight_line: int = -1
) -> Image.Image:
    """
    Render code block in a professional code editor style.
    """
    # Create background
    if dark_mode:
        bg = create_gradient_background(
            width, height,
            COLORS['code_bg'],
            COLORS['bg_dark']
        )
        text_color = COLORS['code_text']
    else:
        bg = Image.new('RGB', (width, height), COLORS['code_bg_light'])
        text_color = COLORS['text_dark']
    
    draw = ImageDraw.Draw(bg)
    
    # Code editor mockup frame
    editor_x = width // 8
    editor_y = height // 6
    editor_w = width * 3 // 4
    editor_h = height * 2 // 3
    
    # Draw editor window with shadow
    shadow_offset = 8
    draw.rectangle(
        [editor_x + shadow_offset, editor_y + shadow_offset, 
         editor_x + editor_w + shadow_offset, editor_y + editor_h + shadow_offset],
        fill=(0, 0, 0, 200)
    )
    
    # Editor background
    editor_bg = COLORS['code_bg'] if dark_mode else COLORS['code_bg_light']
    draw.rectangle(
        [editor_x, editor_y, editor_x + editor_w, editor_y + editor_h],
        fill=editor_bg,
        outline=COLORS['primary'],
        width=2
    )
    
    # Title bar
    draw.rectangle(
        [editor_x, editor_y, editor_x + editor_w, editor_y + 50],
        fill=COLORS['primary_dark'] if dark_mode else COLORS['primary_light']
    )
    
    # Title bar dots (macOS style)
    for i, dot_color in enumerate([(255, 95, 87), (255, 189, 46), (40, 201, 64)]):
        draw.ellipse(
            [editor_x + 20 + i * 25, editor_y + 20, editor_x + 35 + i * 25, editor_y + 35],
            fill=dot_color
        )
    
    # Render code with syntax highlighting
    font = get_font(32)
    line_height = 50
    y_pos = editor_y + 80
    
    lines = code.strip().split('\n')
    for line_num, line in enumerate(lines[:15]):  # Limit to 15 lines
        if line_num == highlight_line:
            # Highlight current line
            draw.rectangle(
                [editor_x + 10, y_pos - 5, editor_x + editor_w - 10, y_pos + line_height - 10],
                fill=(59, 130, 246, 30)
            )
        
        # Simple syntax highlighting
        if line.strip().startswith('//'):
            # Comment
            draw.text(
                (editor_x + 30, y_pos),
                line,
                fill=COLORS['code_comment'],
                font=font
            )
        elif 'function' in line or 'let' in line or 'const' in line:
            # Keywords
            words = line.split()
            x_offset = editor_x + 30
            for word in words:
                if word in ['function', 'let', 'const', 'return', 'if', 'else']:
                    draw.text((x_offset, y_pos), word, fill=COLORS['code_keyword'], font=font)
                elif word.startswith('"') or word.startswith("'") or word.startswith('`'):
                    draw.text((x_offset, y_pos), word, fill=COLORS['code_string'], font=font)
                else:
                    draw.text((x_offset, y_pos), word, fill=text_color, font=font)
                x_offset += font.getlength(word) + 10
        else:
            draw.text(
                (editor_x + 30, y_pos),
                line,
                fill=text_color,
                font=font
            )
        
        y_pos += line_height
    
    return bg


def render_title_card(
    title: str,
    subtitle: Optional[str] = None,
    width: int = VIDEO_WIDTH,
    height: int = VIDEO_HEIGHT,
    style: str = "modern"
) -> Image.Image:
    """
    Render a professional title card with properly word-wrapped, centered text.
    """
    # Create background based on style
    if "dark" in style.lower():
        bg = create_gradient_background(
            width, height,
            COLORS['bg_dark_gradient_start'],
            COLORS['bg_dark_gradient_end']
        )
        text_color = COLORS['text_light']
    else:
        bg = create_gradient_background(
            width, height,
            COLORS['bg_light_gradient_start'],
            COLORS['bg_light_gradient_end']
        )
        text_color = COLORS['text_dark']
    
    draw = ImageDraw.Draw(bg)
    
    # Clean and shorten title - MAX 3 words, MAX 30 chars
    title_clean = title.strip()
    words = title_clean.split()[:3]  # First 3 words only
    title_clean = ' '.join(words)
    if len(title_clean) > 30:
        title_clean = title_clean[:27] + "..."
    
    # Main title with proper word wrapping and margins
    title_font = get_font(68, bold=True)  # Smaller for better fit
    max_title_width = width - 400  # More margin (200px each side)
    
    # Word wrap title properly
    title_words = title_clean.split()
    title_lines = []
    current_line = ""
    
    for word in title_words:
        test_line = current_line + " " + word if current_line else word
        if draw.textlength(test_line, font=title_font) <= max_title_width:
            current_line = test_line
        else:
            if current_line:
                title_lines.append(current_line)
            current_line = word
    if current_line:
        title_lines.append(current_line)
    
    # Limit to 2 lines max
    title_lines = title_lines[:2]
    
    # Calculate total height of title
    line_height = 95
    total_title_height = len(title_lines) * line_height
    
    # Center vertically (considering subtitle space at bottom)
    title_start_y = (height - total_title_height - 200) // 2  # Leave space for subtitle
    
    # Draw title lines with shadow - properly centered
    for i, line in enumerate(title_lines):
        line_bbox = draw.textbbox((0, 0), line, font=title_font)
        line_w = line_bbox[2] - line_bbox[0]
        line_x = (width - line_w) // 2  # Perfect center
        line_y = title_start_y + i * line_height
        
        # Shadow effect for depth
        for offset in [(3, 3), (2, 2), (1, 1)]:
            draw.text(
                (line_x + offset[0], line_y + offset[1]),
                line,
                fill=(0, 0, 0, 120),
                font=title_font
            )
        
        # Main text - centered
        draw.text(
            (line_x, line_y),
            line,
            fill=COLORS['primary'],
            font=title_font
        )
    
    # No subtitle on title card - subtitle will be shown in bottom bar only
    return bg


def render_diagram(
    diagram_type: str,
    elements: List[Dict],
    width: int = VIDEO_WIDTH,
    height: int = VIDEO_HEIGHT
) -> Image.Image:
    """
    Render a minimal, animated diagram.
    """
    # Light background for diagrams
    bg = create_gradient_background(
        width, height,
        COLORS['bg_light_gradient_start'],
        COLORS['bg_light_gradient_end']
    )
    
    draw = ImageDraw.Draw(bg)
    
    # Draw flowchart-style diagram
    if diagram_type == "flowchart":
        # Example: Simple flowchart
        box_width = 300
        box_height = 100
        start_x = width // 4
        y = height // 3
        
        boxes = [
            {"label": "Event", "x": start_x, "y": y},
            {"label": "Handler", "x": start_x + box_width + 100, "y": y},
            {"label": "Action", "x": start_x + (box_width + 100) * 2, "y": y},
        ]
        
        for box in boxes:
            # Box with rounded corners effect
            draw.rectangle(
                [box['x'], box['y'], box['x'] + box_width, box['y'] + box_height],
                fill=COLORS['primary'],
                outline=COLORS['primary_dark'],
                width=3
            )
            
            # Label
            font = get_font(36, bold=True)
            label_bbox = draw.textbbox((0, 0), box['label'], font=font)
            label_w = label_bbox[2] - label_bbox[0]
            label_x = box['x'] + (box_width - label_w) // 2
            label_y = box['y'] + (box_height - (label_bbox[3] - label_bbox[1])) // 2
            
            draw.text(
                (label_x, label_y),
                box['label'],
                fill=COLORS['text_light'],
                font=font
            )
            
            # Arrow to next
            if boxes.index(box) < len(boxes) - 1:
                arrow_x = box['x'] + box_width
                arrow_y = box['y'] + box_height // 2
                next_x = boxes[boxes.index(box) + 1]['x']
                next_y = boxes[boxes.index(box) + 1]['y'] + box_height // 2
                
                # Arrow line
                draw.line(
                    [(arrow_x, arrow_y), (next_x - 20, next_y)],
                    fill=COLORS['primary_dark'],
                    width=4
                )
                # Arrow head
                draw.polygon(
                    [(next_x - 20, next_y), (next_x - 40, next_y - 15), (next_x - 40, next_y + 15)],
                    fill=COLORS['primary_dark']
                )
    
    return bg


def render_text_overlay(
    narration: str,
    visual_description: str = "",
    width: int = VIDEO_WIDTH,
    height: int = VIDEO_HEIGHT,
    style: str = "bullet"
) -> Image.Image:
    """
    Render clean text overlay for summaries/CTAs with proper word wrapping.
    """
    # Light background
    bg = create_gradient_background(
        width, height,
        COLORS['bg_light_gradient_start'],
        COLORS['bg_light_gradient_end']
    )
    
    draw = ImageDraw.Draw(bg)
    
    # Extract bullet points from visual description if available
    bullet_items = []
    
    if visual_description:
        import re
        # Look for bullet points in visual description (- Use, - Modular, etc.)
        bullet_matches = re.findall(r'[-•]\s*([^\n]+)', visual_description)
        if bullet_matches:
            bullet_items = [b.strip() for b in bullet_matches[:6]]
    
    # If no bullets in visual, extract from narration
    if not bullet_items:
        # Split narration by sentences
        sentences = narration.split('.')
        for sent in sentences[:4]:  # Max 4 items
            sent = sent.strip()
            if sent and len(sent) > 5:
                bullet_items.append(sent)
    
    # Limit to 5 items max
    bullet_items = bullet_items[:5]
    
    # Professional spacing and positioning
    y_start = height // 3  # Start higher for better balance
    line_height = 90  # More spacing between lines
    font = get_font(44, bold=False)  # Slightly smaller for better fit
    bullet_size = 12
    max_text_width = width - 400  # More margin for word wrapping
    left_margin = width // 6
    
    for i, item in enumerate(bullet_items):
        if i >= 5:  # Safety limit
            break
            
        item = item.strip()
        if not item:
            continue
        
        # Word wrap item text if too long
        words = item.split()
        wrapped_lines = []
        current_wrapped = ""
        
        for word in words:
            test_line = current_wrapped + " " + word if current_wrapped else word
            if draw.textlength(test_line, font=font) <= max_text_width:
                current_wrapped = test_line
            else:
                if current_wrapped:
                    wrapped_lines.append(current_wrapped)
                current_wrapped = word
        if current_wrapped:
            wrapped_lines.append(current_wrapped)
        
        # Draw bullet point
        bullet_y = y_start + i * line_height + (len(wrapped_lines) - 1) * 45
        draw.ellipse(
            [left_margin - 30, bullet_y + 10,
             left_margin - 10, bullet_y + 30],
            fill=COLORS['primary']
        )
        
        # Draw wrapped text lines
        for j, wrapped_line in enumerate(wrapped_lines[:2]):  # Max 2 lines per item
            text_y = y_start + i * line_height + j * 45
            
            # Text shadow for readability
            draw.text(
                (left_margin + 3, text_y + 3),
                wrapped_line,
                fill=(200, 200, 200, 150),
                font=font
            )
            # Main text
            draw.text(
                (left_margin, text_y),
                wrapped_line,
                fill=COLORS['text_dark'],
                font=font
            )
    
    return bg


def render_narration_subtitle(
    narration: str,
    bg: Image.Image,
    frame_time: float = 0.0
) -> Image.Image:
    """
    Render narration text as subtitle at bottom of screen.
    """
    # Clean narration text professionally
    text = narration.strip()
    # Remove code markers but keep readability
    text = text.replace('`', '')
    # Clean extra spaces
    text = ' '.join(text.split())
    
    # Professional subtitle: Show full narration, properly word-wrapped
    # Limit only if extremely long (150+ chars)
    if len(text) > 150:
        # Split by sentences and take first 2
        sentences = text.split('.')
        if len(sentences) > 2:
            text = '. '.join(sentences[:2]).strip()
            if text and not text.endswith('.'):
                text += '.'
        else:
            text = text[:147] + "..."
    
    # Subtitle box at bottom - professional size and spacing
    subtitle_bg_height = 140
    subtitle_y = VIDEO_HEIGHT - subtitle_bg_height - 60  # More margin from bottom
    
    # Semi-transparent dark background for subtitle
    subtitle_overlay = Image.new('RGBA', (VIDEO_WIDTH, subtitle_bg_height), (0, 0, 0, 200))
    bg_rgba = bg.convert('RGBA')
    bg_rgba.paste(subtitle_overlay, (0, subtitle_y), subtitle_overlay)
    bg = bg_rgba.convert('RGB')
    draw = ImageDraw.Draw(bg)
    
    # Professional subtitle font - slightly smaller for better fit
    font = get_font(38, bold=False)
    
    # Word wrap with proper margins (150px each side = 300px total margin)
    words = text.split()
    lines = []
    current_line = ""
    max_width = VIDEO_WIDTH - 300  # Professional margins
    
    for word in words:
        test_line = current_line + " " + word if current_line else word
        if draw.textlength(test_line, font=font) <= max_width:
            current_line = test_line
        else:
            if current_line:
                lines.append(current_line)
            current_line = word
    if current_line:
        lines.append(current_line)
    
    # Limit to 3 lines max (professional standard)
    if len(lines) > 3:
        lines = lines[:3]
    
    # Draw lines centered with proper spacing
    line_height = 48
    total_height = len(lines) * line_height
    start_y = subtitle_y + (subtitle_bg_height - total_height) // 2
    
    for i, line in enumerate(lines):
        if i >= 3:  # Safety limit
            break
            
        line_bbox = draw.textbbox((0, 0), line, font=font)
        line_w = line_bbox[2] - line_bbox[0]
        line_x = (VIDEO_WIDTH - line_w) // 2
        line_y = start_y + i * line_height
        
        # Professional text shadow for readability
        for offset in [(2, 2), (1, 1)]:
            draw.text(
                (line_x + offset[0], line_y + offset[1]), 
                line, 
                fill=(0, 0, 0, 180), 
                font=font
            )
        
        # Main text - crisp white
        draw.text((line_x, line_y), line, fill=COLORS['text_light'], font=font)
    
    return bg


def render_scene_base(scene: Scene, frame_time: float = 0.0) -> Image.Image:
    """
    Render base frame for a scene based on visual description.
    Professional rendering: visual description matches what's shown.
    Subtitle shown only in bottom bar, not duplicated on screen.
    """
    # Determine background from video_settings
    bg_type = scene.video_settings.background.lower()
    
    if "dark" in bg_type:
        bg = create_gradient_background(
            VIDEO_WIDTH, VIDEO_HEIGHT,
            COLORS['bg_dark_gradient_start'],
            COLORS['bg_dark_gradient_end']
        )
    elif "light" in bg_type:
        bg = create_gradient_background(
            VIDEO_WIDTH, VIDEO_HEIGHT,
            COLORS['bg_light_gradient_start'],
            COLORS['bg_light_gradient_end']
        )
    else:
        bg = create_gradient_background(
            VIDEO_WIDTH, VIDEO_HEIGHT,
            COLORS['bg_dark_gradient_start'],
            COLORS['bg_dark_gradient_end']
        )
    
    draw = ImageDraw.Draw(bg)
    visual_lower = scene.visual.lower()
    
    # Render based on visual description - priority order matters!
    # Check text overlay FIRST (before code) to handle scene 8, 9 correctly
    
    # Priority order: Text overlay > Code > Diagram > Title card > Logo > Default
    
    # 1. Text/bullet overlay scenes (scene 8, 9) - MUST check first
    if ("text overlay" in visual_lower or ("bullet" in visual_lower and "code" not in visual_lower)) and not scene.code:
        text_img = render_text_overlay(scene.narration, scene.visual)
        bg.paste(text_img, (0, 0))
    
    # 2. Code scenes - must have actual code block
    elif scene.code and ("code" in visual_lower or scene.code):
        code_img = render_code_editor(
            scene.code.content,
            dark_mode="dark" in bg_type or "light" not in bg_type
        )
        bg.paste(code_img, (0, 0))
    
    # 3. Diagram/flowchart scenes (scene 5, 6)
    elif "diagram" in visual_lower or "flowchart" in visual_lower:
        diagram_img = render_diagram("flowchart", [])
        bg.paste(diagram_img, (0, 0))
    
    # 4. Title card scenes (scene 2)
    elif ("title" in visual_lower or "card" in visual_lower) and "text overlay" not in visual_lower:
        title = "JavaScript"  # Default
        if "javascript" in visual_lower:
            title = "JavaScript"
        elif scene.narration:
            first_sentence = scene.narration.split('.')[0].strip()
            words = first_sentence.split()[:3]
            title = ' '.join(words)
            if len(title) > 30:
                title = title[:27] + "..."
        title_img = render_title_card(title, style=scene.video_settings.mood)
        bg.paste(title_img, (0, 0))
    
    # 5. Logo/animation scenes (scene 1) - ABSOLUTELY NO TEXT, just background
    elif "logo" in visual_lower or ("animated" in visual_lower and "diagram" not in visual_lower and "text" not in visual_lower):
        # Clean minimal: Just background, NO text on screen (subtitle only)
        pass
    
    # 6. Default: Clean background, NO text
    else:
        pass
    
    # Always add narration as subtitle at bottom (ONLY place for narration text)
    if scene.narration:
        bg = render_narration_subtitle(scene.narration, bg, frame_time)
    
    return bg

