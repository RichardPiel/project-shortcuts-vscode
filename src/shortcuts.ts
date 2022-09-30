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
		console.log('getTreeItem', element);
		return element;
	}

	getChildren(element?: Shortcut): Thenable<Shortcut[]> {
		console.log('getChildren', element);

		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage('No dependency in empty workspace');
			return Promise.resolve([]);
		}

		return Promise.resolve(this.getShortcuts());
		// if (element) {
		// } else {
		// 	const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
		// 	if (this.pathExists(packageJsonPath)) {
		// 		vscode.window.showInformationMessage('dependency loaded');
		// 		return Promise.resolve(this.getDepsInPackageJson(packageJsonPath));
		// 	} else {
		// 		vscode.window.showInformationMessage('Workspace has no package.json');
		// 		return Promise.resolve([]);
		// 	}
		// }
		vscode.window.showInformationMessage('Workspace has no package.json');
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

	private getShortcuts(): Shortcut[] {
		const shortcuts: Shortcut[] = [];
		if (this.workspaceRoot) {

			const shortcutsJsonPath = path.join(this.workspaceRoot, 'shortcuts.json');
			if (this.pathExists(shortcutsJsonPath)) {
				const shortcutsJson = fs.readFileSync(shortcutsJsonPath, 'utf-8');
				const shortcutsData = JSON.parse(shortcutsJson);
				console.log('shortcutsData', shortcutsData);
				shortcutsData.forEach((element: any) => console.log(element));
				for (const shortcut in shortcutsData) {
					console.log('shortcut', shortcutsData[shortcut]);

					const description = shortcutsData[shortcut].description ? shortcutsData[shortcut].description : shortcutsData[shortcut].url;
					shortcuts.push(new Shortcut(shortcutsData[shortcut].name, description, vscode.TreeItemCollapsibleState.None, {
						command: 'shortcuts-project-vscode.openShortcut',
						title: 'Open Shortcut ' + shortcutsData[shortcut].name,
						arguments: [{url: shortcutsData[shortcut].url}]
					}));
				}
			}
			return shortcuts;
		}
		return [];
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
