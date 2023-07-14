import * as React from 'react';
import { observer } from 'mobx-react';
import { View, TextInput, Keyboard, ActivityIndicator, InputAccessoryView, Platform, KeyboardAvoidingView } from 'react-native';
import { Navigation } from 'react-native-navigation';
import Auth from '../../stores/Auth';
import App from '../../stores/App';
import PostToolbar from '../../components/keyboard/post_toolbar';
import AssetToolbar from '../../components/keyboard/asset_toolbar';
import UsernameToolbar from '../../components/keyboard/username_toolbar';
import HighlightingText from '../../components/text/highlighting_text';

@observer
export default class PostingScreen extends React.Component{
  
  constructor(props) {
		super(props)
		Navigation.events().bindComponent(this);
    this.input_accessory_view_id = "input_toolbar";
  }
  
  componentDidMount() {
    if (Auth.selected_user.posting.selected_service != null) {
      Auth.selected_user.posting.selected_service.check_for_categories()
      Auth.selected_user.posting.reset_post_syndicates()
    }
  }
  
  componentDidAppear(){
    Navigation.mergeOptions(this.props.componentId, {modal: {swipeToDismiss: true}});
  }
  
  componentDidDisappear(){
    Navigation.mergeOptions(this.props.componentId, {modal: {swipeToDismiss: false}});
  }
  
  navigationButtonPressed = async ({ buttonId }) => {
    console.log("navigationButtonPressed::", buttonId)
    if(buttonId === "post_button"){
      const sent = await Auth.selected_user.posting.send_post()
      if(sent){
        this._dismiss()
      }
    }
    else{
      this._dismiss()
    }
  }
  
  _dismiss = () => {
    Keyboard.dismiss()
		Navigation.dismissModal(this.props.componentId)
  }
  
  _input_outer_view = (component) => {
    if (Platform.OS === 'ios') {
      return (
        <KeyboardAvoidingView behavior={'padding'} style={{ flex: 1 }}>
        {component}
        </KeyboardAvoidingView>
      )
    }
    return component
  }
  
  render() {
    const { posting } = Auth.selected_user
    return(
      <View style={{ flex: 1, backgroundColor: App.theme_background_color() }}>
        {
          posting.should_show_title() ?
          <TextInput
            placeholder="Title"
            placeholderTextColor={App.theme_placeholder_text_color()}
            style={{
              fontSize: 18,
              justifyContent: 'flex-start',
						  alignItems: 'flex-start',
              padding: 8,
              marginBottom: 4,
              fontWeight: '700',
              borderColor: App.theme_border_color(),
              borderBottomWidth: .5,
              color: App.theme_text_color()
            }}
            editable={!posting.is_sending_post}
            multiline={false}
            scrollEnabled={false}
            returnKeyType={'default'}
					  keyboardType={'default'}
					  autoFocus={false}
					  autoCorrect={true}
					  clearButtonMode={'while-editing'}
					  enablesReturnKeyAutomatically={true}
					  underlineColorAndroid={'transparent'}
            value={posting.post_title}
            onChangeText={(text) => !posting.is_sending_post ? posting.set_post_title(text) : null}
            inputAccessoryViewID={this.input_accessory_view_id}
          />
          : null
        }
        {
          this._input_outer_view(
            Platform.OS === 'ios' ?
            <HighlightingText
              placeholderTextColor="lightgrey"
              style={{
                height: 300,
                fontSize: 18,
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                marginTop: 3,
                ...Platform.select({
                  android: {
                    marginBottom: posting.post_text_length() > posting.max_post_length() || posting.post_title ? posting.post_assets.length > 0 ? 135 : 80 : posting.post_assets.length > 0 ? 93 : 38,
                  },
                  ios: {
                    paddingBottom: posting.post_text_length() > posting.max_post_length() ? 150 : 0,
                    flex: 1
                  }
                }),
                padding: 8,
                color: App.theme_text_color()
              }}
              editable={!posting.is_sending_post}
              multiline={true}
              scrollEnabled={true}
              returnKeyType={'default'}
              keyboardType={'default'}
              autoFocus={true}
              autoCorrect={true}
              clearButtonMode={'while-editing'}
              enablesReturnKeyAutomatically={true}
              underlineColorAndroid={'transparent'}
              value={posting.post_text}
              onChangeText={({ nativeEvent: { text } }) => {
                !posting.is_sending_post ? posting.set_post_text_from_typing(text) : null
              }}
              onSelectionChange={({ nativeEvent: { selection } }) => {
                posting.set_text_selection(selection)
              }}
              inputAccessoryViewID={this.input_accessory_view_id}
            />
            :
            <TextInput
              placeholderTextColor="lightgrey"
              style={{
                fontSize: 18,
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                marginTop: 3,
                marginBottom: posting.post_text_length() > posting.max_post_length() || posting.post_title ? posting.post_assets.length > 0 ? 135 : 80 : posting.post_assets.length > 0 ? 93 : 38,
                padding: 8,
                color: App.theme_text_color()
              }}
              editable={!posting.is_sending_post}
              multiline={true}
              scrollEnabled={true}
              returnKeyType={'default'}
              keyboardType={'default'}
              autoFocus={true}
              autoCorrect={true}
              clearButtonMode={'while-editing'}
              enablesReturnKeyAutomatically={true}
              underlineColorAndroid={'transparent'}
              value={posting.post_text}
              onChangeText={(text) => !posting.is_sending_post ? posting.set_post_text_from_typing(text) : null}
              onSelectionChange={({ nativeEvent: { selection } }) => {
                posting.set_text_selection(selection)
              }}
              inputAccessoryViewID={this.input_accessory_view_id}
            />
          )
        }
        {
          Platform.OS === 'ios' ?
            <InputAccessoryView nativeID={this.input_accessory_view_id}>
              <UsernameToolbar componentId={this.props.componentId} object={posting} />
              <AssetToolbar componentId={this.props.componentId} />
              <PostToolbar componentId={this.props.componentId} />
            </InputAccessoryView>
          :  
          <>
            <UsernameToolbar componentId={this.props.componentId} object={posting} />
            <AssetToolbar componentId={this.props.componentId} />
            <PostToolbar componentId={this.props.componentId} />
          </>
        }
        {          
          posting.is_sending_post ?
          <View 
            style={{ 
              position: 'absolute',
              top: 0,
              height: 200,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10
            }} 
          >
            <ActivityIndicator color="#f80" size={'large'} />
          </View>
          : null
        }
      </View>
    )
  }
  
}