import {Injectable} from '@angular/core';
import {LocalStorageService} from './local-storage.service';
import {saveAs} from 'file-saver';
import {JSEncrypt} from 'jsencrypt';

@Injectable({
    providedIn: 'root'
})
export class RSAService {

    private key = null;

    constructor(
        private LSS: LocalStorageService,
    ) {
        if (this.LSS.get('pKey', null) !== null) {
            this.key = new JSEncrypt();
            this.key.setPrivateKey(this.LSS.get('pKey', null));
        }
    }

    setKey(key) {
        if (this.key === null) {
            this.key = new JSEncrypt();
        }
        this.LSS.set('pKey', key);
        this.key.setPrivateKey(key);
    }

    isKeyLoaded(): boolean {
        return this.key !== null;
    }

    getKey() {
        const filename = 'e2eCommunicator_privateKey.pkey';
        const blob = new Blob([this.key.getPrivateKey()], {type: 'text/plain'});
        let filesaver = saveAs(blob, filename);
    }

    getPublicKey() {
        return this.key.getPublicKey();
    }

    generateKey() {
        this.key = new JSEncrypt({
            default_key_size: 512
        });

        this.LSS.set('pKey', this.key.getPrivateKey());
    }

    removeKey() {
        this.key = null;
        this.LSS.remove('pKey');
    }

    encrypt(publicKey, message) {
        let key = new JSEncrypt();
        key.setPublicKey(publicKey);

        let encrypted = '';
        for (let str of this.chunkSubstr(message)) {
            if (encrypted.length > 0) {
                encrypted += ':|:' + key.encrypt(str);
            } else {
                encrypted += key.encrypt(str);
            }
        }
        return encrypted;
    }

    decrypt(message: string) {
        let result = '';
        for (let str of message.split(':|:')) {
            let m = this.key.decrypt(str);
            if (m === null) {
                return 'Nie udało się odszyfrować tej wiadomości!';
            }
            result += m;
        }
        return decodeURI(result);
    }

    private chunkSubstr(str) {
        str = encodeURI(str);
        const size = 50;
        const chunks = [];

        for (let i = 0, o = 0; i < Math.ceil(str.length/size); ++i, o += size) {
            chunks.push(str.substr(o, size));
        }

        return chunks;
    }
}
