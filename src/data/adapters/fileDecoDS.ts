import { Uri, FileDecoration } from "vscode";
import { IFileDecoDS } from "../../register/fileDecoProv";
import { GTagMapper } from "../tag";


class CFileDecoDS implements IFileDecoDS {
    get(uri: Uri): FileDecoration | undefined {
        const info = GTagMapper.get(uri);
        return new FileDecoration(info?.tag ?? "");
    }

    onUpdate = GTagMapper.onUpdate;
}

export const cFileDecoDS = new CFileDecoDS();
