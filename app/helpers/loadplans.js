import Ember from 'ember';
import { queryManager } from "ember-apollo-client";
import query from 'ghost-admin/gql/queries/vp.graphql';
import {inject} from '@ember/service';

//export default Ember.Helper.helper(loadplans);
export default Ember.Helper.extend({
  apollo: Ember.inject.service(),
  onLocalesInit: Ember.observer('i18n.locales', function () {
      //this.recompute();
  }),
  compute(params/*, hash*/) {
    return "5" + this.get('apollo').query({ query, variables:{'plan': 'ck0tg2e3d00000iqj5bk4a6pc','date': '2020-12-07'}}, 'vp').catch(error => alert(error));
  }
});