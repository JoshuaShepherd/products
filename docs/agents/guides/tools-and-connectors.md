# Tools and Connectors

Extend model capabilities with built-in tools and remote MCP servers.

When generating model responses, you can extend capabilities using built-in tools and remote MCP servers. These enable the model to search the web, retrieve from your files, call your own functions, or access third-party services.

## Available Tools

Here's an overview of the tools available in the OpenAI platform:

### Built-in Tools

#### Web Search
Include data from the Internet in model response generation.

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5",
    tools: [
        { type: "web_search" },
    ],
    input: "What was a positive news story from today?",
});

console.log(response.output_text);
```

#### File Search
Search the contents of uploaded files for context when generating a response.

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-4.1",
    input="What is deep research by OpenAI?",
    tools=[{
        "type": "file_search",
        "vector_store_ids": ["<vector_store_id>"]
    }]
)
print(response)
```

#### Function Calling
Call custom code to give the model access to additional data and capabilities.

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const tools = [
    {
        type: "function",
        name: "get_weather",
        description: "Get current temperature for a given location.",
        parameters: {
            type: "object",
            properties: {
                location: {
                    type: "string",
                    description: "City and country e.g. Bogotá, Colombia",
                },
            },
            required: ["location"],
            additionalProperties: false,
        },
        strict: true,
    },
];

const response = await client.responses.create({
    model: "gpt-5",
    input: [
        { role: "user", content: "What is the weather like in Paris today?" },
    ],
    tools,
});

console.log(response.output[0].to_json());
```

#### Remote MCP
Call third-party tools and services via Model Context Protocol (MCP) servers.

```bash
curl https://api.openai.com/v1/responses \ 
-H "Content-Type: application/json" \ 
-H "Authorization: Bearer $OPENAI_API_KEY" \ 
-d '{
  "model": "gpt-5",
    "tools": [
      {
        "type": "mcp",
        "server_label": "dmcp",
        "server_description": "A Dungeons and Dragons MCP server to assist with dice rolling.",
        "server_url": "https://dmcp-server.deno.dev/sse",
        "require_approval": "never"
      }
    ],
    "input": "Roll 2d4+1"
  }'
```

#### Image Generation
Generate or edit images using GPT Image.

#### Code Interpreter
Allow the model to execute code in a secure container.

#### Computer Use
Create agentic workflows that enable a model to control a computer interface.

## Connectors and MCP Servers

Use connectors and remote MCP servers to give models new capabilities.

In addition to tools you make available to the model with function calling, you can give models new capabilities using **connectors** and **remote MCP servers**. These tools give the model the ability to connect to and control external services when needed to respond to a user's prompt.

- **Connectors** are OpenAI-maintained MCP wrappers for popular services like Google Workspace or Dropbox
- **Remote MCP servers** can be any server on the public Internet that implements a remote Model Context Protocol (MCP) server

### Using Remote MCP Servers

Remote MCP servers require a `server_url`. Depending on the server, you may also need an OAuth `authorization` parameter containing an access token.

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const resp = await client.responses.create({
  model: "gpt-5",
  tools: [
    {
      type: "mcp",
      server_label: "dmcp",
      server_description: "A Dungeons and Dragons MCP server to assist with dice rolling.",
      server_url: "https://dmcp-server.deno.dev/sse",
      require_approval: "never",
    },
  ],
  input: "Roll 2d4+1",
});

console.log(resp.output_text);
```

### Using Connectors

Connectors require a `connector_id` parameter, and an OAuth access token provided by your application in the `authorization` parameter.

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const resp = await client.responses.create({
  model: "gpt-5",
  tools: [
    {
      type: "mcp",
      server_label: "Dropbox",
      connector_id: "connector_dropbox",
      authorization: "<oauth access token>",
      require_approval: "never",
    },
  ],
  input: "Summarize the Q2 earnings report.",
});

console.log(resp.output_text);
```

### Available Connectors

- Dropbox: `connector_dropbox`
- Gmail: `connector_gmail`
- Google Calendar: `connector_googlecalendar`
- Google Drive: `connector_googledrive`
- Microsoft Teams: `connector_microsoftteams`
- Outlook Calendar: `connector_outlookcalendar`
- Outlook Email: `connector_outlookemail`
- SharePoint: `connector_sharepoint`

## How MCP Works

The MCP tool (for both remote MCP servers and connectors) is available in the Responses API in most recent models. When you're using the MCP tool, you only pay for tokens used when importing tool definitions or making tool calls.

### Step 1: Listing Available Tools

When you specify a remote MCP server in the `tools` parameter, the API will attempt to get a list of tools from the server. The Responses API works with remote MCP servers that support either the Streamable HTTP or the HTTP/SSE transport protocols.

If successful in retrieving the list of tools, a new `mcp_list_tools` output item will appear in the model response output.

```json
{
    "id": "mcpl_68a6102a4968819c8177b05584dd627b0679e572a900e618",
    "type": "mcp_list_tools",
    "server_label": "dmcp",
    "tools": [
        {
            "annotations": null,
            "description": "Given a string of text describing a dice roll...",
            "input_schema": {
                "$schema": "https://json-schema.org/draft/2020-12/schema",
                "type": "object",
                "properties": {
                    "diceRollExpression": {
                        "type": "string"
                    }
                },
                "required": ["diceRollExpression"],
                "additionalProperties": false
            },
            "name": "roll"
        }
    ]
}
```

### Step 2: Calling Tools

Once the model has access to these tool definitions, it may choose to call them depending on what's in the model's context. When the model decides to call an MCP tool, the API will make a request to the remote MCP server to call the tool and put its output into the model's context.

```json
{
    "id": "mcp_68a6102d8948819c9b1490d36d5ffa4a0679e572a900e618",
    "type": "mcp_call",
    "approval_request_id": null,
    "arguments": "{\"diceRollExpression\":\"2d4 + 1\"}",
    "error": null,
    "name": "roll",
    "output": "4",
    "server_label": "dmcp"
}
```

### Tool Approvals

By default, OpenAI will request your approval before any data is shared with a connector or remote MCP server. Approvals help you maintain control and visibility over what data is being sent to an MCP server.

A request for an approval to make an MCP tool call creates a `mcp_approval_request` item in the Response's output:

```json
{
    "id": "mcpr_68a619e1d82c8190b50c1ccba7ad18ef0d2d23a86136d339",
    "type": "mcp_approval_request",
    "arguments": "{\"diceRollExpression\":\"2d4 + 1\"}",
    "name": "roll",
    "server_label": "dmcp"
}
```

You can then respond to this by creating a new Response object and appending an `mcp_approval_response` item to it.

### Filtering Tools

Some MCP servers can have dozens of tools, and exposing many tools to the model can result in high cost and latency. If you're only interested in a subset of tools an MCP server exposes, you can use the `allowed_tools` parameter to only import those tools.

```javascript
const resp = await client.responses.create({
  model: "gpt-5",
  tools: [{
    type: "mcp",
    server_label: "dmcp",
    server_description: "A Dungeons and Dragons MCP server to assist with dice rolling.",
    server_url: "https://dmcp-server.deno.dev/sse",
    require_approval: "never",
    allowed_tools: ["roll"],
  }],
  input: "Roll 2d4+1",
});
```

## Authentication

Unlike example MCP servers, most other MCP servers require authentication. The most common scheme is an OAuth access token. Provide this token using the `authorization` field of the MCP tool:

```javascript
const resp = await client.responses.create({
  model: "gpt-5",
  input: "Create a payment link for $20",
  tools: [
    {
      type: "mcp",
      server_label: "stripe",
      server_url: "https://mcp.stripe.com",
      authorization: "$STRIPE_OAUTH_ACCESS_TOKEN"
    }
  ]
});
```

## Risks and Safety

The MCP tool permits you to connect OpenAI models to external services. This is a powerful feature that comes with some risks.

For connectors, there is a risk of potentially sending sensitive data to OpenAI, or allowing models read access to potentially sensitive data in those services.

Remote MCP servers carry those same risks, but also have not been verified by OpenAI. These servers can allow models to access, send, and receive data, and take action in these services.

### Best Practices

#### Prompt Injection
Prompt injection is an important security consideration in any LLM application, and is especially true when you give the model access to MCP servers and connectors which can access sensitive data or take action.

#### Always Require Approval for Sensitive Actions
Use the available configurations of the `require_approval` and `allowed_tools` parameters to ensure that any sensitive actions require an approval flow.

#### URLs Within MCP Tool Calls and Outputs
It can be dangerous to request URLs or embed image URLs provided by tool call outputs either from connectors or remote MCP servers. Ensure that you trust the domains and services providing those URLs before embedding or otherwise using them in your application code.

#### Connecting to Trusted Servers
Pick official servers hosted by the service providers themselves. Because there aren't too many official remote MCP servers today, you may be tempted to use a MCP server hosted by an organization that doesn't operate that server and simply proxies request to that service via your API. If you must do this, be extra careful in doing your due diligence on these "aggregators", and carefully review how they use your data.

#### Log and Review Data Being Shared
Because MCP servers define their own tool definitions, they may request for data that you may not always be comfortable sharing with the host of that MCP server. We recommend logging any data sent to MCP servers and performing periodic reviews on this to ensure data is being shared per your expectations.

## Usage Notes

| API | Rate Limits | Pricing | ZDR and Data Residency |
|-----|-------------|---------|------------------------|
| Responses | Tier 1: 200 RPM<br>Tier 2 and 3: 1000 RPM<br>Tier 4 and 5: 2000 RPM | Same as underlying model | Supported |
| Chat Completions | Same as tiered rate limits for underlying model | Same as underlying model | Supported |
| Assistants | Same as tiered rate limits for underlying model | Same as underlying model | Supported |

## Web Search Tool

Allow models to search the web for the latest information before generating a response.

Web search allows models to access up-to-date information from the internet and provide answers with sourced citations. To enable this, use the web search tool in the Responses API or, in some cases, Chat Completions.

There are three main types of web search available with OpenAI models:

1. **Non-reasoning web search**: The non-reasoning model sends the user's query to the web search tool, which returns the response based on top results. There's no internal planning and the model simply passes along the search tool's responses. This method is fast and ideal for quick lookups.

2. **Agentic search with reasoning models**: An approach where the model actively manages the search process. It can perform web searches as part of its chain of thought, analyze results, and decide whether to keep searching. This flexibility makes agentic search well suited to complex workflows, but it also means searches take longer than quick lookups.

3. **Deep research**: A specialized, agent-driven method for in-depth, extended investigations by reasoning models. The model conducts web searches as part of its chain of thought, often tapping into hundreds of sources. Deep research can run for several minutes and is best used with background mode.

### Output and Citations

Model responses that use the web search tool will include two parts:

- A `web_search_call` output item with the ID of the search call, along with the action taken in `web_search_call.action`
- A `message` output item containing the text result and annotations for the cited URLs

By default, the model's response will include inline citations for URLs found in the web search results. In addition to this, the `url_citation` annotation object will contain the URL, title and location of the cited source.

### Domain Filtering

Domain filtering in web search lets you limit results to a specific set of domains. With the `filters` parameter you can set an allow-list of up to 20 URLs.

```javascript
const response = await client.responses.create({
  model: "gpt-5",
  reasoning: { effort: "low" },
  tools: [
      {
          type: "web_search",
          filters: {
              allowed_domains: [
                  "pubmed.ncbi.nlm.nih.gov",
                  "clinicaltrials.gov",
                  "www.who.int",
                  "www.cdc.gov",
                  "www.fda.gov",
              ],
          },
      },
  ],
  tool_choice: "auto",
  include: ["web_search_call.action.sources"],
  input: "Please perform a web search on how semaglutide is used in the treatment of diabetes.",
});
```

### User Location

To refine search results based on geography, you can specify an approximate user location using country, city, region, and/or timezone.

```javascript
const response = await openai.responses.create({
    model: "o4-mini",
    tools: [{
        type: "web_search",
        user_location: {
            type: "approximate",
            country: "GB",
            city: "London",
            region: "London"
        }
    }],
    input: "What are the best restaurants near me?",
});
```

## File Search Tool

Allow models to search your files for relevant information before generating a response.

File search is a tool available in the Responses API. It enables models to retrieve information in a knowledge base of previously uploaded files through semantic and keyword search. By creating vector stores and uploading files to them, you can augment the models' inherent knowledge by giving them access to these knowledge bases or `vector_stores`.

### How to Use

Prior to using file search with the Responses API, you need to have set up a knowledge base in a vector store and uploaded files to it.

#### Create a Vector Store and Upload a File

```python
from openai import OpenAI
client = OpenAI()

# Create vector store
vector_store = client.vector_stores.create(
    name="knowledge_base"
)

# Upload file
file_id = create_file(client, "https://cdn.openai.com/API/docs/deep_research_blog.pdf")

# Add file to vector store
result = client.vector_stores.files.create(
    vector_store_id=vector_store.id,
    file_id=file_id
)
```

#### Use File Search Tool

```python
response = client.responses.create(
    model="gpt-4.1",
    input="What is deep research by OpenAI?",
    tools=[{
        "type": "file_search",
        "vector_store_ids": ["<vector_store_id>"]
    }]
)
print(response)
```

### Retrieval Customization

#### Limiting the Number of Results

Using the file search tool with the Responses API, you can customize the number of results you want to retrieve from the vector stores.

```python
response = client.responses.create(
    model="gpt-4.1",
    input="What is deep research by OpenAI?",
    tools=[{
        "type": "file_search",
        "vector_store_ids": ["<vector_store_id>"],
        "max_num_results": 2
    }]
)
```

#### Include Search Results in the Response

To include search results in the response, you can use the `include` parameter when creating the response.

```python
response = client.responses.create(
    model="gpt-4.1",
    input="What is deep research by OpenAI?",
    tools=[{
        "type": "file_search",
        "vector_store_ids": ["<vector_store_id>"]
    }],
    include=["file_search_call.results"]
)
```

#### Metadata Filtering

You can filter the search results based on the metadata of the files.

```python
response = client.responses.create(
    model="gpt-4.1",
    input="What is deep research by OpenAI?",
    tools=[{
        "type": "file_search",
        "vector_store_ids": ["<vector_store_id>"],
        "filters": {
            "type": "in",
            "key": "category",
            "value": ["blog", "announcement"]
        }
    }]
)
```

### Supported Files

For `text/` MIME types, the encoding must be one of `utf-8`, `utf-16`, or `ascii`.

| File format | MIME type |
|-------------|-----------|
| .c | text/x-c |
| .cpp | text/x-c++ |
| .cs | text/x-csharp |
| .css | text/css |
| .doc | application/msword |
| .docx | application/vnd.openxmlformats-officedocument.wordprocessingml.document |
| .go | text/x-golang |
| .html | text/html |
| .java | text/x-java |
| .js | text/javascript |
| .json | application/json |
| .md | text/markdown |
| .pdf | application/pdf |
| .php | text/x-php |
| .pptx | application/vnd.openxmlformats-officedocument.presentationml.presentation |
| .py | text/x-python |
| .py | text/x-script.python |
| .rb | text/x-ruby |
| .sh | application/x-sh |
| .tex | text/x-tex |
| .ts | application/typescript |
| .txt | text/plain |

## Code Interpreter Tool

Allow models to write and run Python to solve problems.

The Code Interpreter tool allows models to write and run Python code in a sandboxed environment to solve complex problems in domains like data analysis, coding, and math.

### Usage

```python
from openai import OpenAI

client = OpenAI()

instructions = """
You are a personal math tutor. When asked a math question, 
write and run code using the python tool to answer the question.
"""

resp = client.responses.create(
    model="gpt-4.1",
    tools=[
        {
            "type": "code_interpreter",
            "container": {"type": "auto"}
        }
    ],
    instructions=instructions,
    input="I need to solve the equation 3x + 11 = 14. Can you help me?",
)

print(resp.output)
```

### Containers

The Code Interpreter tool requires a container object. A container is a fully sandboxed virtual machine that the model can run Python code in.

There are two ways to create containers:

1. **Auto mode**: Pass `"container": { "type": "auto", "file_ids": ["file-1", "file-2"] }` in the tool configuration
2. **Explicit mode**: Create a container using the `v1/containers` endpoint and assign its `id` as the `container` value

### Work with Files

When running Code Interpreter, the model can create its own files. For example, if you ask it to construct a plot, or create a CSV, it creates these images directly on your container.

Files and images generated by the model are returned as annotations on the assistant's message. `container_file_citation` annotations point to files created in the container.

### Supported Files

| File format | MIME type |
|-------------|-----------|
| .c | text/x-c |
| .cs | text/x-csharp |
| .cpp | text/x-c++ |
| .csv | text/csv |
| .doc | application/msword |
| .docx | application/vnd.openxmlformats-officedocument.wordprocessingml.document |
| .html | text/html |
| .java | text/x-java |
| .json | application/json |
| .md | text/markdown |
| .pdf | application/pdf |
| .php | text/x-php |
| .pptx | application/vnd.openxmlformats-officedocument.presentationml.presentation |
| .py | text/x-python |
| .py | text/x-script.python |
| .rb | text/x-ruby |
| .tex | text/x-tex |
| .txt | text/plain |
| .css | text/css |
| .js | text/javascript |
| .sh | application/x-sh |
| .ts | application/typescript |
| .csv | application/csv |
| .jpeg | image/jpeg |
| .jpg | image/jpeg |
| .gif | image/gif |
| .pkl | application/octet-stream |
| .png | image/png |
| .tar | application/x-tar |
| .xlsx | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet |
| .xml | application/xml or "text/xml" |
| .zip | application/zip |

## Image Generation Tool

Allow models to generate or edit images.

The image generation tool allows you to generate images using a text prompt, and optionally image inputs. It leverages the GPT Image model, and automatically optimizes text inputs for improved performance.

### Usage

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-5",
    input: "Generate an image of gray tabby cat hugging an otter with an orange scarf",
    tools: [{type: "image_generation"}],
});

// Save the image to a file
const imageData = response.output
  .filter((output) => output.type === "image_generation_call")
  .map((output) => output.result);

if (imageData.length > 0) {
  const imageBase64 = imageData[0];
  const fs = await import("fs");
  fs.writeFileSync("otter.png", Buffer.from(imageBase64, "base64"));
}
```

### Tool Options

You can configure the following output options as parameters for the image generation tool:

- **Size**: Image dimensions (e.g., 1024x1024, 1024x1536)
- **Quality**: Rendering quality (e.g. low, medium, high)
- **Format**: File output format
- **Compression**: Compression level (0-100%) for JPEG and WebP formats
- **Background**: Transparent or opaque

`size`, `quality`, and `background` support the `auto` option, where the model will automatically select the best option based on the prompt.

### Multi-turn Editing

You can iteratively edit images by referencing previous response or image IDs. This allows you to refine images across multiple turns in a conversation.

### Streaming

The image generation tool supports streaming partial images as the final result is being generated. This provides faster visual feedback for users and improves perceived latency.

You can set the number of partial images (1-3) with the `partial_images` parameter.

### Supported Models

The image generation tool is supported for the following models:

- `gpt-4o`
- `gpt-4o-mini`
- `gpt-4.1`
- `gpt-4.1-mini`
- `gpt-4.1-nano`
- `o3`

## Computer Use Tool

Build a computer-using agent that can perform tasks on your behalf.

Computer use is a practical application of our Computer-Using Agent (CUA) model, `computer-use-preview`, which combines the vision capabilities of GPT-4o with advanced reasoning to simulate controlling computer interfaces and performing tasks.

### How It Works

The computer use tool operates in a continuous loop. It sends computer actions, like `click(x,y)` or `type(text)`, which your code executes on a computer or browser environment and then returns screenshots of the outcomes back to the model.

This loop lets you automate many tasks requiring clicking, typing, scrolling, and more. For example, booking a flight, searching for a product, or filling out a form.

### Setting Up Your Environment

Before integrating the tool, prepare an environment that can capture screenshots and execute the recommended actions. We recommend using a sandboxed environment for safety reasons.

#### Set Up a Local Browsing Environment

You can use a browser automation framework such as Playwright or Selenium.

```javascript
import { chromium } from "playwright";

const browser = await chromium.launch({
  headless: false,
  chromiumSandbox: true,
  env: {},
  args: ["--disable-extensions", "--disable-file-system"],
});
const page = await browser.newPage();
await page.setViewportSize({ width: 1024, height: 768 });
await page.goto("https://bing.com");

await page.waitForTimeout(10000);

browser.close();
```

### Integrating the CUA Loop

These are the high-level steps you need to follow to integrate the computer use tool:

1. **Send a request to the model**: Include the `computer` tool as part of the available tools, specifying the display size and environment
2. **Receive a response from the model**: Check if the response has any `computer_call` items
3. **Execute the requested action**: Execute through code the corresponding action on your computer or browser environment
4. **Capture the updated state**: After executing the action, capture the updated state of the environment as a screenshot
5. **Repeat**: Send a new request with the updated state as a `computer_call_output`, and repeat this loop until the model stops requesting actions

### Send a CUA Request

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
  model: "computer-use-preview",
  tools: [
    {
      type: "computer_use_preview",
      display_width: 1024,
      display_height: 768,
      environment: "browser", // other possible values: "mac", "windows", "ubuntu"
    },
  ],
  input: [
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: "Check the latest OpenAI news on bing.com.",
        },
      ],
    },
  ],
  reasoning: {
    summary: "concise",
  },
  truncation: "auto",
});
```

### Execute Actions

Execute the corresponding actions on your computer or browser. How you map a computer call to actions through code depends on your environment.

```javascript
async function handleModelAction(page, action) {
  const actionType = action.type;

  try {
    switch (actionType) {
      case "click": {
        const { x, y, button = "left" } = action;
        console.log(`Action: click at (${x}, ${y}) with button '${button}'`);
        await page.mouse.click(x, y, { button });
        break;
      }

      case "scroll": {
        const { x, y, scrollX, scrollY } = action;
        console.log(
          `Action: scroll at (${x}, ${y}) with offsets (scrollX=${scrollX}, scrollY=${scrollY})`
        );
        await page.mouse.move(x, y);
        await page.evaluate(`window.scrollBy(${scrollX}, ${scrollY})`);
        break;
      }

      case "keypress": {
        const { keys } = action;
        for (const k of keys) {
          console.log(`Action: keypress '${k}'`);
          if (k.includes("ENTER")) {
            await page.keyboard.press("Enter");
          } else if (k.includes("SPACE")) {
            await page.keyboard.press(" ");
          } else {
            await page.keyboard.press(k);
          }
        }
        break;
      }
    }
  } catch (error) {
    console.error(`Error executing action ${actionType}:`, error);
  }
}
```

### Limitations

Computer use is in beta. Because the model is still in preview and may be susceptible to exploits and inadvertent mistakes, we discourage trusting it in fully authenticated environments or for high-stakes tasks.

### Risks and Safety Best Practices

- Use sandboxed environments
- Avoid exposing sensitive data
- Implement proper error handling
- Monitor and log all actions
- Use appropriate approval mechanisms for sensitive operations

You must use the Computer Use tool in line with OpenAI's Usage Policy and Business Terms.
