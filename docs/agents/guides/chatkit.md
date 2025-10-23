# ChatKit

Build and customize an embeddable chat with ChatKit.

ChatKit is the best way to build agentic chat experiences. Whether you're building an internal knowledge base assistant, HR onboarding helper, research companion, shopping or scheduling assistant, troubleshooting bot, financial planning advisor, or support agent, ChatKit provides a customizable chat embed to handle all user experience details.

Use ChatKit's embeddable UI widgets, customizable prompts, tool‑invocation support, file attachments, and chain‑of‑thought visualizations to build agents without reinventing the chat UI.

## Overview

There are two ways to implement ChatKit:

*   **Recommended integration**. Embed ChatKit in your frontend, customize its look and feel, let OpenAI host and scale the backend from [Agent Builder](/docs/guides/agent-builder). Requires a development server.
*   **Advanced integration**. Run ChatKit on your own infrastructure. Use the ChatKit Python SDK and connect to any agentic backend. Use widgets to build the frontend.

## Get started with ChatKit

### Embed ChatKit in your frontend

Embed a chat widget, customize its look and feel, and let OpenAI host and scale the backend

At a high level, setting up ChatKit is a three-step process. Create an agent workflow, hosted on OpenAI servers. Then set up ChatKit and add features to build your chat experience.

![OpenAI-hosted ChatKit](https://cdn.openai.com/API/docs/images/openai-hosted.png)

### 1. Create an agent workflow

Create an agent workflow with [Agent Builder](/docs/guides/agent-builder). Agent Builder is a visual canvas for designing multi-step agent workflows. You'll get a workflow ID.

The chat embedded in your frontend will point to the workflow you created as the backend.

### 2. Set up ChatKit in your product

To set up ChatKit, you'll create a ChatKit session and create a backend endpoint, pass in your workflow ID, exchange the client secret, add a script to embed ChatKit on your site.

1.  On your server, generate a client token.
    
    This snippet spins up a FastAPI service whose sole job is to create a new ChatKit session via the [OpenAI Python SDK](https://github.com/openai/chatkit-python) and hand back the session's client secret:
    
    server.py
    
    ```python
    from fastapi import FastAPI
    from pydantic import BaseModel
    from openai import OpenAI
    import os
    
    app = FastAPI()
    openai = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    
    @app.post("/api/chatkit/session")
    def create_chatkit_session():
        session = openai.chatkit.sessions.create({
          # ...
        })
        return { client_secret: session.client_secret }
    ```
    
2.  In your server-side code, pass in your workflow ID and secret key to the session endpoint.
    
    The client secret is the credential that your ChatKit frontend uses to open or refresh the chat session. You don't store it; you immediately hand it off to the ChatKit client library.
    
    See the [chatkit-js repo](https://github.com/openai/chatkit-js) on GitHub.
    
    chatkit.ts
    
    ```typescript
    export default async function getChatKitSessionToken(
    deviceId: string
    ): Promise<string> {
    const response = await fetch("https://api.openai.com/v1/chatkit/sessions", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        "OpenAI-Beta": "chatkit_beta=v1",
        Authorization: "Bearer " + process.env.VITE_OPENAI_API_SECRET_KEY,
        },
        body: JSON.stringify({
        workflow: { id: "wf_68df4b13b3588190a09d19288d4610ec0df388c3983f58d1" },
        user: deviceId,
        }),
    });
    
    const { client_secret } = await response.json();
    
    return client_secret;
    }
    ```
    
3.  In your project directory, install the ChatKit React bindings:
    
    ```bash
    npm install @openai/chatkit-react
    ```
    
4.  Add the ChatKit JS script to your page. Drop this snippet into your page's `<head>` or wherever you load scripts, and the browser will fetch and run ChatKit for you.
    
    index.html
    
    ```html
    <script
    src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
    async
    ></script>
    ```
    
5.  Render ChatKit in your UI. This code fetches the client secret from your server and mounts a live chat widget, connected to your workflow as the backend.
    
    Your frontend code
    
    ```react
    import { ChatKit, useChatKit } from '@openai/chatkit-react';
    
       export function MyChat() {
         const { control } = useChatKit({
           api: {
             async getClientSecret(existing) {
               if (existing) {
                 // implement session refresh
               }
    
               const res = await fetch('/api/chatkit/session', {
                 method: 'POST',
                 headers: {
                   'Content-Type': 'application/json',
                 },
               });
               const { client_secret } = await res.json();
               return client_secret;
             },
           },
         });
    
         return <ChatKit control={control} className="h-[600px] w-[320px]" />;
       }
    ```
    
    ```javascript
    const chatkit = document.getElementById('my-chat');
    
      chatkit.setOptions({
        api: {
          getClientSecret(currentClientSecret) {
            if (!currentClientSecret) {
              const res = await fetch('/api/chatkit/start', { method: 'POST' })
              const {client_secret} = await res.json();
              return client_secret
            }
            const res = await fetch('/api/chatkit/refresh', {
              method: 'POST',
              body: JSON.stringify({ currentClientSecret })
              headers: {
                'Content-Type': 'application/json',
              },
            });
            const {client_secret} = await res.json();
            return client_secret
          }
        },
      });
    ```

### 3. Build and iterate

See the [custom theming](/docs/guides/chatkit-themes), [widgets](/docs/guides/chatkit-widgets), and [actions](/docs/guides/chatkit-actions) docs to learn more about how ChatKit works. Or explore the following resources to test your chat, iterate on prompts, and add widgets and tools.

#### Build your implementation

*   [ChatKit docs on GitHub](https://openai.github.io/chatkit-python) - Learn to handle authentication, add theming and customization, and more.
*   [ChatKit Python SDK](https://github.com/openai/chatkit-python) - Add server-side storage, access control, tools, and other backend functionality.
*   [ChatKit JS SDK](https://github.com/openai/chatkit-js) - Check out the ChatKit JS repo.

#### Explore ChatKit UI

*   [chatkit.world](https://chatkit.world) - Play with an interactive demo of ChatKit.
*   [Widget builder](https://widgets.chatkit.studio) - Browse available widgets.
*   [ChatKit playground](https://chatkit.studio/playground) - Play with an interactive demo to learn by doing.

#### See working examples

*   [Samples on GitHub](https://github.com/openai/openai-chatkit-advanced-samples) - See working examples of ChatKit and get inspired.
*   [Starter app repo](https://github.com/openai/openai-chatkit-starter-app) - Clone a repo to start with a fully working template.

## Next steps

When you're happy with your ChatKit implementation, learn how to optimize it with [evals](/docs/guides/agent-evals). To run ChatKit on your own infrastructure, see the [advanced integration docs](/docs/guides/custom-chatkit).

## Theming and customization in ChatKit

Configure colors, typography, density, and component variants.

After following the [ChatKit quickstart](/docs/guides/chatkit), learn how to change themes and add customization to your chat embed. Match your app's aesthetic with light and dark themes, setting an accent color, controlling the density, and rounded corners.

### Overview

At a high level, customize the theme by passing in an options object. If you followed the [ChatKit quickstart](/docs/guides/chatkit) to embed ChatKit in your frontend, use the React syntax below.

*   **React**: Pass options to `useChatKit({...})`
*   **Advanced integrations**: Set options with `chatkit.setOptions({...})`

In both integration types, the shape of the options object is the same.

### Explore customization options

Visit [ChatKit Studio](https://chatkit.studio) to see working implementations of ChatKit and interactive builders. If you like building by trying things rather than reading, these resources are a good starting point.

#### Explore ChatKit UI

*   [chatkit.world](https://chatkit.world) - Play with an interactive demo of ChatKit.
*   [Widget builder](https://widgets.chatkit.studio) - Browse available widgets.
*   [ChatKit playground](https://chatkit.studio/playground) - Play with an interactive demo to learn by doing.

#### See working examples

*   [Samples on GitHub](https://github.com/openai/openai-chatkit-advanced-samples) - See working examples of ChatKit and get inspired.
*   [Starter app repo](https://github.com/openai/openai-chatkit-starter-app) - Clone a repo to start with a fully working template.

### Change the theme

Match the look and feel of your product by specifying colors, typography, and more. Below, we set to dark mode, change colors, round the corners, adjust the information density, and set the font.

For all theming options, see the [API reference](/chatkit-js-internal/api/openai/chatkit/type-aliases/themeoption/).

```jsx
const options: Partial<ChatKitOptions> = {
  theme: {
    colorScheme: "dark",
    color: { 
      accent: { 
        primary: "#2D8CFF", 
        level: 2 
      }
    },
    radius: "round", 
    density: "compact",
    typography: { fontFamily: "'Inter', sans-serif" },
  },
};
```

### Customize the start screen text

Let users know what to ask or guide their first input by changing the composer's placeholder text.

```jsx
const options: Partial<ChatKitOptions> = {
  composer: {
    placeholder: "Ask anything about your data…",
  },
  startScreen: {
    greeting: "Welcome to FeedbackBot!",
  },
};
```

### Show starter prompts for new threads

Guide users on what to ask or do by suggesting prompt ideas when starting a conversation.

```js
const options: Partial<ChatKitOptions> = {
  startScreen: {
    greeting: "What can I help you build today?",
    prompts: [
      { 
        name: "Check on the status of a ticket", 
        prompt: "Can you help me check on the status of a ticket?", 
        icon: "search"
      },
      { 
        name: "Create Ticket", 
        prompt: "Can you help me create a new support ticket?", 
        icon: "write"
      },
    ],
  },
};
```

### Add custom buttons to the header

Custom header buttons help you add navigation, context, or actions relevant to your integration.

```jsx
const options: Partial<ChatKitOptions> = {
  header: {
    customButtonLeft: {
      icon: "settings-cog",
      onClick: () => openProfileSettings(),
    },
    customButtonRight: {
      icon: "home",
      onClick: () => openHomePage(),
    },
  },
};
```

### Enable file attachments

Attachments are disabled by default. To enable them, add attachments configuration. Unless you are doing a custom backend, you must use the `hosted` upload strategy. See the Python SDK docs for more information on other upload strategies work with a custom backend.

You can also control the number, size, and types of files that users can attach to messages.

```jsx
const options: Partial<ChatKitOptions> = {
  composer: {
    attachments: {
      uploadStrategy: { type: 'hosted' },
      maxSize: 20 * 1024 * 1024, // 20MB per file
      maxCount: 3,
      accept: { "application/pdf": [".pdf"], "image/*": [".png", ".jpg"] },
    },
  },
}
```

### Enable @mentions in the composer with entity tags

Let users tag custom "entities" with @-mentions. This enables richer conversation context and interactivity.

*   Use `onTagSearch` to return a list of entities based on the input query.
*   Use `onClick` to handle the click event of an entity.

```jsx
const options: Partial<ChatKitOptions> = {
  entities: {
    async onTagSearch(query) {
      return [
        { 
          id: "user_123", 
          title: "Jane Doe", 
          group: "People", 
          interactive: true, 
        },
        { 
          id: "document_123", 
          title: "Quarterly Plan", 
          group: "Documents", 
          interactive: true, 
        },
      ]
    },
    onClick: (entity) => {
      navigateToEntity(entity.id);
    },
  },
};
```

### Customize how entity tags appear

You can customize the appearance of entity tags on mouseover using widgets. Show rich previews such as a business card, document summary, or image when the user hovers over an entity tag.

[Widget builder](https://widgets.chatkit.studio)

```jsx
const options: Partial<ChatKitOptions> = {
  entities: {
    async onTagSearch() { /* ... */ },
    onRequestPreview: async (entity) => ({
      preview: {
        type: "Card",
        children: [
          { type: "Text", value: `Profile: ${entity.title}` },
          { type: "Text", value: "Role: Developer" },
        ],
      },
    }),
  },
};
```

### Add custom tools to the composer

Enhance productivity by letting users trigger app-specific actions from the composer bar. The selected tool will be sent to the model as a tool preference.

```jsx
const options: Partial<ChatKitOptions> = {
  composer: {
    tools: [
      {
        id: 'add-note',
        label: 'Add Note',
        icon: 'write',
        pinned: true,
      },
    ],
  },
};
```

### Toggle UI regions and features

Disable major UI regions and features if you need more customization over the options available in the header and want to implement your own instead. Disabling history can be useful when the concept of threads and history doesn't make sense for your use case—e.g., in a support chatbot.

```jsx
const options: Partial<ChatKitOptions> = {
  history: { enabled: false },
  header: { enabled: false },
};
```

### Override the locale

Override the default locale if you have an app-wide language setting. By default, the locale is set to the browser's locale.

```jsx
const options: Partial<ChatKitOptions> = {
  locale: 'de-DE',
};
```

## ChatKit widgets

Learn how to design widgets in your chat experience.

Widgets are the containers and components that come with ChatKit. You can use prebuilt widgets, modify templates, or design your own to fully customize ChatKit in your product.

![widgets](https://cdn.openai.com/API/images/widget-graphic.png)

### Design widgets quickly

Use the [Widget Builder](https://widgets.chatkit.studio) in ChatKit Studio to experiment with card layouts, list rows, and preview components. When you have a design you like, copy the generated JSON into your integration and serve it from your backend.

### Upload assets

Upload assets to customize ChatKit widgets to match your product. ChatKit expects uploads (files and images) to be hosted by your backend before they are referenced in a message. Follow the [upload guide in the Python SDK](https://openai.github.io/chatkit-python/server) for a reference implementation.

ChatKit widgets can surface context, shortcuts, and interactive cards directly in the conversation. When a user clicks a widget button, your application receives a custom action payload so you can respond from your backend.

### Handle actions on your server

Widget actions allow users to trigger logic from the UI. Actions can be bound to different events on various widget nodes (e.g., button clicks) and then handled by your server or client integration.

Capture widget events with the `onAction` callback from `WidgetsOption` or equivalent React hook. Forward the action payload to your backend to handle actions.

```ts
chatkit.setOptions({
  widgets: {
    async onAction(action, item) {
      await fetch('/api/widget-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, itemId: item.id }),
      });
    },
  },
});
```

Looking for a full server example? See the [ChatKit Python SDK docs](https://openai.github.io/chatkit-python-sdk/guides/widget-actions) for an end-to-end walkthrough.

Learn more in the [actions docs](/docs/guides/chatkit-actions).

## Actions in ChatKit

Trigger actions on the backend from user interactions in your chat.

Actions are a way for the ChatKit SDK frontend to trigger a streaming response without the user submitting a message. They can also be used to trigger side-effects outside ChatKit SDK.

### Triggering actions

#### In response to user interaction with widgets

Actions can be triggered by attaching an `ActionConfig` to any widget node that supports it. For example, you can respond to click events on Buttons. When a user clicks on this button, the action will be sent to your server where you can update the widget, run inference, stream new thread items, etc.

```python
Button(
    label="Example",
    onClickAction=ActionConfig(
      type="example",
      payload={"id": 123},
    )
)
```

Actions can also be sent imperatively by your frontend with `sendAction()`. This is probably most useful when you need ChatKit to respond to interaction happening outside ChatKit, but it can also be used to chain actions when you need to respond on both the client and the server (more on that below).

```tsx
await chatKit.sendAction({
  type: "example",
  payload: { id: 123 },
});
```

### Handling actions

#### On the server

By default, actions are sent to your server. You can handle actions on your server by implementing the `action` method on `ChatKitServer`.

```python
class MyChatKitServer(ChatKitServer[RequestContext])
    async def action(
        self,
        thread: ThreadMetadata,
        action: Action[str, Any],
        sender: WidgetItem | None,
        context: RequestContext,
    ) -> AsyncIterator[Event]:
        if action.type == "example":
          await do_thing(action.payload['id'])

          # often you'll want to add a HiddenContextItem so the model
          # can see that the user did something
          await self.store.add_thread_item(
              thread.id,
              HiddenContextItem(
                  id="item_123",
                  created_at=datetime.now(),
                  content=(
                      "<USER_ACTION>The user did a thing</USER_ACTION>"
                  ),
              ),
              context,
          )

          # then you might want to run inference to stream a response
          # back to the user.
          async for e in self.generate(context, thread):
              yield e
```

**NOTE:** As with any client/server interaction, actions and their payloads are sent by the client and should be treated as untrusted data.

#### Client

Sometimes you'll want to handle actions in your client integration. To do that you need to specify that the action should be sent to your client-side action handler by adding `handler="client` to the `ActionConfig`.

```python
Button(
    label="Example",
    onClickAction=ActionConfig(
      type="example",
      payload={"id": 123},
      handler="client"
    )
)
```

Then, when the action is triggered, it will then be passed to a callback that you provide when instantiating ChatKit.

```ts
async function handleWidgetAction(action: {type: string, Record<string, unknown>}) {
  if (action.type === "example") {
    const res = await doSomething(action)

    // You can fire off actions to your server from here as well.
    // e.g. if you want to stream new thread items or update a widget.
    await chatKit.sendAction({
      type: "example_complete",
      payload: res
    })
  }
}

chatKit.setOptions({
  // other options...
  widgets: { onAction: handleWidgetAction }
})
```

### Strongly typed actions

By default `Action` and `ActionConfig` are not strongly typed. However, we do expose a `create` helper on `Action` making it easy to generate `ActionConfig`s from a set of strongly-typed actions.

```python
class ExamplePayload(BaseModel)
    id: int

ExampleAction = Action[Literal["example"], ExamplePayload]
OtherAction = Action[Literal["other"], None]

AppAction = Annotated[
  ExampleAction
  | OtherAction,
  Field(discriminator="type"),
]

ActionAdapter: TypeAdapter[AppAction] = TypeAdapter(AppAction)

def parse_app_action(action: Action[str, Any]): AppAction
  return ActionAdapter.model_validate(action)

# Usage in a widget
# Action provides a create helper which makes it easy to generate
# ActionConfigs from strongly typed actions.
Button(
    label="Example",
    onClickAction=ExampleAction.create(ExamplePayload(id=123))
)

# usage in action handler
class MyChatKitServer(ChatKitServer[RequestContext])
    async def action(
        self,
        thread: ThreadMetadata,
        action: Action[str, Any],
        sender: WidgetItem | None,
        context: RequestContext,
    ) -> AsyncIterator[Event]:
        # add custom error handling if needed
        app_action = parse_app_action(action)
        if (app_action.type == "example"):
            await do_thing(app_action.payload.id)
```

### Use widgets and actions to create custom forms

When widget nodes that take user input are mounted inside a `Form`, the values from those fields will be included in the `payload` of all actions that originate from within the `Form`.

Form values are keyed in the `payload` by their `name` e.g.

*   `Select(name="title")` → `action.payload.title`
*   `Select(name="todo.title")` → `action.payload.todo.title`

```python
Form(
	direction="col",
	validation="native"
  onSubmitAction=ActionConfig(
	  type="update_todo",
	  payload={"id": todo.id}
  ),
  children=[
    Title(value="Edit Todo"),

    Text(value="Title", color="secondary", size="sm"),
    Text(
      value=todo.title,
      editable=EditableProps(name="title", required=True),
    )

    Text(value="Description", color="secondary", size="sm"),
    Text(
      value=todo.description,
      editable=EditableProps(name="description"),
    ),

    Button(label="Save", type="submit")
  ]
)

class MyChatKitServer(ChatKitServer[RequestContext])
    async def action(
        self,
        thread: ThreadMetadata,
        action: Action[str, Any],
        sender: WidgetItem | None,
        context: RequestContext,
    ) -> AsyncIterator[Event]:
        if (action.type == "update_todo"):
          id = action.payload['id']
          # Any action that originates from within the Form will
          # include title and description
          title = action.payload['title']
          description = action.payload['description']

	        # ...
```

#### Validation

`Form` uses basic native form validation; enforcing `required` and `pattern` on fields where they are configured and blocking submission when the form has any invalid field.

We may add new validation modes with better UX, more expressive validation, custom error display, etc in the future. Until then, widgets are not a great medium for complex forms with tricky validation. If you have this need, a better pattern would be to use client side action handling to trigger a modal, show a custom form there, then pass the result back into ChatKit with `sendAction`.

#### Treating `Card` as a `Form`

You can pass `asForm=True` to `Card` and it will behave as a `Form`, running validation and passing collected fields to the Card's `confirm` action.

#### Payload key collisions

If there is a naming collision with some other existing pre-defined key on your payload, the form value will be ignored. This is probably a bug, so we'll emit an `error` event when we see this.

### Control loading state interactions in widgets

Use `ActionConfig.loadingBehavior` to control how actions trigger different loading states in a widget.

```python
Button(
    label="This make take a while...",
    onClickAction=ActionConfig(
      type="long_running_action_that_should_block_other_ui_interactions",
      loadingBehavior="container"
    )
)
```

|Value|Behavior|
|---|---|
|auto|The action will adapt to how it's being used. (default)|
|self|The action triggers loading state on the widget node that the action was bound to.|
|container|The action triggers loading state on the entire widget container. This causes the widget to fade out slightly and become inert.|
|none|No loading state|

#### Using `auto` behavior

Generally, we recommend using `auto`, which is the default. `auto` triggers loading states based on where the action is bound, for example:

*   `Button.onClickAction` → `self`
*   `Select.onChangeAction` → `none`
*   `Card.confirm.action` → `container`

## Advanced integrations with ChatKit

Use your own infrastructure with ChatKit for more customization.

When you need full control—custom authentication, data residency, on‑prem deployment, or bespoke agent orchestration—you can run ChatKit on your own infrastructure. Use OpenAI's advanced self‑hosted option to use your own server and customized ChatKit.

Our recommended ChatKit integration helps you get started quickly: embed a chat widget, customize its look and feel, let OpenAI host and scale the backend. [Use simpler integration →](/docs/guides/chatkit)

### Run ChatKit on your own infrastructure

At a high level, an advanced ChatKit integration is a process of building your own ChatKit server and adding widgets to build out your chat surface. You'll use OpenAI APIs and your ChatKit server to build a custom chat powered by OpenAI models.

![OpenAI-hosted ChatKit](https://cdn.openai.com/API/docs/images/self-hosted.png)

### Set up your ChatKit server

Follow the [server guide on GitHub](https://github.com/openai/chatkit-python/blob/main/docs/server.md) to learn how to handle incoming requests, run tools, and stream results back to the client. The snippets below highlight the main components.

#### 1. Install the server package

```bash
pip install openai-chatkit
```

#### 2. Implement a server class

`ChatKitServer` drives the conversation. Override `respond` to stream events whenever a user message or client tool output arrives. Helpers like `stream_agent_response` make it simple to connect to the Agents SDK.

```python
class MyChatKitServer(ChatKitServer):
    def __init__(self, data_store: Store, file_store: FileStore | None = None):
        super().__init__(data_store, file_store)

    assistant_agent = Agent[AgentContext](
        model="gpt-4.1",
        name="Assistant",
        instructions="You are a helpful assistant",
    )

    async def respond(
        self,
        thread: ThreadMetadata,
        input: UserMessageItem | ClientToolCallOutputItem,
        context: Any,
    ) -> AsyncIterator[Event]:
        agent_context = AgentContext(
            thread=thread,
            store=self.store,
            request_context=context,
        )
        result = Runner.run_streamed(
            self.assistant_agent,
            await to_input_item(input, self.to_message_content),
            context=agent_context,
        )
        async for event in stream_agent_response(agent_context, result):
            yield event

    async def to_message_content(
        self, input: FilePart | ImagePart
    ) -> ResponseInputContentParam:
        raise NotImplementedError()
```

#### 3. Expose the endpoint

Use your framework of choice to forward HTTP requests to the server instance. For example, with FastAPI:

```python
app = FastAPI()
data_store = SQLiteStore()
file_store = DiskFileStore(data_store)
server = MyChatKitServer(data_store, file_store)

@app.post("/chatkit")
async def chatkit_endpoint(request: Request):
    result = await server.process(await request.body(), {})
    if isinstance(result, StreamingResult):
        return StreamingResponse(result, media_type="text/event-stream")
    return Response(content=result.json, media_type="application/json")
```

#### 4. Establish data store contract

Implement `chatkit.store.Store` to persist threads, messages, and files using your preferred database. The default example uses SQLite for local development. Consider storing the models as JSON blobs so library updates can evolve the schema without migrations.

#### 5. Provide file store contract

Provide a `FileStore` implementation if you support uploads. ChatKit works with direct uploads (the client POSTs the file to your endpoint) or two-phase uploads (the client requests a signed URL, then uploads to cloud storage). Expose previews to support inline thumbnails and handle deletions when threads are removed.

#### 6. Trigger client tools from the server

Client tools must be registered both in the client options and on your agent. Use `ctx.context.client_tool_call` to enqueue a call from an Agents SDK tool.

```python
@function_tool(description_override="Add an item to the user's todo list.")
async def add_to_todo_list(ctx: RunContextWrapper[AgentContext], item: str) -> None:
    ctx.context.client_tool_call = ClientToolCall(
        name="add_to_todo_list",
        arguments={"item": item},
    )

assistant_agent = Agent[AgentContext](
    model="gpt-4.1",
    name="Assistant",
    instructions="You are a helpful assistant",
    tools=[add_to_todo_list],
    tool_use_behavior=StopAtTools(stop_at_tool_names=[add_to_todo_list.name]),
)
```

#### 7. Use thread metadata and state

Use `thread.metadata` to store server-side state such as the previous Responses API run ID or custom labels. Metadata is not exposed to the client but is available in every `respond` call.

#### 8. Get tool status updates

Long-running tools can stream progress to the UI with `ProgressUpdateEvent`. ChatKit replaces the progress event with the next assistant message or widget output.

#### 9. Using server context

Pass a custom context object to `server.process(body, context)` to enforce permissions or propagate user identity through your store and file store implementations.

### Add inline interactive widgets

Widgets let agents surface rich UI inside the chat surface. Use them for cards, forms, text blocks, lists, and other layouts. The helper `stream_widget` can render a widget immediately or stream updates as they arrive.

```python
async def respond(
    self,
    thread: ThreadMetadata,
    input: UserMessageItem | ClientToolCallOutputItem,
    context: Any,
) -> AsyncIterator[Event]:
    widget = Card(
        children=[Text(
            id="description",
            value="Generated summary",
        )]
    )
    async for event in stream_widget(
        thread,
        widget,
        generate_id=lambda item_type: self.store.generate_item_id(item_type, thread, context),
    ):
        yield event
```

ChatKit ships with a wide set of widget nodes (cards, lists, forms, text, buttons, and more). See [widgets guide on GitHub](https://github.com/openai/chatkit-python/blob/main/docs/widgets.md) for all components, props, and streaming guidance.

See the [Widget Builder](https://widgets.chatkit.studio/) to explore and create widgets in an interactive UI.

### Use actions

Actions let the ChatKit UI trigger work without sending a user message. Attach an `ActionConfig` to any widget node that supports it—buttons, selects, and other controls can stream new thread items or update widgets in place. When a widget lives inside a `Form`, ChatKit includes the collected form values in the action payload.

On the server, implement the `action` method on `ChatKitServer` to process the payload and optionally stream additional events. You can also handle actions on the client by setting `handler="client"` and responding in JavaScript before forwarding follow-up work to the server.

See the [actions guide on GitHub](https://github.com/openai/chatkit-python/blob/main/docs/actions.md) for patterns like chaining actions, creating strongly typed payloads, and coordinating client/server handlers.

### Resources

Use the following resources and reference to complete your integration.

#### Design resources

*   Download [OpenAI Sans Variable](https://drive.google.com/file/d/10-dMu1Oknxg3cNPHZOda9a1nEkSwSXE1/view?usp=sharing).
*   Duplicate the file and customize components for your product.

#### Events reference

ChatKit emits `CustomEvent` instances from the Web Component. The payload shapes are:

```ts
type Events = {
    "chatkit.error": CustomEvent<{ error: Error }>;
    "chatkit.response.start": CustomEvent<void>;
    "chatkit.response.end": CustomEvent<void>;
    "chatkit.thread.change": CustomEvent<{ threadId: string | null }>;
    "chatkit.log": CustomEvent<{ name: string; data?: Record<string, unknown> }>;
};
```

#### Options reference

|Option|Type|Description|Default|
|---|---|---|---|
|apiURL|string|Endpoint that implements the ChatKit server protocol.|required|
|fetch|typeof fetch|Override fetch calls (for custom headers or auth).|window.fetch|
|theme|"light" | "dark"|UI theme.|"light"|
|initialThread|string | null|Thread to open on mount; null shows the new thread view.|null|
|clientTools|Record<string, Function>|Client-executed tools exposed to the model.||
|header|object | boolean|Header configuration or false to hide the header.|true|
|newThreadView|object|Customize greeting text and starter prompts.||
|messages|object|Configure message affordances (feedback, annotations, etc.).||
|composer|object|Control attachments, entity tags, and placeholder text.||
|entities|object|Callbacks for entity lookup, click handling, and previews.||
