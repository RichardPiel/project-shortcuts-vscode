import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class ShortcustProvider implements vscode.TreeDataProvider<Shortcut> {

	private _onDidChangeTreeData: vscode.EventEmitter<Shortcut | undefined | void> = new vscode.EventEmitter<Shortcut | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<Shortcut | undefined | void> = this._onDidChangeTreeData.event;

	constructor(private workspaceRoot: string | undefined) {
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Shortcut): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Shortcut): Thenable<Shortcut[]> {

		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage('Empty workspace!');
			return Promise.resolve([]);
		}

		const shortcutsJsonPath = path.join(this.workspaceRoot, 'shortcuts.json');
		if (this.pathExists(shortcutsJsonPath)) {
			return Promise.resolve(this.getShortcuts(shortcutsJsonPath));
		}

		vscode.window.showInformationMessage('Workspace has no shortcuts.json');
		return Promise.resolve([]);

	}

	private pathExists(p: string): boolean {
		try {
			fs.accessSync(p);
		} catch (err) {
			return false;
		}

		return true;
	}

	private getShortcuts(shortcutsJsonPath: string): Shortcut[] {
		const shortcuts: Shortcut[] = [];
		let shortcutsJson = [];
		try {
			shortcutsJson = JSON.parse(fs.readFileSync(shortcutsJsonPath, 'utf8'));
		}
		catch {
			// do nothing
		}

		for (const shortcut in shortcutsJson) {
			const description = shortcutsJson[shortcut].description ? shortcutsJson[shortcut].description : shortcutsJson[shortcut].url;
			shortcuts.push(new Shortcut(shortcutsJson[shortcut].name, description, vscode.TreeItemCollapsibleState.None, {
				command: 'project-shortcuts-vscode.openShortcut',
				title: 'Open Shortcut ' + shortcutsJson[shortcut].name,
				arguments: [{ url: shortcutsJson[shortcut].url }]
			}));
		}
		return shortcuts;
	}
}

export class Shortcut extends vscode.TreeItem {

	constructor(
		public readonly label: string,
		public readonly description: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);

		this.tooltip = `${this.label} - ${this.description}`;
		this.description = this.description;
	}

	iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'light', 'link.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'dark', 'link.svg')
	};
	contextValue = 'shortcut';
}
