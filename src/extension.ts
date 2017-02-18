import * as vscode from 'vscode';

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {

	console.log('decorator sample is activated');

	const badStuffDecorationType = vscode.window.createTextEditorDecorationType({
		backgroundColor: 'red',
	});

	let activeEditor = vscode.window.activeTextEditor;
	if (activeEditor) {
		triggerUpdateDecorations();
	}

	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	var timeout = null;
	function triggerUpdateDecorations() {
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(updateDecorations, 500);
	}

	function updateDecorations() {
		if (!activeEditor) {
			return;
		}
		if(!activeEditor.document.fileName.match(/\.js$/i)) {
			return;
		}
		const isTest = activeEditor.document.fileName.match(/\.spec\.js$/i);
		const regEx = /\b(?:if\(|class=)/g;
		const text = activeEditor.document.getText();
		const badStuffDecorations: vscode.DecorationOptions[] = [];
		let match;
		while (match = regEx.exec(text)) {
			const startPos = activeEditor.document.positionAt(match.index);
			const endPos = activeEditor.document.positionAt(match.index + match[0].length);
			let decoration;
			if(isTest && match[0] == "if(") {
				decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: 'Did you mean "it("?' };
			} else if(match[0] == "class=") {
				decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: 'If this is JSX, you mean "className="' };
			}
			if(decoration) {
				badStuffDecorations.push(decoration);
			}
		}
		activeEditor.setDecorations(badStuffDecorationType, badStuffDecorations);
	}
}

