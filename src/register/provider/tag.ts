import { EventEmitter, FileDecoration, Uri, Event } from "vscode";
import * as fs from 'fs';
import * as path from 'path';

export interface TagMapper {
    del(uri: Uri): void;
    get(uri: Uri): FileDecoration | undefined;
    set(uri: Uri, badge: string): void;

    load(): Promise<void>;
    save(): Promise<void>;
    onUpdate: Event<undefined>
}

class TagMapperImpl implements TagMapper {
    private map = new Map<string, FileDecoration>();

    private _onUpdate = new EventEmitter<undefined>()
    onUpdate = this._onUpdate.event
    notifyUpdate() {
        this._onUpdate.fire(undefined)
    }

    del(uri: Uri): void {
        this.map.delete(uri.toString());
        this.notifyUpdate()
    }

    get(uri: Uri): FileDecoration | undefined {
        return this.map.get(uri.toString());
    }

    set(uri: Uri, badge: string): void {
        const decoration: FileDecoration = { badge };
        this.map.set(uri.toString(), decoration);
        this.notifyUpdate()
    }

    async save(): Promise<void> {
        const filepath = path.join(__dirname, 'tagmapper.json');
        const data = Array.from(this.map.entries()); // Convert Map to array
        try {
            await fs.promises.writeFile(filepath, JSON.stringify(data, null, 2)); // Pretty-print JSON
            console.log('Data saved successfully.');
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    async load(): Promise<void> {
        const filepath = path.join(__dirname, 'tagmapper.json');
        try {
            const data = await fs.promises.readFile(filepath, 'utf-8');
            const parsedData: [string, FileDecoration][] = JSON.parse(data);

            // Rebuild the map from the loaded data
            this.map = new Map(parsedData);
            console.log('Data loaded successfully.');
            this.notifyUpdate()
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }
}

class MonoInstance<T> {
    private _instance?: T;
    
    constructor(private ctor: new () => T) {}

    get instance(): T {
        if (this._instance) {
            return this._instance;
        } else {
            this._instance = new this.ctor();
            return this._instance;
        }
    }
}

// Create the MonoInstance with TagMapperImpl, a concrete class.
export const GTagMapper: MonoInstance<TagMapper> = new MonoInstance(TagMapperImpl);
