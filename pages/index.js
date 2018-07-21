import firebase from 'firebase'
import 'isomorphic-unfetch'
import clientCredentials from '../credentials/client'

class Index extends React.Component {

  static async getInitialProps ({req, query}) {
    const user = req && req.seesion ? req.session.decodedToken:null
    return { user }
  }

  constructor (props) {
    super(props)

    this.state = {
      user: this.props.user
    }
  }

  componentDidMount () {
    if(!firebase.apps.length){
      firebase.initializeApp(clientCredentials)
    }

    firebase.auth().onAuthStateChanged(user => {
      if(user){
        this.setState({ user: user })
        user.getIdToken()
          .then((token) => {
            fetch('/api/login',{
              method: 'POST',
              headers: new Headers({ 'Content-Type': 'application/json' }),
              credentials: 'same-origin',
              body: JSON.stringify({ token })
            })
          })
      }else{
        this.setState({ user: null })
        fetch('/api/logout',{
          method: 'POST',
          credentials: 'same-origin'
        })
      }
    })
  }

  login() {
    firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())
  }

  logout() {
    firebase.auth().signOut()
  }

  render() {
    const { user } = this.state
    return (
      <div>
        {
          user
            ? <button onClick={this.logout}>Logout</button>
            : <button onClick={this.login}>Login</button>
        }
      </div>
    )
  }
}

export default Index