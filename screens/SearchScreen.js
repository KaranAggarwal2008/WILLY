/* 
FlatList has 3 key props: 
● data: This contains all the data in the array which needs to be rendered. 
● renderItem: This takes each item from the data array and renders it as described using JSX. This should return a JSX component. 
● keyExtractor: It gives a unique key prop to each item in the list. 
The unique key prop should be a string. FlatList has two more important props- onEndReached and onEndThreshold 
● onEndReached can call a function to get more transaction documents after the last transaction document we fetched.
 ● onEndThreshold defines when we want to call the function inside onEndReached prop. 
 If onEndThreshold is 1, the function will be called when the user has completely scrolled through the list. 
 If onEndThreshold is 0.5, the function will be called when the user is mid-way during scrolling the items.
  */
import React from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import db from '../config';

export default class Searchscreen extends React.Component {
  // display ALL the transaction documents from transaction collections in our search screen.
  //We will create a state array which will hold all the transactions.
  constructor(props) {
    super(props);
    this.state = {
      allTransactions: [],
      lastVisibleTransaction: null,
      searchedID: '',
    };
  }

  /* how lazy loading works:
   Everytime we scroll down, we see new items getting added to the list 

   */
  fetchMoreTransactions = async () => {
    var text = this.state.searchedID.toUpperCase();
    var enteredText = text.split('');

    if (enteredText[0].toUpperCase() === 'B') {
      const query = await db
        .collection('TRANSACTIONS')
        .where('BOOKID', '==', text)
        .startAfter(this.state.lastVisibleTransaction)
        .limit(10)
        .get();
      query.docs.map((doc) => {
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastVisibleTransaction: doc,
        });
      });
    } else if (enteredText[0].toUpperCase() === 'S') {
      const query = await db
        .collection('TRANSACTIONS')
        .where('STUDENTID', '==', text)
        .startAfter(this.state.lastVisibleTransaction)
        .limit(10)
        .get();
      query.docs.map((doc) => {
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastVisibleTransaction: doc,
        });
      });
    }
  };

  /* 
   When search button is pressed,it will call searchTransactions().
                                
   searchTransactions() which checks if the user has entered book id or student id and 
   then fetches the documents matching the book id or student id.
                                 
  searchTransactions will first check if the entered text is a book id or a student id (begins with B or S) 
  Depending on that, the function will query the transactions collection matching the book id or student id
   and add them to the state allTransactions array. 
  Limit the fetched transactions to 10. 
  */
  searchTransactions = async (text) => {
    console.log('firstTExt: ' + text);
    var enteredText = text.split('');
    console.log('enteredText: ' + enteredText);
    var capitalTerm = text.toUpperCase();
    console.log('capitalTerm: ' + capitalTerm);
    if (enteredText[0].toUpperCase() === 'B') {
      console.log('bookID is being searched ');
      const transaction = await db
        .collection('TRANSACTIONS')
        .where('BOOKID', '==', text)
        .get();
      console.log('searched transaction' + transaction);
      transaction.docs.map((doc) => {
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastVisibleTransaction: doc,
        });
      });
    } else if (enteredText[0].toUpperCase() === 'S') {
      const transaction = await db
        .collection('TRANSACTIONS')
        .where('STUDENTID', '==', text)
        .get();
      transaction.docs.map((doc) => {
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastVisibleTransaction: doc,
        });
      });
    }
  };
  /*
 When the screen mounts, we will query all the transactions and store them in the state array.
 Store the entire list of transactions inside this.state when the component mounts 
 
 We can get only the first 10 transactions in componentDidMount.
  This will be quicker than getting all the transactions from the collection. 
  Let's store the last transaction doc which we get inside another state called lastVisibleTransaction. 
  */
  componentDidMount = async () => {
    const query = await db.collection('TRANSACTIONS').limit(10).get();
    console.log('searched query' + query);
    query.docs.map((doc) => {
      this.setState({
        allTransactions: [],
        lastVisibleTransaction: doc,
      });
    });
  };

  /* In the render function for the component, we will map over the state array and display each item. */
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.bar}
            placeholder="Enter Book ID or Student ID"
            onChangeText={(text) => {
              this.setState({
                searchedID: text,
              });
            }}
            value={this.state.searchedID}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => {
              this.searchTransactions(this.state.searchedID);
            }}>
            <Text>Search</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={this.state.allTransactions}
          renderItem={({ item }) => (
            <View style={{ borderBottomWidth: 2 }}>
              <Text>{'Book ID: ' + item.BOOKID}</Text>
              <Text>{'Student ID: ' + item.STUDENTID}</Text>
              <Text>{'Transaction Type: ' + item.TRANSACTIONTYPE}</Text>
              <Text>{'Date: ' + item.DATE.toDate()}</Text>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          onEndReached={this.fetchMoreTransactions}
          onEndReachedThreshold={0.7}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  searchBar: {
    flexDirection: 'row',
    height: 40,
    width: 'auto',
    borderWidth: 0.5,
    alignItems: 'center',
    backgroundColor: 'grey',
  },
  bar: {
    borderWidth: 2,
    height: 30,
    width: 300,
    paddingLeft: 10,
  },
  searchButton: {
    borderWidth: 1,
    height: 30,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'green',
  },
});
