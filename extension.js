// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const mysql = require('mysql2/promise')
const path = require('path')
const fs = require('fs')
const doc = require('./document')
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let configureDB = vscode.commands.registerCommand('mybatis-code-generator.configureDB', async function () {
		const workspaceFolders = vscode.workspace.workspaceFolders

		if (workspaceFolders) {
			const workspaceFolder = workspaceFolders[0].uri.fsPath;
			const vscodeFolderPath = path.join(workspaceFolder, '.vscode');
			const jsonFilePath = path.join(vscodeFolderPath, 'db.json');

			if (!fs.existsSync(vscodeFolderPath)) {
				fs.mkdirSync(vscodeFolderPath);
			}

			getDbInfo()
			.then(
				info => {
					fs.writeFileSync(jsonFilePath, JSON.stringify(info, null, 4))
				}
			).catch(err => {
				vscode.window.showWarningMessage(err)
			})
		} else {
			vscode.window.showInformationMessage(messagePrefix + '先打开一个 Java 项目')
		}
	})

	let setTemplate = vscode.commands.registerCommand('mybatis-code-generator.setTemplate', () => {
		const workspaceFolders = vscode.workspace.workspaceFolders

		if (workspaceFolders) {
			const workspaceFolder = workspaceFolders[0].uri.fsPath
			const jsonFilePath = path.join(workspaceFolder, '.vscode', 'db.json')

			if (!fs.existsSync(jsonFilePath)) {
				vscode.commands.executeCommand('mybatis-code-generator.configureDB')
			}

			var info = fs.readFileSync(jsonFilePath, 'utf-8')
			info = JSON.parse(info)
			getTable(info)
			.then(
				res => {
					const panel = vscode.window.createWebviewPanel(
						'setTemplate',
						'Setup Template',
						vscode.ViewColumn.One,
						{enableScripts: true}
					)

					const cssPath = vscode.Uri.joinPath(context.extensionUri, 'src', 'output.css')
					const cssSrc = panel.webview.asWebviewUri(cssPath)
					panel.webview.html = doc.getWebviewContent(cssSrc)

					panel.webview.onDidReceiveMessage(message => {
						switch (message.command) {
							case 'genCode':
								const config = JSON.parse(message.text)
								console.log(config)
						}
					})
					// showPanel(res.database, res.table, res.conn)
					// console.log(res.table)
				}
			).then(
				config => genCode(config)
			).catch(
				err => {
					vscode.window.showWarningMessage(err)
				}
			)
		} else {
			vscode.window.showInformationMessage(messagePrefix + '先打开一个 Java 项目')
		}
	})

	context.subscriptions.push(configureDB);
	context.subscriptions.push(setTemplate)
}

const messagePrefix = 'MPCG: '

async function genCode(config) {

}

async function showPanel(database, table, conn) {
	try {
		const panel = vscode.window.createWebviewPanel(
			'setTemplate',
			'Setup Template',
			vscode.ViewColumn.One,
			{enableScripts: true}
		)

		const cssPath = vscode.Uri.joinPath(context.extensionUri, 'src', 'output.css')
		const cssSrc = panel.webview.asWebviewUri(cssPath)
		panel.webview.html = doc.getWebviewContent(cssSrc)
	} catch (err) {
		vscode.window.showErrorMessage(messagePrefix + err)
	}
}

async function getTable(info) {
	try {
		const database = info.database
		const conn = await mysql.createConnection(info)
		const [result, field] = await conn.query('SHOW TABLES');
		const tables = result.map(res => Object.values(res)[0])
		const table = await vscode.window.showQuickPick(tables, {
			placeHolder: '请选择要生成代码的实体'
		})

		return new Promise(
			(resolve, reject) => {
				if (table) resolve({database, table, conn})
				else reject(messagePrefix + "未选择表")
			}
		)
	} catch (err) {
		vscode.window.showErrorMessage(messagePrefix + '查询数据库失败：' + String(err))
	}
}

async function getDbInfo() {
	const host = await vscode.window.showInputBox(
		{prompt: '请输入数据库地址', value: 'localhost'}
	)
	const user = await vscode.window.showInputBox(
		{prompt: '请输入用户名', value: 'root'}
	)
	const password = await vscode.window.showInputBox(
		{prompt: '请输入密码', password: true}
	)
	const database = await vscode.window.showInputBox(
		{prompt: '请输入数据库名称'}
	)

	return new Promise(
		(resolve, reject) => {
			if (!host || !user || !password || !database) {
				reject(messagePrefix + "无输入")
			}
			resolve({host, user, password, database})
		}
	)
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}