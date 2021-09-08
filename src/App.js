import React, { useState, useRef } from 'react';

import './App.css';

// imports for firebase v9
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  //config here

})

const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {
  
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>BorkChat</h1>
      <SignOut />
      </header>

      <section>
        {/* if user logged in show chat else show signin */}
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const SignInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <button onClick={SignInWithGoogle}>Sign in with google</button>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(100);
  const [messages] = useCollectionData(query, {idField: 'id'});
  const [ formValue, setFormValue] = useState('');

  const autoScroll = useRef();

  const sendMessage = async(e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;

    // add new doc to DB
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL

    })

    setFormValue('');

    autoScroll.current.scrollIntoView({ behavior: 'smooth'});

  }

  

  return (
    <>
    <main>
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <div ref={autoScroll}></div>
    </main>
    <form onSubmit={sendMessage}>
      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />

      <button type="submit">Submit</button>
    </form>

    </>
  )


}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>

  )
}

export default App;
