/** @jsx React.DOM */

!function(React, Router) {
  var container = document.createElement('div')
  container.id = 'container'
  container.className = 'container'
  document.querySelector('body').appendChild(container)

  var socket    = io.connect('http://localhost:3000')
    , container = document.querySelector('#container')

  var Index = React.createClass({
    render: function() {
      return (
        <div className="index">
          <h1>React chat</h1>
          <p><a href="/chat">Enter the chat</a></p>
        </div>
      )
    }
  })

  var CommentBox = React.createClass({
    getInitialState: function() {
      var self = this
      socket.on('new:comment', function(comment) {
        var comments = self.state.data
          , newComments = comments.concat(comment)
        self.setState({data: newComments})
      })

      socket.on('init', function(comments) {
        self.setState({data: comments})
      })

      socket.emit('init')

      return {data: []}
    },
    handleNewComment: function(comment) {
      socket.emit('new:comment', comment)
    },
    render: function() {
      return (
        <div className="commentBox">
          <h1>Chat room</h1>
          <p><a href="/">Homepage</a></p>
          <CommentForm onHandleSubmit={this.handleNewComment} />
          <CommentList data={this.state.data} />
        </div>
      )
    }
  })

  var CommentForm = React.createClass({
    handleSubmit: function() {
      var name = this.refs.name.getDOMNode().value
        , text = this.refs.comment.getDOMNode().value

      this.refs.comment.getDOMNode().value = ''
      this.props.onHandleSubmit({name: name, comment: text, date: Date.now()})

      return false
    },
    render: function() {
      return (
        <form className="commentForm" onSubmit={this.handleSubmit}>
          <input type="text" placeholder="name" ref="name" />
          <input type="text" ref="comment" />
          <input type="submit" />
        </form>
      )
    }
  })

  var CommentList = React.createClass({
    render: function() {
      var comments = this.props.data.map(function(comment) {
        return <Comment name={comment.name} comment={comment.comment} date={comment.date} />
      })

      return (
        <div>
          {comments}
        </div>
      )
    }
  })

  var Comment = React.createClass({
    render: function() {
      var date = new Date(this.props.date)
        , now = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
      return (
        <div className="comment">
          {now} <strong>{this.props.name}</strong> - {this.props.comment}
          <hr />
        </div>
      )
    }
  })

  var map = {
    index: function() {
      React.renderComponent(
        <Index />,
        container
      )
    },
    chat: function(match) {
      React.renderComponent(
        <CommentBox />,
        container
      )
    }
  }

  var routes = {
        '/': map.index,
        '/chat': map.chat
      }
    , options = {
        html5history: true
      }

  var router = Router(routes).configure(options)
  router.init()

}(window.React, window.Router)
