# Bad Code Highlighter VS Code Extension

This is a Visual Studio Code extension based on [Microsoft's decorator-sample](https://github.com/Microsoft/vscode-extension-samples/).

It lets you highlight text in your editor using regular expressions, allowing you (for example) to flag simple bits of bad code.

## Example:

When creating Jest tests, I would often type "if(" instead of "it(" out of habit. And when working with JSX, I would sometimes type "class=" instead of "className=".

To turn these bad bits of code red, you would configure the extension with the filename and text to match, the color for the highlight, and the tooltip text to show when you mouse over the highlight.

```json
"badCodeHighlighter.highlights": [
    {
        "filename": "\\.spec\\.js$",
        "text": "if\\(",
        "color": "red",
        "tooltip": "You mean 'it(', not 'if('!"
    },
    {
        "filename": "\\.js$",
        "text": "class=",
        "color": "red",
        "tooltip": "If this is in JSX, you mean 'className=', not 'class='!"
    }
]
```

`filename` and `text` are regular expressions, so you'll need to escape special characters (and double up your backslashes, to escape them in the configuration json).

## Installation:

Install it from the VS Code Marketplace; or put it in a directory under `%HOME%\.vscode\extensions` .
