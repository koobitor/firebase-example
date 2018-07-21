import firebase from 'firebase'
import 'isomorphic-unfetch'
import clientCredentials from '../credentials/client'

class Index extends React.Component {

  static async getInitialProps ({req, query}) {
    const user = req && req.seesion ? req.session.decodedToken:null
    const item = user && await req.firebaseServer.database().ref('todo').once('value')
    const todo = item && item.val()
    return { user, todo }
  }

  constructor (props) {
    super(props)

    this.state = {
      user: this.props.user,
      todo: this.props.todo,
      value: ''
    }

    this.databaseInit = this.databaseInit.bind(this)
    this.addTodo = this.addTodo.bind(this)
    this.send = this.send.bind(this)
  }

  componentDidMount () {
    if(!firebase.apps.length){
      firebase.initializeApp(clientCredentials)
    }

    if(this.state.user) this.databaseInit()

    firebase.auth().onAuthStateChanged(user => {
      if(user){
        this.setState({ user: user })
        return user.getIdToken()
          .then((token) => {
            // return fetch('/api/login', {
            //   method: 'POST',
            //   headers: new Headers({ 'Content-Type': 'application/json' }),
            //   credentials: 'same-origin',
            //   body: JSON.stringify({ token })
            // })
          })
          .then((res) => this.databaseInit())
      }else{
        this.setState({ user: null })
        fetch('/api/logout', {
          method: 'POST',
          credentials: 'same-origin'
        }).then(() => firebase.database().ref('messages').off())
      }
    })
  }

  databaseInit() {
    firebase.database().ref('todo').on('value', item => {
      const todo = item.val()
      if(todo) this.setState({todo})
    })
  }

  addTodo(e) {
    this.setState({ value: e.target.value })
  }

  send(e) {
    e.preventDefault()
    const date = new Date().getTime()
    firebase.database().ref(`todo/${date}`).set({
      id: date,
      title: this.state.value
    })
    this.setState({ value: '' })
  }

  login() {
    firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())
  }

  logout() {
    firebase.auth().signOut()
  }

  render() {
    const { user, todo, value } = this.state
    return (
      <div>
        {
          user
            ? <button onClick={this.logout}>Logout</button>
            : <button onClick={this.login}>Login</button>
        }
        {
          user &&
          <div>
            <form onSubmit={this.send}>
              <input
                type="text"
                onChange={this.addTodo}
                placeholder="Add your task."
                value={value} />
            </form>
            <ul>
              {
                todo && Object.keys(todo).map((key) => (
                  <li key={key}>{todo[key].title}</li>
                ))
            }
            </ul>
          </div>
        }
      </div>
    )
  }
}

export default Index