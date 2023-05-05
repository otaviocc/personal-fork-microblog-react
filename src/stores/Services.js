import { types, flow } from 'mobx-state-tree';
import StringChecker from '../utils/string_checker';
import XMLRPCApi, { RSD_NOT_FOUND, BLOG_ID_NOT_FOUND } from '../api/XMLRPCApi';

export default Services = types.model('Services', {
  is_setting_up: types.optional(types.boolean, false),
  current_url: types.optional(types.string, ""),
  current_username: types.optional(types.string, ""),
  xml_endpoint: types.optional(types.string, ""),
  blog_id: types.optional(types.string, ""),
  show_credentials: types.optional(types.boolean, false)
})
.actions(self => ({
  
  hydrate_with_user: flow(function* (user = null) {
    console.log("Services:hydrate_with_user", user)
    self.current_username = user.username
    self.current_url = ""
    self.xml_endpoint = ""
    self.blog_id = ""
  }),
  
  clear: flow(function* () {
    console.log("Services:clear")
    self.current_url = ""
    self.xml_endpoint = ""
    self.blog_id = ""
    self.show_credentials = false
  }),
  
  set_url: flow(function* (text) {
    console.log("Services:set_url", text)
    self.current_url = text
  }),
  
  setup_new_service: flow(function* () {
    console.log("Services:setup_new_service", self.current_url)
    self.is_setting_up = true
    // For now, let's just figure out XMLRPC endpoint
    const rsd_link = yield XMLRPCApi.discover_rsd_endpoint(self.current_url)
    console.log("Services:setup_new_service:rsd_link", rsd_link)
    if(rsd_link !== RSD_NOT_FOUND){
      // OK, so we found the RSD link, now we need to get the preferred blog ID
      self.xml_endpoint = rsd_link.replace("?rsd", "")
      const blog_id = yield XMLRPCApi.discover_preferred_blog(rsd_link)
      console.log("Services:setup_new_service:blog_id", blog_id)
      if(blog_id !== BLOG_ID_NOT_FOUND){
        // We found a blog id, nice!
        self.blog_id = blog_id
        self.show_credentials = true
      }
      else{
        // TODO: show an error
      }
    }
    else{
      // TODO: show an error
    }
    self.is_setting_up = false
    console.log("Service:self", self)
  }),
  
}))
.views((self) => ({
  
  can_set_up(){
    // We want to check if the URL is a URL
    return StringChecker._validate_url(self.current_url)
  },
  
  should_show_set_up(){
    // TODO: Check if the user has existing credentials, if not, show the set up button
    return true
  },
  
  can_set_up_credentials(){
    // Let's check that we have a Blog ID and endpoint
    return self.xml_endpoint != "" && self.blog_id != ""
  },
  
}))
.create({})