/* 
creating a new screen for the login page.

We can simply create a new file inside our screens folder called LoginScreen.js.
 
We will have to create TextInput buttons to collect email and password from the user.

We will also have to create a button to navigate inside the application.
 
When the user enters the email id and password, there should be something to check if the email id and password are registered.
  
Firebase provides an authentication service which helps us do that.
---enable email ‘sign in’ inside the authentication tab in the database for the Wireless library.
 
---We need to change our database rules to allow only authenticated users to access,
read and modify our database. There is a separate way for writing complex database rules which we will learn later. 
For now we can just make a small change to allow everyone who is authenticated to read and write values in our database.

*/

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import * as firebase from 'firebase';
export default class LoginScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      emailId: '',
      password: '',
    };
  }

  /* 
FUNCTION DEFINITION: 
when the user presses the button, we will call a login function, which will check if username and password are 
registered or not.

Firebase provides us an auth service to do that using firebase.auth().signInWthEmailAndPassword()

Our login function is going to be an async function because it is going to take some time to authenticate.

USE firebase.auth().signInWithEmailAndPassword() to authenticate registered user and navigate to the next screen if authentication is successful.

Sometimes, our authentication might throw an unusual error because of different reasons
- like loss of data packets due to bad internet. 

This might cause our app to behave in unusual ways. We can prevent this from happening by writing our code in try - catch block.

When executed, our code inside the try block will try to run. If there is any error, the catch block will catch
the error and it can be displayed to the developer or the user 

*/
  login = async (emailInput, passwordInput) => {
    if (emailInput && passwordInput) {
      try {
        const response = await firebase
          .auth()
          .signInWithEmailAndPassword(emailInput, passwordInput);
        if (response) {
          this.props.navigation.navigate('Transaction');
        }
      } catch (error) {
        switch (error.code) {
          case 'auth/user-not-found':
            Alert.alert('The user does not exist');
            console.log("user doesn't exist");
            break;
          case 'auth/invalid-email':
            Alert.alert('The entered email ID or password is incorrect');
            console.log('invaild user information');
            break;
        }
      }
    } else {
      Alert.alert('Enter email ID and password');
    }
  };

  render() {
    return (
      <KeyboardAvoidingView
        style={{
          alignItems: 'center',
          marginTop: 20,
        }}>
        <View>
          <Image
            source={require('../assets/booklogo.jpg')}
            style={{ width: 200, height: 200 }}
          />
          <Text style={{ textAlign: 'center', fontSize: 30 }}>
            Wireless Library
          </Text>
        </View>
        <View>
          <TextInput
            /* The props keyBoardType and secureTextEntry for the TextInput Component is to collect emailID and password from the user */
            style={styles.loginBox}
            placeholder="abc@example.com"
            keyboardType="email-address"
            onChangeText={(text) => {
              this.setState({ emailId: text });
            }}
          />
          <TextInput
            style={styles.loginBox}
            secureTextEntry={true}
            placeholder="Enter Password"
            onChangeText={(text) => {
              this.setState({ password: text });
            }}
          />
        </View>
        <View>
          <TouchableOpacity
            style={{
              height: 30,
              width: 90,
              borderWidth: 1,
              marginTop: 20,
              paddingTop: 5,
              borderRadius: 7,
            }}
            //function call to login and check if the user is valid
            onPress={() => {
              this.login(this.state.emailId, this.state.password);
            }}>
            <Text style={{ textAlign: 'center' }}>Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  loginBox: {
    width: 300,
    height: 40,
    borderWidth: 1.5,
    fontSize: 20,
    margin: 10,
    paddingLeft: 10,
  },
});
