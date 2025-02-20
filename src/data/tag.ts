import { EventEmitter, FileDecoration, Uri, Event } from "vscode";
import * as fs from 'fs';
import * as path from 'path';


type Info = {
    tag?: string
}

/**
 * Global mapper which can read/write to config file.
 * This is the original data source for all providers/commands
 */
class TagMapper {
    private map = new Map<string, Info>();

    private _onUpdate = new EventEmitter<undefined>()
    onUpdate = this._onUpdate.event
    notifyUpdate() {
        this._onUpdate.fire(undefined)
    }

    del(uri: Uri): void {
        this.map.delete(uri.toString());
        this.notifyUpdate()
    }

    get(uri: Uri): Info | undefined {
        return this.map.get(uri.toString());
    }

    set(uri: Uri, info: Info): void {
        this.map.set(uri.toString(), info);
        this.notifyUpdate()
    }

    keys(): Uri[] {
        let res = []
        for (const k of this.map.keys()) {
            res.push(Uri.parse(k, true))
        }
        return res
    }

    async save(): Promise<void> {
        const filepath = path.join(__dirname, '.tagmapper.json');
        const data = Array.from(this.map.entries());
        try {
            await fs.promises.writeFile(filepath, JSON.stringify(data, null, 2));
            console.log('Data saved successfully.');
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    async load(): Promise<void> {
        const filepath = path.join(__dirname, '.tagmapper.json');
        try {
            const data = await fs.promises.readFile(filepath, 'utf-8');
            const parsedData: [string, Info][] = JSON.parse(data);

            this.map = new Map(parsedData);
            console.log('Data loaded successfully.');
            this.notifyUpdate()
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }
}


export const GTagMapper:TagMapper = new TagMapper();
