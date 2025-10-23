# How to Get Your OpenAI Assistant ID

## The Issue
Your `.env.local` has `CHATKIT_WIDGET_ID=wf_68f7fec83ff881908ad7657155b94db201bfcc3e5ca59e06` but the API needs an OpenAI Assistant ID that starts with `asst_`.

## Steps to Get Your Assistant ID

1. **Go to OpenAI Platform**: https://platform.openai.com/
2. **Navigate to Assistants**: Click "Assistants" in the left sidebar
3. **Find Your Agent**: Look for your PDF extraction agent
4. **Copy the Assistant ID**: It will look like `asst_xxxxxxxxxxxxxxxxxxxx`
5. **Add to .env.local**: Add this line:
   ```
   OPENAI_ASSISTANT_ID=asst_your_actual_assistant_id_here
   ```

## Alternative: Create New Assistant

If you don't have an assistant yet:

1. **Create Assistant**: Click "Create" in the Assistants page
2. **Configure**:
   - Name: "PDF Data Extractor"
   - Instructions: Your extraction prompt
   - Model: gpt-4o
   - Tools: Enable File Search
3. **Copy Assistant ID**: Save the `asst_...` ID
4. **Add to .env.local**: Add the `OPENAI_ASSISTANT_ID` variable

## Test the Fix

After adding `OPENAI_ASSISTANT_ID` to your `.env.local`:
1. Restart your dev server
2. Try uploading a PDF again
3. Check the console logs for "✅ Using OpenAI Assistant ID: asst_..."

The Chatkit widget ID (`wf_...`) is for the Chatkit UI component, but the API needs the actual OpenAI Assistant ID (`asst_...`).
