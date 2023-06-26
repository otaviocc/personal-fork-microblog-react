import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, TextInput, KeyboardAvoidingView, Alert } from 'react-native';
import Auth from '../../stores/Auth';
import App from '../../stores/App'
import { Navigation } from 'react-native-navigation';

@observer
export default class ImageOptionsScreen extends React.Component{
  
  _handle_image_remove = (image, index) => {
    const { posting } = Auth.selected_user
    const existing_index = posting.post_assets?.findIndex(file => file.uri === image.uri)
    if (existing_index > -1) {
      Alert.alert(
        "Remove image",
        "Are you sure you want to remove this image from this post?",
        [
          {
            text: "Cancel",
            style: 'cancel',
          },
          {
            text: "Remove",
            onPress: () => { Navigation.popToRoot(this.props.componentId) ; posting.remove_asset(index) },
            style: 'destructive'
          },
        ],
        {cancelable: false},
      );
    }
  }
  
  render() {
    const { posting } = Auth.selected_user
    const { image, index } = this.props
    return(
      <KeyboardAvoidingView behavior={"height"} style={{ flex: 1, height: "100%" }}>
        <ScrollView style={{ padding: 15 }} contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', width: "100%" }}>
          <View
            style={{
              position: 'relative',
              justifyContent: 'center',
              alignItems: 'center',
              width: 250,
              height: 250,
              backgroundColor: '#E5E7EB'
            }}
          >
            <Image source={{ uri: image.remote_url ? image.remote_url : image.uri }} style={{ width: 250, height: 250, borderRadius: 5 }} />
            {
              image.is_uploading ?
                <>
                  <ActivityIndicator color="#f80" size={"large"} style={{ position: 'absolute' }} />
                  <View
                    style={{
                      width: `${ image.progress }%`,
                      height: 5,
                      backgroundColor: App.theme_accent_color(),
                      position: 'absolute',
                      left: 0,
                      bottom: 0,
                      borderBottomLeftRadius: 5,
                      borderBottomRightRadius: image.progress === 100 ? 5 : 0,
                      zIndex: 2
                    }}
                  />
                </>
              : null
            }
          </View>
          <TextInput
            placeholder="Accessibility description"
            placeholderTextColor={App.theme_placeholder_alt_text_color()}
            style={{
              fontSize: 20,
              padding: 9,
              paddingTop: 9,
              fontWeight: '400',
              color: App.theme_text_color(),
              marginVertical: 25,
              borderRadius: 5,
              backgroundColor: App.theme_button_background_color(),
              width: "100%",
            }}
            editable={!posting.is_sending_post}
            multiline={true}
            scrollEnabled={true}
            returnKeyType={'default'}
            keyboardType={'default'}
            autoFocus={false}
            autoCorrect={true}
            clearButtonMode={'while-editing'}
            enablesReturnKeyAutomatically={true}
            underlineColorAndroid={'transparent'}
            value={image.alt_text}
            onChangeText={(text) => !posting.is_sending_post ? image.set_alt_text(text) : null}
          />
          <View
            style={{
              width: "100%",
            }}
          >
            <TouchableOpacity
              onPress={() => this._handle_image_remove(image, index)}
              key={image.uri}
              style={{
                justifyContent: 'center',
                alignItems: 'center'
              }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', width: "100%", justifyContent: 'center' }}>
                <Text style={{color: 'red'}}>{image.is_uploading ? "Cancel Upload & Remove Image" : "Remove Image"}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }
  
}