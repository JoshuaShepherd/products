# Image Generation

Allow models to generate or edit images.

The image generation tool allows you to generate images using a text prompt, and optionally image inputs. It leverages the [GPT Image model](/docs/models/gpt-image-1), and automatically optimizes text inputs for improved performance.

To learn more about image generation, refer to our dedicated [image generation guide](/docs/guides/image-generation?image-generation-model=gpt-image-1&api=responses).

## Usage

When you include the `image_generation` tool in your request, the model can decide when and how to generate images as part of the conversation, using your prompt and any provided image inputs.

The `image_generation_call` tool call result will include a base64-encoded image.

### Generate an image

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

```python
from openai import OpenAI
import base64

client = OpenAI() 

response = client.responses.create(
    model="gpt-5",
    input="Generate an image of gray tabby cat hugging an otter with an orange scarf",
    tools=[{"type": "image_generation"}],
)

# Save the image to a file
image_data = [
    output.result
    for output in response.output
    if output.type == "image_generation_call"
]
    
if image_data:
    image_base64 = image_data[0]
    with open("otter.png", "wb") as f:
        f.write(base64.b64decode(image_base64))
```

You can [provide input images](/docs/guides/image-generation?image-generation-model=gpt-image-1#edit-images) using file IDs or base64 data.

To force the image generation tool call, you can set the parameter `tool_choice` to `{"type": "image_generation"}`.

## Tool options

You can configure the following output options as parameters for the [image generation tool](/docs/api-reference/responses/create#responses-create-tools):

* Size: Image dimensions (e.g., 1024x1024, 1024x1536)
* Quality: Rendering quality (e.g. low, medium, high)
* Format: File output format
* Compression: Compression level (0-100%) for JPEG and WebP formats
* Background: Transparent or opaque

`size`, `quality`, and `background` support the `auto` option, where the model will automatically select the best option based on the prompt.

For more details on available options, refer to the [image generation guide](/docs/guides/image-generation#customize-image-output).

## Revised prompt

When using the image generation tool, the mainline model (e.g. `gpt-4.1`) will automatically revise your prompt for improved performance.

You can access the revised prompt in the `revised_prompt` field of the image generation call:

```json
{
  "id": "ig_123",
  "type": "image_generation_call",
  "status": "completed",
  "revised_prompt": "A gray tabby cat hugging an otter. The otter is wearing an orange scarf. Both animals are cute and friendly, depicted in a warm, heartwarming style.",
  "result": "..."
}
```

## Prompting tips

Image generation works best when you use terms like "draw" or "edit" in your prompt.

For example, if you want to combine images, instead of saying "combine" or "merge", you can say something like "edit the first image by adding this element from the second image".

## Multi-turn editing

You can iteratively edit images by referencing previous response or image IDs. This allows you to refine images across multiple turns in a conversation.

### Using previous response ID

Multi-turn image generation

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
  model: "gpt-5",
  input:
    "Generate an image of gray tabby cat hugging an otter with an orange scarf",
  tools: [{ type: "image_generation" }],
});

const imageData = response.output
  .filter((output) => output.type === "image_generation_call")
  .map((output) => output.result);

if (imageData.length > 0) {
  const imageBase64 = imageData[0];
  const fs = await import("fs");
  fs.writeFileSync("cat_and_otter.png", Buffer.from(imageBase64, "base64"));
}

// Follow up

const response_fwup = await openai.responses.create({
  model: "gpt-5",
  previous_response_id: response.id,
  input: "Now make it look realistic",
  tools: [{ type: "image_generation" }],
});

const imageData_fwup = response_fwup.output
  .filter((output) => output.type === "image_generation_call")
  .map((output) => output.result);

if (imageData_fwup.length > 0) {
  const imageBase64 = imageData_fwup[0];
  const fs = await import("fs");
  fs.writeFileSync(
    "cat_and_otter_realistic.png",
    Buffer.from(imageBase64, "base64")
  );
}
```

```python
from openai import OpenAI
import base64

client = OpenAI()

response = client.responses.create(
    model="gpt-5",
    input="Generate an image of gray tabby cat hugging an otter with an orange scarf",
    tools=[{"type": "image_generation"}],
)

image_data = [
    output.result
    for output in response.output
    if output.type == "image_generation_call"
]

if image_data:
    image_base64 = image_data[0]

    with open("cat_and_otter.png", "wb") as f:
        f.write(base64.b64decode(image_base64))

# Follow up

response_fwup = client.responses.create(
    model="gpt-5",
    previous_response_id=response.id,
    input="Now make it look realistic",
    tools=[{"type": "image_generation"}],
)

image_data_fwup = [
    output.result
    for output in response_fwup.output
    if output.type == "image_generation_call"
]

if image_data_fwup:
    image_base64 = image_data_fwup[0]
    with open("cat_and_otter_realistic.png", "wb") as f:
        f.write(base64.b64decode(image_base64))
```

### Using image ID

Multi-turn image generation

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
  model: "gpt-5",
  input:
    "Generate an image of gray tabby cat hugging an otter with an orange scarf",
  tools: [{ type: "image_generation" }],
});

const imageGenerationCalls = response.output.filter(
  (output) => output.type === "image_generation_call"
);

const imageData = imageGenerationCalls.map((output) => output.result);

if (imageData.length > 0) {
  const imageBase64 = imageData[0];
  const fs = await import("fs");
  fs.writeFileSync("cat_and_otter.png", Buffer.from(imageBase64, "base64"));
}

// Follow up

const response_fwup = await openai.responses.create({
  model: "gpt-5",
  input: [
    {
      role: "user",
      content: [{ type: "input_text", text: "Now make it look realistic" }],
    },
    {
      type: "image_generation_call",
      id: imageGenerationCalls[0].id,
    },
  ],
  tools: [{ type: "image_generation" }],
});

const imageData_fwup = response_fwup.output
  .filter((output) => output.type === "image_generation_call")
  .map((output) => output.result);

if (imageData_fwup.length > 0) {
  const imageBase64 = imageData_fwup[0];
  const fs = await import("fs");
  fs.writeFileSync(
    "cat_and_otter_realistic.png",
    Buffer.from(imageBase64, "base64")
  );
}
```

```python
import openai
import base64

response = openai.responses.create(
    model="gpt-5",
    input="Generate an image of gray tabby cat hugging an otter with an orange scarf",
    tools=[{"type": "image_generation"}],
)

image_generation_calls = [
    output
    for output in response.output
    if output.type == "image_generation_call"
]

image_data = [output.result for output in image_generation_calls]

if image_data:
    image_base64 = image_data[0]

    with open("cat_and_otter.png", "wb") as f:
        f.write(base64.b64decode(image_base64))

# Follow up

response_fwup = openai.responses.create(
    model="gpt-5",
    input=[
        {
            "role": "user",
            "content": [{"type": "input_text", "text": "Now make it look realistic"}],
        },
        {
            "type": "image_generation_call",
            "id": image_generation_calls[0].id,
        },
    ],
    tools=[{"type": "image_generation"}],
)

image_data_fwup = [
    output.result
    for output in response_fwup.output
    if output.type == "image_generation_call"
]

if image_data_fwup:
    image_base64 = image_data_fwup[0]
    with open("cat_and_otter_realistic.png", "wb") as f:
        f.write(base64.b64decode(image_base64))
```

## Image editing

You can edit images by providing input images along with your text prompt. The model can modify, enhance, or combine images based on your instructions.

### Edit with file ID

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

// First upload an image file
const file = await openai.files.create({
  file: fs.createReadStream("original_image.png"),
  purpose: "user_data",
});

const response = await openai.responses.create({
  model: "gpt-5",
  input: [
    {
      role: "user",
      content: [
        { type: "input_text", text: "Add a sunset background to this image" },
        { type: "input_file", file_id: file.id },
      ],
    },
  ],
  tools: [{ type: "image_generation" }],
});

// Save the edited image
const imageData = response.output
  .filter((output) => output.type === "image_generation_call")
  .map((output) => output.result);

if (imageData.length > 0) {
  const imageBase64 = imageData[0];
  fs.writeFileSync("edited_image.png", Buffer.from(imageBase64, "base64"));
}
```

```python
from openai import OpenAI
import base64

client = OpenAI()

# First upload an image file
file = client.files.create(
    file=open("original_image.png", "rb"),
    purpose="user_data"
)

response = client.responses.create(
    model="gpt-5",
    input=[
        {
            "role": "user",
            "content": [
                {"type": "input_text", "text": "Add a sunset background to this image"},
                {"type": "input_file", "file_id": file.id},
            ],
        },
    ],
    tools=[{"type": "image_generation"}],
)

# Save the edited image
image_data = [
    output.result
    for output in response.output
    if output.type == "image_generation_call"
]

if image_data:
    image_base64 = image_data[0]
    with open("edited_image.png", "wb") as f:
        f.write(base64.b64decode(image_base64))
```

### Edit with base64 data

```javascript
import OpenAI from "openai";
import fs from "fs";

const openai = new OpenAI();

// Read and encode the original image
const imageBuffer = fs.readFileSync("original_image.png");
const imageBase64 = imageBuffer.toString("base64");

const response = await openai.responses.create({
  model: "gpt-5",
  input: [
    {
      role: "user",
      content: [
        { type: "input_text", text: "Add a sunset background to this image" },
        {
          type: "input_file",
          filename: "original_image.png",
          file_data: `data:image/png;base64,${imageBase64}`,
        },
      ],
    },
  ],
  tools: [{ type: "image_generation" }],
});

// Save the edited image
const imageData = response.output
  .filter((output) => output.type === "image_generation_call")
  .map((output) => output.result);

if (imageData.length > 0) {
  const editedImageBase64 = imageData[0];
  fs.writeFileSync("edited_image.png", Buffer.from(editedImageBase64, "base64"));
}
```

```python
from openai import OpenAI
import base64

client = OpenAI()

# Read and encode the original image
with open("original_image.png", "rb") as f:
    image_data = f.read()

image_base64 = base64.b64encode(image_data).decode("utf-8")

response = client.responses.create(
    model="gpt-5",
    input=[
        {
            "role": "user",
            "content": [
                {"type": "input_text", "text": "Add a sunset background to this image"},
                {
                    "type": "input_file",
                    "filename": "original_image.png",
                    "file_data": f"data:image/png;base64,{image_base64}",
                },
            ],
        },
    ],
    tools=[{"type": "image_generation"}],
)

# Save the edited image
edited_image_data = [
    output.result
    for output in response.output
    if output.type == "image_generation_call"
]

if edited_image_data:
    edited_image_base64 = edited_image_data[0]
    with open("edited_image.png", "wb") as f:
        f.write(base64.b64decode(edited_image_base64))
```

## Advanced configuration

### Custom tool options

You can configure specific options for image generation:

```javascript
const response = await openai.responses.create({
  model: "gpt-5",
  input: "Generate a high-quality portrait of a cat",
  tools: [
    {
      type: "image_generation",
      size: "1024x1536",
      quality: "high",
      format: "png",
      background: "transparent"
    }
  ],
});
```

```python
response = client.responses.create(
    model="gpt-5",
    input="Generate a high-quality portrait of a cat",
    tools=[
        {
            "type": "image_generation",
            "size": "1024x1536",
            "quality": "high",
            "format": "png",
            "background": "transparent"
        }
    ],
)
```

### Force image generation

To ensure the model generates an image, use the `tool_choice` parameter:

```javascript
const response = await openai.responses.create({
  model: "gpt-5",
  input: "Create an image of a futuristic city",
  tools: [{ type: "image_generation" }],
  tool_choice: { type: "image_generation" },
});
```

```python
response = client.responses.create(
    model="gpt-5",
    input="Create an image of a futuristic city",
    tools=[{"type": "image_generation"}],
    tool_choice={"type": "image_generation"},
)
```

## Best practices

1. **Use descriptive prompts**: Be specific about what you want to generate, including style, composition, and mood.

2. **Iterative refinement**: Use multi-turn editing to refine images step by step.

3. **Reference previous images**: When editing, reference specific image IDs to maintain context.

4. **Optimize for your use case**: Choose appropriate size, quality, and format settings based on your needs.

5. **Handle base64 encoding**: Properly encode and decode base64 image data when saving or processing images.

## Limitations

- Image generation is subject to OpenAI's content policy
- Generated images are not stored permanently - save them if you need them later
- The model may not always generate images exactly as described in complex prompts
- File size limits apply to input images

## Usage notes

|Responses|Chat Completions|Assistants|
|---|---|---|
|Tier 1: 100 RPM<br>Tier 2 and 3: 500 RPM<br>Tier 4 and 5: 1000 RPM|Pricing|ZDR and data residency|
