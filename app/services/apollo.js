import ApolloService from 'ember-apollo-client/services/apollo';
import {Promise} from 'rsvp';
import {get} from '@ember/object';
import {inject as service} from '@ember/service';
import {setContext} from 'apollo-link-context';

class OverriddenApollo extends ApolloService {
    @service session;

    User = '';
    async init() {
        super.init(...arguments);
        let session = await this.session;
        this.User = session.user;
    }

    link() {
        //while(!this.User){this.getUser()}
        let httpLink = super.link();
        let headers = setContext(() => {
            this.getUser();
            return new Promise((success) => {
                headers = {};
                headers.isplanseditor = get(this.User, 'isEditorOrPlanseditor');
                success({headers});
            });
        });
        return headers.concat(httpLink);
    }
    async getUser() {
        this.User = await this.session.user;
    }
}
export default OverriddenApollo;