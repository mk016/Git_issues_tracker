require('dotenv').config();
const axios = require('axios');
const readline = require('readline');

// Set up readline to get user input from the terminal
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to extract organization and repository name from a GitHub URL
function parseGitHubUrl(url) {
    const regex = /https:\/\/github\.com\/([^\/]+)\/([^\/]+)/;
    const match = url.match(regex);
    if (match) {
        return { org: match[1], repo: match[2] };
    } else {
        console.log("Invalid GitHub URL. Please enter a valid repository link.");
        process.exit(1);
    }
}

// Function to fetch issues from GitHub
async function fetchIssues(org, repo) {
    const url = `https://api.github.com/repos/${org}/${repo}/issues`;
    try {
        const response = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching issues:", error.message);
        process.exit(1);
    }
}

// Main function to run the program
rl.question("Enter the GitHub repository link (e.g., https://github.com/ORG_NAME/REPO_NAME): ", async (repoUrl) => {
    const { org, repo } = parseGitHubUrl(repoUrl);
    
    const issues = await fetchIssues(org, repo);
    if (issues.length === 0) {
        console.log("No issues found for this repository.");
    } else {
        console.log(`\nIssues for repository: ${org}/${repo}\n`);
        issues.forEach(issue => {
            const assignees = issue.assignees.map(a => a.login).join(', ') || "Unassigned";
            console.log(`- Issue Title: ${issue.title}`);
            console.log(`  Assignees: ${assignees}`);
            console.log(`  Created At: ${issue.created_at}`);
            console.log(`  Status: ${issue.state}`);
            console.log("------------------------------------------------------");
        });
    }
    rl.close();
});
