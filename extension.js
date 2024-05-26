const vscode = require('vscode');
const mysql = require('mysql2/promise')
const path = require('path')
const fs = require('fs')
const doc = require('./document')
const render = require('./renderer')

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let configureDB = vscode.commands.registerCommand('mybatis-code-generator.configureDB', async function () {
		const workspaceFolders = vscode.workspace.workspaceFolders

		if (workspaceFolders) {
			const workspaceFolder = workspaceFolders[0].uri.fsPath
			const vscodeFolderPath = path.join(workspaceFolder, '.vscode')
			const jsonFilePath = path.join(vscodeFolderPath, 'generator.json')

			if (!fs.existsSync(vscodeFolderPath)) {
				fs.mkdirSync(vscodeFolderPath)
			}

			var json = {}

			getDbInfo()
				.then(
					info => {
						json.db = info
						fs.writeFileSync(jsonFilePath, JSON.stringify(json, null, 4))
					}
				).catch(err => {
					vscode.window.showWarningMessage(err)
				})
		} else {
			vscode.window.showInformationMessage(messagePrefix + 'Open a Java Project First')
		}
	})

	let panel = undefined

	let setTemplate = vscode.commands.registerCommand('mybatis-code-generator.setTemplate', () => {
		const workspaceFolders = vscode.workspace.workspaceFolders

		if (workspaceFolders) {
			const workspaceFolder = workspaceFolders[0].uri.fsPath
			const jsonFilePath = path.join(workspaceFolder, '.vscode', 'db.json')

			if (!fs.existsSync(jsonFilePath)) {
				vscode.commands.executeCommand('mybatis-code-generator.configureDB')
			}

			var json = fs.readFileSync(jsonFilePath, 'utf-8')
			var db = JSON.parse(json).db
			getTable(db)
				.then(
					res => {
						panel = vscode.window.createWebviewPanel(
							'setTemplate',
							'Setup Template',
							vscode.ViewColumn.One,
							{ enableScripts: true }
						)

						const cssPath = vscode.Uri.joinPath(context.extensionUri, 'src', 'output.css')
						const cssSrc = panel.webview.asWebviewUri(cssPath)
						panel.webview.html = doc.getWebviewContent(cssSrc, res.table)

						panel.webview.postMessage({
							data: {
								module: 'tj_learning',
								package: 'com.tianji.learning'
							}
						}).then(res => console.log(res))

						return new Promise(
							resolve => {
								panel.webview.onDidReceiveMessage(msg => {
									switch (msg.command) {
										case 'genCode':
											const options = JSON.parse(msg.text)
											setTimeout(() => {
												panel.dispose()
											}, 500)
											resolve({ res, options })
											break;
										case 'save':
											saveOption()
											resolve()
											break;
									}
								})
							}
						)
					}
				).then(
					res => {
						if (res) genCode(res)
					}
				).catch(
					err => {
						if (panel) panel.dispose()
						vscode.window.showWarningMessage(err)
					}
				)
		} else {
			vscode.window.showInformationMessage(messagePrefix + 'Open a Java Project First')
		}
	})

	context.subscriptions.push(configureDB);
	context.subscriptions.push(setTemplate)
}

const messagePrefix = 'MPCG: '

function saveOption(jsonFilePath, options) {
	const jsonstr = fs.readFileSync(jsonFilePath, {encoding: 'utf-8'})
	var json = JSON.parse(jsonstr)
	json.options = options
	fs.writeFileSync(jsonFilePath, JSON.stringify(json, null, 4))
}

function table2Camel(tableName) {
	return tableName
		.split('_')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join('')
}

function field2Camel(field) {
	return field.replace(/_([a-z])/g, (match, p) => p.toUpperCase())
}

async function genCode(arg) {
	const table = arg.res.table
	const conn = arg.res.conn
	const options = arg.options

	const [field] = await conn.query(`DESCRIBE ${table}`)
	// console.log(field)
	// console.log(config)
	const data = render.getRenderData(options, 'LearningLesson', { comment: 'xx 表', tableName: 'learning_lesson' })
	render.renderController('xxx', data)
}

async function getTable(info) {
	try {
		info.connectTimeout = 1
		const conn = await mysql.createConnection(info)
		const [result] = await conn.query('SHOW TABLES')
		const tables = result.map(res => Object.values(res)[0])
		const table = await vscode.window.showQuickPick(tables, {
			placeHolder: 'Select table to generate code'
		})

		return new Promise(
			(resolve, reject) => {
				if (table) resolve({ table, conn })
				else reject(messagePrefix + "Nothing selected")
			}
		)
	} catch (err) {
		vscode.window.showErrorMessage(messagePrefix + 'error when querying database' + String(err))
	}
}

async function getDbInfo() {
	const host = await vscode.window.showInputBox(
		{ prompt: 'input host', value: 'localhost' }
	)
	const user = await vscode.window.showInputBox(
		{ prompt: 'input user', value: 'root' }
	)
	const password = await vscode.window.showInputBox(
		{ prompt: 'input password', password: true }
	)
	const database = await vscode.window.showInputBox(
		{ prompt: 'input database' }
	)

	return new Promise(
		(resolve, reject) => {
			if (!host || !user || !password || !database) {
				reject(messagePrefix + "No input")
			}
			resolve({ host, user, password, database })
		}
	)
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}