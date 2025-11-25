# PDF Service

Service to convert markdown articles to PDF format.

## Installation

```bash
npm install
```

## Usage

### Convert All Articles

Converts all markdown files in `article-generation/articles` directory:

```bash
npm run convert
```

### Convert Single Article

Converts a specific markdown file:

```bash
npm run convert:single solid.md
```

## Output

PDF files are saved in the `output/` directory with the same name as the source markdown file (with `.pdf` extension).

## Structure

```
pdf-service/
├── src/
│   ├── index.js          # Main script (converts all articles)
│   ├── convertSingle.js  # Single file converter
│   └── pdfConverter.js   # Core conversion service
├── output/               # Generated PDF files
└── package.json
```

## Features

- Converts markdown to PDF with custom styling
- Handles multiple files
- Creates output directory if it doesn't exist
- Comprehensive logging for debugging







