import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { run } from '@ember/runloop';

export default Controller.extend({
    ajax: service(),
    fileList:[],
    init() {
        this._super(...arguments);
        this.getFileList();
    },
    async getFileList(){
      const response = await fetch(`${window.location.origin}/content/api/files/listAll/`).then(response=>response.json());
      this.set('fileList',response);
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
            }).catch((response) => {
                console.log(response);
            });
            this.getFileList();
        },
        async deleteFile(file){
          const response = await fetch(`${window.location.origin}/ghost/api/v2/admin/documents/delete`, {
            method: 'post',
            headers: {
              file: file.filePath
            }
        });
        this.getFileList();
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