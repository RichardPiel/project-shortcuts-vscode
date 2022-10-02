"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const shortcuts_1 = require("./shortcuts");
const fs = require("fs");
const path = require("path");
const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
    ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    registerTreeDataProvider();
    let folders = vscode.workspace.workspaceFolders;
    if (folders) {
        let watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(folders[0], "*.json"));
        watcher.onDidCreate(uri => registerTreeDataProvider());
        watcher.onDidChange(uri => registerTreeDataProvider());
    }
    /**
     * Open Shortcut
     */
    context.subscriptions.push(vscode.commands.registerCommand('project-shortcuts-vscode.openShortcut', (url) => {
        vscode.env.openExternal(vscode.Uri.parse(url.url));
    }));
    /**
     * Delete Shortcut
     */
    context.subscriptions.push(vscode.commands.registerCommand('project-shortcuts-vscode.deleteEntry', (node) => {
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
        fs.writeFileSync(shortcutsJsonPath, JSON.stringify(shortcutsJson.filter((shortcut) => shortcut.name !== node.label), null, 2));
        vscode.window.showInformationMessage('Shortcut deleted!');
    }));
    /**
     * Add Shortcut
     */
    context.subscriptions.push(vscode.commands.registerCommand('project-shortcuts-vscode.addEntry', async (url) => {
        const shortcutName = await vscode.window.showInputBox({
            placeHolder: 'Shortcut name',
            validateInput: text => {
                return text && text !== '' ? null : 'Required!'; // return null if validates
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
            console.log('ZZZ try');
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
        console.log('ZZZ shortcutsJson', shortcutsJson);
        fs.writeFileSync(shortcutsJsonPath, JSON.stringify(shortcutsJson, null, 2));
        registerTreeDataProvider();
        vscode.window.showInformationMessage('Shortcut added!');
    }));
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
function registerTreeDataProvider() {
    const shortcustProvider = new shortcuts_1.ShortcustProvider(rootPath);
    vscode.window.registerTreeDataProvider('shortcuts', shortcustProvider);
}
function pathExists(p) {
    try {
        fs.accessSync(p);
    }
    catch (err) {
        return false;
    }
    return true;
}
const isValidUrl = (urlString) => {
    var urlPattern = new RegExp('^(https?:\\/\\/)?' + // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // validate fragment locator
    return !!urlPattern.test(urlString);
};
//# sourceMappingURL=extension.js.map