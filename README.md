# LINEFORGE

> Document-to-CAD line art, image-to-3D model, and AI video guide generator.

Built at **HackCU 2026**.

---

## Features

### Pipeline Builder (`/`)
Drag-and-drop workflow composer. Chain up to 3 processing blocks (line art conversion, 3D generation, video guide, captioning, SVG vectorization) into a single pipeline. Upload an image and execute.

### Doc2CAD (`/doc2cad`)
Upload a document (PDF, DOCX, Markdown, HTML, or image) and convert all embedded images into engineering-style line art. Optionally generate technical captions and SVG vector output. Download the reassembled document with processed images.

### Image to 3D (`/image2stl`)
Upload an image and generate a 3D model via Meshy.ai. Real-time progress polling with before/after preview. Download as GLB.

### Video Guide (`/video`)
Upload an image and generate a cinematic multi-angle video guide using Google Veo 3.1. Customizable prompt. Download as MP4.

### Try with Example
All upload areas include a "Try with example" button that loads a sample image so you can test features without uploading your own files.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| AI - Image/Text | Google Gemini API (`@google/genai`) |
| AI - Video | Google Veo 3.1 |
| AI - 3D | Meshy.ai |
| Document parsing | `pdf-parse`, `mammoth`, `cheerio`, `remark` |
| Image processing | `sharp`, `potrace` |
| 3D rendering | Three.js |
| Animations | anime.js |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set environment variables

Create a `.env.local` file:

```env
GEMINI_API_KEY=your_google_gemini_api_key
MESHY_API_KEY=your_meshy_api_key
```

- **GEMINI_API_KEY** — Get one at [Google AI Studio](https://aistudio.google.com/apikey)
- **MESHY_API_KEY** — Get one at [Meshy.ai](https://www.meshy.ai/)

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## API Routes

| Route | Purpose |
|-------|---------|
| `POST /api/process-document` | Full document processing with line art conversion |
| `POST /api/process-document-streaming` | Streaming document processing with real-time progress |
| `POST /api/convert-image` | Single image to line art conversion |
| `POST /api/vectorize` | Raster image to SVG vectorization |
| `POST /api/generate-video` | Image to video via Veo 3.1 |
| `POST /api/image-to-3d` | Submit image for 3D generation (Meshy.ai) |
| `GET /api/image-to-3d/[taskId]` | Poll 3D generation task status |
| `GET /api/proxy-glb` | CORS proxy for remote GLB model files |

---

## Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

Add your environment variables in the Vercel dashboard under **Settings > Environment Variables** before deploying (see below).

---

## License

MIT
