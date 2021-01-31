import AuthenticatedRoute from 'ghost-admin/routes/authenticated';
import CurrentUserSettings from 'ghost-admin/mixins/current-user-settings';
import {inject as service} from '@ember/service';
import ghostPaths from 'ghost-admin/utils/ghost-paths';
import {computed} from '@ember/object';
import { task } from 'ember-concurrency';

const { get, set } = Ember;

export default AuthenticatedRoute.extend(CurrentUserSettings, {
    config: service(),
    settings: service(),
    accept: ['application/pdf'],
    
    beforeModel() {
      this._super(...arguments);
      
    },

    uploadUrl: computed(function () {
        return `${ghostPaths().apiRoot}/themes/upload/`;
    }),

    uploadPhoto: task(function * (file) {
        let product = this.modelFor('product');
        let photo = this.store.createRecord('photo', {
          product,
          filename: get(file, 'name'),
          filesize: get(file, 'size')
        });
    
        try {
          file.readAsDataURL().then(function (url) {
            if (get(photo, 'url') == null) {
              set(photo, 'url', url);
            }
          });
    
          let response = yield file.upload('/api/images/upload');
          set(photo, 'url', response.headers.Location);
          yield photo.save();
        } catch (e) {
          photo.rollback();
        }
      }).maxConcurrency(3).enqueue(),

    actions: {
        
    },

    buildRouteInfoMetadata() {
        return {
            titleToken: 'Dokumente'
        };
    }
});
