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
			vscode.window.showInformationMessage('Shortcuts loaded!');
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

		const shortcutsJson = fs.readFileSync(shortcutsJsonPath, 'utf-8');
		const shortcutsData = JSON.parse(shortcutsJson);

		for (const shortcut in shortcutsData) {
			const description = shortcutsData[shortcut].description ? shortcutsData[shortcut].description : shortcutsData[shortcut].url;
			shortcuts.push(new Shortcut(shortcutsData[shortcut].name, description, vscode.TreeItemCollapsibleState.None, {
				command: 'project-shortcuts-vscode.openShortcut',
				title: 'Open Shortcut ' + shortcutsData[shortcut].name,
				arguments: [{ url: shortcutsData[shortcut].url }]
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
