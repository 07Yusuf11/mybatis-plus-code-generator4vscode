// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const mysql = require('mysql2/promise')
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let disposable = vscode.commands.registerCommand('mybatis-code-generator.helloWorld', function () {
			selectTable().then(
				table => console.log(table)
			)
		}
	)
	context.subscriptions.push(disposable);
}

async function selectTable() {
	try {
		const tables = await getTables()
		return vscode.window.showQuickPick(tables)
	} catch (err) {
		vscode.window.showErrorMessage(String(err))
	}
}

async function getTables() {
	const info = await getDbInfo()
	const conn = await mysql.createConnection(info)

	const [result, field] = await conn.query('SHOW TABLES');
	const tables = result.map(res => Object.values(res)[0])

	return new Promise(
		(resolve, reject) => {
			if (result.length > 0) {
				resolve(tables)
			} else {
				reject("数据库中没有表")
			}
		}
	)
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
		resolve => {
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