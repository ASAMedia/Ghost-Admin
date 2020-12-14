import Ember from 'ember';
import AuthenticatedRoute from 'ghost-admin/routes/authenticated';
import CurrentUserSettings from 'ghost-admin/mixins/current-user-settings';
import RSVP from 'rsvp';
import query from 'ghost-admin/gql/queries/vp.graphql';
import {inject as service} from '@ember/service';
import moment from 'moment';

export default AuthenticatedRoute.extend(CurrentUserSettings, {
    config: service(),
    settings: service(),
    apollo: service(),
    moment: service(),

    beforeModel() {
        this._super(...arguments);
        return this.get('session.user')
            .then(this.transitionAuthor())
            .then(this.transitionEditor());
    },
    
    async model(params) {
        let apollo = this.get('apollo');
        let plan=params.location;
        let isMellingen=(plan=='ck0tg2e3d00000iqj5bk4a6pc' ? true : false);
        let date=params.date;
        let variables = { plan: plan,date: date,key: `${plan}_${date}_missing_teachers`};
        var substitutions=await apollo.query({ query, variables},'substitutions').catch(error => alert(error));
        substitutions=substitutions.slice().sort(function(a, b){
            if (a.period > b.period) {  
                return 1;  
            } else if (a.period < b.period) {  
                return -1;  
            }  
            else {
                if (Number(a.class.split(/\D/)[0]) > Number(b.class.split(/\D/)[0])) {  
                    return 1;  
                } else if (Number(a.class.split(/\D/)[0]) < Number(b.class.split(/\D/)[0])) {  
                    return -1;  
                } 
                else {
                    if (a.class.split(/\D/)[1] > b.class.split(/\D/)[1]) {  
                        return 1;  
                    } else if (a.class.split(/\D/)[1] < b.class.split(/\D/)[1]) {  
                        return -1;  
                    } else {
                        return 0;
                    }
                }
            }
        });
        
        var abwesend=await apollo.query({ query, variables},'note').catch(error => alert(error));
        variables = { plan: plan,date: date,key: `${plan}_${date}_av`};
        var av=await apollo.query({ query, variables},'note').catch(error => alert(error));
        variables = { plan: plan,date: date,key: `${plan}_${date}_information`};
        var information=await apollo.query({ query, variables},'note').catch(error => alert(error));
        let fileFormats= [
            { key: "pdf", mime: "application/pdf", description: "PDF (Portable Document Format)" },
            { key: "csv", mime: "text/comma-separated-values", description: "CSV (Comma Separated Values)" },
            { key: "tex", mime: "application/x-tex", description: "TeX (Textsatzsystem)" }
          ];    
        return RSVP.hash({
            settings: this.settings.reload(),
            availableTimezones: this.get('config.availableTimezones'),
            date,
            plan,
            isMellingen,
            substitutions,
            abwesend,
            av,
            information,
            headers: [
                { text: "Stunde", value: "period" },
                { text: "Klasse", value: "class" },
                { text: "Fach", value: "subject" },
                { text: "Vertretende Lehrer", value: "teacher" },
                { text: "Fach", value: "replacement" },
                { text: "Raum", value: "room" },
                { text: "Bemerkung", value: "note" }
              ],
            fileFormats,
          
        });
    },

    setupController(controller, models) {
        // reset the leave setting transition
        controller.set('showLeaveSettingsModal', false);
        controller.set('leaveSettingsTransition', null);
        controller.set('availableTimezones', models.availableTimezones);
    },

    actions: {

        willTransition(transition) {
            let controller = this.controller;
            let settings = this.settings;
            let settingsIsDirty = settings.get('hasDirtyAttributes');

            if (settingsIsDirty) {
                transition.abort();
                controller.send('toggleLeaveSettingsModal', transition);
                return;
            }
        },

    },

    buildRouteInfoMetadata() {
        return {
            titleToken: 'Vertretungsplan'
        };
    },
    
});

export function ghUserCanPlans(params) {
    return !!(params[0].get('isEditorOrPlanseditor'));
}


