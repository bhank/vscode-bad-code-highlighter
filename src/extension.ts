import * as vscode from 'vscode';
import * as _ from 'lodash';

interface Highlight {
	filename: string;
	text: string;
	color: string;
	tooltip: string;
}

interface DecorationArray {
	[color: string] : vscode.TextEditorDecorationType
}

let decorationTypes: DecorationArray;
let highlights: Highlight[];
let updateTimeout: number;

function loadConfig() : void {
	console.log('badCodeHighlighter loading config');
	let config = vscode.workspace.getConfiguration('badCodeHighlighter');
	updateTimeout = config.get<number>('updateTimeout', 500);
	highlights = config.get<Highlight[]>('highlights', []);
	if(highlights && highlights.length > 0) {
		let allDecoratorStyles : string[] = _.uniq(highlights.map(h => h.color));
		decorationTypes = allDecoratorStyles.reduce<DecorationArray>((accum, val) => {
			accum[val] = vscode.window.createTextEditorDecorationType({
				backgroundColor: val,
			});
			return accum;
		},{});
	}
};

export function activate(context: vscode.ExtensionContext) {
	loadConfig();
	vscode.workspace.onDidChangeConfiguration(loadConfig);

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
		timeout = setTimeout(updateDecorations, updateTimeout);
	}

	function updateDecorations() {
		if (!activeEditor) {
			return;
		}

		// maybe move this check into foreach
		let activeHighlights = highlights.filter(h => activeEditor.document.fileName.match(h.filename));
		if(activeHighlights.length == 0) {
			return;
		}

		const text = activeEditor.document.getText();

		let activeDecorationsByColor: { [color: string]: vscode.DecorationOptions[] } = {};

		for(let highlight of activeHighlights) {
			if(activeEditor.document.fileName.match(highlight.filename)) {
				let regEx = new RegExp(highlight.text, 'g');
				let match;
				while (match = regEx.exec(text)) {
					const startPos = activeEditor.document.positionAt(match.index);
					const endPos = activeEditor.document.positionAt(match.index + match[0].length);
					let decoration: vscode.DecorationOptions = { range: new vscode.Range(startPos, endPos), hoverMessage: highlight.tooltip };
					activeDecorationsByColor[highlight.color] = activeDecorationsByColor[highlight.color] || [];
					activeDecorationsByColor[highlight.color].push(decoration);
				}
			}
		}

		_.forEach(activeDecorationsByColor, (decorationOptions: vscode.DecorationOptions[], color: string) => {
			activeEditor.setDecorations(decorationTypes[color], decorationOptions);
		});
	}
}

