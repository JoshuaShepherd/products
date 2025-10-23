# Agent Builder

**Beta**

Visually assemble, debug, and export multi-step agent workflows from the playground.

**Agent Builder** is a visual canvas for building multi-step agent workflows.

You can start from templates, drag and drop nodes for each step in your workflow, provide typed inputs and outputs, and preview runs using live data. When you're ready to deploy, embed the workflow into your site with ChatKit, or download the SDK code to run it yourself.

Use this guide to learn the process and parts of building agents.

## Agents and workflows

To build useful agents, you create workflows for them. A **workflow** is a combination of agents, tools, and control-flow logic. A workflow encapsulates all steps and actions involved in handling your tasks or powering your chats, with working code you can deploy when you're ready.

[Open Agent Builder](/agent-builder)  

There are three main steps in building agents to handle tasks:

1.  Design a workflow in [Agent Builder](/agent-builder). This defines your agents and how they'll work.
2.  Publish your workflow. It's an object with an ID and versioning.
3.  Deploy your workflow. Pass the ID into your [ChatKit](/docs/guides/chatkit) integration, or download the Agents SDK code to deploy your workflow yourself.

## Compose with nodes

In Agent Builder, insert and connect nodes to create your workflow. Each connection between nodes becomes a typed edge. Click a node to configure its inputs and outputs, observe the data contract between steps, and ensure downstream nodes receive the properties they expect.

### Examples and templates

Agent Builder provides templates for common workflow patterns. Start with a template to see how nodes work together, or start from scratch.

Here's a homework helper workflow. It uses agents to take questions, reframe them for better answers, route them to other specialized agents, and return an answer.

![prompts chat](https://cdn.openai.com/API/docs/images/homework-helper2.png)

### Available nodes

Nodes are the building blocks for agents. To see all available nodes and their configuration options, see the [node reference documentation](/docs/guides/node-reference).

### Preview and debug

As you build, you can test your workflow by using the **Preview** feature. Here, you can interactively run your workflow, attach sample files, and observe the execution of each node.

### Safety and risks

Building agent workflows comes with risks, like prompt injection and data leakage. See [safety in building agents](/docs/guides/agent-builder-safety) to learn about and help mitigate the risks of agent workflows.

### Evaluate your workflow

Run [trace graders](/docs/guides/trace-grading) inside of Agent Builder. In the top navigation, click **Evaluate**. Here, you can select a trace (or set of traces) and run custom graders to assess overall workflow performance.

## Publish your workflow

Agent Builder autosaves your work as you go. When you're happy with your workflow, publish it to create a new major version that acts as a snapshot. You can then use your workflow in [ChatKit](/docs/guides/chatkit), an OpenAI framework for embedding chat experiences.

You can create new versions or specify an older version in your API calls.

## Deploy in your product

When you're ready to implement the agent workflow you created, click **Code** in the top navigation. You have two options for implementing your workflow in production:

**ChatKit**: Follow the [ChatKit quickstart](/docs/guides/chatkit) and pass in your workflow ID to embed this workflow into your application. If you're not sure, we recommend this option.

**Advanced integration**: Copy the workflow code and use it anywhere. You can run ChatKit on your own infrastructure and use the Agents SDK to build and customize agent chat experiences.

## Next steps

Now that you've created an agent workflow, bring it into your product with ChatKit.

*   [ChatKit quickstart](/docs/guides/chatkit) →
*   [Advanced integration](/docs/guides/custom-chatkit) →

## Node Reference

**Beta**

Explore all available nodes for composing workflows in Agent Builder.

[Agent Builder](/agent-builder) is a visual canvas for composing agentic workflows. Workflows are made up of nodes and connections that control the sequence and flow. Insert nodes, then configure and connect them to define the process you want your agents to follow.

Explore all available nodes below. To learn more, read the [Agent Builder guide](/docs/guides/agent-builder).

### Core nodes

Get started with basic building blocks. All workflows have start and agent nodes.

![core nodes](https://cdn.openai.com/API/docs/images/core-nodes2.png)

#### Start

Define inputs to your workflow. For user input in a chat workflow, start nodes do two things:

*   Append the user input to the conversation history
*   Expose `input_as_text` to represent the text contents of this input

All chat start nodes have `input_as_text` as an input variable. You can add state variables too.

#### Agent

Define instructions, tools, and model configuration, or attach evaluations.

Keep each agent well defined in scope. In our homework helper example, we use one agent to rewrite the user's query for more specificity and relevance with the knowledge base. We use another agent to classify the query as either Q&A or fact-finding, and another agent to field each type of question.

Add model behavior instructions and user messages as you would with any other model prompt. To pipe output from a previous step, you can add it as context.

You can have as many agent nodes as you'd like.

#### Note

Leave comments and explanations about your workflow. Unlike other nodes, notes don't _do_ anything in the flow. They're just helpful commentary for you and your team.

### Tool nodes

Tool nodes let you equip your agents with tools and external services. You can retrieve data, monitor for misuse, and connect to external services.

![tool nodes](https://cdn.openai.com/API/docs/images/tool-nodes2.png)

#### File search

Retrieve data from vector stores you've created in the OpenAI platform. Search by vector store ID, and add a query for what the model should search for. You can use variables to include output from previous nodes in the workflow.

See the [file search documentation](/docs/guides/tools-file-search) to set up vector stores and see supported file types.

To search outside of your hosted storage with OpenAI, use [MCP](/docs/guides/node-reference#mcp) instead.

#### Guardrails

Set up input monitors for unwanted inputs such as personally identifiable information (PII), jailbreaks, hallucinations, and other misuse.

Guardrails are pass/fail by default, meaning they test the output from a previous node, and you define what happens next. When there's a guardrails failure, we recommend either ending the workflow or returning to the previous step with a reminder of safe use.

#### MCP

Call third-party tools and services. Connect with OpenAI connectors or third-party servers, or add your own server. MCP connections are helpful in a workflow that needs to read or search data in another application, like Gmail or Zapier.

Browse options in the Agent Builder. To learn more about MCP, see the [connectors and MCP documentation](/docs/guides/tools-connectors-mcp).

### Logic nodes

![logic nodes](https://cdn.openai.com/API/docs/images/logic-nodes.png)

Logic nodes let you write custom logic and define the control flow—for example, looping on custom conditions, or asking the user for approval before continuing an operation.

#### If/else

Add conditional logic. Use [Common Expression Language](https://cel.dev/) (CEL) to create a custom expression. Useful for defining what to do with input that's been sorted into classifications.

For example, if an agent classifies input as Q&A, route that query to the Q&A agent for a straightforward answer. If it's an open-ended query, route to an agent that finds relevant facts. Else, end the workflow.

#### While

Loop on custom conditions. Use [Common Expression Language](https://cel.dev/) (CEL) to create a custom expression. Useful for checking whether a condition is still true.

#### Human approval

Defer to end-users for approval. Useful for workflows where agents draft work that could use a human review before it goes out.

For example, picture an agent workflow that sends emails on your behalf. You'd include an agent node that outputs an email widget, then a human approval node immediately following. You can configure the human approval node to ask, "Would you like me to send this email?" and, if approved, proceeds to an MCP node that connects to Gmail.

### Data nodes

Data nodes let you define and manipulate data in your workflow. Reshape outputs or define global variables for use across your workflow.

![data nodes](https://cdn.openai.com/API/docs/images/data-nodes.png)

#### Transform

Reshape outputs (e.g., object → array). Useful for enforcing types to adhere to your schema or reshaping outputs for agents to read and understand as inputs.

#### Set state

Define global variables for use across the workflow. Useful for when an agent takes input and outputs something new that you'll want to use throughout the workflow. You can define that output as a new global variable.
