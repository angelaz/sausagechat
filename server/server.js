Messages = new Meteor.Collection('messages');

function getUser(_id) {
	return Meteor.users.findOne(_id);
}

Meteor.methods({
    clearMessages: function () {
        Messages.remove({});
    }
});

Meteor.publish("messages", function () {
	if (this.userId) {
		var user = getUser(this.userId);
		if (user) {
			var name = user.username;

			if (name === "Sausage" || name === "Blob") {
				return Messages.find({});
			} else {
				return [];
			}
		}
	}
});