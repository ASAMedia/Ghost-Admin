import ApolloService from 'ember-apollo-client/services/apollo';
import { inject as service } from '@ember/service';
import { setContext } from 'apollo-link-context';
import { Promise } from 'rsvp';

class OverriddenApollo extends ApolloService {
  @service
  session;

  link() {
    let httpLink = super.link()

    // Middleware
    let authMiddleware = setContext(async(request, context) => {
      if (!token) {
      }

      Object.assign(context.headers, {
        headers: {
          authorization: token ? `Bearer ${token}` : null
        }
      });

      return context;
    });

    // Afterware
    const resetToken = undefined;

    const authFlowLink = authMiddleware.concat(resetToken);

    return authFlowLink.concat(httpLink);
  }
}
export default OverriddenApollo;
/* import ApolloService from 'ember-apollo-client/services/apollo';
//import middlewares from 'ember-apollo-client/utils/middlewares';
import { computed } from '@ember/object';
const { inject: { service } } = Ember;
 */

/* export default ApolloService.extend({

    middlewares: middlewares('authorize'),

    authorize(req, next) {
        if (!req.options.headers) {
            req.options.headers = {};
        }
        const token = 'ad10a5fa5069d63e7761e351b2eaf040';
        req.options.headers.authorization = token ? `Bearer ${token}` : null;
        next();
    },
    /* link: computed(function() {
        let httpLink = this._super(...arguments);
    
        let setAuthorizationLink = setContext((_, _previousContext) => ({
            headers: {authorization: "Bearer ad10a5fa5069d63e7761e351b2eaf040"}
          }));
        
        //setContext((_, previousContext) => {
         // return { headers: { "authorization": "Bearer ad10a5fa5069d63e7761e351b2eaf040" } };
        //});
        return setAuthorizationLink.concat(httpLink);
      }), 
      
}); */