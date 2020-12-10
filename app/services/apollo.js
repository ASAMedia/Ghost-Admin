import ApolloService from 'ember-apollo-client/services/apollo';
import { computed } from '@ember/object';
const { inject: { service } } = Ember;
import { setContext } from 'apollo-link-context';

export default ApolloService.extend({

  //auth: Ember.inject.service(),
    authorize(req, next) {
        if (!req.options.headers) {
            req.options.headers = {};
        }
        req.options.headers.authorization = token ? `Bearer ${token}` : null;
        next();
    },
    link: computed(function() {
        let httpLink = this._super(...arguments);
    
        let authLink = setContext((request, context) => {
        });
        return authLink.concat(httpLink);
      }),
});