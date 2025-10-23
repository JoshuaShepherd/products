# Agent Evals

Measure agent quality with reproducible evaluations.

The OpenAI Platform offers a suite of evaluation tools to help you ensure your agents perform consistently and accurately.

For identifying errors at the workflow-level, we recommend our [trace grading](/docs/guides/trace-grading) functionality.

For an easy way to build and iterate on your evals, we recommend exploring [Datasets](/docs/guides/evaluation-getting-started).

If you need advanced features such as evaluation against external models, want to interact with your eval runs via API, or want to run evaluations on a larger scale, consider using [Evals](/docs/guides/evals) instead.

## Trace Grading

Grade model outputs with reproducible evaluations.

Trace grading is the process of assigning structured scores or labels to an agent's trace—the end-to-end log of decisions, tool calls, and reasoning steps—to assess correctness, quality, or adherence to expectations. These annotations help identify where the agent did well or made mistakes, enabling targeted improvements in orchestration or behavior.

Trace evals use those graded traces to systematically evaluate agent performance across many examples, helping to benchmark changes, identify regressions, or validate improvements. Unlike black-box evaluations, trace evals provide more data to better understand why an agent succeeds or fails.

Use both features to track, analyze, and optimize the performance of groups of agents.

### Get started with traces

1. In the dashboard, navigate to Logs > [Traces](/logs?api=traces).
2. Select a worfklow. You'll see logs from any workflows you created in [Agent Builder](/docs/guides/agent-builder).
3. Select a trace to inspect your workflow.
4. Create a grader, and run it to grade your agents' performance against grader criteria.

Trace grading is a valuable tool for error identification at scale, which is critical for building resilience into your AI applications. Learn more about our recommended process in our [cookbook](https://cookbook.openai.com/examples/evaluation/Building_resilient_prompts_using_an_evaluation_flywheel.md#).

### Evaluate traces with runs

1. Select **Grade all**. This takes you to the evaluation dashboard.
2. In the evaluation dashboard, add and edit test criteria.
3. Add a run to evaluate outputs. You can configure run options like model, date range, and tool calls to get more specificity in your eval.

Learn more about how you can use evals [here](/docs/guides/evals).

## Prompt Optimizer

Use your dataset to automatically improve your prompts.

The [prompt optimizer](/chat/edit?models=gpt-5&optimize=true) is a chat interface in the dashboard, where you enter a prompt, and we optimize it according to current best practices before returning it to you. Pairing the prompt optimizer with [datasets](/docs/guides/evaluation-getting-started) is a powerful way to automatically improve prompts.

### Prepare your data

1. Set up a [dataset](/docs/guides/evaluation-getting-started) containing the prompt you want to optimize and an evaluation dataset.
2. Create at least three rows of data with responses in your dataset.
3. For each row, create at least one grader result or human annotation.

The prompt optimizer can use the following from your dataset to improve your prompt:

* Annotations (Good/Bad and additional custom annotation columns you add)
* Text critiques written in **output_feedback**
* Results from graders

### How to use the prompt optimizer

1. Navigate to the [prompt optimizer](/chat/edit?models=gpt-5&optimize=true) in the dashboard.
2. When the optimized prompt is ready, view and test the new prompt.
3. Repeat. While a single optimization run may achieve your desired result, experiment with repeating the optimization process on the new prompt—generate outputs, annotate outputs, run graders, and optimize.

The effectiveness of prompt optimization depends on the quality of your graders. We recommend building narrowly-defined graders for each of the desired output properties where you see your prompt failing.

Always evaluate and manually review optimized prompts before using them in production. While the prompt optimizer generally provides a strict improvement in your prompt's effectiveness, it's possible for the optimized prompt to perform worse than your original on specific inputs.

## What annotation does

Annotations are a key part of evaluating and improving model output. A good annotation:

* Serves as ground truth for desired model behavior, even for highly specific cases—including subjective elements, like style and tone
* Provides information-dense context enabling automatic prompt improvement (via our prompt optimizer)
* Enables diagnosing prompt shortcomings, particularly in subtle or infrequent cases
* Helps ensure that graders are aligned with your intent

You can choose to annotate as little or as much as you want. Datasets are designed to work with any degree and type of annotation, but the higher quality of information you can provide, the better your results will be. Additionally, if you're not an expert on the contents of your dataset, we recommend that a subject matter expert performs the annotation — this is the most valuable way for their expertise to be incorporated into your optimization process. Explore [our cookbook](https://cookbook.openai.com/examples/evaluation/Building_resilient_prompts_using_an_evaluation_flywheel.md) to learn more about what we have found to be most effective in using evals to improve our prompt resilience.

## Next steps

For more inspiration, visit the [OpenAI Cookbook](https://cookbook.openai.com), which contains example code and links to third-party resources, or learn more about our tools for evals:

- [Getting started with evals: Datasets](/docs/guides/evaluation-getting-started) - Operate a flywheel of continuous improvement using evaluations.
- [Working with evals](/docs/guides/evals) - Evaluate against external models, interact with evals via API, and more.
- [Prompt optimizer](/docs/guides/prompt-optimizer) - Use your dataset to automatically improve your prompts.
- [Cookbook: Building resilient prompts with evals](https://cookbook.openai.com/examples/evaluation/Building_resilient_prompts_using_an_evaluation_flywheel.md) - Operate a flywheel of continuous improvement using evaluations.
