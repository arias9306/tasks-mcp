# Tasks MCP

A command-line tool for managing tasks using a RESTful API.

## MCP Config

Add the following configuration to your MCP config file to run the Tasks Manager:

```json
"tasks-manager": {
    "command": "npx",
    "args": [
    "-y",
    "tsx",
    "{path}/tasks-mcp/src/index.ts"
    ]
}
```

```json
"tasks-manager": {
    "command": "node",
    "args": [
    "{path}/tasks-mcp/dist/index.js"
    ]
}
```
