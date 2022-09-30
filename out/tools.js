"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.finalAppLocation = void 0;
const vscode_1 = require("vscode");
function finalAppLocation() {
    const workspacePath = vscode_1.workspace.asRelativePath(vscode_1.workspace.workspaceFolders[0].uri);
    let config = vscode_1.workspace.getConfiguration('cakephp.bake');
    const projectLocation = config.get('project.location', null);
    if (projectLocation !== null) {
        return projectLocation;
    }
    return workspacePath;
}
exports.finalAppLocation = finalAppLocation;
//# sourceMappingURL=tools.js.map