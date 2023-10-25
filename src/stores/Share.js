import { types, flow, applySnapshot } from 'mobx-state-tree'
import { ShareMenuReactView } from "react-native-share-menu";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MicroBlogApi, { LOGIN_ERROR, LOGIN_TOKEN_INVALID, LOGIN_INCORRECT } from "../api/MicroBlogApi"
import Tokens from "./Tokens";
import User from './models/User';
import string_checker from '../utils/string_checker'
import { Platform } from 'react-native'
import { Navigation } from 'react-native-navigation'

export default Share = types.model('Share', {
	is_loading: types.optional(types.boolean, true),
	share_type: types.optional(types.string, "text"),
	share_data: types.optional(types.string, ""),
	share_text: types.optional(types.string, ""),
	share_url: types.optional(types.string, ""),
	share_image_data: types.maybeNull(types.model("ShareImageData", {
		uri: types.string,
		type: types.string,
		mime: types.string
	})),
	text_selection: types.optional(
    types.model('Selection', {
      start: types.optional(types.number, 0),
      end: types.optional(types.number, 0),
    }), {start: 0, end: 0}
  ),
	users: types.optional(types.array(User), []),
	selected_user: types.maybeNull(types.reference(User)),
	toolbar_select_user_open: types.optional(types.boolean, false),
	error_message: types.maybeNull(types.string),
	image_options_open: types.optional(types.boolean, false)
})
	.actions(self => ({

		hydrate: flow(function* (shared_data = null) {
			console.log('Share:hydrate', self)
			yield self.trigger_loading()
			yield App.prep_and_hydrate_share_extension()
			const store = yield AsyncStorage.getItem('Share')
			if (store) {
				applySnapshot(self, JSON.parse(store))
				self.is_loading = true
				self.share_type = "text"
				self.share_data = ""
				self.share_text = ""
				self.share_image_data = null
				self.error_message = null
				self.image_options_open = false
			}
			const data = yield Tokens.hydrate(true)
			if (data?.tokens) {
				console.log('Share:hydrate:tokens', data.tokens)
				for (const user_data of data.tokens) {
					console.log("USER DATA", user_data)
					const existing_user = self.users.find(u => u.username === user_data.username)
					if (existing_user == null) {
						yield self.login_account(user_data)
					}
				}
			}
			yield self.set_data(shared_data)
			self.trigger_loading(false)
		}),
		
		hydrate_android_share: flow(function* (shared_data) {
			console.log('Share:hydrate_android_share', shared_data)
			Share.hydrate(shared_data)
		}),

		trigger_loading: flow(function* (is_loading = true) {
			console.log('Share:trigger_loading', is_loading)
			self.is_loading = is_loading
		}),

		open_in_app: flow(function* () {
			console.log('Share:open_in_app')
			ShareMenuReactView.continueInApp()
		}),

		set_data: flow(function* (direct_data = null) {
			let data = null
			let mime_type = null
			if (direct_data != null) {
				console.log('Share:set_data:direct_data', direct_data)
				data = direct_data.data
				mime_type = direct_data.mimeType
			}
			else {
				const share_data = yield ShareMenuReactView.data()
				console.log('Share:set_data', share_data)
				data_array = share_data.data
				data = data_array[ 0 ].data
				mime_type = data_array[ 0 ].mimeType
			}
			self.share_data = data
			console.log('Share:set_data:data', data, mime_type)
			if (mime_type === "image/jpeg" || mime_type === "image/png") {
				self.share_type = "image"
			}
			else if(mime_type === "application/json"){
				self.share_type = "json"
			}
			if (self.share_type === "text") {
				self.share_text = string_checker._validate_url(data) ? data : `> ${data}`
				self.users.forEach(user => {
					user.posting.set_post_text(self.share_text)
				})
			}
			else if (self.share_type === "image") {
				const image_data = {
					uri: data,
					type: mime_type,
					mime: mime_type
				}
				self.share_image_data = image_data
				self.users.forEach(user => {
					user.posting.create_and_attach_asset(image_data)
				})
			}
			else if (self.share_type === "json"){
				// Because we're dealing with JSON, we need to check a few things and add the correct share_text
				const parsed_data = JSON.parse(data)
				
				let share_text = ""
				if (parsed_data.title && parsed_data.url) {
					share_text += `[${parsed_data.title}](${parsed_data.url})`
					self.share_url = parsed_data.url
				} 
				else if (parsed_data.url) {
					share_text += `[](${parsed_data.url})`
					self.share_url = parsed_data.url
				}
				if (parsed_data.text) {
					share_text += `\n\n> ${parsed_data.text}\n\n`
				}
				
				self.share_text = share_text
				self.users.forEach(user => {
					user.posting.set_post_text(self.share_text)
				})
			}
			else {
				// TODO?: Not supported
			}
		}),
		
		login_account: flow(function* (account_with_token = null) {
			console.log("Share:login_account")
			if (account_with_token) {
				const existing_user = self.users.find(u => u.username === account_with_token.username)
				if (existing_user) {
					console.log("Share:login_account:existing_user", existing_user, self.selected_user)
					// TODO: UPDATE USER
					if (self.selected_user == null || self.selected_user.username !== existing_user.username) {
						self.selected_user = existing_user
					}
				}
				else {
					const login = yield MicroBlogApi.login_with_token(account_with_token.token)
					if (login !== LOGIN_ERROR && login !== LOGIN_INCORRECT && login !== LOGIN_TOKEN_INVALID) {
						console.log("Share:login_account:login", login)
						const new_user = User.create(login)
						self.users.push(new_user)
						self.selected_user = new_user
					}
				}
			}
		}),

		select_user: flow(function* (user) {
			console.log("Share:select_user", user)
			if (self.selected_user !== user) {
				self.selected_user = user
			}
			else {
				self.selected_user?.fetch_data()
			}
			if (self.toolbar_select_user_open) {
				self.toolbar_select_user_open = false
			}
		}),

		toggle_select_user: flow(function* () {
			console.log("Share:toggle_select_user")
			self.toolbar_select_user_open = !self.toolbar_select_user_open
		}),

		save_as_bookmark: flow(function* () {
			console.log("Share:save_as_bookmark")
			let url = ""
			if(string_checker._validate_url(self.share_text)){
				url = self.share_text
			}
			else if(string_checker._validate_url(self.share_url)){
				url = self.share_url
			}
			Share.clear_error_message()
			const saved = yield self.selected_user.posting.add_bookmark(url)
			if (saved) {
				ShareMenuReactView.dismissExtension()
			}
			else {
				self.error_message = "Something went wrong, trying to save your bookmark. Please try again."
			}
		}),

		send_post: flow(function* () {
			console.log("Share:send_post")
			Share.clear_error_message()
			const sent = yield self.selected_user.posting.send_post()
			if (sent) {
				ShareMenuReactView.dismissExtension()
			}
			else {
				self.error_message = "Something went wrong, trying to send your post. Please try again."
			}
		}),

		set_post_text: flow(function* (text) {
			console.log("Share:set_post_text", text)
			self.share_text = text
			self.users.forEach(user => {
				user.posting.set_post_text(text)
			})
		}),

		handle_text_action: flow(function* (action) {
			console.log("Share:handle_text_action", action)
			const is_link = action === "[]"
			if (is_link) {
				action = "[]()"
				let url = null
				if (self.can_save_as_bookmark() && self.share_text === self.share_data) {
					url = self.share_data
					action = `[](${ url })`
				}
				self.share_text = self.share_text.InsertTextStyle(action, self.text_selection, true, url)
			}
			else {
				self.share_text = self.share_text.InsertTextStyle(action, self.text_selection, is_link)
			}
			self.set_post_text(self.share_text)
		}),

		set_text_selection: flow(function* (selection) {
			self.text_selection = selection
		}),

		close: flow(function* () {
			Platform.OS === "ios" ?
				ShareMenuReactView.dismissExtension()
			: Navigation.dismissAllModals()
		}),

		clear_error_message: flow(function* () {
			self.error_message = null
		}),
		
		trigger_image_options: flow(function* (asset) {
			console.log('Share:trigger_image_options', asset)
			self.image_options_open = true
		}),
		
		close_image_options: flow(function* () {
			console.log('Share:close_image_options')
			self.image_options_open = false
		}),

	}))
	.views(self => ({
		is_logged_in(){
			return self.users.length && self.selected_user != null && self.selected_user.token() != null
		},
		can_save_as_bookmark() {
			return (self.share_type === "text" || self.share_type === "json") && self.share_text.length > 0 && (self.share_text.startsWith("http://") || self.share_text.startsWith("https://") || (self.share_text.startsWith("[") && self.share_text.endsWith(")"))) && (string_checker._validate_url(self.share_text) || string_checker._validate_url(self.share_url))
		},
		sorted_users() {
			return self.users.slice().sort((a, b) => {
				const a_is_selected = Share.selected_user?.username === a.username;
				const b_is_selected = Share.selected_user?.username === b.username;
				return b_is_selected - a_is_selected;
			})
		}
	}))
	.create()