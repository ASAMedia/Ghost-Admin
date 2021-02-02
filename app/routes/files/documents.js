import AuthenticatedRoute from 'ghost-admin/routes/authenticated';
import CurrentUserSettings from 'ghost-admin/mixins/current-user-settings';
import {inject as service} from '@ember/service';

const { get, set } = Ember;

export default AuthenticatedRoute.extend(CurrentUserSettings, {
    config: service(),
    settings: service(),
   
    beforeModel() {
      this._super(...arguments);
      
    },

    actions: {
        
    },

    buildRouteInfoMetadata() {
        return {
            titleToken: 'Dokumente'
        };
    }
});
