// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ShortcustProvider } from './shortcuts';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

	const shortcustProvider = new ShortcustProvider(rootPath);

	vscode.window.registerTreeDataProvider('shortcuts', shortcustProvider);
	const commandHandler = (url: any) => {
		vscode.env.openExternal(vscode.Uri.parse(url.url));
	};
	let disposable = vscode.commands.registerCommand('project-shortcuts-vscode.openShortcut', commandHandler);
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
