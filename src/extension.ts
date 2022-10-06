// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ShortcustProvider, Shortcut } from './shortcuts';
import * as fs from 'fs';
import * as path from 'path';
const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
	? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	registerTreeDataProvider();

	let folders = vscode.workspace.workspaceFolders;
	if (folders) {
		let watcher = vscode.workspace.createFileSystemWatcher(
			new vscode.RelativePattern(folders[0], "*.json"));
		watcher.onDidCreate(() => registerTreeDataProvider());
		watcher.onDidChange(() => registerTreeDataProvider());
	}

	/**	
	 * Open Shortcut
	 */
	context.subscriptions.push(vscode.commands.registerCommand('project-shortcuts-vscode.openShortcut', (url: any) => {
		vscode.env.openExternal(vscode.Uri.parse(url.url));
	}));

	/**	
	 * Delete Shortcut
	 */
	context.subscriptions.push(vscode.commands.registerCommand('project-shortcuts-vscode.deleteEntry', (node: Shortcut) => {

		if (!rootPath) {
			vscode.window.showInformationMessage('Empty workspace!');
			return;
		}

		const shortcutsJsonPath = path.join(rootPath, 'shortcuts.json');
		let shortcutsJson = [];

		try {
			shortcutsJson = JSON.parse(fs.readFileSync(shortcutsJsonPath, 'utf8'));
		}
		catch {
			// do nothing
		}

		fs.writeFileSync(shortcutsJsonPath, JSON.stringify(shortcutsJson.filter((shortcut: any) => shortcut.name !== node.label), null, 2));

		vscode.window.showInformationMessage('Shortcut deleted!');
	}));

	/**
	 * Add Shortcut
	 */
	context.subscriptions.push(vscode.commands.registerCommand('project-shortcuts-vscode.addEntry', async (url: any) => {

		const shortcutName = await vscode.window.showInputBox({
			placeHolder: 'Shortcut name',
			validateInput: text => {
				return text && text !== '' ? null : 'Required!';  // return null if validates
			}
		});

		const shortcutUrl = await vscode.window.showInputBox({
			placeHolder: 'Shortcut url',
			validateInput: text => {

				if (isValidUrl(text)) {
					return null;
				}

				return "Please enter a valide url";
			}
		});

		const shortcutDescription = await vscode.window.showInputBox({
			placeHolder: 'Shortcut description (optional)',
		});

		if (!rootPath) {
			vscode.window.showInformationMessage('Empty workspace!');
			return;
		}

		const shortcutsJsonPath = path.join(rootPath, 'shortcuts.json');

		let shortcutsJson = [];

		if (pathExists(shortcutsJsonPath)) {
			try {
				shortcutsJson = JSON.parse(fs.readFileSync(shortcutsJsonPath, 'utf8'));
			}
			catch {
				// do nothing
			}
		}

		shortcutsJson.push({
			name: shortcutName,
			url: shortcutUrl,
			description: shortcutDescription
		});
		fs.writeFileSync(shortcutsJsonPath, JSON.stringify(shortcutsJson, null, 2));

		registerTreeDataProvider();

		vscode.window.showInformationMessage('Shortcut added!');

	}));

}

// this method is called when your extension is deactivated
export function deactivate() { }

function registerTreeDataProvider() {

	const shortcustProvider = new ShortcustProvider(rootPath);
	vscode.window.registerTreeDataProvider('shortcuts', shortcustProvider);
}

function pathExists(p: string): boolean {
	try {
		fs.accessSync(p);
	} catch (err) {
		return false;
	}

	return true;
}

const isValidUrl = (urlString: string) => {
	var urlPattern = new RegExp('^(https?:\\/\\/)?' + // validate protocol
		'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
		'((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
		'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
		'(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
		'(\\#[-a-z\\d_]*)?$', 'i'); // validate fragment locator
	return !!urlPattern.test(urlString);
};