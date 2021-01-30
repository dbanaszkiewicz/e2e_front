import {Inject, Injectable} from '@angular/core';
import {LOCAL_STORAGE, StorageService} from 'angular-webstorage-service';

@Injectable({providedIn: 'root'})
export class LocalStorageService {
    constructor(@Inject(LOCAL_STORAGE) private storage: StorageService) {
    }

    get(key: string, defaultValue = null) {
        return this.storage.get(key) === null ? defaultValue : this.storage.get(key);
    }

    set(key: string, value: any) {
        this.storage.set(key, value);
    }

    remove(key: string) {
        this.storage.remove(key);
    }
}

