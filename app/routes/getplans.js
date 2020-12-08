import Route from '@ember/routing/route';
import UnsubscribeRoute from 'ember-apollo-client/mixins/unsubscribe-route';
import query from 'client/gql/queries/vp';
import {inject} from '@ember/service';

// 1.
export default Route.extend(UnsubscribeRoute, {
    // 2.  
    apollo: inject,

    model(){
    // 3.
        return [
          {
            id: '1',
            description: 'The Coolest GraphQL Backend 😎',
            url: 'https://www.graph.cool'
          },
          {
            id: '2',
            description: 'The Best GraphQL Client',
            url: 'http://dev.apollodata.com/'
          }
        ];
        return 'Test';//this.get('apollo').query({query,variables: {plan: 'ck0tg2e3d00000iqj5bk4a6pc',date: '2020-12-10'}},'substitutions').catch(error => alert(error));
    }
});
