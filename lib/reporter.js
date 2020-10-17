"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseLocation = exports.readProperties = exports.reporter = void 0;
const command_1 = require("@actions/core/lib/command");
exports.reporter = (ts) => (diagnostic) => {
    switch (diagnostic.category) {
        case ts.DiagnosticCategory.Error: {
            return command_1.issueCommand('error', exports.readProperties(diagnostic), ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
        }
        case ts.DiagnosticCategory.Warning: {
            return command_1.issueCommand('warning', exports.readProperties(diagnostic), ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
        }
    }
};
exports.readProperties = ({ start, file }) => {
    const fileName = file && file.fileName;
    if (!fileName)
        return {};
    if (!start)
        return { file: fileName };
    const content = file.getFullText();
    const { line, column } = exports.parseLocation(content, start);
    return { file: fileName, line: `${line}`, col: `${column}` };
};
exports.parseLocation = (content, position) => {
    let l = 1;
    let c = 0;
    for (let i = 0; i < content.length && i < position; i++) {
        const cc = content[i];
        if (cc === '\n') {
            c = 0;
            l++;
        }
        else {
            c++;
        }
    }
    return { line: l, column: c };
};
