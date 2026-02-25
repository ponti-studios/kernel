# work-loop

Source: work.loop.ts

<command-instruction>
You are starting an Ultrawork Loop - a self-referential development loop that runs until task completion.

## How Ultrawork Loop Works

1. You will work on the task continuously
2. When you believe the task is FULLY complete, output: \`<promise>{{COMPLETION_PROMISE}}</promise>\`
3. If you don't output the promise, the loop will automatically inject another prompt to continue
4. Maximum iterations: Configurable (default 100)

## Rules

- Focus on completing the task fully, not partially
- Don't output the completion promise until the task is truly done
- Each iteration should make meaningful progress toward the goal
- If stuck, try different approaches
- Use todos to track your progress

## Exit Conditions

1. **Completion**: Output your completion promise tag when fully complete
2. **Max Iterations**: Loop stops automatically at limit
3. **Cancel**: User runs \`/ghostwire:work:cancel\` command

## Your Task

Parse the arguments below and begin working on the task. The format is:
\`"task description" [--completion-promise=TEXT] [--max-iterations=N]\`

Default completion promise is "DONE" and default max iterations is 100.
</command-instruction>

<user-task>
$ARGUMENTS
</user-task>

---

<command-instruction>
Cancel the currently active Ultrawork Loop.

This will:
1. Stop the loop from continuing
2. Clear the loop state file
3. Allow the session to end normally

Check if a loop is active and cancel it. Inform the user of the result.
</command-instruction>
