import Controller from '@ember/controller';
import { get } from '@ember/object';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { run } from '@ember/runloop';

export default Controller.extend({
    ajax: service(),

    init() {
        this._super(...arguments);
    },
    actions: {
        async onUpload(file) {
            let ajax = this.ajax;
            let formData = new FormData();
            console.log(file);
            formData.append('file', file);

            Object.keys(this.paramsHash || {}).forEach((key) => {
                formData.append(key, this.paramsHash[key]);
            });

            let response = await ajax.post(`${window.location.origin}/ghost/api/v3/admin/files/upload/`, {
                data: formData,
                processData: false,
                contentType: false,
                dataType: 'pdf',
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
        triggerFileDialog(event) {
            // simulate click to open file dialog
            // using jQuery because IE11 doesn't support MouseEvent
            $(event.target)
                .closest('.gh-setting-action')
                .find('input[type="file"]')
                .click();
        },
    },
});