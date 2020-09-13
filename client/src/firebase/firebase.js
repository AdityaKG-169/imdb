import firebase from "firebase/app";
import "firebase/auth";

const config = {
	apiKey: "AIzaSyBhK2OeWvA1tmKqhDN7tuUwY1QHUJjMuUU",
	authDomain: "imdb-9535a.firebaseapp.com",
	databaseURL: "https://imdb-9535a.firebaseio.com",
	projectId: "imdb-9535a",
	storageBucket: "imdb-9535a.appspot.com",
	messagingSenderId: "1017886562194",
	appId: "1:1017886562194:web:ca5ced9955b1e8a270d34b",
	measurementId: "G-4N5NLPW159",
};

firebase.initializeApp(config);

export const auth = firebase.auth();

const provider = new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export const signInWithGoogle = () => auth.signInWithPopup(provider);

export default firebase;
