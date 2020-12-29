import AuthenticatedRoute from 'ghost-admin/routes/authenticated';
import CurrentUserSettings from 'ghost-admin/mixins/current-user-settings';
import RSVP from 'rsvp';
import query from 'ghost-admin/gql/queries/vp.graphql';
import {inject as service} from '@ember/service';

export default AuthenticatedRoute.extend(CurrentUserSettings, {
    apollo: service(),
    moment: service(),
    vpModel: null,
    beforeModel() {
        this._super(...arguments);
        return this.get('session.user')
            .then(this.transitionAuthor())
            .then(this.transitionEditor());
    },
    async model(params) {
        await this.calculateVpModel(params);
        return this.vpModel;
    },
    actions: {
        refreshPage() {
            this.refresh();
        }
    },
    setupController(controller, model) {
        controller.set('vpModel', model);
      },
    async calculateVpModel(params) {
        let apollo = this.apollo;
        let plan = params.location;
        let isMellingen = (plan === 'ck0tg2e3d00000iqj5bk4a6pc' ? true : false);
        let date = params.date;
        let variables = {plan: plan, date: date, key: `${plan}_${date}_missing_teachers`};
        let substitutions = await apollo.query({query, fetchPolicy: 'network-only', variables}, 'substitutions').catch(error => alert(error));
        substitutions = substitutions.slice().sort(function (a, b) {
            if (a.period > b.period) {
                return 1;
            } else if (a.period < b.period) {
                return -1;
            } else {
                if (Number(a.class.split(/\D/)[0]) > Number(b.class.split(/\D/)[0])) {
                    return 1;
                } else if (Number(a.class.split(/\D/)[0]) < Number(b.class.split(/\D/)[0])) {
                    return -1;
                } else {
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

        var abwesend = await apollo.query({query, fetchPolicy: 'network-only', variables}, 'note').catch(error => alert(error));
        variables = {plan: plan, date: date, key: `${plan}_${date}_av`};
        var av = await apollo.query({query, fetchPolicy: 'network-only', variables}, 'note').catch(error => alert(error));
        variables = {plan: plan, date: date, key: `${plan}_${date}_information`};
        var information = await apollo.query({query, fetchPolicy: 'network-only', variables}, 'note').catch(error => alert(error));
        let fileFormats = [
            {key: 'pdf', mime: 'application/pdf', description: 'PDF (Portable Document Format)'},
            {key: 'csv', mime: 'text/comma-separated-values', description: 'CSV (Comma Separated Values)'},
            {key: 'tex', mime: 'application/x-tex', description: 'TeX (Textsatzsystem)'}
        ];
        this.vpModel = RSVP.hash({
            date,
            plan,
            isMellingen,
            substitutions,
            abwesend,
            av,
            information,
            headers: [
                {text: 'Stunde', value: 'period'},
                {text: 'Klasse', value: 'class'},
                {text: 'Fach', value: 'subject'},
                {text: 'Vertretende Lehrer', value: 'teacher'},
                {text: 'Fach', value: 'replacement'},
                {text: 'Raum', value: 'room'},
                {text: 'Bemerkung', value: 'note'}
            ],
            fileFormats

        });
    },
    buildRouteInfoMetadata() {
        return {
            titleToken: 'Vertretungsplan'
        };
    }

});

export function ghUserCanPlans(params) {
    return !!(params[0].get('isEditorOrPlanseditor'));
}