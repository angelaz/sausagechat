Messages = new Meteor.Collection('messages');

Meteor.subscribe("messages");

// do we have permission to show notifications?
var notificationPermission = window.webkitNotifications.checkPermission();

// have all of the existing messages been loaded? (meaning we can use
// added callback)
var ready = false;
Meteor.subscribe("messages", function () {
    ready = true;
});

// only require username on login
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
                var messageText = message.val();

                Messages.insert({
                    name: name,
                    message: messageText,
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

var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
};

function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
        return entityMap[s];
    });
}

function linkify(inputText) {
    var replacedText, replacePattern1, replacePattern2, replacePattern3;

    //URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

    //Change email addresses to mailto:: links.
    replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

    return replacedText;
}

Template.message.sexyMessage = function () {
    // TODO this allows XSS and stuff

    var sexyMsg = this.message;
    sexyMsg = linkify(sexyMsg);
    sexyMsg = sexyMsg.replace(/\\blob/g,
        "<img src='http://4.bp.blogspot.com/-i8HuUVAX4V0/T06jb7mD2MI/AAAAAAAAAGU/k37huhvENLg/s1600/blob.gif' width=40 height=30 />");
    sexyMsg = sexyMsg.replace(/\\sausage/g,
        "<img src='http://media.morristechnology.com/mediafilesvr/upload/coastalcourier/article/2013/01/16/hotdog_.jpg' width=40 height=30 />");
    return sexyMsg;
};


Template.message.formatTime = function (timestamp) {
    return moment(timestamp).fromNow();
};

Template.body.events({
    'click #clear': function () {
        Meteor.call("clearMessages");
    },
    'click #enableNotifications': function () {
        var notificationPermission = window.webkitNotifications.checkPermission();
        if (notificationPermission !== 0) {
            window.webkitNotifications.requestPermission();
        }
    }
});

Messages.find().observe({
    added: function (message) {
        if (ready) {
            // lol wait unti template renders to scroll
            // don't remember how to do this legitimately ATM
            setTimeout(function () {
                $("#chat").scrollTop(99999);
            }, 100);
        }

        if ((notificationPermission === 0) && ready && Meteor.user().username !== message.name) {
            var notification = window.webkitNotifications.createNotification(
                'http://media.morristechnology.com/mediafilesvr/upload/coastalcourier/article/2013/01/16/hotdog_.jpg',
                "Message from " + message.name,
                message.message
            );

            notification.show();

            setTimeout(function () {
                notification.cancel();
            }, 2000);
        }
    }
});