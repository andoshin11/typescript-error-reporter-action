"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const module_1 = __importDefault(require("module"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const core_1 = require("@actions/core");
const reporter_1 = require("./reporter");
async function main() {
    try {
        const project = core_1.getInput('project') || 'tsconfig.json';
        const projectPath = resolveProjectPath(path.resolve(process.cwd(), project));
        if (projectPath == null) {
            throw new Error(`No valid typescript project was not found at: ${projectPath}`);
        }
        typecheck(projectPath);
    }
    catch (e) {
        console.error(e);
        core_1.setFailed(e);
    }
}
/**
 * Attempts to resolve ts config file and returns either path to it or `null`.
 */
const resolveProjectPath = (projectPath) => {
    try {
        if (fs.statSync(projectPath).isFile()) {
            return projectPath;
        }
        else {
            const configPath = path.resolve(projectPath, "tsconfig.json");
            return fs.statSync(configPath).isFile() ? configPath : null;
        }
    }
    catch {
        return null;
    }
};
const typecheck = (projectPath) => {
    const ts = loadTS(projectPath);
    const json = ts.readConfigFile(projectPath, ts.sys.readFile);
    const config = ts.parseJsonConfigFileContent(json.config, ts.sys, path.dirname(projectPath), undefined, path.basename(projectPath));
    const errors = isIncrementalCompilation(config.options)
        ? performIncrementalCompilation(ts, projectPath)
        : performCompilation(ts, config);
    if (errors > 0) {
        core_1.setFailed(`Found ${errors} errors!`);
    }
};
const performIncrementalCompilation = (ts, projectPath) => {
    const report = reporter_1.reporter(ts);
    const host = ts.createSolutionBuilderHost(ts.sys, undefined, report, report);
    const builder = ts.createSolutionBuilder(host, [projectPath], { noEmit: true });
    return builder.build();
};
const performCompilation = (ts, config) => {
    const report = reporter_1.reporter(ts);
    const host = ts.createCompilerHost(config.options);
    const program = ts.createProgram({
        rootNames: config.fileNames,
        options: config.options,
        projectReferences: config.projectReferences,
        configFileParsingDiagnostics: ts.getConfigFileParsingDiagnostics(config)
    });
    const configuration = program.getConfigFileParsingDiagnostics();
    let all = [...program.getSyntacticDiagnostics()];
    if (all.length === 0) {
        all = [
            ...program.getOptionsDiagnostics(),
            ...program.getGlobalDiagnostics()
        ];
        if (all.length == 0) {
            all = [...program.getSemanticDiagnostics()];
        }
    }
    const diagnostics = ts.sortAndDeduplicateDiagnostics(all);
    diagnostics.forEach(report);
    return all.length;
};
const isIncrementalCompilation = (options) => options.incremental || options.composite;
const loadTS = (projectPath) => {
    try {
        const require = module_1.default.createRequire(projectPath);
        const ts = require('typescript');
        console.log(`Using local typescript@${ts.version}`);
        return ts;
    }
    catch (error) {
        const ts = require('typescript');
        console.log(`Failed to find project specific typescript, falling back to bundled typescript@${ts.version}`);
        return ts;
    }
};
main();
