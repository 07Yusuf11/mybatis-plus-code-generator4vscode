const vscode = require('vscode');
const mysql = require('mysql2/promise')
const path = require('path')
const fs = require('fs')
const doc = require('./document')
const render = require('./renderer')
const Freemarker = require('freemarker')

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let configureDB = vscode.commands.registerCommand('mybatis-code-generator.configureDB', () => {
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

		if (!workspaceFolders) {
			vscode.window.showInformationMessage(messagePrefix + 'Open a Java Project First')
			return
		}
		const workspaceFolder = workspaceFolders[0].uri.fsPath
		const jsonFilePath = path.join(workspaceFolder, '.vscode', 'generator.json')

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

			let jsonstr = fs.readFileSync(jsonFilePath, {encoding: 'utf-8'})
			var json = JSON.parse(jsonstr)
			var message = {}
			if ('options' in json) {
				message.data = json.options
				panel.webview.postMessage(message)
			}

			return new Promise(
				resolve => {
				panel.webview.onDidReceiveMessage(msg => {
					var options = JSON.parse(msg.text)
					switch (msg.command) {
						case 'genCode':
							setTimeout(() => {
								panel.dispose()
							}, 500)
							resolve({ res, options })
							break;
						case 'save':
							options = JSON.parse(msg.text)
							saveOption(jsonFilePath, options)
							resolve()
							break;
					}
				})
			})
		}).then(
		res => {
			const templatePath = vscode.Uri.joinPath(context.extensionUri, 'templates').path
			if (res) genCode(res, templatePath)
		}).catch(
			err => {
				if (panel) panel.dispose()
				vscode.window.showWarningMessage(err)
			}
		)
	})

	context.subscriptions.push(configureDB);
	context.subscriptions.push(setTemplate)
}

const messagePrefix = 'Code Generator: '

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

async function genCode(arg, templatePath) {
	const freemarker = new Freemarker({root: templatePath})
	const table = arg.res.table
	const conn = arg.res.conn
	const options = arg.options

	const [field] = await conn.query(`DESCRIBE ${table}`)
	console.log(field)
	console.log(options)
	const entityName = table2Camel(table)
	const data = render.getRenderData(options, entityName)
	if ('genController' in options) {
		freemarker.renderFile(path.join('controller.java.ftl'), data, (err, res) => {
			console.log(err)
			console.log(res)
		})
	}
	if ('genService' in options) {
		freemarker.renderFile(path.join('service.java.ftl'), data, (err, res) => {
			console.log(err)
			console.log(res)
		})
	}
	if ('genServiceImpl' in options) {
		freemarker.renderFile(path.join('serviceImpl.java.ftl'), data, (err, res) => {
			console.log(err)
			console.log(res)
		})
	}
	if ('genMapper' in options) {
		freemarker.renderFile(path.join('mapper.java.ftl'), data, (err, res) => {
			console.log(err)
			console.log(res)
		})
	}
}

async function getTable(info) {
	try {
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