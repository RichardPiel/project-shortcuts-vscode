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
        return element;
    }
    getChildren(element) {
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
    pathExists(p) {
        try {
            fs.accessSync(p);
        }
        catch (err) {
            return false;
        }
        return true;
    }
    getShortcuts(shortcutsJsonPath) {
        const shortcuts = [];
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