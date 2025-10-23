# Using OpenAI Agent Builder with Your React App

## Step 1: Create Agent in Agent Builder

1. Go to https://platform.openai.com/
2. Navigate to "Agent Builder" or "Assistants"
3. Click "Create Assistant"
4. Configure your agent with:
   - Name: "PDF Data Extractor"
   - Instructions: (paste your system prompt)
   - Model: gpt-4o
   - Tools: Enable File Search
   - Response Format: Set to your JSON schema

5. **Copy the Assistant ID** - It looks like: `asst_xxxxxxxxxxxxxxxxxxxx`

## Step 2: Use the Assistant ID in Your App

Instead of creating an assistant every time, just use the ID:

```javascript
// In your API route
const assistant_id = process.env.OPENAI_ASSISTANT_ID // asst_xxxxx

// Upload file
const file = await openai.files.create({
  file: fs.createReadStream(filePath),
  purpose: 'assistants'
})

// Create thread with the file
const thread = await openai.beta.threads.create({
  messages: [{
    role: 'user',
    content: 'Extract data from this PDF',
    attachments: [{
      file_id: file.id,
      tools: [{ type: 'file_search' }]
    }]
  }]
})

// Run your pre-built assistant
const run = await openai.beta.threads.runs.create(thread.id, {
  assistant_id: assistant_id // Use your agent's ID here!
})

// Poll for completion
while (run.status === 'queued' || run.status === 'in_progress') {
  await new Promise(resolve => setTimeout(resolve, 1000))
  run = await openai.beta.threads.runs.retrieve(thread.id, run.id)
}

// Get response
const messages = await openai.beta.threads.messages.list(thread.id)
const response = messages.data[0].content[0].text.value
```

## Environment Variable

Add to `.env.local`:
```bash
OPENAI_ASSISTANT_ID=asst_your_assistant_id_here
```

That's it! No need to create the assistant programmatically - just connect to your pre-built one!


