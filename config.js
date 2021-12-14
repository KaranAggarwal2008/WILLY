import * as firebase from 'firebase';
require("@firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyD-VdCI23xnFzfy776cUzJBn2HLpVWeYEU",
  authDomain: "wireless-library-c68-c75.firebaseapp.com",
  databaseURL: "https://wireless-library-c68-c75-default-rtdb.firebaseio.com",
  projectId: "wireless-library-c68-c75",
  storageBucket: "wireless-library-c68-c75.appspot.com",
  messagingSenderId: "683954407569",
  appId: "1:683954407569:web:29c2f9695ded4f170ad730"
};



   firebase.initializeApp(firebaseConfig);


export default firebase.firestore();