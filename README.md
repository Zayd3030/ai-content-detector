# AI Content Detector

A multimodal AI content detection system built for an Honours Project.  
The application analyses **text**, **images**, and **videos** to estimate whether the content is **human-made** or **AI-generated**, and where possible provides a **best-effort source attribution** and an **explanation** of the decision.

## Project Overview

This project combines a **React frontend** with a **Flask backend**.

The system currently includes:

- **Text Detection**
  - Handcrafted linguistic feature extraction
  - Binary classification using **Logistic Regression**
  - Optional attribution of likely source model
  - Natural-language explanation using **Ollama**

- **Image Detection**
  - Handcrafted visual and frequency-domain feature extraction
  - Binary classification using **Logistic Regression**
  - Optional attribution of likely image generator

- **Video Detection**
  - Frame-based detection pipeline
  - Samples frames from uploaded videos
  - Reuses the trained image detector
  - Aggregates frame-level predictions into a final video-level decision

## Main Features

- Detect whether **text** is human-written or AI-generated
- Detect whether an **image** is human-made or AI-generated
- Detect whether a **video** is human-made or AI-generated
- Show:
  - predicted label
  - confidence score
  - extracted signals / features
  - explanation of the decision
  - attribution result where available
- Export JSON results from the frontend

---

# Project Structure

```text
ai-content-detector/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── routes/
│   │   ├── text.py
│   │   ├── image.py
│   │   └── video.py
│   ├── services/
│   │   ├── text_detector.py
│   │   ├── image_detector.py
│   │   ├── video_detector.py
│   │   ├── train_text_models.py
│   │   ├── train_image_models.py
│   │   ├── ollama_client.py
│   │   └── ...
│   └── models/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── datasets/
│   ├── text/
│   ├── image/
│   └── video/
│
└── run-dev.ps1
```

---

# Requirements

## Software
Make sure the following are installed:

- **Python**
- **Node.js + npm**
- **Ollama** (for explanation features)
- **Git** (optional, for version control)

## Python dependencies
Installed through:

```powershell
pip install -r requirements.txt
```

## Frontend dependencies
Installed through:

```powershell
npm install
```

---

# Backend Setup

Open a terminal and go into the backend folder:

```powershell
cd backend
```

## 1. Create virtual environment
```powershell
python -m venv .venv
```

## 2. Activate virtual environment
```powershell
.\.venv\Scripts\Activate.ps1
```

## 3. Install backend dependencies
```powershell
pip install -r requirements.txt
```

## 4. Run the Flask backend
```powershell
flask run
```

Or alternatively:

```powershell
python app.py
```

The backend should run on:

```text
http://127.0.0.1:5000
```

---

# Frontend Setup

Open a second terminal and go into the frontend folder:

```powershell
cd frontend
```

## 1. Install dependencies
```powershell
npm install
```

## 2. Start the frontend
```powershell
npm run dev
```

The frontend should run on:

```text
http://localhost:5173
```

---

# Ollama Setup (for explanations)

The project uses **Ollama** to generate plain-language explanations for text detection outputs.

## 1. Start Ollama
```powershell
ollama serve
```

## 2. Check it is running
```powershell
curl http://localhost:11434/v1/models
```

## 3. Pull a model if needed
Example:

```powershell
ollama pull llama3:latest
```

If Ollama is not running, the detection pipelines may still work, but explanation features may fail or fall back depending on implementation.

---

# One-Command Development Startup

A PowerShell launcher script is included:

```powershell
.\run-dev.ps1
```

This is intended to start:

- Ollama
- Flask backend
- React frontend

If script execution is blocked on Windows, run:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Then run the launcher again.

---

# API Endpoints

## Health
```http
GET /health
```

Used to check whether the backend is running.

---

## Text Detection
```http
POST /detect/text
```

### Request body
```json
{
  "text": "Your input text here"
}
```

### Returns
- label
- confidence
- source attribution (if available)
- explanation
- extracted signals

---

## Image Detection
```http
POST /detect/image
```

### Request type
`multipart/form-data`

### Form key
```text
image
```

### Returns
- label
- confidence
- source attribution (if available)
- explanation
- extracted visual signals

---

## Video Detection
```http
POST /detect/video
```

### Request type
`multipart/form-data`

### Form key
```text
video
```

### Returns
- label
- confidence
- frame-level aggregation info
- sampled frame statistics
- explanation
- extracted signals

---

# How the System Works

## 1. Text Module
The text module extracts handcrafted linguistic features from the submitted text, such as:

- token count
- type-token ratio
- repetition ratio
- punctuation ratio
- sentence length statistics
- common token frequency

These features are fed into a trained **Logistic Regression** classifier to predict whether the text is human-written or AI-generated.

If the text is classified as AI-generated, a second attribution model may estimate the likely source.

An optional Ollama-based explanation module then explains the decision using the extracted signals.

---

## 2. Image Module
The image module extracts handcrafted visual features, including:

- image size
- RGB mean and variance
- saturation statistics
- edge density
- Laplacian variance (sharpness)
- FFT high-frequency ratio

These signals are passed into a trained **Logistic Regression** model to classify the image as human-made or AI-generated.

Where enough training data exists, a second attribution classifier may estimate the likely source model.

---

## 3. Video Module
The video module works by:

1. receiving an uploaded video
2. extracting frames at fixed intervals
3. running the image detector on sampled frames
4. aggregating frame-level predictions
5. returning a final video-level decision

This makes the video pipeline explainable, lightweight, and reusable.

---

# Training the Models

## Text Model Training

From the backend folder:

```powershell
python -m services.train_text_models
```

This will:
- build the text dataset
- train the binary text classifier
- train attribution if enough AI sources are present
- save model files into `backend/models/`

---

## Image Model Training

From the backend folder:

```powershell
python -m services.train_image_models
```

This will:
- build the image dataset
- train the binary image classifier
- train attribution if enough AI image sources are present
- save model files into `backend/models/`

---

# Dataset Layout

## Text datasets
```text
datasets/text/
├── human/
└── ai/
    ├── chatgpt/
    ├── llama3/
    └── ...
```

## Image datasets
```text
datasets/image/
├── human/
└── ai/
    ├── chatgpt/
    ├── midjourney/
    ├── stable_diffusion/
    └── ...
```

## Video datasets
If you create evaluation video datasets, use a similar structure:

```text
datasets/video/
├── human/
└── ai/
```

---

# Example Commands for Evaluation

## Text evaluation
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m services.train_text_models
```

## Image evaluation
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m services.train_image_models
```

These commands print:
- dataset size
- class distribution
- classification report
- confusion matrix

---

# Troubleshooting

## 1. `ModuleNotFoundError: No module named 'services'`
You are probably running a backend module from the project root instead of the `backend` folder.

### Fix
```powershell
cd backend
python -m services.train_text_models
```

---

## 2. `API_BASE is not defined`
Make sure your frontend `src/services/api.js` defines the backend base URL, for example:

```js
const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";
```

Optionally add a `.env` file in `frontend/`:

```env
VITE_API_BASE=http://127.0.0.1:5000
```

---

## 3. `motion is not defined`
A component is using Framer Motion without importing it.

### Fix
Add:

```js
import { motion } from "framer-motion";
```

---

## 4. OpenCV / NumPy errors
If OpenCV fails due to NumPy version issues, reinstall compatible versions in the backend virtual environment.

A stable working option is:

```powershell
pip uninstall -y numpy opencv-python
pip install numpy==1.26.4
pip install opencv-python==4.10.0.84
```

---

## 5. Ollama connection refused
Make sure Ollama is running:

```powershell
ollama serve
```

Then check:

```powershell
curl http://localhost:11434/v1/models
```

---

# Notes

- Datasets are not included in the repository if they are ignored by `.gitignore`.
- Trained model files may need to be regenerated locally.
- The system is designed primarily for research and evaluation rather than production deployment.

---

# Suggested Usage Workflow

1. Start Ollama
2. Start backend
3. Start frontend
4. Train text and image models if needed
5. Open the frontend
6. Test:
   - `/text`
   - `/image`
   - `/video`
7. Record outputs for evaluation

---

# Author

Developed as part of an Honours Project on AI-generated content detection.

Zayd Hussain
S2212398