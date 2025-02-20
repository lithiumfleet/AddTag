import { commands, Disposable, window } from "vscode";
import { GTagMapper } from "../../data/tag";
import { trailingFix } from "./uriUtils";

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
            window.showInputBox()
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
    }
]

export function registerCmds(): Disposable {
    const disposables = CMDS.map((c) => {
        return commands.registerCommand(c.name, c.handler)
    })
    return Disposable.from(...disposables)
}
