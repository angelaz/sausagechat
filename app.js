var Messages = new Meteor.Collection('messages');

if (Meteor.isClient) {

    Accounts.ui.config({
      passwordSignupFields: 'USERNAME_ONLY'
    });

    Template.chat.messages = function () {
        return Messages.find({}, { sort: { createdAt: 1 }});
    };

    Template.input.events({
        'keydown input#message': function (event) {
            if (event.which == 13) {
                var name = 'Anonymous';
                var message = $('#message');
                if (Meteor.user()) name = Meteor.user().username;

                if (message.val() !== '') {
                    Messages.insert({
                        name: name,
                        message: message.val(),
                        createdAt: Date.now()
                    });

                    message.val('');
                    message.focus();
                    Meteor.flush();
                    $("#chat").scrollTop(99999);
                }
            }
        }
    });
}
