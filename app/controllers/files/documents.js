import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { run } from '@ember/runloop';

export default Controller.extend({
    ajax: service(),
    accept: 'application/pdf',
    isShowingDeleteFileModal: false,
    fileToDelete: '',
    fileList:[],
    init() {
        this._super(...arguments);
        this.getFileList();
    },
    async getFileList(){
      const response = await fetch(`${window.location.origin}/content/api/files/listall/`).then(response=>response.json());
      this.set('fileList',response);
      //console.log(this.fileList);
    },
    
    actions: {
        async onUpload(file) {
            if(file.type!==this.accept){
                console.log('Wrong file Type');
                return 'Wrong file Type';
            }
            let ajax = this.ajax;
            let formData = new FormData();
            
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
                //console.log(response);
            });
            this.getFileList();
        },
        async deleteFile(file){
            let fileToDelete=file || this.fileToDelete;
          const response = await fetch(`${window.location.origin}/ghost/api/v2/admin/documents/delete`, {
            method: 'post',
            headers: {
              file: fileToDelete.filePath
            }
        });
        this.set('fileToDelete','');
        this.getFileList();
        this.set('isShowingDeleteFileModal',!this.isShowingDeleteFileModal);
        },
        toggleDeleteFileModal(file){
            this.set('isShowingDeleteFileModal',!this.isShowingDeleteFileModal);
            this.set('fileToDelete',file)
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