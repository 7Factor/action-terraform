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

const createPlanDetails = (stdout, stderr) => {
    return `

<details><summary>Show Plan</summary>

\`\`\`hcl\n
${stdout}${stderr ? `\n${stderr}` : ''}
\`\`\`

</details>
    `;
};

const createPlanOutput = ({enabled, outcome, stdout, stderr}) => {
    return enabled ? `

#### Terraform Plan 📖 \`${outcome}\`
${outcome !== 'skipped' ? createPlanDetails(stdout, stderr) : ''}
    ` : '';
};

const createCommentBody = ({actor, eventName, workflow}, {header, fmt, init, validate, test, plan}) => {
    return `
${createHeader(header)}
${createFmtOutput(fmt)}
${createInitOutput(init)}
${createValidateOutput(validate)}
${createTestOutput(test)}
${createPlanOutput(plan)}

*Pusher: @${actor}, Action: \`${eventName}\`, Workflow: \`${workflow}\`*
    `;
};

module.exports = (context, content) => {
    return createCommentBody(context, content);
};
