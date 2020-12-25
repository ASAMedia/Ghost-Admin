import Controller from '@ember/controller';
import { get } from '@ember/object';
import {inject as service} from '@ember/service';
import mutation from 'ghost-admin/gql/queries/vpEdit.graphql';
import gql from "graphql-tag";

export default Controller.extend({
    apollo: service(),
    session: service(),

    showSubstitutionCard: false,
    isCreatingSubstitution: false,
    showNoteCard: false,
    url: '',
    params: '',
    date: '',
    plan: '',
    isMell: '',
    init() {
        this._super(...arguments);
        let url=window.location.href;
        let parameter=url.split('/');
        this.set('url',url);
        this.set('params',parameter);
        this.set('date',moment(parameter[parameter.length-1]).format('YYYY-MM-DD'));
        this.set('plan',parameter[parameter.length-2]);
        this.set('isMell',(this.plan=='ck0tg2e3d00000iqj5bk4a6pc' ? true :false ));
    },
    
    updateVars(){
        let url=window.location.href;
        let parameter=url.split('/');
        this.set('url',url);
        this.set('params',parameter);
        this.set('date',moment(parameter[parameter.length-1]).format('YYYY-MM-DD'));
        this.set('plan',parameter[parameter.length-2]);
        this.set('isMell',(this.plan=='ck0tg2e3d00000iqj5bk4a6pc' ? true :false ));
    },
    actions: {
        switchPlan(params){
            const url=this.url.slice(this.url.lastIndexOf('#')+1,this.url.lastIndexOf('/', this.url.lastIndexOf('/')-1));
            this.url=`${url}/${params}/${this.date}`;
            this.plan=params;
            this.isMell=(this.plan=='ck0tg2e3d00000iqj5bk4a6pc' ? true :false );
            this.transitionToRoute(this.url);
        },
        reloadSite(date) {
            this.date = moment(date).format('YYYY-MM-DD');            
            const url=this.url.slice(this.url.lastIndexOf('#')+1,this.url.lastIndexOf('/'));
            this.transitionToRoute(`${url}/${this.date}`);
        },
        nextVp() {    
            this.updateVars();      
            const url=this.url.slice(this.url.lastIndexOf('#')+1,this.url.lastIndexOf('/'));
            this.date = moment(this.date).add(1,'days').format('YYYY-MM-DD');   
            this.transitionToRoute(`${url}/${this.date}`);
        },
        prevVp() {       
            this.updateVars();   
            const url=this.url.slice(this.url.lastIndexOf('#')+1,this.url.lastIndexOf('/'));
            this.date = moment(this.date).subtract(1,'days').format('YYYY-MM-DD');    
            this.transitionToRoute(`${url}/${this.date}`);
        },
        async openExportDialog(fileFormat){
            let session=await this.session;
            const response = await fetch(`${window.location.origin}/ghost/api/v2/admin/vertretungsplan/export?plan=${this.plan}&date=${this.date}&type=${fileFormat.key}`, {
                method: "get",
                headers: {
                isplanseditor: get(session.user,'isPlanseditor')}
              });
            let array=await response.arrayBuffer();
            var file = new Blob([array], { type: fileFormat.mime });
            var fileURL = URL.createObjectURL(file);
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveOrOpenBlob(fileURL,(this.isMell ?  `Mellingen-${this.date}` : `Buttelstedt-${this.date}`));
            }else{
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                a.href = fileURL;
                a.target = '_blank';
                a.download = (this.isMell ?  `Mellingen-${this.date}.${fileFormat.key}` : `Buttelstedt-${this.date}.${fileFormat.key}`);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(fileURL);
            }
        },

        /**Actions for Substitutions */
        itemToEditPeriod:'',
        itemToEditClass:'',
        itemToEditSubject:'',
        itemToEditTeacher:'',
        itemToEditReplacement:'',
        itemToEditRoom:'',
        itemToEditNote:'',
        itemToEditId:'',

        toggleDisplay(item) {
            if (item!=undefined){
                this.set('itemToEditPeriod',item.period)
                this.set('itemToEditClass',item.class)
                this.set('itemToEditSubject',item.subject)
                this.set('itemToEditTeacher',item.teacher)
                this.set('itemToEditReplacement',item.replacement)
                this.set('itemToEditRoom',item.room)
                this.set('itemToEditNote',item.note)
                this.set('itemToEditId',item.id)
            }
            else{
                this.set('itemToEditPeriod','')
                this.set('itemToEditClass','')
                this.set('itemToEditSubject','')
                this.set('itemToEditTeacher','')
                this.set('itemToEditReplacement','')
                this.set('itemToEditRoom','')
                this.set('itemToEditNote','')
                this.set('itemToEditId','')
                this.toggleProperty('isCreatingSubstitution');
            }
            this.toggleProperty('showSubstitutionCard');
        },

        isShowingeditSubstitutionModal: false,
        async editSubstitution() {
            const itemToMutate = {
                period: this.itemToEditPeriod,
                class:this.itemToEditClass,
                subject:this.itemToEditSubject,
                teacher:this.itemToEditTeacher,
                replacement:this.itemToEditReplacement,
                room:this.itemToEditRoom,
                note:this.itemToEditNote,
                id: this.itemToEditId
            };

            if(this.isCreatingSubstitution){
                this.toggleProperty('isCreatingSubstitution');
                const variables = {
                    data: { 
                        plan: { id: this.plan },
                        date: this.date,
                        class: itemToMutate.class,
                        teacher: itemToMutate.teacher,
                        replacement: itemToMutate.replacement,
                        room: itemToMutate.room,
                        period: itemToMutate.period,
                        subject: itemToMutate.subject,
                        note: itemToMutate.note
                      }};
                const data = await this.apollo.mutate({
                    mutation: gql`
                      mutation($data: SubstitutionCreateInput!) {
                        createSubstitution(data: $data) {
                          id
                          date
                          class
                          teacher
                          replacement
                          note
                          room
                          period
                          subject
                        }
                      }
                    `,
                    variables
                  }).catch(error => alert(error));            
                
            }
            else{
                const variables = {id: itemToMutate.id,
                    data: {
                    class: itemToMutate.class,
                    teacher: itemToMutate.teacher,
                    replacement: itemToMutate.replacement,
                    room: itemToMutate.room,
                    period: itemToMutate.period,
                    subject: itemToMutate.subject,
                    note: itemToMutate.note
                }};
                let data = await this.apollo.mutate({ mutation, variables},'updateSubstitution').catch(error => alert(error));
            }
            
            this.toggleProperty('showSubstitutionCard');
            this.toggleProperty('isShowingeditSubstitutionModal');   
          this.send('refreshPage');
          
        },
        toggleeditSubstitutionModal() {
            this.toggleProperty('isShowingeditSubstitutionModal');
          },
          isShowingDeleteSubstitutionModal: false,
          deleteItem:'',
          toggledelteSubstitutionModal(item) {
            this.toggleProperty('isShowingDeleteSubstitutionModal');
            this.set('deleteItem',item);
          },

        async deleteSubstitution() {
            const query = gql`
            mutation($id: ID!) {
                deleteSubstitution(where: { id: $id }) {
                id
                }
            }
            `;
            const variables = { id: this.deleteItem.id };
            await this.apollo.mutate({mutation: query, variables}).catch(error => alert(error));
            this.toggleProperty('isShowingDeleteSubstitutionModal');
            this.toggleProperty('isShowingDeleteConfirmModal');
            this.send('refreshPage');
        },
        isShowingDeleteConfirmModal: false,
        toggledelteSubstitutionConfirmModal() {
            this.toggleProperty('isShowingDeleteConfirmModal');
          },
          
      
          /**Actions for NoteCard */
          itemNoteToEdit:'',
          itemNoteKey:'',
          toggleNoteDisplay(item, type) {
            if (item!=undefined){
                if(type==='missing_teachers'){
                    this.set('itemNoteToEdit', (item.abwesend!==null ? item.abwesend.value : ' '));
                    this.set('itemNoteKey', `${this.plan}_${this.date}_${type}`);
                }
                else if(type==='av'){
                    this.set('itemNoteToEdit',(item.av!==null ? item.av.value : ' '));
                    this.set('itemNoteKey', `${this.plan}_${this.date}_${type}`);
                }
                else if(type==='information'){
                    this.set('itemNoteToEdit',(item.information!==null ? item.information.value : ' '));
                    this.set('itemNoteKey', `${this.plan}_${this.date}_${type}`);
                }
            }
            this.toggleProperty('showNoteCard');
        },

        isShowingEditNoteModal: false,
        async editNote() {
            console.log(this.itemNoteToEdit);
            const variables = {
                data: {
                    key: this.itemNoteKey,
                    value: this.itemNoteToEdit
                    }
            };
            const mutation = gql`
            mutation($data: NoteCreateInput!) {
                createNote(data: $data) {
                    id
                    key
                    value
                }
                }
            `;
            await this.apollo.mutate({mutation, variables}).catch(error => alert(error));

            this.toggleProperty('showNoteCard');
            this.toggleProperty('isShowingEditNoteModal');
            this.send('refreshPage');
        },
        toggleeditNoteModal() {
            this.toggleProperty('isShowingEditNoteModal');
          },
      

        
    },
});
