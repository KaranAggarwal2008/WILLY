import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  ToastAndroid,
  Alert,
} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as firebase from 'firebase';
import db from '../config.js';

export default class TransactionScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      hasCameraPermissions: null,
      scanned: false,
      scannedBookId: '',
      scannedStudentId: '',
      buttonState: 'normal',
      transactionMessage: '',
    };
  }

  getCameraPermissions = async (id) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);

    this.setState({
      /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
      hasCameraPermissions: status === 'granted',
      buttonState: id,
      scanned: false,
    });
  };

  handleBarCodeScanned = async ({ type, data }) => {
    const { buttonState } = this.state;

    if (buttonState === 'BookId') {
      this.setState({
        scanned: true,
        scannedBookId: data,
        buttonState: 'normal',
      });
    } else if (buttonState === 'StudentId') {
      this.setState({
        scanned: true,
        scannedStudentId: data,
        buttonState: 'normal',
      });
    }
  };

  initiateBookIssue = async () => {
    //add a transaction
    db.collection('TRANSACTIONS').add({
      STUDENTID: this.state.scannedStudentId,
      BOOKID: this.state.scannedBookId,
      DATE: firebase.firestore.Timestamp.now().toDate(),
      TRANSACTIONTYPE: 'Issue',
    });
    //change book status
    db.collection('BOOKS').doc(this.state.scannedBookId).update({
      BOOKAVAILABILITY: false,
    });
    //change number  of issued books for student
    db.collection('STUDENTS')
      .doc(this.state.scannedStudentId)
      .update({
        NUMBEROFBOOKSISSUED: firebase.firestore.FieldValue.increment(1),
      });

    this.setState({
      scannedStudentId: '',
      scannedBookId: '',
    });
  };

  initiateBookReturn = async () => {
    //add a transaction
    db.collection('TRANSACTIONS').add({
      STUDENTID: this.state.scannedStudentId,
      BOOKID: this.state.scannedBookId,
      DATE: firebase.firestore.Timestamp.now().toDate(),
      TRANSACTIONTYPE: 'Return',
    });
    //change book status
    db.collection('BOOKS').doc(this.state.scannedBookId).update({
      BOOKAVAILABILITY: true,
    });
    //change number  of issued books for student
    db.collection('STUDENTS')
      .doc(this.state.scannedStudentId)
      .update({
        NUMBEROFBOOKSISSUED: firebase.firestore.FieldValue.increment(-1),
      });

    this.setState({
      scannedStudentId: '',
      scannedBookId: '',
    });
  };
  /*
checkBookEligibility() function which
will be an async function
Here, we will query in our books
collections if any document in the
collection contains the book id which
the user has just entered.

We can do this usin
.where("bookId","==",this.state.scann
edBookId) in our book reference:
const bookRef = await
db.collection("books").where("bookId",
"==",this.state.scannedBookId).get()

The query will return a list of
documents (in an array) which will
contain in its book id field, the same
book id as the scanned book id.
If the query returns an empty array, it
means that the book doesn't exist. We
can return false if the book doesn't
exist.

*/
  checkBookEligibility = async () => {
    const bookRef = await db
      .collection('BOOKS')
      .where('BOOKID', '==', this.state.scannedBookId)
      .get();
    var transactionType = '';
    if (bookRef.docs.length == 0) {
      transactionType = false;
    } else {
      /*
We can map over the array element
(ideally, there would be only one
element since each book id is unique)
and check its book availability. If the
book is available we can return the
transaction type to 'issue'. If the book
is not available, we can return the
book transaction type to 'return'

*/
      bookRef.docs.map((doc) => {
        var book = doc.data();
        if (book.BOOKAVAILABILITY) {
          transactionType = 'Issue';
        } else {
          transactionType = 'Return';
        }
      });
    }

    return transactionType;
  };
  // function definition to send queries to database to obtain results based on different scenarios
  /*
this function returns false
if the book is not in the database. Else
if the book is there in the database, it
checks the book's availability. After
checking the book's eligibility, it
returns the transaction type the book
is eligible for - Issue or Return

*/
  /*
If transaction type is false,
let's issue an alert and empty the
Textinputs

If the transaction type is "issue", let's
check if the student is eligible for the
book issue.
To be eligible for book issue, the
student should exist in the database
and the number of books issued by
them should be less than 2.

It returns true if the student
is eligible and false if the student is
not eligible.
If the student is eligible, let's call our
function initiateBookIssue() and issue
an alert that the book has been
issued.

Simply, put:
- We need to check if the
student id exists in the
database
- If it exists, we need to
check if the student has
issued more than 2 books
 - if not,we return true
Else, we return false
*/
  checkStudentEligibilityForBookIssue = async () => {
    const studentRef = await db
      .collection('STUDENTS')
      .where('STUDENTID', '==', this.state.scannedStudentId)
      .get();
    var isStudentEligible = '';
    if (studentRef.docs.length == 0) {
      this.setState({
        scannedStudentId: '',
        scannedBookId: '',
      });
      isStudentEligible = false;
      // issue alerts in the app for any transaction type.
      Alert.alert("The student id doesn't exist in the database!");
    } else {
      studentRef.docs.map((doc) => {
        var student = doc.data();
        if (student.NUMBEROFBOOKSISSUED < 2) {
          isStudentEligible = true;
        } else {
          isStudentEligible = false;
          // issue alerts in the app for any transaction type.
          Alert.alert('The student has already issued 2 books!');
          this.setState({
            scannedStudentId: '',
            scannedBookId: '',
          });
        }
      });
    }

    return isStudentEligible;
  };

  /*
If the transaction type is
return, we can call a
function
checkStudentEligibilityForB
ookReturn() which checks if
the student is eligible for
Book Returns.
We can check the last
transaction for the book and
see if the book was issued
by that student in the last
transaction.

the
checkStudentEligibilityForReturn() is
an abstract function which returns
true if the student is eligible for return
and false if the student is not eligible.

If the student is eligible, let's call a
function which returns the book.
Also, we can clear the TextInput
boxes as we return the book.

We need to query the last
transaction for the book
We need to check if the last
book transaction was
performed by the same
student
*/

  checkStudentEligibilityForReturn = async () => {
    const transactionRef = await db
      .collection('TRANSACTIONS')
      .where('BOOKID', '==', this.state.scannedBookId)
      .limit(1)
      .get();
    var isStudentEligible = '';
    transactionRef.docs.map((doc) => {
      var lastBookTransaction = doc.data();
      if (lastBookTransaction.STUDENTID === this.state.scannedStudentId) {
        isStudentEligible = true;
      } else {
        isStudentEligible = false;
        // issue alerts in the app for any transaction type.
        Alert.alert("The book wasn't issued by this student!");
        this.setState({
          scannedStudentId: '',
          scannedBookId: '',
        });
      }
    });
    return isStudentEligible;
  };

  handleTransaction = async () => {
    //verify if the student is eligible for book issue or return or none
    //student id exists in the database
    //issue : number of book issued < 2
    //issue: verify book availability
    //return: last transaction -> book issued by the student id
    var transactionType = await this.checkBookEligibility();
    var transactionMessage;
    if (!transactionType) {
      // issue alerts in the app for any transaction type.
      Alert.alert("The book doesn't exist in the library database!");
      this.setState({
        scannedStudentId: '',
        scannedBookId: '',
      });
    } else if (transactionType === 'Issue') {
      var isStudentEligible = await this.checkStudentEligibilityForBookIssue();
      if (isStudentEligible) {
        this.initiateBookIssue();
        transactionMessage = 'Book Issued';

        /*
            1. we want to display a message to the user when a transaction (issue or return) is 
            completed. We have been using Alerts for this !!!
            2. Import Toast from react-native and replaces the Alert with Toast
            3. Using Toast you can set a duration for a message to be shown and then it disappear
            4. It is the best approach to want to empty the textinput when the transaction 
            is completed so that we are ready for another book transaction.
          ------ToastAndroid.show(transactionMessage, ToastAndroid.SHORT);
          */
        // issue alerts in the app for any transaction type.
        //Alert.alert("Book issued to the student!");
        ToastAndroid.show(transactionMessage, ToastAndroid.SHORT);
      }
    } else if(transactionType === 'Return'){
      var isStudentEligible = await this.checkStudentEligibilityForReturn();
      if (isStudentEligible) {
        this.initiateBookReturn();
        transactionMessage = 'Book Returned';

        /*
            1. we want to display a message to the user when a transaction (issue or return) is 
            completed. We have been using Alerts for this !!!
            2. Import Toast from react-native and replaces the Alert with Toast
            3. Using Toast you can set a duration for a message to be shown and then it disappear
            4. It is the best approach to want to empty the textinput when the transaction 
            is completed so that we are ready for another book transaction.
          ------ToastAndroid.show(transactionMessage, ToastAndroid.SHORT);
          */
        // issue alerts in the app for any transaction type.
        //Alert.alert("Book issued to the student!");
        ToastAndroid.show(transactionMessage, ToastAndroid.SHORT);
      }
    }
  };

  render() {
    const hasCameraPermissions = this.state.hasCameraPermissions;
    const scanned = this.state.scanned;
    const buttonState = this.state.buttonState;

    if (buttonState !== 'normal' && hasCameraPermissions) {
      return (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      );
    } else if (buttonState === 'normal') {
      return (
        <KeyboardAvoidingView behavior="padding" style={styles.container}>
          <View>
            <Image
              source={require('../assets/booklogo.jpg')}
              style={{ width: 200, height: 200 }}
            />
            <Text style={{ textAlign: 'center', fontSize: 30 }}>WIRELESS LIBRARY</Text>
          </View>
          <View style={styles.inputView}>
            <TextInput
              style={styles.inputBox}
              placeholder="Book Id"
              onChangeText={(text) => {
                this.setState({
                  scannedBookId: text,
                });
              }}
              value={this.state.scannedBookId}
            />
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => {
                this.getCameraPermissions('BookId');
              }}>
              <Text style={styles.buttonText}>SCAN</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputView}>
            <TextInput
              style={styles.inputBox}
              placeholder="Student Id"
              onChangeText={(text) => {
                this.setState({
                  scannedStudentId: text,
                });
              }}
              value={this.state.scannedStudentId}
            />
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => {
                this.getCameraPermissions('StudentId');
              }}>
              <Text style={styles.buttonText}>SCAN</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.transactionAlert}>
            {this.state.transactionMessage}
          </Text>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={async () => {
              var transactionMessage = this.handleTransaction();
            }}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      );
    }
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 20,
      textDecorationLine: 'underline',
      textAlign: 'center'
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 7
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 5,
      fontSize: 20
    },
    submitButton:{
      backgroundColor: '#FBC02D',
      width: 100,
      height: 50
    },
    submitButtonText:{
      padding: 10,
      textAlign: 'center',
      fontSize: 20,
      fontWeight: 'bold'
    },
        transactionAlert:{
      margin:10,
      color: 'red'
    }
  });