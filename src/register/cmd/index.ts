import { commands, Disposable, window } from "vscode";
import { GTagMapper } from "../../data/tag";
import { trailingFix } from "./uriUtils";
import { ITreeNode } from "../treeDataProv";

export type Cmd = {
    name: string
    handler: (...args: any[]) => any
}

const CMDS: Cmd[] = [
    {
        name: "AddTag.set",
        handler: async (uri?) => {
            if (!uri) {
                window.showInformationMessage("no file selected")
            }
            uri = await trailingFix(uri)
            const prevTag = GTagMapper.get(uri)?.tag
            window.showInputBox({"value": prevTag})
                .then((inputs) => {
                    if (inputs) {
                        GTagMapper.set(uri, {tag: inputs})
                    } else {
                        GTagMapper.del(uri)
                    }
                })
            }
    },
    {
        name: "AddTag.save",
        handler: async () => {
                await GTagMapper.save()
            }
    },
    {
        name: "AddTag.load",
        handler: async () => {
                await GTagMapper.load()
            }
    },
    {
        name: "AddTag.setFromTagPannel",
        handler: async (item: ITreeNode) => {
            await commands.executeCommand("AddTag.set", item.uri)
        }
    }
]

export function registerCmds(): Disposable {
    const disposables = CMDS.map((c) => {
        return commands.registerCommand(c.name, c.handler)
    })
    return Disposable.from(...disposables)
}
