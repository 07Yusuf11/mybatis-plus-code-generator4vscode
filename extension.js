const vscode = require('vscode');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const doc = require('./document');
const render = require('./renderer');
const Freemarker = require('freemarker');

const MESSAGE_PREFIX = 'Code Generator: ';
const JSON_FILE_NAME = 'generator.json';
const CSS_FILE_NAME = 'output.css';

function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('mybatis-code-generator.configureDB', configureDB));
    context.subscriptions.push(vscode.commands.registerCommand('mybatis-code-generator.setTemplate', () => setTemplate(context)));
}

async function configureDB() {
    const workspaceFolder = getWorkspaceFolder();
    if (!workspaceFolder) {
        vscode.window.showInformationMessage(MESSAGE_PREFIX + 'Open a Java Project First');
        return;
    }

    const vscodeFolderPath = path.join(workspaceFolder, '.vscode');
    const jsonFilePath = path.join(vscodeFolderPath, JSON_FILE_NAME);

    if (!fs.existsSync(vscodeFolderPath)) {
        fs.mkdirSync(vscodeFolderPath);
    }

    try {
        const dbInfo = await getDbInfo();
        const json = { db: dbInfo };
        fs.writeFileSync(jsonFilePath, JSON.stringify(json, null, 4));
    } catch (err) {
        vscode.window.showWarningMessage(err);
    }
}

async function setTemplate(context) {
    const workspaceFolder = getWorkspaceFolder();
    if (!workspaceFolder) {
        vscode.window.showInformationMessage(MESSAGE_PREFIX + 'Open a Java Project First');
        return;
    }

    const jsonFilePath = path.join(workspaceFolder, '.vscode', JSON_FILE_NAME);
    if (!fs.existsSync(jsonFilePath)) {
        await vscode.commands.executeCommand('mybatis-code-generator.configureDB');
    }

    const dbInfo = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8')).db;
    try {
        const tableResult = await getTable(dbInfo);
        await showTemplatePanel(context, tableResult, jsonFilePath);
    } catch (err) {
        if (panel) panel.dispose();
        vscode.window.showWarningMessage(err);
    }
}

async function showTemplatePanel(context, tableResult, jsonFilePath) {
    const panel = vscode.window.createWebviewPanel(
        'setTemplate',
        'Setup Template',
        vscode.ViewColumn.One,
        { enableScripts: true }
    );

    const cssPath = vscode.Uri.joinPath(context.extensionUri, 'src', CSS_FILE_NAME);
    const cssSrc = panel.webview.asWebviewUri(cssPath);
    const templatePath = vscode.Uri.joinPath(context.extensionUri, 'templates').path;
    panel.webview.html = doc.getWebviewContent(cssSrc, tableResult.table);

    const json = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
    if (json.options) {
        panel.webview.postMessage({ data: json.options });
    }

    panel.webview.onDidReceiveMessage(async msg => {
        const options = JSON.parse(msg.text);
        if (msg.command === 'genCode') {
            panel.dispose();
            await generateCode({ res: tableResult, options }, templatePath);
        } else if (msg.command === 'save') {
            saveOptions(jsonFilePath, options);
        }
    });
}

async function generateCode(arg, templatePath) {
    const freemarker = new Freemarker({ root: templatePath });
    const { table, conn } = arg.res;
    const options = arg.options;

    const [fields] = await conn.query(`DESCRIBE ${table}`);
    const entityName = toCamelCase(table);
    const data = render.getRenderData(options, entityName);

	
    var res = await renderTemplate(freemarker, 'controller.java.ftl', data, options, 'genController');
	console.log(res);
    res = await renderTemplate(freemarker, 'service.java.ftl', data, options, 'genService');
	console.log(res);
    res = await renderTemplate(freemarker, 'serviceImpl.java.ftl', data, options, 'genServiceImpl');
	console.log(res);
    res = await renderTemplate(freemarker, 'mapper.java.ftl', data, options, 'genMapper');
	console.log(res);
}

async function renderTemplate(freemarker, templateName, data, options, optionKey) {
    if (options[optionKey]) {
        freemarker.renderFile(templateName, data, (err, res) => {
            if (err) console.error(err);
            else console.log(res);
        });
    }
}

function getWorkspaceFolder() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    return workspaceFolders ? workspaceFolders[0].uri.fsPath : null;
}

function saveOptions(jsonFilePath, options) {
    const json = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
    json.options = options;
    fs.writeFileSync(jsonFilePath, JSON.stringify(json, null, 4));
}

function toCamelCase(str) {
    return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

async function getTable(dbInfo) {
    try {
        const conn = await mysql.createConnection(dbInfo);
        const [result] = await conn.query('SHOW TABLES');
        const tables = result.map(res => Object.values(res)[0]);
        const table = await vscode.window.showQuickPick(tables, { placeHolder: 'Select table to generate code' });
        if (!table) throw new Error(MESSAGE_PREFIX + "Nothing selected");
        return { table, conn };
    } catch (err) {
		vscode.window.showErrorMessage(MESSAGE_PREFIX + 'Error when querying database: ' + err.message)
    }
}

async function getDbInfo() {
    const host = await vscode.window.showInputBox({ prompt: 'Input host', value: 'localhost' });
    const user = await vscode.window.showInputBox({ prompt: 'Input user', value: 'root' });
    const password = await vscode.window.showInputBox({ prompt: 'Input password', password: true });
    const database = await vscode.window.showInputBox({ prompt: 'Input database' });

    if (!host || !user || !password || !database) {
		vscode.window.showErrorMessage(MESSAGE_PREFIX + 'Nothing Selected')
    }
    return { host, user, password, database };
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
