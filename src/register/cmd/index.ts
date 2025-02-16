import { commands, Disposable, window } from "vscode";
import { GTagMapper } from "../provider/tag";

export type Cmd = {
    name: string
    handler: (...args: any[]) => any
}

const CMDS: Cmd[] = [
    {
        name: "AddTag.set",
        handler: (uri?) => {
            if (!uri) {
                window.showInformationMessage("no file selected")
            }
            window.showInputBox()
                .then((inputs) => {
                    if (inputs) {
                        GTagMapper.instance.set(uri, inputs)
                    } else {
                        GTagMapper.instance.del(uri)
                    }
                })
            }
    },
    {
        name: "AddTag.save",
        handler: async () => {
                await GTagMapper.instance.save()
            }
    },
    {
        name: "AddTag.load",
        handler: async () => {
                await GTagMapper.instance.load()
            }
    }
]

export function registerCmds(): Disposable {
    const disposables = CMDS.map((c) => {
        return commands.registerCommand(c.name, c.handler)
    })
    return Disposable.from(...disposables)
}
