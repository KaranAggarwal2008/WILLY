/*

Class 75- Wireless library authentication


Goals:
● Create an authentication page for the user to authenticate. 
● Use firebase authentication service to authenticate a user. 
● Modify security rules in firebase database to allow only authenticated users to access database




*/

import * as React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import TransactionScreen from './screens/BookTransactionScreen';
import SearchScreen from './screens/SearchScreen';
import LoginScreen from './screens/LoginScreen';

export default class App extends React.Component {
  render() {
    return <AppContainer style={styles.container} />;
  }
}

const TabNavigator = createBottomTabNavigator(
  {
    Transaction: { screen: TransactionScreen },
    Search: { screen: SearchScreen },
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: () => {
        const routeName = navigation.state.routeName;
        console.log(routeName);
        if (routeName === 'Transaction') {
          return (
            <Image
              source={require('./assets/book.png')}
              style={{ width: 40, height: 40 }}
            />
          );
        } else if (routeName === 'Search') {
          return (
            <Image
              source={require('./assets/searchingbook.png')}
              style={{ width: 40, height: 40 }}
            />
          );
        }
      },
    }),
  }
);

/* 
We are using TabNavigation in our app.
However, we do not want the login screen as a tab in our application. 
This should be the first screen which users see by entering emailID,
 password and hitting the login button.


We are going to create a SwitchNavigator which will contain both
- the login page and the TabNavigator - we had created earlier. 

*/

const switchNavigator = createSwitchNavigator({
  LoginScreen: { screen: LoginScreen },
  TabNavigator: { screen: TabNavigator },
});

const AppContainer = createAppContainer(switchNavigator);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
