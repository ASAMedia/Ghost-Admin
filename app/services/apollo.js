import ApolloService from 'ember-apollo-client/services/apollo';
import middlewares from 'ember-apollo-client/utils/middlewares';
import {inject} from '@ember/service';

export default ApolloService.extend({
    middlewares: middlewares('authorize'),

    auth: inject,

    authorize(req, next) {
        if (!req.options.headers) {
            req.options.headers = {};
        }
        req.options.headers.authorization = token ? `Bearer ${token}` : null;
        next();
    }
});