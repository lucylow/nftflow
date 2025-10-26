# API Key Setup Guide

## Quick Setup

Your `.env` file has been created based on `env.template`. To enable AI agents functionality, you need to add your OpenAI API key.

### Step 1: Get Your OpenAI API Key

1. Visit [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up or log in to your OpenAI account
3. Click "Create new secret key"
4. Copy your API key (it starts with `sk-`)

### Step 2: Add API Key to .env File

Open the `.env` file in your project root and update this line:

```bash
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

Replace `your_openai_api_key_here` with your actual API key:

```bash
VITE_OPENAI_API_KEY=sk-your-actual-key-here
```

### Step 3: Restart Your Development Server

After adding the API key, restart your development server:

```bash
# Stop the current server (Ctrl+C) if running
npm run dev
```

The AI agents will now work properly!

## Optional: Add Other AI Providers

You can also add API keys for other AI providers for additional features:

### Anthropic (Claude)

```bash
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Get your key from: [https://console.anthropic.com/](https://console.anthropic.com/)

### Google (Gemini)

```bash
VITE_GOOGLE_API_KEY=your-google-key-here
```

Get your key from: [https://ai.google.dev/](https://ai.google.dev/)

### Replicate (Open-source models)

```bash
VITE_REPLICATE_API_KEY=your-replicate-key-here
```

Get your key from: [https://replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)

## Troubleshooting

### Warning still appears after adding key

1. Make sure the variable name is exactly `VITE_OPENAI_API_KEY` (with `VITE_` prefix)
2. Restart your development server
3. Check that there are no extra spaces or quotes around the key
4. Clear browser cache and refresh

### API Key format

The key should:
- Start with `sk-` for OpenAI
- Not have any spaces
- Not be wrapped in quotes
- Be on a single line

Example of correct format:
```bash
VITE_OPENAI_API_KEY=sk-proj-abc123def456...
```

Example of INCORRECT format:
```bash
VITE_OPENAI_API_KEY="sk-proj-abc123..."  # Don't use quotes
VITE_OPENAI_API_KEY = sk-proj-abc123...  # Don't use spaces
```

## Security Notes

- **Never commit your `.env` file** to version control
- The `.env` file is already in `.gitignore`
- API keys starting with `VITE_` are exposed to the frontend (this is intentional for client-side AI)
- Keep your keys secure and rotate them regularly

## Need Help?

If you're still having issues:

1. Check that the `.env` file exists in your project root
2. Verify the file format matches the template
3. Try restarting your terminal and running `npm run dev` again
4. Check the browser console for any error messages

