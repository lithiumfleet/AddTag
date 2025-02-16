import * as vscode from 'vscode';
import { disableLongBandge, enableLongBandge } from './hack';
import { registerProvider } from './register/provider';
import { registerCmds } from './register/cmd';
import { GTagMapper } from './register/provider/tag';

export async function activate(context: vscode.ExtensionContext) {
	enableLongBandge()

	context.subscriptions.push(registerProvider(GTagMapper.instance))
	
	context.subscriptions.push(registerCmds())

	await vscode.commands.executeCommand("AddTag.load")
}

export async function deactivate() {
	await vscode.commands.executeCommand("AddTag.save")
	disableLongBandge()
}
