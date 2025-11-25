"""
Script cleaner utility module.
Removes video script section headers (HOOK, INTRO, MAIN CONTENT, etc.)
and markdown formatting before TTS generation.
"""

import re

# Video script section headers to remove
SECTION_HEADERS = [
    r'^\*\*?HOOK\*\*?\s*$',
    r'^HOOK\s*$',
    r'^\*\*?INTRO\*\*?\s*$',
    r'^INTRO\s*$',
    r'^\*\*?MAIN CONTENT\*\*?\s*$',
    r'^MAIN CONTENT\s*$',
    r'^\*\*?EXAMPLE\*\*?\s*$',
    r'^EXAMPLE\s*$',
    r'^\*\*?SUMMARY\*\*?\s*$',
    r'^SUMMARY\s*$',
    r'^\*\*?CTA\*\*?\s*$',
    r'^CTA\s*$',
    r'^\*\*?CONCLUSION\*\*?\s*$',
    r'^CONCLUSION\s*$',
]


def clean_script_text(text):
    """
    Cleans video script text by removing section headers and markdown formatting.
    
    @param text Raw script text with headers and markdown
    @return Cleaned text ready for TTS
    """
    if not text:
        return text
    
    lines = text.split('\n')
    cleaned_lines = []
    
    for line in lines:
        # Check if line is a section header
        is_header = False
        for header_pattern in SECTION_HEADERS:
            if re.match(header_pattern, line, re.IGNORECASE):
                is_header = True
                break
        
        # Skip section headers
        if is_header:
            continue
        
        # Remove markdown bold formatting (**text** -> text)
        line = re.sub(r'\*\*([^*]+)\*\*', r'\1', line)
        line = re.sub(r'\*([^*]+)\*', r'\1', line)
        
        # Remove markdown code blocks (```code``` -> code)
        line = re.sub(r'```[^`]*```', '', line)
        
        # Remove markdown inline code (`code` -> code)
        line = re.sub(r'`([^`]+)`', r'\1', line)
        
        # Remove horizontal rules (---)
        if re.match(r'^---+$', line):
            continue
        
        # Remove markdown links ([text](url) -> text)
        line = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', line)
        
        # Clean up extra whitespace but keep line structure
        line = line.strip()
        
        # Add line if not empty
        if line:
            cleaned_lines.append(line)
    
    # Join lines and clean up multiple blank lines
    cleaned_text = '\n'.join(cleaned_lines)
    cleaned_text = re.sub(r'\n{3,}', '\n\n', cleaned_text)
    
    return cleaned_text.strip()


def clean_script_file(input_path, output_path=None):
    """
    Reads a script file, cleans it, and optionally saves to output path.
    If output_path is None, returns cleaned text without saving.
    
    @param input_path Path to input script file
    @param output_path Optional path to save cleaned script
    @return Cleaned text content
    """
    with open(input_path, 'r', encoding='utf-8') as f:
        raw_text = f.read()
    
    cleaned_text = clean_script_text(raw_text)
    
    if output_path:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(cleaned_text)
        print(f"[ScriptCleaner] Cleaned script saved to: {output_path}")
    
    return cleaned_text


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python script_cleaner.py <input_file> [output_file]")
        print("\nIf output_file is not provided, cleaned text will be printed to stdout.")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    cleaned = clean_script_file(input_file, output_file)
    
    if not output_file:
        print(cleaned)






