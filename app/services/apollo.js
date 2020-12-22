import ApolloService from 'ember-apollo-client/services/apollo';
import { inject as service } from '@ember/service';

class OverriddenApollo extends ApolloService {
  @service
  session;
}
export default OverriddenApollo;
