import Controller from '@ember/controller';
import { get } from '@ember/object';
import { task } from 'ember-concurrency';
import {inject as service} from '@ember/service';
import {run} from '@ember/runloop';

export default Controller.extend({
    ajax: service(),

    imageExtensions: ['gif', 'jpg', 'jpeg', 'png', 'svg'],
    init() {
        this._super(...arguments);
    },
    actions: {
        uploadImage(file) {
            this.uploadPhoto(file);
        }
    },
    async uploadPhoto(file) {
        /* const response = await fetch(`${window.location.origin}/ghost/api/v3/admin/images/upload/`, {
            method: 'post',
            headers: {
                'Content-Type': 'form-data;',
                'file': ('ifxb.png', file, 'image/png'),
                'params': {'purpose': 'image', 'ref': 'ifxb.png'}
            }
        }); */
        let ajax = this.ajax;
        let formData = new FormData();

        formData.append(this.paramName, file);

        Object.keys(this.paramsHash || {}).forEach((key) => {
            formData.append(key, this.paramsHash[key]);
        });

        let response = await ajax.post(`${window.location.origin}/ghost/api/v3/admin/images/upload/`, {
            data: formData,
            processData: false,
            contentType: false,
            dataType: 'text',
            xhr: () => {
                let xhr = new window.XMLHttpRequest();

                xhr.upload.addEventListener('progress', (event) => {
                    run(() => {
                        //tracker.update(event);
                        //this._updateProgress();
                    });
                }, false);

                return xhr;
            }
        });
    },
});