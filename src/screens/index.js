import { Navigation } from "react-native-navigation";
import { RNNBottomSheet } from 'react-native-navigation-bottom-sheet';
import * as React from 'react';

// SCREENS
import TimelineScreen from './timeline/timeline';
import MentionsScreen from './mentions/mentions';
import DiscoverScreen from './discover/discover';
import LoginScreen from './login/login';
import ProfileScreen from './profile/profile';
import ConversationScreen from "./conversation/conversation";
import BookmarksScreen from "./bookmarks/bookmarks";
import FollowingScreen from "./following/following";
import PostingScreen from "./posting/posting";

export const TIMELINE_SCREEN = 'microblog.TimelineScreen';
export const MENTIONS_SCREEN = 'microblog.MentionsScreen';
export const DISCOVER_SCREEN = 'microblog.DiscoverScreen';
export const LOGIN_SCREEN = 'microblog.LoginScreen';
export const PROFILE_SCREEN = 'microblog.ProfileScreen';
export const CONVERSATION_SCREEN = 'microblog.ConversationScreen';
export const BOOKMARKS_SCREEN = 'microblog.BookmarksScreen';
export const FOLLOWING_SCREEN = 'microblog.FollowingScreen';
export const POSTING_SCREEN = 'microblog.PostingScreen';

// COMPONENTS
import ProfileImage from './../components/header/profile_image';
import SheetMenu from './../components/sheets/menu';
import NewPostButton from './../components/header/new_post';

export const PROFILE_IMAGE = 'microblog.component.ProfileImage'
export const NEW_POST_BUTTON = 'microblog.component.NewPostButton'

// ICONS
import TimelineIcon from './../assets/icons/tab_bar/timeline.png';
import MentionsIcon from './../assets/icons/tab_bar/mentions.png';
import DiscoverIcon from './../assets/icons/tab_bar/discover.png';

// Set up screens
export const Screens = new Map();
Screens.set(TIMELINE_SCREEN, TimelineScreen);
Screens.set(MENTIONS_SCREEN, MentionsScreen);
Screens.set(DISCOVER_SCREEN, DiscoverScreen);
Screens.set(LOGIN_SCREEN, LoginScreen);
Screens.set(PROFILE_SCREEN, ProfileScreen);
Screens.set(CONVERSATION_SCREEN, ConversationScreen);
Screens.set(BOOKMARKS_SCREEN, BookmarksScreen);
Screens.set(FOLLOWING_SCREEN, FollowingScreen);
Screens.set(POSTING_SCREEN, PostingScreen);

// SET UP COMPONENTS
Screens.set(PROFILE_IMAGE, ProfileImage)
Screens.set(NEW_POST_BUTTON, NewPostButton)

// INIT BOTTOMSHEET
RNNBottomSheet.init()

export const startApp = () => {
  const tabs = [
    {
      stack: {
        children: [{
          component: {
            id: 'TIMELINE_SCREEN',
            name: TIMELINE_SCREEN,
            options: {
              topBar: {
                title: {
                  text: 'Timeline',
                },
                rightButtons: [
                  {
                    id: 'post_button',
                    text: 'New',
                    component: {
                      name: NEW_POST_BUTTON
                    }
                  },
                  {
                    id: 'profile_button',
                    text: 'profile',
                    component: {
                      name: PROFILE_IMAGE
                    }
                  }
                ],
              }
            }
          },
        }],
        options: {
          bottomTab: {
            text: 'Timeline',
            icon: TimelineIcon
          },
        },
      },
    },
    {
      stack: {
        children: [{
          component: {
            id: 'MENTIONS_SCREEN',
            name: MENTIONS_SCREEN,
            options: {
              topBar: {
                title: {
                  text: 'Mentions',
                },
                rightButtons: [
                  {
                    id: 'post_button',
                    text: 'New',
                    component: {
                      name: NEW_POST_BUTTON
                    }
                  },
                  {
                    id: 'profile_button',
                    text: 'profile',
                    component: {
                      name: PROFILE_IMAGE
                    }
                  },
                ],
              }
            }
          },
        }],
        options: {
          bottomTab: {
            text: 'Mentions',
            icon: MentionsIcon
          },
        },
      },
    },
    {
      stack: {
        children: [{
          component: {
            id: 'DISCOVER_SCREEN',
            name: DISCOVER_SCREEN,
            options: {
              topBar: {
                title: {
                  text: 'Discover',
                },
                rightButtons: [
                  {
                    id: 'post_button',
                    text: 'New',
                    component: {
                      name: NEW_POST_BUTTON
                    }
                  },
                  {
                    id: 'profile_button',
                    text: 'profile',
                    component: {
                      name: PROFILE_IMAGE
                    }
                  },
                ],
              }
            }
          },
        }],
        options: {
          bottomTab: {
            text: 'Discover',
            icon: DiscoverIcon
          },
        },
      },
    }
  ]

  Navigation.setDefaultOptions({
    animations: {
      setRoot: {
        waitForRender: true,
      },
      setStackRoot: {
        waitForRender: true,
      },
    },
    bottomTab: {
      selectedIconColor: "#f80",
      selectedTextColor: "#f80"
    }
  });

  return Navigation.setRoot({
    root: {
      bottomTabs: {
        id: 'ROOT',
        children: tabs,
      }
    },
  });

}

export const loginScreen = (can_dismiss = false) => {
  return Navigation.showModal({
    stack: {
      id: 'LOGIN_SCREEN',
      children: [ {
        component: {
          name: LOGIN_SCREEN,
          passProps: {
            can_dismiss: can_dismiss
          },
          options: {
            topBar: {
              title: {
                text: 'Sign in',
              },
            },
            layout: {
              backgroundColor: "#fff"
            }
          }
        },
      }],
    }
  });
}

export const menuBottomSheet = (close = false) => {
  if(!close){
    return RNNBottomSheet.openBottomSheet({
      renderContent: () => <SheetMenu />,
      snapPoints: [0, '20%', '40%', '70%'],
      initialSnapIndex: 2,
      borderRadius: 16,
    })
  }
  RNNBottomSheet.closeBottomSheet()
}

export const profileScreen = (username, component_id) => {
  console.log("Screens:profileScreen", username, component_id);
  const options = {
    component: {
			name: PROFILE_SCREEN,
			passProps: {
        username: username
			},
			options: {
				topBar: {
					title: {
            text: `@${username}`
          },
          rightButtons: [
            {
              id: 'post_button',
              text: 'New',
              component: {
                name: NEW_POST_BUTTON
              }
            },
            {
              id: 'profile_button',
              text: 'profile',
              component: {
                name: PROFILE_IMAGE
              }
            },
          ],
				}
			}
		}
	};

  return Navigation.push(component_id, options);
}

export const conversationScreen = (conversation_id, component_id) => {
  console.log("Screens:conversationScreen", conversation_id, component_id);
  const options = {
    component: {
      id: 'CONVERSATION_SCREEN',
			name: CONVERSATION_SCREEN,
			passProps: {
        conversation_id: conversation_id
			},
			options: {
				topBar: {
					title: {
            text: "Conversation"
          },
          rightButtons: [
            {
              id: 'post_button',
              text: 'New',
              component: {
                name: NEW_POST_BUTTON
              }
            },
            {
              id: 'profile_button',
              text: 'profile',
              component: {
                name: PROFILE_IMAGE
              }
            },
          ],
				}
			}
		}
	};

  return Navigation.push(component_id, options);
}

export const bookmarksScreen = (component_id) => {
  console.log("Screens:bookmarksScreen", component_id);
  const options = {
    component: {
      id: 'BOOKMARKS_SCREEN',
      name: BOOKMARKS_SCREEN,
      options: {
        topBar: {
          title: {
            text: "Bookmarks"
          },
          rightButtons: [
            {
              id: 'post_button',
              text: 'New',
              component: {
                name: NEW_POST_BUTTON
              }
            },
            {
              id: 'profile_button',
              text: 'profile',
              component: {
                name: PROFILE_IMAGE
              }
            },
          ],
        }
      }
    }
  };

  return Navigation.push(component_id, options);
}

export const followingScreen = (username, component_id) => {
  console.log("Screens:followingScreen", username, component_id);
  const options = {
    component: {
			name: FOLLOWING_SCREEN,
			passProps: {
        username: username
			},
			options: {
				topBar: {
					title: {
            text: `Following`
          },
          rightButtons: [
            {
              id: 'post_button',
              text: 'New',
              component: {
                name: NEW_POST_BUTTON
              }
            },
            {
              id: 'profile_button',
              text: 'profile',
              component: {
                name: PROFILE_IMAGE
              }
            },
          ],
				}
			}
		}
	};

  return Navigation.push(component_id, options);
}

export const postingScreen = () => {
  return Navigation.showModal({
    stack: {
      id: 'POSTING_SCREEN',
      children: [ {
        component: {
          name: POSTING_SCREEN,
          options: {
            topBar: {
              title: {
                text: 'New Post',
              },
              leftButtons: [
                {
                  id: 'back_button',
                  text: 'Back',
                },
              ],
              rightButtons: [
						    {
							    id: 'post_button',
							    text: 'Post'
						    }
					    ]
            },
            layout: {
              backgroundColor: "#fff"
            }
          }
        },
      }],
    }
  });
}