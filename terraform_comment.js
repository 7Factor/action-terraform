const createHeader = (header) => {
    return header ? `
${header}

` : '';
}

const createFmtDetails = (stdout, stderr) => {
    return `

<details><summary>Show Format Issues</summary>

\`\`\`\n
${stdout}${stderr ? `\n${stderr}` : ''}
\`\`\`

</details>
    `;
};

const createFmtOutput = ({enabled, outcome, stdout, stderr}) => {
    return enabled ? `

#### Terraform Format and Style 🖌 \`${outcome}\`
${outcome === 'failure' ? createFmtDetails(stdout, stderr) : ''}
    ` : '';
};

const createInitDetails = (stdout, stderr) => {
    return `

<details><summary>Show Initialization Details</summary>

\`\`\`\n
${stdout}${stderr ? `\n${stderr}` : ''}
\`\`\`

</details>
    `;
};

const createInitOutput = ({enabled, outcome, stdout, stderr}) => {
    return enabled ? `

#### Terraform Initialization ⚙️ \`${outcome}\`
${outcome !== 'skipped' ? createInitDetails(stdout, stderr) : ''}
    ` : '';
};

const createWorkspaceDetails = (stdout, stderr) => {
    return `

<details><summary>Show Workspace Select Details</summary>

\`\`\`\n
${stdout}${stderr ? `\n${stderr}` : ''}
\`\`\`

</details>
    `;
}

const createWorkspaceOutput = ({enabled, outcome, stdout, stderr}) => {
    return enabled ? `

#### Terraform Workspace Select 🤖 \`${outcome}\`
${outcome !== 'skipped' ? createWorkspaceDetails(stdout, stderr) : ''}
    ` : '';
}

const createValidateDetails = (stdout, stderr) => {
    return `

<details><summary>Show Validation Issues</summary>

\`\`\`\n
${stdout}${stderr ? `\n${stderr}` : ''}
\`\`\`

</details>
    `;
};

const createValidateOutput = ({enabled, outcome, stdout, stderr}) => {
    return enabled ? `

#### Terraform Validation 🤖 \`${outcome}\`
${outcome === 'failure' ? createValidateDetails(stdout, stderr) : ''}
    ` : '';
};

const createTestDetails = (stdout, stderr) => {
    return `
    
<details><summary>Show Test Results</summary>

\`\`\`hcl\n
${stdout}${stderr ? `\n${stderr}` : ''}
\`\`\`

</details>
    `;
}

const createTestOutput = ({enabled, outcome, stdout, stderr}) => {
    return enabled ? `

#### Terraform Test 📖 \`${outcome}\`
${outcome !== 'skipped' ? createTestDetails(stdout, stderr) : ''}
    ` : '';
}

const createPlanExcerptSourceNote = (excerptSource) => {
    if (excerptSource === 'plan-summary') {
        return 'This excerpt starts at the Terraform summary line (`Plan: ...`).';
    }

    if (excerptSource === 'tail') {
        return 'The Terraform summary line was not found, so this excerpt shows the tail of combined stdout/stderr output.';
    }

    return 'This excerpt shows a truncated portion of the Terraform plan output.';
};

const createPlanDetails = ({stdout, stderr, overflowed, excerptSource, logsUrl}) => {
    if (overflowed) {
        const workflowLogs = logsUrl ? `[workflow run logs](${logsUrl})` : 'workflow run logs';
        const excerptSourceNote = createPlanExcerptSourceNote(excerptSource);
        const excerptOutput = stdout
            ? `
\`\`\`hcl\n
${stdout}
\`\`\`
`
            : `
_No plan excerpt was available in this comment._
`;

        return `

<details><summary>Show Plan</summary>

Terraform plan output exceeded size constraints, so this comment includes only a partial excerpt.

${excerptSourceNote}

View the full plan output in the ${workflowLogs}.

${excerptOutput}

</details>
    `;
    }

    return `

<details><summary>Show Plan</summary>

\`\`\`hcl\n
${stdout}${stderr ? `\n${stderr}` : ''}
\`\`\`

</details>
    `;
};

const createPlanOutput = ({enabled, outcome, stdout, stderr, overflowed, excerptSource, logsUrl}) => {
    return enabled ? `

#### Terraform Plan 📖 \`${outcome}\`
${outcome !== 'skipped' ? createPlanDetails({stdout, stderr, overflowed, excerptSource, logsUrl}) : ''}
    ` : '';
};

const createOutputDetails = (stdout, stderr) => {
    return `

<details><summary>Show Output</summary>

\`\`\`hcl\n
${stdout}${stderr ? `\n${stderr}` : ''}
\`\`\`

</details>
    `;
};

const createOutputOutput = ({enabled, stdout, stderr}) => {
    return enabled ? `

#### Terraform Output 📖
${createOutputDetails(stdout, stderr)}
    ` : '';
};

const createCommentBody = ({actor, eventName, workflow}, {header, fmt, init, workspace, validate, test, plan, output}) => {
    return `
${createHeader(header)}
${createFmtOutput(fmt)}
${createInitOutput(init)}
${createWorkspaceOutput(workspace)}
${createValidateOutput(validate)}
${createTestOutput(test)}
${createPlanOutput(plan)}
${createOutputOutput(output)}

*Pusher: @${actor}, Action: \`${eventName}\`, Workflow: \`${workflow}\`*
    `;
};

module.exports = (context, content) => {
    return createCommentBody(context, content);
};
