# MockMate AI - Interview Practice Platform

An AI-powered mock interview platform built with Next.js 15 and Google Gemini AI to help you prepare for job interviews.

## Features

- 🤖 **AI-Powered Interviews**: Realistic mock interviews using Google Gemini 2.0 Flash
- 🎤 **Voice Input**: Record your answers using the microphone - audio is automatically transcribed to text
- 💼 **Role-Based Questions**: Customizable interview experience for different job positions
- 💬 **Interactive Chat Interface**: Real-time conversation with structured feedback
- 📊 **Instant Feedback**: Get constructive feedback on your answers
- 🎯 **Progressive Questioning**: AI adapts follow-up questions based on your responses

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS
- **AI**: Google Gemini API
- **Deployment**: Vercel

## Prerequisites

- Node.js 18.17.0 or higher
- npm or yarn
- Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Sravanthkande/MockMate-App.git
cd MockMate-App
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Google Gemini API key:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production

```bash
npm run build
npm start
```

## Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/new)
3. Import your GitHub repository
4. Configure environment variables:
   - Add `GEMINI_API_KEY` with your API key
5. Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Add environment variable:
```bash
vercel env add GEMINI_API_KEY
```

5. Deploy to production:
```bash
vercel --prod
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes |

## Project Structure

```
MockMate-App/
├── src/
│   └── app/
│       ├── api/
│       │   └── interview/
│       │       └── route.js       # API route for Gemini AI
│       ├── components/
│       │   ├── ChatBubble.jsx     # Chat message component
│       │   ├── ChatWindow.jsx     # Chat container
│       │   └── InterviewSetup.jsx # Interview configuration
│       ├── lib/
│       │   ├── gemini.js          # API client
│       │   └── db.js              # Database utilities (future)
│       ├── globals.css            # Global styles
│       ├── layout.jsx             # Root layout
│       └── page.jsx               # Home page
├── .env.example                   # Environment variables template
├── .nvmrc                         # Node version
├── next.config.js                 # Next.js configuration
├── tailwind.config.js             # Tailwind CSS configuration
└── package.json                   # Dependencies

```

## Usage

1. **Start Interview**: Enter the job role you're preparing for (e.g., "Senior React Developer")
2. **Answer Questions**: The AI will ask relevant interview questions
3. **Get Feedback**: Receive constructive feedback on each answer
4. **Continue**: Answer follow-up questions to complete the interview
5. **Reset**: Start a new interview anytime

## Troubleshooting

### Build Errors

If you encounter build errors:

1. Ensure you're using Node.js 18.17.0 or higher:
```bash
node --version
```

2. Clear cache and reinstall:
```bash
rm -rf node_modules .next package-lock.json
npm install
npm run build
```

### API Errors

If the AI doesn't respond:

1. Verify your `GEMINI_API_KEY` is set correctly in `.env.local`
2. Check the API key is valid at [Google AI Studio](https://makersuite.google.com/app/apikey)
3. Ensure you have API quota available

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and Google Gemini AI