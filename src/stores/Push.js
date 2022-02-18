import { types, flow, destroy } from 'mobx-state-tree';
import MicroBlogApi, { API_ERROR } from '../api/MicroBlogApi'
import PushNotification from "react-native-push-notification";
import Notification from './models/Notification'

export default Push = types.model('Push', {
	token: types.optional(types.string, ""),
	notifications: types.optional(types.array(Notification), [])
})
.actions(self => ({

  hydrate: flow(function* () {
		console.log("Push:hydrate")

		PushNotification.configure({
			onRegister: function (data) {
				console.log("Push:hydrate:onRegister:data", data);
				Push.set_token(data.token)
			},
			onRegistrationError: function (error) {
				console.log("Push:hydrate:onRegistrationError:error", error);
			},
			onNotification: function(data) {
				Push.handle_notification(data)
			},
			permissions: {
				alert: true,
				badge: true,
				sound: true
			},
			popInitialNotification: true,
			requestPermissions: true
		});
	}),
	
	set_token: flow(function* (token) {
		console.log("Push::set_token", token)
		self.token = token
	}),

	register_token: flow(function* (user_token) {
		console.log("Push:register_token")
		if (self.token != null && user_token != null) {
			const data = yield MicroBlogApi.register_push(self.token, user_token)
			if (data !== API_ERROR) {
				console.log("Push:register_token:OK")
				return true
			}
		}
		return false
	}),

	unregister_user_from_push: flow(function* (user_token) {
		console.log("Push:unregister_user_from_push")
		if (self.token != null && user_token != null) {
			const data = yield MicroBlogApi.unregister_push(self.token, user_token)
			if (data !== API_ERROR) {
				console.log("Push:register_token:OK")
				return true
			}
		}
		return false
	}),

	clear_notifications: flow(function* () {
		console.log("Push::clear_notifications")
		PushNotification.cancelAllLocalNotifications()
	}),

	remove_notification: flow(function* (id) {
		console.log("Push::remove_notification", id)
		PushNotification.cancelLocalNotification(id)
	}),

	check_and_remove_notifications_with_post_id: flow(function* (post_id) {
		console.log("Push::check_and_remove_notifications_with_post_id", post_id)
		if (self.notifications) {
			const notifications = self.notifications.filter(n => n.post_id === post_id)
			if (notifications) {
				notifications.forEach(notification => {
					Push.remove_notification(notification.id)
					destroy(notification)
				})
			}
		}
	}),

	handle_notification: flow(function* (notification) {
		console.log("Push::handle_notification", notification)
		const nice_notification_object = {
			id: notification.id,
			message: notification.message,
			post_id: notification.data?.post_id,
			to_username: JSON.parse(notification.data?.to_user)?.username,
			from_username: JSON.parse(notification.data?.from_user)?.username,
		}
		// Check if we have an existing notification in our array.
		// This will never happen, except for DEV for sending through test messages.
		const existing_notification = self.notifications.find(notification => notification.id === nice_notification_object.id)
		if (existing_notification) {
			destroy(existing_notification)
		}
		self.notifications.push(Notification.create(nice_notification_object))
	}),

}))
.views(self => ({
	valid_notifications() {
		return self.notifications.filter(n => n.can_show_notification())
	}
}))
.create({})