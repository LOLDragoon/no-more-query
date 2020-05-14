import React, { Component } from 'react';

import { clone, merge } from './util.js';


class userControlPanel extends Component {
  constructor(props){
    super(props);

    this.state ={
      isLoggedIn: false,
      isSigningUp: false,
      username: '',
      userID: 0,
    }
    this.logIn = this.logIn.bind(this)
    this.signUp = this.signUp.bind(this)
  }


  logIn = (event) => {
    const logInfo = {
      username: event.target.form[0].value,
      password: event.target.form[1].value
    }
    console.log(logInfo)
    // we will post req from here
    fetch('/authenticate/login', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(logInfo),
    })
      .then((response) => response.json())
      .then((result) => {
             console.log(result) // expecting an object with a result: boolean and an userID:
             if(result.result === true){
              this.setState({isLoggedIn: true})
              this.setState({username:logInfo.username,
                             userID: result.userID})
              this.props.loadUserInstances(result.userID)
              console.log(this.state)
              //need to call server to load user-specific data
             }
            })
      .catch((err) => { 
        //this is error handling for when our server does something unexpected. Otherwise it should be handled by the above .then
          console.log("this is from the catch", err)
          alert(err)
      });

   
  }

  // only used to conditionally render the signup div in the user controller
  signUp = () =>{
    this.setState({isSigningUp:true})
  }

  // this is done upon trying to register a username and password
  register = (event) => {
    const logInfo = {
      username: event.target.form[0].value,
      password: event.target.form[1].value
    }
    console.log(logInfo)
    fetch('/authenticate/signup', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(logInfo),
    })
    .then(response =>response.json())
    .then(json=>{
      console.log("OUR NEW USER!", json)
    this.setState({isLoggedIn: true,
                  isSigningUp: false,
                  username: json.username,
                  userID: json.userID})
                  this.props.loadUserInstances(json.userID)
    })
    .catch((err) => console.log(err));
  }


  //sign out, clears cookie and sets us back to the default window
  signOut = () => {
    this.setState({isLoggedIn:false})
    fetch('/authenticate/logout')
    .then(response => {
      console.log(response);
    });
  }
  
  // our jwt checking logic to remember an already logged in person.
  componentDidMount(){
    fetch('/authenticate/verify')
    .then(response => response.json())
    .then(json=> {
      if (json.result === true){
        this.setState({isLoggedIn: true,
                        username: json.username,
                        userID:json.userID}
                      )
        this.props.loadUserInstances(json.userID)
      }
    })
    .catch((err) => { 
      //this is error handling for when our server does something unexpected. Otherwise it should be handled by the above .then
        console.log("this is from the catch", err)
        alert(err)
    });
  }

  render(){

    return(
      <div className = "toolbar userPanel">
      {/* anonymous callback function to allow inline conditional rendering. This could be handled outside the return. */}
      { (() => { 
        if(!this.state.isLoggedIn && this.state.isSigningUp){
      return(
        <div className = "signUp">
           <form>
            <label htmlFor= "newUsername">Username: </label>
            <input type ="text" id ="newUsername" name= "newUsername" placeholder="username"/>
            <label htmlFor= "newPassword">Password: </label>
            <input type ="password" placeholder = "password" id ="newPassword" name= "newPassword"/>
            <button type ="button" onClick = {this.register}>Sign up</button>
          </form>
        </div>
      )
       }
       else if(!this.state.isLoggedIn) {
         return(
          <div className = "signIn">
          Login to use to save/load
          <br></br>
          <form>
            <label htmlFor= "username">Username: </label>
            <input type ="text" id ="username" name= "username" placeholder="username"/>
            <label htmlFor= "password" >Password: </label>
            <input type ="password" placeholder = "password" id ="password" name= "password"/>
            <button  type="button" onClick ={this.logIn}>Log In</button>
            </form>
          
           <span onClick ={this.signUp}>Not a user? Sign up</span>
          </div>
       )
       
      }
      else if(this.state.isLoggedIn){
        return(
        <div className = "loggedIn">
          Welcome {this.state.username}
          <br></br>
          <div className = "save">
          <input ref={this.props.refInputInstance} className="instance-name" type="text" placeholder="instance name"/>
          <button onClick={() => this.props.saveInstance(this.state.userID)}>Save</button>
          </div>
          <br></br>
          <div className ="load"> 
          Load:
          {this.props.instanceButtons()}
          </div>
          <br></br>
          <button type="button" onClick = {this.signOut} >Log Out</button>
        </div>
        
        )}
      })()
    }
      </div>
    )
  }
}

export default userControlPanel
