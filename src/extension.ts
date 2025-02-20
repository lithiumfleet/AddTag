import * as vscode from 'vscode';
import { disableLongBandge, enableLongBandge } from './hack';
import { registerProvider } from './register/fileDecoProv';
import { registerCmds } from './register/cmd';
import { cTagTreeDS } from "./data/adapters/treeNodeDS";
import { cFileDecoDS } from "./data/adapters/fileDecoDS";
import { registerTreeDataProvider } from './register/treeDataProv';


export async function activate(context: vscode.ExtensionContext) {
	enableLongBandge()

	const workspaceFolder = vscode.workspace.workspaceFolders?.[0]
	if (!workspaceFolder) throw new Error("ws not init")

	context.subscriptions.push(registerProvider(cFileDecoDS))
	
	context.subscriptions.push(registerCmds())

	context.subscriptions.push(registerTreeDataProvider(cTagTreeDS(workspaceFolder)))

	await vscode.commands.executeCommand("AddTag.load")
}

export async function deactivate() {
	await vscode.commands.executeCommand("AddTag.save")
	disableLongBandge()
}
