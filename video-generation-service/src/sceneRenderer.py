"""
Professional Scene Renderer for cinematic educational videos.
Creates high-quality visual elements for each scene.
"""

from PIL import Image, ImageDraw, ImageFont
import math
import os
import re
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


def extract_diagram_elements_from_scene(scene) -> List[Dict]:
    """
    Extract meaningful diagram elements from scene narration and visual description.
    Returns list of box labels for flowchart.
    """
    import re
    
    elements = []
    text = (scene.narration + " " + scene.visual).lower()
    
    # Pattern 1: Technology stack components (MERN, LAMP, etc.)
    stack_patterns = [
        r'(mongodb|express|react|node\.?js|mern)',
        r'(mysql|apache|php|python|django|flask)',
        r'(angular|vue|svelte)',
    ]
    
    # Pattern 2: Process flow keywords
    process_keywords = ['stores', 'handles', 'routes', 'manages', 'delivers', 'powers', 'creates', 'builds']
    
    # Pattern 3: Extract entities from narration (capitalized words, tech names)
    narration_upper = scene.narration
    # Find technology names and key concepts
    tech_names = re.findall(r'\b([A-Z][a-z]+(?:\.[a-z]+)?(?:\.js)?)\b', narration_upper)
    # Remove common words
    tech_names = [t for t in tech_names if t not in ['The', 'This', 'Let', 'Here', 'How', 'What', 'When', 'Where', 'Why']]
    
    # Pattern 4: Extract from visual description
    visual_lower = scene.visual.lower()
    if "circles" in visual_lower or "components" in visual_lower:
        # Try to extract component names
        component_match = re.search(r'(mongodb|express|react|node\.?js|mern)', visual_lower, re.IGNORECASE)
        if component_match:
            # Extract all mentioned technologies
            all_techs = re.findall(r'\b(mongodb|express\.?js|react|node\.?js|mern)\b', visual_lower, re.IGNORECASE)
            elements = [{"label": t.capitalize().replace('.js', '.js').replace('express', 'Express.js').replace('nodejs', 'Node.js')} for t in set(all_techs)]
    
    # Pattern 5: Extract flow from narration (X stores Y, X handles Z, etc.)
    if not elements:
        # Look for action patterns: "MongoDB stores data", "Express handles APIs"
        flow_pattern = re.findall(r'([A-Z][a-z]+(?:\.[a-z]+)?)\s+(stores|handles|routes|manages|delivers|powers|creates|builds)\s+([a-z\s]+)', narration_upper)
        if flow_pattern:
            for tech, action, obj in flow_pattern[:4]:  # Max 4 elements
                label = f"{tech}\n{action.capitalize()}\n{obj[:15]}"
                elements.append({"label": label})
    
    # Pattern 6: Extract from visual description explicitly
    if "flowchart" in visual_lower or "flow" in visual_lower:
        # Try to extract flow elements
        flow_match = re.search(r'(from\s+([A-Z][a-z]+)\s+to\s+([A-Z][a-z]+))', visual_lower)
        if flow_match:
            elements = [
                {"label": flow_match.group(2).capitalize()},
                {"label": flow_match.group(3).capitalize()}
            ]
    
    # Pattern 7: Use tech names found
    if not elements and tech_names:
        elements = [{"label": t} for t in tech_names[:4]]
    
    # Pattern 8: Fallback - extract key nouns from narration
    if not elements:
        # Extract capitalized words that might be entities
        nouns = re.findall(r'\b([A-Z][a-z]{3,})\b', narration_upper)
        nouns = [n for n in nouns if n not in ['The', 'This', 'Let', 'Here', 'How', 'What', 'When', 'Where', 'Why', 'Imagine', 'Scalability']]
        if nouns:
            elements = [{"label": n} for n in nouns[:4]]
    
    # Default fallback
    if not elements:
        # Extract first 3-4 key words from narration
        words = narration_upper.split()[:10]
        key_words = [w.capitalize() for w in words if len(w) > 4][:4]
        if key_words:
            elements = [{"label": w} for w in key_words]
    
    return elements[:4]  # Max 4 boxes


def render_diagram(
    diagram_type: str,
    elements: List[Dict],
    scene=None,
    width: int = VIDEO_WIDTH,
    height: int = VIDEO_HEIGHT
) -> Image.Image:
    """
    Render a dynamic diagram based on scene content.
    Extracts meaningful elements from scene narration and visual description.
    """
    # Light background for diagrams
    bg = create_gradient_background(
        width, height,
        COLORS['bg_light_gradient_start'],
        COLORS['bg_light_gradient_end']
    )
    
    draw = ImageDraw.Draw(bg)
    
    # Extract elements from scene if provided
    if scene and not elements:
        elements = extract_diagram_elements_from_scene(scene)
    
    # If still no elements, use default
    if not elements:
        elements = [
            {"label": "Input"},
            {"label": "Process"},
            {"label": "Output"}
        ]
    
    # Draw flowchart-style diagram
    if diagram_type == "flowchart" or not diagram_type:
        box_width = 280
        box_height = 120
        spacing = 80
        
        # Calculate total width needed
        total_width = len(elements) * box_width + (len(elements) - 1) * spacing
        start_x = (width - total_width) // 2
        y = height // 3
        
        boxes = []
        for i, elem in enumerate(elements):
            label = elem.get("label", f"Step {i+1}")
            # Truncate long labels
            if len(label) > 20:
                label = label[:17] + "..."
            boxes.append({
                "label": label,
                "x": start_x + i * (box_width + spacing),
                "y": y
            })
        
        for i, box in enumerate(boxes):
            # Box with rounded corners effect
            draw.rectangle(
                [box['x'], box['y'], box['x'] + box_width, box['y'] + box_height],
                fill=COLORS['primary'],
                outline=COLORS['primary_dark'],
                width=3
            )
            
            # Label - handle multi-line
            font = get_font(32, bold=True)
            label_lines = box['label'].split('\n')[:2]  # Max 2 lines
            line_height = 40
            
            for line_idx, line in enumerate(label_lines):
                label_bbox = draw.textbbox((0, 0), line, font=font)
                label_w = label_bbox[2] - label_bbox[0]
                label_x = box['x'] + (box_width - label_w) // 2
                label_y = box['y'] + (box_height - len(label_lines) * line_height) // 2 + line_idx * line_height
                
                draw.text(
                    (label_x, label_y),
                    line,
                    fill=COLORS['text_light'],
                    font=font
                )
            
            # Arrow to next
            if i < len(boxes) - 1:
                arrow_x = box['x'] + box_width
                arrow_y = box['y'] + box_height // 2
                next_x = boxes[i + 1]['x']
                next_y = boxes[i + 1]['y'] + box_height // 2
                
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
        
        # Also look for numbered lists
        numbered_matches = re.findall(r'\d+\.\s*([^\n]+)', visual_description)
        if numbered_matches:
            bullet_items.extend([b.strip() for b in numbered_matches[:6]])
    
    # If no bullets in visual, extract key concepts from narration
    if not bullet_items:
        import re
        # Extract key phrases: "X does Y", "X is Y", "X provides Y"
        key_phrases = re.findall(r'([A-Z][a-z]+(?:\.[a-z]+)?)\s+(stores|handles|routes|manages|delivers|powers|creates|builds|is|provides|offers|enables)\s+([^.,]+)', narration)
        if key_phrases:
            for tech, action, obj in key_phrases[:5]:
                bullet_items.append(f"{tech} {action} {obj.strip()}")
        
        # If still no items, extract meaningful sentences
        if not bullet_items:
            sentences = narration.split('.')
            for sent in sentences[:5]:  # Max 5 items
                sent = sent.strip()
                # Filter out very short or meaningless sentences
                if sent and len(sent) > 10 and not sent.lower().startswith(('imagine', 'let', 'here', 'now')):
                    # Clean up: remove quotes, extra spaces
                    sent = re.sub(r'^["\']|["\']$', '', sent).strip()
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
    # More flexible matching to handle various visual descriptions
    
    # Priority order: Code > Text overlay > Diagram > Title card > Logo > Default (text overlay)
    
    # 1. Code scenes - must have actual code block OR "code" in visual description
    if scene.code or ("code" in visual_lower and ("snippet" in visual_lower or "appears" in visual_lower)):
        if scene.code:
            code_img = render_code_editor(
                scene.code.content,
                dark_mode="dark" in bg_type or "light" not in bg_type
            )
            bg.paste(code_img, (0, 0))
        else:
            # Code mentioned but no code block - show placeholder or text overlay
            text_img = render_text_overlay(scene.narration, scene.visual)
            bg.paste(text_img, (0, 0))
    
    # 2. Text/bullet overlay scenes - bullet points, infographic, tips
    elif ("text overlay" in visual_lower or 
          "bullet" in visual_lower or 
          "infographic" in visual_lower or 
          "tips" in visual_lower or
          "optimization" in visual_lower):
        text_img = render_text_overlay(scene.narration, scene.visual)
        bg.paste(text_img, (0, 0))
    
    # 3. Diagram/flowchart scenes - flowchart, diagram, circles, panels, scale
    elif ("diagram" in visual_lower or 
          "flowchart" in visual_lower or 
          "circles" in visual_lower or 
          "panels" in visual_lower or
          "scale" in visual_lower or
          "arrows" in visual_lower or
          "flow" in visual_lower):
        # Pass scene to extract meaningful diagram elements from narration
        diagram_img = render_diagram("flowchart", [], scene=scene)
        bg.paste(diagram_img, (0, 0))
    
    # 4. Title card scenes
    elif ("title" in visual_lower or "card" in visual_lower):
        title = "MERN Stack"  # Default
        if "mern" in visual_lower:
            title = "MERN Stack"
        elif "javascript" in visual_lower:
            title = "JavaScript"
        elif scene.narration:
            first_sentence = scene.narration.split('.')[0].strip()
            words = first_sentence.split()[:3]
            title = ' '.join(words)
            if len(title) > 30:
                title = title[:27] + "..."
        title_img = render_title_card(title, style=scene.video_settings.mood)
        bg.paste(title_img, (0, 0))
    
    # 5. Logo/animation scenes - logo, animated text (but not if it's just text overlay)
    elif ("logo" in visual_lower or 
          ("animated" in visual_lower and "text" in visual_lower and "logo" not in visual_lower)):
        # For animated text without logo, show title card instead
        if "animated" in visual_lower and "text" in visual_lower:
            # Extract title from narration or visual
            title = "MERN"
            if "mern" in visual_lower:
                # Try to extract MERN from visual description
                mern_match = re.search(r"'?([A-Z]{4,})'?", visual_lower)
                if mern_match:
                    title = mern_match.group(1).upper()
            title_img = render_title_card(title, style=scene.video_settings.mood)
            bg.paste(title_img, (0, 0))
        else:
            # Just logo - minimal background
            pass
    
    # 6. Screenshots/images scenes - show text overlay with narration
    elif ("screenshot" in visual_lower or "image" in visual_lower or "app" in visual_lower):
        text_img = render_text_overlay(scene.narration, scene.visual)
        bg.paste(text_img, (0, 0))
    
    # 7. Call-to-action scenes - show text overlay
    elif ("call-to-action" in visual_lower or "button" in visual_lower or "cta" in visual_lower):
        text_img = render_text_overlay(scene.narration, scene.visual)
        bg.paste(text_img, (0, 0))
    
    # 8. Default: Show text overlay for any other case (better than blank screen)
    else:
        text_img = render_text_overlay(scene.narration, scene.visual)
        bg.paste(text_img, (0, 0))
    
    # Always add narration as subtitle at bottom (ONLY place for narration text)
    if scene.narration:
        bg = render_narration_subtitle(scene.narration, bg, frame_time)
    
    return bg

