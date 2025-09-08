<div align="center">
<img width="1200" height="475" alt="PhotoRestorAI Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# PhotoRestorAI - AI-Powered Photo Restoration

Professional photo restoration and enhancement powered by Google's Gemini 2.5 Flash through OpenRouter's free API.

## 🌟 Features

- ✨ **Magic Restoration**: One-click AI restoration for damaged photos
- 🖼️ **Memorial Restoration**: Specialized care for precious family memories
- 🎨 **Creative Editing**: Transform photos with artistic AI effects
- 🔧 **Smart Compositing**: Advanced photo combination and background replacement
- ✏️ **Precision Retouching**: Remove objects and fix imperfections with AI
- 🎭 **Restoration Styles**: Apply vintage and period-appropriate effects
- ✂️ **Smart Cropping**: Professional cropping tools with aspect ratios
- ⚙️ **AI Adjustments**: Intelligent brightness, contrast, and color optimization
- 🔍 **Before/After Comparison**: Interactive slider and toggle comparisons
- � **Mobile Optimized**: Floating action buttons and gesture-friendly interface
- �🔐 **Firebase Authentication**: Secure user accounts with quota management
- ⚡ **Real-time Processing**: Live processing timers and progress tracking

## 🚀 Run Locally

**Prerequisites:** Node.js 18+

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd PhotoRestorAI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   **Use Gemini API Key:**
   - Visit https://gemini.ai/
   - Sign up for a free account
  ```
  VITE_GEMINI_API_KEY=your_key_here
  ```

4.**Run the development server:**
   ```bash
   npm run dev
   ```

5.**Open your browser:**
   Navigate to `http://localhost:5173`

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **AI**: Google Gemini Nano Banana
- **Auth**: Firebase Authentication
- **Image Processing**: HTML5 Canvas, React Image Crop
- **Build**: Vite
- **Analytics**: Vercel Analytics

## 📝 Environment Variables

```bash
# Required: Gemini API Key for Nano Banana
VITE_GEMINI_API_KEY=your_key_here
```

## 🎯 Usage

1. **Upload a photo** you want to restore or enhance
2. **Choose your restoration mode:**
   - **Magic**: Automatic professional restoration
   - **Memorial**: Gentle restoration for precious family photos
   - **Creative Edit**: Artistic transformations and effects
   - **Composite**: Combine photos or replace backgrounds
   - **Retouch**: Remove objects and fix imperfections
   - **Styles**: Apply vintage and period-appropriate effects
   - **Crop**: Resize and crop with professional tools
   - **Adjustments**: Fine-tune exposure, contrast, and colors
3. **AI Suggestions**: Get intelligent recommendations for each mode
4. **Real-time Preview**: Watch AI processing with live timers
5. **Compare Results**: Use slider or toggle to see before/after
6. **Mobile Friendly**: Use floating buttons for quick actions
7. **Download**: Save your enhanced photo in full quality

## 🔧 Development

**Build for production:**
```bash
npm run build
```

**Preview production build:**
```bash
npm run preview
```