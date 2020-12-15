import $ from 'jquery';
import Controller from '@ember/controller';
import generatePassword from 'ghost-admin/utils/password-generator';
import validator from 'validator';
import {
    IMAGE_EXTENSIONS,
    IMAGE_MIME_TYPES
} from 'ghost-admin/components/gh-image-uploader';
import {computed} from '@ember/object';
import {inject as service} from '@ember/service';
import {task} from 'ember-concurrency';
import mutation from 'ghost-admin/gql/queries/vpEdit.graphql';;

const ICON_EXTENSIONS = ['ico', 'png'];

function randomPassword() {
    let word = generatePassword(6);
    let randomN = Math.floor(Math.random() * 1000);

    return word + randomN;
}

export default Controller.extend({
    config: service(),
    ghostPaths: service(),
    notifications: service(),
    session: service(),
    settings: service(),
    ui: service(),
    router: service(),
    apollo: service(),

    availableTimezones: null,
    iconExtensions: null,
    iconMimeTypes: 'image/png,image/x-icon',
    imageExtensions: IMAGE_EXTENSIONS,
    imageMimeTypes: IMAGE_MIME_TYPES,
    _scratchFacebook: null,
    _scratchTwitter: null,
    showSubstitutionCard: false,
    url: '',
    params: '',
    date: '',
    plan: '',
    isMell: '',
    init() {
        this._super(...arguments);
        this.iconExtensions = ICON_EXTENSIONS;
        const url=window.location.href;
        const parameter=url.split('/');
        this.set('url',url);
        this.set('params',parameter);
        this.set('date',parameter[parameter.length-1]);
        this.set('plan',parameter[parameter.length-2]);
        this.set('isMell',(this.plan=='ck0tg2e3d00000iqj5bk4a6pc' ? true :false ));
    },
    
    privateRSSUrl: computed('config.blogUrl', 'settings.publicHash', function () {
        let blogUrl = this.get('config.blogUrl');
        let publicHash = this.get('settings.publicHash');

        return `${blogUrl}/${publicHash}/rss`;
    }),
    getUrlParams(){
        return this.params;
    },
    actions: {
        reloadSite(date) {
            const dateString = moment(date).format('YYYY-MM-DD');            
            let url = this.url;
            url=url.slice(url.lastIndexOf('#')+1,url.lastIndexOf('/'));
            this.transitionToRoute(`${url}/${dateString}`);
        },
        nextVp() {          
            let url = this.url;
            url=url.slice(url.lastIndexOf('#')+1,url.lastIndexOf('/'));
            const dateString = moment(this.date).add(1,'days').format('YYYY-MM-DD');    
            this.transitionToRoute(`${url}/${dateString}`);
        },
        prevVp() {          
            let url = this.url;
            url=url.slice(url.lastIndexOf('#')+1,url.lastIndexOf('/'));
            const dateString = moment(this.date).subtract(1,'days').format('YYYY-MM-DD');    
            this.transitionToRoute(`${url}/${dateString}`);
        },
        async openExportDialog(fileFormat){
            //`${this.$env.EXPORTER_ENDPOINT}/?plan=${this.plan}&date=${this.date}&type=${this.fileFormat!.key}`
            let response = await fetch(`https://vp.lyonel-feininger-gymnasium.de/export/?plan=${this.plan}&date=${this.date}&type=${fileFormat.key}`, {
                method: "post",
              });
            let array=await response.arrayBuffer();
            var file = new Blob([array], { type: fileFormat.mime });
            var fileURL = URL.createObjectURL(file);
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveOrOpenBlob(fileURL,(this.isMell ?  `Mellingen-${this.date}` : `Buttelstedt-${this.date}`));
            }else{
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                a.href = fileURL;
                a.target = '_blank';
                a.download = (this.isMell ?  `Mellingen-${this.date}.${fileFormat.key}` : `Buttelstedt-${this.date}.${fileFormat.key}`);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(fileURL);
            }
        },
        itemToEditPeriod:'',
        itemToEditClass:'',
        itemToEditSubject:'',
        itemToEditTeacher:'',
        itemToEditReplacement:'',
        itemToEditRoom:'',
        itemToEditNote:'',
        itemToEditId:'',

        toggleDisplay(item) {
            if (item!=undefined){
                this.set('itemToEditPeriod',item.period)
                this.set('itemToEditClass',item.class)
                this.set('itemToEditSubject',item.subject)
                this.set('itemToEditTeacher',item.teacher)
                this.set('itemToEditReplacement',item.replacement)
                this.set('itemToEditRoom',item.room)
                this.set('itemToEditNote',item.note)
                this.set('itemToEditId',item.id)
            }
            this.toggleProperty('showSubstitutionCard');
        },

        isShowingeditSubstitutionModal: false,
        async editSubstitution() {
            const itemToMutate = [
                {period:this.itemToEditPeriod},
                {class:this.itemToEditClass},
                {subject:this.itemToEditSubject},
                {teacher:this.itemToEditTeacher},
                {replacement:this.itemToEditReplacement},
                {room:this.itemToEditRoom},
                {note:this.itemToEditNote},
                {id: this.itemToEditId}
            ];
            let variables = {id: itemToMutate.id,
                data: {
                class: itemToMutate.class,
                teacher: itemToMutate.teacher,
                replacement: itemToMutate.replacement,
                room: itemToMutate.room,
                period: itemToMutate.period,
                subject: itemToMutate.subject,
                note: itemToMutate.note
            }};
            let data = await this.apollo.mutate({ mutation, variables},'updateSubstitution').catch(error => alert(error));
            this.toggleProperty('showSubstitutionCard');
            this.toggleProperty('isShowingeditSubstitutionModal');
        },
        toggleeditSubstitutionModal() {
            this.toggleProperty('isShowingeditSubstitutionModal');
          },
          async deleteSubstitution(item) {
            const dialog = await this.$dialog.show(ConfirmCard, {
              title: 'Eintrag löschen',
              text: `Möchten Sie diesen Eintrag wirklich löschen?`,
            });
            const result = await dialog.wait();
      
            if(!result) {
              return;
            }
      
            await this.$apollo.mutate({
              mutation: gql`
                mutation($id: ID!) {
                  deleteSubstitution(where: { id: $id }) {
                    id
                  }
                }
              `,
              variables: { id: item.id }
            });
      
            this.$dialog.message.success('Eintrag erfolgreich gelöscht.');
          },
      
        /**
         * Opens a file selection dialog - Triggered by "Upload Image" buttons,
         * searches for the hidden file input within the .gh-setting element
         * containing the clicked button then simulates a click
         * @param  {MouseEvent} event - MouseEvent fired by the button click
         */
        triggerFileDialog(event) {
            // simulate click to open file dialog
            // using jQuery because IE11 doesn't support MouseEvent
            $(event.target)
                .closest('.gh-setting-action')
                .find('input[type="file"]')
                .click();
        },

        /**
         * Fired after an image upload completes
         * @param  {string} property - Property name to be set on `this.settings`
         * @param  {UploadResult[]} results - Array of UploadResult objects
         * @return {string} The URL that was set on `this.settings.property`
         */
        imageUploaded(property, results) {
            if (results[0]) {
                return this.settings.set(property, results[0].url);
            }
        },

        toggleIsPrivate(isPrivate) {
            let settings = this.settings;

            settings.set('isPrivate', isPrivate);
            settings.get('errors').remove('password');

            let changedAttrs = settings.changedAttributes();

            // set a new random password when isPrivate is enabled
            if (isPrivate && changedAttrs.isPrivate) {
                settings.set('password', randomPassword());

            // reset the password when isPrivate is disabled
            } else if (changedAttrs.password) {
                settings.set('password', changedAttrs.password[0]);
            }
        },

        toggleLeaveSettingsModal(transition) {
            let leaveTransition = this.leaveSettingsTransition;

            if (!transition && this.showLeaveSettingsModal) {
                this.set('leaveSettingsTransition', null);
                this.set('showLeaveSettingsModal', false);
                return;
            }

            if (!leaveTransition || transition.targetName === leaveTransition.targetName) {
                this.set('leaveSettingsTransition', transition);

                // if a save is running, wait for it to finish then transition
                if (this.save.isRunning) {
                    return this.save.last.then(() => {
                        transition.retry();
                    });
                }

                // we genuinely have unsaved data, show the modal
                this.set('showLeaveSettingsModal', true);
            }
        },

        leaveSettings() {
            let transition = this.leaveSettingsTransition;
            let settings = this.settings;

            if (!transition) {
                this.notifications.showAlert('Sorry, there was an error in the application. Please let the Ghost team know what happened.', {type: 'error'});
                return;
            }

            // roll back changes on settings props
            settings.rollbackAttributes();

            return transition.retry();
        },

        validateFacebookUrl() {
            let newUrl = this._scratchFacebook;
            let oldUrl = this.get('settings.facebook');
            let errMessage = '';

            // reset errors and validation
            this.get('settings.errors').remove('facebook');
            this.get('settings.hasValidated').removeObject('facebook');

            if (newUrl === '') {
                // Clear out the Facebook url
                this.set('settings.facebook', '');
                return;
            }

            // _scratchFacebook will be null unless the user has input something
            if (!newUrl) {
                newUrl = oldUrl;
            }

            try {
                // strip any facebook URLs out
                newUrl = newUrl.replace(/(https?:\/\/)?(www\.)?facebook\.com/i, '');

                // don't allow any non-facebook urls
                if (newUrl.match(/^(http|\/\/)/i)) {
                    throw 'invalid url';
                }

                // strip leading / if we have one then concat to full facebook URL
                newUrl = newUrl.replace(/^\//, '');
                newUrl = `https://www.facebook.com/${newUrl}`;

                // don't allow URL if it's not valid
                if (!validator.isURL(newUrl)) {
                    throw 'invalid url';
                }

                this.settings.set('facebook', newUrl);
                this.settings.notifyPropertyChange('facebook');
            } catch (e) {
                if (e === 'invalid url') {
                    errMessage = 'The URL must be in a format like '
                               + 'https://www.facebook.com/yourPage';
                    this.get('settings.errors').add('facebook', errMessage);
                    return;
                }

                throw e;
            } finally {
                this.get('settings.hasValidated').pushObject('facebook');
            }
        },

        validateTwitterUrl() {
            let newUrl = this._scratchTwitter;
            let oldUrl = this.get('settings.twitter');
            let errMessage = '';

            // reset errors and validation
            this.get('settings.errors').remove('twitter');
            this.get('settings.hasValidated').removeObject('twitter');

            if (newUrl === '') {
                // Clear out the Twitter url
                this.set('settings.twitter', '');
                return;
            }

            // _scratchTwitter will be null unless the user has input something
            if (!newUrl) {
                newUrl = oldUrl;
            }

            if (newUrl.match(/(?:twitter\.com\/)(\S+)/) || newUrl.match(/([a-z\d.]+)/i)) {
                let username = [];

                if (newUrl.match(/(?:twitter\.com\/)(\S+)/)) {
                    [, username] = newUrl.match(/(?:twitter\.com\/)(\S+)/);
                } else {
                    [username] = newUrl.match(/([^/]+)\/?$/mi);
                }

                // check if username starts with http or www and show error if so
                if (username.match(/^(http|www)|(\/)/) || !username.match(/^[a-z\d._]{1,15}$/mi)) {
                    errMessage = !username.match(/^[a-z\d._]{1,15}$/mi) ? 'Your Username is not a valid Twitter Username' : 'The URL must be in a format like https://twitter.com/yourUsername';

                    this.get('settings.errors').add('twitter', errMessage);
                    this.get('settings.hasValidated').pushObject('twitter');
                    return;
                }

                newUrl = `https://twitter.com/${username}`;

                this.settings.get('hasValidated').pushObject('twitter');
                this.settings.set('twitter', newUrl);
                this.settings.notifyPropertyChange('twitter');
            } else {
                errMessage = 'The URL must be in a format like '
                           + 'https://twitter.com/yourUsername';
                this.get('settings.errors').add('twitter', errMessage);
                this.get('settings.hasValidated').pushObject('twitter');
                return;
            }
        }
    },

    _deleteTheme() {
        let theme = this.store.peekRecord('theme', this.themeToDelete.name);

        if (!theme) {
            return;
        }

        return theme.destroyRecord().catch((error) => {
            this.notifications.showAPIError(error);
        });
    },

    save: task(function* () {
        let notifications = this.notifications;
        let config = this.config;

        if (this.settings.get('twitter') !== this._scratchTwitter) {
            this.send('validateTwitterUrl');
        }

        if (this.settings.get('facebook') !== this._scratchFacebook) {
            this.send('validateFacebookUrl');
        }

        try {
            let settings = yield this.settings.save();
            config.set('blogTitle', settings.get('title'));

            // this forces the document title to recompute after a blog title change
            this.ui.updateDocumentTitle();

            return settings;
        } catch (error) {
            if (error) {
                notifications.showAPIError(error, {key: 'settings.save'});
            }
            throw error;
        }
    })
});
