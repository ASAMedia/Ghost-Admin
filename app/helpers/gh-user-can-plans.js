import {helper} from '@ember/component/helper';

// Handlebars Helper {{gh-user-can-admin}} group users by admin and owner using if, or group them author using unless
// Usage: call helper as with aparameter of session.user
// e.g - {{#if (gh-user-can-admin session.user)}} 'block content' {{/if}}
// @param session.user

export function ghUserCanPlans(params) {
    return !!(params[0].get('isEditorOrPlanseditor'));
}

export default helper(function (params) {
    return ghUserCanPlans(params);
});
