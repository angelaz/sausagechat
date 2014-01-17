Messages = new Meteor.Collection('messages');

Meteor.methods({
    clearMessages: function () {
        Messages.remove({});
    }
});

Meteor.publish("messages", function () {
	return Messages.find({});
});