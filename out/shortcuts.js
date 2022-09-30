"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Shortcut = exports.ShortcustProvider = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
class ShortcustProvider {
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        console.log('getTreeItem', element);
        return element;
    }
    getChildren(element) {
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
    pathExists(p) {
        try {
            fs.accessSync(p);
        }
        catch (err) {
            return false;
        }
        return true;
    }
    getShortcuts() {
        const shortcuts = [];
        if (this.workspaceRoot) {
            const shortcutsJsonPath = path.join(this.workspaceRoot, 'shortcuts.json');
            if (this.pathExists(shortcutsJsonPath)) {
                const shortcutsJson = fs.readFileSync(shortcutsJsonPath, 'utf-8');
                const shortcutsData = JSON.parse(shortcutsJson);
                console.log('shortcutsData', shortcutsData);
                shortcutsData.forEach((element) => console.log(element));
                for (const shortcut in shortcutsData) {
                    console.log('shortcut', shortcutsData[shortcut]);
                    const description = shortcutsData[shortcut].description ? shortcutsData[shortcut].description : shortcutsData[shortcut].url;
                    shortcuts.push(new Shortcut(shortcutsData[shortcut].name, description, vscode.TreeItemCollapsibleState.None, {
                        command: 'shortcuts-project-vscode.openShortcut',
                        title: 'Open Shortcut ' + shortcutsData[shortcut].name,
                        arguments: [{ url: shortcutsData[shortcut].url }]
                    }));
                }
            }
            return shortcuts;
        }
        return [];
    }
}
exports.ShortcustProvider = ShortcustProvider;
class Shortcut extends vscode.TreeItem {
    constructor(label, description, collapsibleState, command) {
        super(label, collapsibleState);
        this.label = label;
        this.description = description;
        this.collapsibleState = collapsibleState;
        this.command = command;
        this.iconPath = {
            light: path.join(__filename, '..', '..', 'resources', 'light', 'link.svg'),
            dark: path.join(__filename, '..', '..', 'resources', 'dark', 'link.svg')
        };
        this.contextValue = 'shortcut';
        this.tooltip = `${this.label} - ${this.description}`;
        this.description = this.description;
    }
}
exports.Shortcut = Shortcut;
//# sourceMappingURL=shortcuts.js.map